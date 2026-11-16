# Creative Hub ZA

A marketplace for South African creatives and the people who hire them. Clients pay a 10% deposit that is held until they release it.

```
frontend/   index.html, join.html (onboarding page), theme.css, index-patches.md
backend/    server.js (Express: Yoco checkout, webhook, release, refund, admin), .env.example
supabase/   schema.sql (tables, security rules, storage, triggers)
```

Stack: plain HTML + Tailwind CDN + vanilla JS, Node/Express, Supabase (Postgres, auth, storage, realtime), Yoco payments.

## Set up

1. **Database.** Supabase SQL Editor: run `supabase/schema.sql`. To make yourself an admin, run the `update ... set role = 'admin'` line at the bottom of that file.
2. **Frontend.** Apply the edits in `frontend/index-patches.md`. Deploy the `frontend` folder (Netlify).
3. **Backend.** `cd backend && cp .env.example .env`, fill it in, `npm install`, `npm start`. Deploy to Render, Railway or Fly. Set the same variables there.
4. **Yoco webhook.** In the Yoco dashboard register `https://YOUR-BACKEND/api/webhooks/yoco` for payment events and copy the signing secret into `YOCO_WEBHOOK_SECRET`.
5. **Test with test keys.** Make a booking, pay with a Yoco test card, check the booking becomes `escrow_held`, then release one and refund one.
6. **Go live.** Switch to live Yoco keys, set `PAYMENTS:true` in `index.html`.

## How money moves

1. Client pays 10% of the budget through Yoco. The webhook marks the booking `escrow_held`.
2. Client taps **Release deposit**: status becomes `released`, and `PLATFORM_FEE_RATE` (default 10%) of the deposit is recorded as our fee.
3. The rest is paid to the creative **manually** for now. `GET /api/admin/payouts` lists what is owed; `POST /api/admin/payouts/:id/paid` marks it done.
4. If the creative cancels, **Cancel and refund** returns the full deposit to the client.

Yoco is a payment processor, not a licensed escrow service: the deposit sits in your own merchant balance. Before real launch, get a lawyer or accountant to confirm how holding client money should be structured, and confirm Yoco's refund endpoint in their docs.

## Ways the platform earns

Booking fee on released deposits (built). Next: a Pro subscription for creatives, featured placement, paid brief credits for businesses, and sponsored showcases.

## Licence

MIT
