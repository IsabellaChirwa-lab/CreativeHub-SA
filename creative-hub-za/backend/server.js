require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

// This uses the SERVICE ROLE key — this file must only ever run on a server
// you control (Render/Railway/Fly/your own VM), never in a browser.
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

app.get('/', (req, res) => res.json({ status: 'Creative Hub ZA API is running' }));

// ==========================================
// Middleware: verify a logged-in user via their Supabase JWT
// ==========================================
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

// ==========================================
// YOCO PAYMENT INTEGRATION — escrow deposit
// ==========================================
app.post('/api/checkout/yoco', async (req, res) => {
  const { token, amountInCents, currency, target } = req.body;
  if (!token || !amountInCents) return res.status(400).json({ success: false, message: 'Missing token or amount' });

  try {
    const response = await axios.post(
      'https://online.yoco.com/v1/charges/',
      { token, amountInCents, currency: currency || 'ZAR' },
      { headers: { 'X-Auth-Secret-Key': process.env.YOCO_SECRET_KEY } }
    );

    if (response.data.status === 'successful') {
      const { data: booking, error } = await supabase.from('bookings').insert({
        target_name: target || 'Unknown',
        deposit_amount: amountInCents / 100,
        payment_status: 'escrow_held',
        yoco_charge_id: response.data.id
      }).select().single();

      if (error) console.error('Supabase insert error:', error);
      return res.json({ success: true, charge: response.data, booking });
    }
    return res.status(400).json({ success: false, message: 'Payment processing failed' });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ success: false, message: err.response?.data?.displayMessage || err.message });
  }
});

// ==========================================
// ADMIN DASHBOARD STATS
// ==========================================
app.get('/api/admin/stats', requireAdmin, async (req, res) => {
  const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
  const { count: totalBriefs } = await supabase.from('briefs').select('*', { count: 'exact', head: true });
  const { data: bookings } = await supabase.from('bookings').select('deposit_amount, payment_status');

  const totalEscrow = (bookings || [])
    .filter(b => b.payment_status === 'escrow_held')
    .reduce((acc, curr) => acc + Number(curr.deposit_amount || 0), 0);

  res.json({ totalUsers, totalBriefs, totalEscrow, bookingsCount: (bookings || []).length });
});

// ==========================================
// BRIEFS — list & create (optional real backend for the Briefs board)
// ==========================================
app.get('/api/briefs', async (req, res) => {
  const { data, error } = await supabase.from('briefs').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/briefs', requireUser, async (req, res) => {
  const { title, category, budget, deadline, description } = req.body;
  const { data, error } = await supabase.from('briefs').insert({
    title, category, budget, deadline, description, posted_by: req.user.id
  }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Creative Hub ZA API running on port ${PORT}`));
