# Creative Hub ZA

A concept platform connecting South African creatives musicians, tattoo artists, photographers, fine artists and 3D/VFX artists with record labels, radio stations, and brands looking to book paid work.

**Live demo:** open `index.html` in any browser, or check the published artifact link shared in the project.

## What it does

- **Discover Feed** — browse and filter verified creatives by category, city, and availability
- **Briefs board** — clients post paid work, creatives apply directly
- **Bookings with escrow** — every booking shows a 25% deposit held until delivery
- **Sign up as** an Artist, Record Label, Radio Station, or Brand — each gets a tailored landing page
- **Portfolio & Gallery** — creatives upload work samples to build their profile
- **Welcome page** — an editorial splash screen introducing the platform

## Tech stack

Plain and dependency-light on purpose, so it's easy to read, deploy, or hand off:

- **HTML** — single-file structure
- **Tailwind CSS** (via CDN, no build step) — styling
- **Vanilla JavaScript** — all interactivity (routing between pages, modals, filters, forms)
- **Google Fonts** — Playfair Display (headlines) + Manrope (body)
- **Material Symbols** — icons

No frameworks, no bundler, no backend. Everything runs from the one `index.html` file.

## Current limitations (important)

This is a **front-end prototype**, not a production app:

- All data (accounts, uploads, bookings, briefs) is stored in the browser's `localStorage`. It is **not shared between devices or users** — it only persists in the browser you're using.
- Sign in / sign up doesn't verify anything real — any email + password combination "works," for demo purposes.
- No real payments happen. The escrow deposit shown is a calculated display value, not a live transaction.
- Uploaded gallery files are stored as base64 in `localStorage`, which has a small size limit (a few MB) — fine for a demo, not for real media hosting.

## What a production version would need

- A real backend + database (e.g. Node/Postgres, or a BaaS like Supabase/Firebase) to store users, bookings, and briefs centrally
- File storage for uploads (e.g. S3 or Cloudflare R2) instead of base64 in localStorage
- Real authentication (hashed passwords, sessions/JWT, email verification)
- A payment gateway integration for real deposits/escrow — South African options include **PayFast**, **Yoco**, **Ozow**, or **Paystack**
- A dispute/resolution flow for when a client and creative disagree on delivery
- Verification workflow (ID checks, portfolio review) before a creative gets the "verified" badge

## Running locally

No install needed:

```bash
# just open it
open index.html        # macOS
start index.html        # Windows
xdg-open index.html      # Linux
```

Or serve it (recommended, since some browsers restrict local file access for certain features):

```bash
npx serve .
# or
python3 -m http.server 8000
```

## Customizing the welcome page collage

The welcome page uses stylized discipline cards (Amapiano, Tattoo, Photography, etc.) instead of real photos — this avoids using anyone's likeness without permission. If you have licensed photos of creatives you'd like to feature, swap them into the collage `<div>` blocks near the top of `page-welcome` in `index.html`.

## License / attribution

Sample creative names (Sipho Ndlovu, Zara Van Der Merwe, etc.) and studio images are placeholder content for demo purposes only, not real people or real photography rights holders' work you should assume you can reuse commercially — replace with your own licensed content before shipping.
