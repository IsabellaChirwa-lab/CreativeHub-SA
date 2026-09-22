require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Middleware: Verify Admin Access
async function requireAdmin(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Missing authentication token' });

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Unauthorized user' });

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });

  req.user = user;
  next();
}

// ==========================================
// YOCO PAYMENT INTEGRATION
// ==========================================
app.post('/api/checkout/yoco', async (req, res) => {
  const { amountInCents, currency, bookingId, metadata } = req.body;

  try {
    const response = await axios.post(
      'https://online.yoco.com/v1/charges',
      {
        token: req.body.token, // Yoco Web SDK Token generated on client side
        amountInCents: amountInCents, // e.g. R500.00 = 50000
        currency: currency || 'ZAR',
        metadata: { bookingId, ...metadata }
      },
      {
        headers: {
          'X-Auth-Secret-Key': process.env.YOCO_SECRET_KEY
        }
      }
    );

    if (response.data.status === 'successful') {
      // Update booking payment status in Supabase
      await supabase.from('bookings').update({
        payment_status: 'escrow_held',
        yoco_charge_id: response.data.id
      }).eq('id', bookingId);

      return res.json({ success: true, charge: response.data });
    } else {
      return res.status(400).json({ success: false, message: 'Payment processing failed' });
    }
  } catch (err) {
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

// ==========================================
// ADMIN DASHBOARD API ENDPOINTS
// ==========================================
app.get('/api/admin/stats', requireAdmin, async (req, res) => {
  const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
  const { count: totalBriefs } = await supabase.from('briefs').select('*', { count: 'exact', head: true });
  const { data: bookings } = await supabase.from('bookings').select('escrow_deposit, amount, payment_status');

  const totalEscrow = bookings
    .filter(b => b.payment_status === 'escrow_held')
    .reduce((acc, curr) => acc + Number(curr.escrow_deposit), 0);

  res.json({ totalUsers, totalBriefs, totalEscrow, bookingsCount: bookings.length });
});

app.listen(5000, () => console.log('Creative Hub ZA API running on port 5000'));