require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

for (const k of ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'YOCO_SECRET_KEY']) {
  if (!process.env[k]) { console.error(`Missing ${k} in environment. See .env.example`); process.exit(1); }
}

const app = express();
app.set('trust proxy', 1);

// Production: set ALLOWED_ORIGIN to your site (comma-separate several). Unset = any origin (dev only).
const ORIGINS = (process.env.ALLOWED_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean);
if (!ORIGINS.length) console.warn('ALLOWED_ORIGIN is not set: every origin is allowed. Fine for local dev only.');
app.use(cors({ origin: ORIGINS.length ? ORIGINS : true }));
app.use(express.json({ limit: '50kb', verify: (req, res, buf) => { req.rawBody = buf; } })); // rawBody verifies Yoco webhooks

// SERVICE ROLE key bypasses RLS. This file must only run on a server you control.
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const DEPOSIT_RATE = 0.25;                                   // share of the budget paid up front
const FEE_RATE = Math.min(Math.max(Number(process.env.PLATFORM_FEE_RATE ?? 0.10), 0), 0.5); // our cut of the deposit on release
const FRONTEND = (process.env.FRONTEND_URL || ORIGINS[0] || '').replace(/\/$/, '');
const yoco = { headers: { Authorization: 'Bearer ' + process.env.YOCO_SECRET_KEY } };

app.get('/', (req, res) => res.json({ status: 'Creative Hub ZA API is running' }));

// ---------- helpers ----------
async function requireUser(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Please sign in again.' });
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ success: false, message: 'Please sign in again.' });
  req.user = user;
  next();
}
async function isAdmin(id) {
  const { data } = await supabase.from('profiles').select('role').eq('id', id).single();
  return data?.role === 'admin';
}
async function requireAdmin(req, res, next) {
  requireUser(req, res, async () => {
    if (!(await isAdmin(req.user.id))) return res.status(403).json({ success: false, message: 'Admin access required' });
    next();
  });
}
const hits = new Map(); // tiny in-memory rate limiter: enough for one server instance
setInterval(() => { const now = Date.now(); for (const [k, a] of hits) if (!a.some(t => now - t < 3600e3)) hits.delete(k); }, 600e3).unref();
const limit = (max, ms) => (req, res, next) => {
  const k = (req.user?.id || req.ip) + req.path.split('/').slice(0, 3).join('/');
  const now = Date.now(), a = (hits.get(k) || []).filter(t => now - t < ms);
  if (a.length >= max) return res.status(429).json({ success: false, message: 'Too many attempts. Please wait a few minutes.' });
  a.push(now); hits.set(k, a); next();
};
const notify = (user_id, title, body, link) =>
    user_id ? supabase.from('notifications').insert({ user_id, title, body, link: link || null }) : null;
const rand = n => 'R' + (Math.round(n * 100) / 100).toLocaleString('en-ZA');

// ---------- Yoco hosted checkout (25% deposit) ----------
// Creates a 'pending' booking, then a Yoco checkout. It only becomes 'escrow_held' when Yoco's signed webhook confirms payment.
app.post('/api/checkout/yoco', requireUser, limit(8, 10 * 60e3), async (req, res) => {
  const { budget, artistId, note, date } = req.body || {};
  const amount = Number(budget);
  if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ success: false, message: 'Enter a valid budget.' });
  if (amount > 500000) return res.status(400).json({ success: false, message: 'For budgets above R500 000 please contact us.' });
  if (!artistId) return res.status(400).json({ success: false, message: 'Missing creative.' });
  if (artistId === req.user.id) return res.status(400).json({ success: false, message: 'You cannot book yourself.' });
  const deposit = Math.round(amount * DEPOSIT_RATE);
  if (deposit < 2) return res.status(400).json({ success: false, message: 'Budget too low for a deposit (minimum R8).' });
  if (!FRONTEND) return res.status(500).json({ success: false, message: 'Server is missing FRONTEND_URL.' });
  let booking;
  try {
    const { data: artist } = await supabase.from('profiles').select('id').eq('id', artistId).eq('role', 'artist').single();
    if (!artist) return res.status(404).json({ success: false, message: 'Creative not found.' });
    const text = `Booking request${date ? ' for ' + String(date).slice(0, 10) : ''} · budget R${amount}\n${String(note || '').slice(0, 1000)}`;
    const ins = await supabase.from('bookings').insert({
      client_id: req.user.id, artist_id: artistId, amount, escrow_deposit: deposit, payment_status: 'pending', note: text
    }).select().single();
    if (ins.error) throw ins.error;
    booking = ins.data;
    const r = await axios.post('https://payments.yoco.com/api/checkouts', {
      amount: deposit * 100, currency: 'ZAR',
      successUrl: FRONTEND + '/?pay=ok', cancelUrl: FRONTEND + '/?pay=cancel', failureUrl: FRONTEND + '/?pay=failed',
      metadata: { bookingId: booking.id }
    }, yoco);
    await supabase.from('bookings').update({ yoco_checkout_id: r.data.id }).eq('id', booking.id);
    res.json({ success: true, redirectUrl: r.data.redirectUrl });
  } catch (err) {
    if (booking) await supabase.from('bookings').delete().eq('id', booking.id).eq('payment_status', 'pending');
    console.error('checkout failed:', err.response?.data || err.message);
    res.status(500).json({ success: false, message: 'Could not start payment. Please try again.' });
  }
});

