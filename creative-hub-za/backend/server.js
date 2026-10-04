require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// In production set ALLOWED_ORIGIN to your site, e.g. https://creativehub.co.za
// (comma-separate several). If unset, every origin is allowed — fine for local dev only.
app.use(cors({ origin: process.env.ALLOWED_ORIGIN ? process.env.ALLOWED_ORIGIN.split(',') : true }));
app.use(express.json());

// SERVICE ROLE key: bypasses RLS. This file must only run on a server you control.
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

app.get('/', (req, res) => res.json({ status: 'Creative Hub ZA API is running' }));

// ---------- auth middleware ----------
async function requireUser(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Missing authentication token' });
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Unauthorized user' });
  req.user = user;
  next();
}

async function requireAdmin(req, res, next) {
  await requireUser(req, res, async () => {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', req.user.id).single();
    if (profile?.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
    next();
  });
}

// ---------- Yoco escrow deposit ----------
// The browser sends the booking budget; the server works out the 25% deposit itself,
// so a user can't pay R1 for a R10,000 booking by editing the request.
const DEPOSIT_RATE = 0.25;

app.post('/api/checkout/yoco', requireUser, async (req, res) => {
  const { token, budget, artistId, briefId } = req.body;
  const amount = Number(budget);
  if (!token || !Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ success: false, message: 'Missing token or a valid budget' });
  }
  if (!artistId && !briefId) {
    return res.status(400).json({ success: false, message: 'Missing artistId or briefId' });
  }
  if (artistId === req.user.id) {
    return res.status(400).json({ success: false, message: 'You cannot book yourself' });
  }

  const deposit = Math.round(amount * DEPOSIT_RATE);
  if (deposit < 2) return res.status(400).json({ success: false, message: 'Budget too low for a deposit' });

  try {
    if (artistId) {
      const { data: artist } = await supabase.from('profiles').select('id').eq('id', artistId).eq('role', 'artist').single();
      if (!artist) return res.status(404).json({ success: false, message: 'Creative not found' });
    }

    const response = await axios.post(
      'https://online.yoco.com/v1/charges/',
      { token, amountInCents: deposit * 100, currency: 'ZAR' },
      { headers: { 'X-Auth-Secret-Key': process.env.YOCO_SECRET_KEY } }
    );
    if (response.data.status !== 'successful') {
      return res.status(400).json({ success: false, message: 'Payment processing failed' });
    }

    const { data: booking, error } = await supabase.from('bookings').insert({
      client_id: req.user.id,
      artist_id: artistId || null,
      brief_id: briefId || null,
      amount,
      escrow_deposit: deposit,
      payment_status: 'escrow_held',
      yoco_charge_id: response.data.id
    }).select().single();

    if (error) {
      // Money has been taken but nothing was saved: never report this as success.
      console.error('BOOKING SAVE FAILED for charge', response.data.id, error);
      return res.status(500).json({
        success: false,
        message: 'Payment was taken but the booking could not be saved. Quote reference ' + response.data.id
      });
    }
    res.json({ success: true, booking });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ success: false, message: err.response?.data?.displayMessage || err.message });
  }
});

// ---------- admin stats ----------
app.get('/api/admin/stats', requireAdmin, async (req, res) => {
  const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
  const { count: totalBriefs } = await supabase.from('briefs').select('*', { count: 'exact', head: true });
  const { data: bookings } = await supabase.from('bookings').select('escrow_deposit, payment_status');

  const totalEscrow = (bookings || [])
    .filter(b => b.payment_status === 'escrow_held')
    .reduce((sum, b) => sum + Number(b.escrow_deposit || 0), 0);

  res.json({ totalUsers, totalBriefs, totalEscrow, bookingsCount: (bookings || []).length });
});

// ---------- briefs ----------
app.get('/api/briefs', async (req, res) => {
  const { data, error } = await supabase.from('briefs').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/briefs', requireUser, async (req, res) => {
  const { title, category, budget, deadline, description } = req.body;
  if (!title || !category || !description || !Number.isFinite(Number(budget))) {
    return res.status(400).json({ error: 'Title, category, description and a numeric budget are required' });
  }
  const { data, error } = await supabase.from('briefs').insert({
    title, category, budget: Number(budget), deadline: deadline || null, description, created_by: req.user.id
  }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Creative Hub ZA API running on port ${PORT}`));