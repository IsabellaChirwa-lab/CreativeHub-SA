# Creative Hub ZA

South Africa's creative talent network — a marketplace connecting musicians, tattoo artists, photographers, painters, and 3D artists with record labels, radio stations, and brands. Bookings are protected with an escrow deposit.

**Status:** working prototype. Frontend is fully functional on its own (with local demo data); real accounts and real payments need your own Supabase and Yoco keys, set up below.

## Project structure

```
creative-hub-za/
├── frontend/
│   └── index.html        # the whole app — single-file HTML/Tailwind/vanilla JS
├── backend/
│   ├── server.js          # Express API — Yoco payments + admin stats
│   ├── package.json
│   └── .env.example
├── supabase/
│   └── schema.sql         # database tables + row-level security
└── README.md
```

## How it works right now (no setup required)

Open `frontend/index.html` in a browser (or deploy it anywhere static — Netlify, Vercel, GitHub Pages) and the whole app works out of the box: sign up, browse creatives, post briefs, apply, book with a deposit. Accounts and bookings are stored in `localStorage` (your browser only) so this mode is for demos/portfolio purposes, not real users.

## Making it real: Supabase (accounts + database)

1. Create a free project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run `supabase/schema.sql` to create the tables.
3. In **Project Settings → API**, copy your **Project URL** and **anon public key**.
4. Open `frontend/index.html`, find the `CONFIG` block near the top of the `<script>` tag, and fill in:
   ```js
   SUPABASE_URL: 'https://your-project-id.supabase.co',
   SUPABASE_ANON_KEY: 'your-anon-key',
   ```
   The anon key is safe to put in frontend code — it's public by design and restricted by the row-level security rules in `schema.sql`. Never put your **service role** key here.

Once set, sign up/sign in/sign out use real Supabase auth automatically.

## Making it real: Yoco (payments)

1. Create a Yoco account at [yoco.com](https://www.yoco.com) and get your test API keys from the dashboard.
2. In `frontend/index.html`, set:
   ```js
   YOCO_PUBLIC_KEY: 'pk_test_xxxxxxxx',
   API_BASE_URL: 'https://your-deployed-backend-url.com',
   ```
3. Set up the backend (below) — Yoco's secret key must live there, never in the frontend.

## Running the backend

The backend confirms payments server-side and writes escrow status to Supabase — this step can't be skipped for real payments, since secret keys can't live in browser code.

```bash
cd backend
cp .env.example .env      # fill in your real keys
npm install
npm start                  # runs on http://localhost:5000
```

For production, deploy this folder to [Render](https://render.com), [Railway](https://railway.app), or [Fly.io](https://fly.io) (all have free tiers), then update `API_BASE_URL` in the frontend to your deployed URL.

## Tech stack

- **Frontend:** plain HTML + [Tailwind CSS](https://tailwindcss.com) (CDN) + vanilla JavaScript — no build step
- **Backend:** Node.js + Express
- **Database/Auth:** [Supabase](https://supabase.com) (Postgres + built-in auth)
- **Payments:** [Yoco](https://www.yoco.com) (South African payment gateway)

## Roadmap ideas

- [ ] Move file uploads (Gallery) from browser storage to Supabase Storage
- [ ] Real-time notifications via Supabase Realtime
- [ ] Booking status flow (pending → accepted → delivered → released) with dispute handling
- [ ] Commission/fee logic on escrow release
- [ ] Rating & review system after a completed booking

## License

MIT — do what you like with it.