// Yoco calls this when a payment succeeds. Never trust the redirect back to the site; trust this.
app.post('/api/webhooks/yoco', async (req, res) => {
  const secret = process.env.YOCO_WEBHOOK_SECRET || '';
  const id = req.get('webhook-id'), ts = req.get('webhook-timestamp'), header = req.get('webhook-signature') || '';
  if (!secret || !id || !ts || !req.rawBody) return res.sendStatus(400);
  if (Math.abs(Date.now() / 1000 - Number(ts)) > 300) return res.sendStatus(400);
  const signed = `${id}.${ts}.${req.rawBody.toString('utf8')}`;
  const raw = secret.replace(/^whsec_/, '');
  const expected = [Buffer.from(raw, 'base64'), Buffer.from(raw)].map(k => crypto.createHmac('sha256', k).update(signed).digest('base64'));
  const given = header.split(' ').map(p => p.split(',')[1] || '');
  const ok = given.some(g => expected.some(e => g.length === e.length && crypto.timingSafeEqual(Buffer.from(g), Buffer.from(e))));
  if (!ok) return res.sendStatus(401);

  try {
    const evt = req.body || {};
    if (evt.type === 'payment.succeeded') {
      const bookingId = evt.payload?.metadata?.bookingId;
      const { data: b } = bookingId ? await supabase.from('bookings').select('*').eq('id', bookingId).single() : { data: null };
      if (b && b.payment_status === 'pending' && Number(evt.payload?.amount) === Math.round(Number(b.escrow_deposit) * 100)) {
        // .eq('payment_status','pending') makes a repeated webhook a no-op
        const { data: upd } = await supabase.from('bookings')
            .update({ payment_status: 'escrow_held', yoco_charge_id: evt.payload?.id || null })
            .eq('id', b.id).eq('payment_status', 'pending').select();
        if (upd?.length) {
          if (b.client_id && b.artist_id) await supabase.from('messages').insert({ sender_id: b.client_id, recipient_id: b.artist_id, body: b.note || 'New booking request' });
          await notify(b.client_id, 'Deposit received', `Your ${rand(b.escrow_deposit)} deposit is held until you release it.`);
        }
      } else {
        console.error('Webhook did not match a pending booking', bookingId, evt.payload?.amount);
      }
    }
    res.sendStatus(200);
  } catch (e) {
    console.error('webhook error:', e.message);
    res.sendStatus(500); // Yoco will retry
  }
});

// ---------- release / refund ----------
// Client releases the deposit once happy. We keep FEE_RATE of it; the rest is paid out to the creative
// (payouts are manual for now: see /api/admin/payouts).
app.post('/api/bookings/:id/release', requireUser, limit(20, 10 * 60e3), async (req, res) => {
  const { data: b } = await supabase.from('bookings').select('*').eq('id', req.params.id).single();
  if (!b || b.client_id !== req.user.id) return res.status(404).json({ success: false, message: 'Booking not found.' });
  if (b.payment_status !== 'escrow_held') return res.status(409).json({ success: false, message: 'This deposit is not being held.' });
  const fee = Math.round(Number(b.escrow_deposit) * FEE_RATE * 100) / 100;
  const { data: upd, error } = await supabase.from('bookings')
      .update({ payment_status: 'released', platform_fee: fee, released_at: new Date().toISOString() })
      .eq('id', b.id).eq('payment_status', 'escrow_held').select();
  if (error || !upd?.length) return res.status(409).json({ success: false, message: 'Could not release. Please refresh and try again.' });
  await notify(b.artist_id, 'Deposit released', `${rand(Number(b.escrow_deposit) - fee)} is on its way to you, after our ${Math.round(FEE_RATE * 100)}% fee.`);
  res.json({ success: true, message: 'Deposit released to the creative.' });
});

// The creative (or an admin) can cancel a held booking: the client gets the full deposit back.
app.post('/api/bookings/:id/refund', requireUser, limit(20, 10 * 60e3), async (req, res) => {
  const { data: b } = await supabase.from('bookings').select('*').eq('id', req.params.id).single();
  if (!b) return res.status(404).json({ success: false, message: 'Booking not found.' });
  if (b.artist_id !== req.user.id && !(await isAdmin(req.user.id))) return res.status(403).json({ success: false, message: 'Only the creative or an admin can refund.' });
  if (b.payment_status !== 'escrow_held' || !b.yoco_checkout_id) return res.status(409).json({ success: false, message: 'This deposit cannot be refunded.' });
  try {
    // Verify this endpoint against Yoco's current Checkout API docs before going live.
    await axios.post(`https://payments.yoco.com/api/checkouts/${b.yoco_checkout_id}/refund`, {}, yoco);
  } catch (e) {
    console.error('refund failed:', e.response?.data || e.message);
    return res.status(502).json({ success: false, message: 'The payment provider could not process the refund. Try again or contact support.' });
  }
  await supabase.from('bookings').update({ payment_status: 'refunded' }).eq('id', b.id).eq('payment_status', 'escrow_held');
  await notify(b.client_id, 'Deposit refunded', `Your ${rand(b.escrow_deposit)} deposit is being refunded to your card.`);
  res.json({ success: true, message: 'Deposit refunded to the client.' });
});

// ---------- admin ----------
app.get('/api/admin/stats', requireAdmin, async (req, res) => {
  const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
  const { count: totalBriefs } = await supabase.from('briefs').select('*', { count: 'exact', head: true });
  const { data: bookings } = await supabase.from('bookings').select('escrow_deposit, platform_fee, payment_status');
  const sum = (st, f) => (bookings || []).filter(b => b.payment_status === st).reduce((s, b) => s + Number(b[f] || 0), 0);
  res.json({ totalUsers, totalBriefs, totalEscrow: sum('escrow_held', 'escrow_deposit'), totalFees: sum('released', 'platform_fee'), bookingsCount: (bookings || []).length });
});

// Released bookings still waiting to be paid out to the creative.
app.get('/api/admin/payouts', requireAdmin, async (req, res) => {
  const { data } = await supabase.from('bookings').select('id, artist_id, escrow_deposit, platform_fee, released_at').eq('payment_status', 'released').is('paid_out_at', null).order('released_at');
  res.json((data || []).map(b => ({ ...b, payout: Number(b.escrow_deposit) - Number(b.platform_fee || 0) })));
});
app.post('/api/admin/payouts/:id/paid', requireAdmin, async (req, res) => {
  const { error } = await supabase.from('bookings').update({ paid_out_at: new Date().toISOString() }).eq('id', req.params.id).eq('payment_status', 'released');
  res.status(error ? 500 : 200).json({ success: !error });
});

// ---------- briefs ----------
app.get('/api/briefs', async (req, res) => {
  const { data, error } = await supabase.from('briefs').select('*').order('created_at', { ascending: false }).limit(100);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});
app.post('/api/briefs', requireUser, limit(10, 60 * 60e3), async (req, res) => {
  const { title, category, budget, deadline, description } = req.body || {};
  if (!title || !category || !description || !Number.isFinite(Number(budget))) {
    return res.status(400).json({ error: 'Title, category, description and a numeric budget are required' });
  }
  const { data, error } = await supabase.from('briefs').insert({
    title: String(title).slice(0, 120), category, budget: Number(budget), deadline: deadline || null,
    description: String(description).slice(0, 3000), created_by: req.user.id
  }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Creative Hub ZA API running on port ${PORT} (fee ${FEE_RATE * 100}%)`));