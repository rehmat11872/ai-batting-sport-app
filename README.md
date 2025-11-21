# AI Sports Betting App (MVP)

A clean Next.js 14 MVP that showcases AI-generated betting predictions with a Whop-powered upgrade flow.

## What’s Included

- **Landing page (`/`)** – Minimal hero with CTA to view predictions.
- **Dashboard (`/dashboard`)** – Displays daily match predictions, odds, AI win probability and confidence bars.
- **Premium flow** – Free users see a limited set of predictions and are prompted to “Upgrade on Whop”.
- **Mock data layer** – Predictions and streak data live in `lib/mockData.ts`.
- **API stub** – `GET /api/predictions` fetches Odds API data with a mock fallback.
- **Dark/Light mode** – Theme toggle powered by `next-themes`.
- **shadcn/ui** – Cards, buttons, badges, and progress bars.

## Getting Started

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to view the landing page. Use `/login` to start the Whop OAuth flow and `/dashboard` to see the AI predictions view.

### Environment variables

Create a `.env.local` with:

```env
WHOP_CLIENT_ID=...
WHOP_CLIENT_SECRET=...
WHOP_REDIRECT_URI=http://localhost:3000/api/auth/whop/callback
WHOP_CHECKOUT_URL=https://whop.com/your-space/premium-plan
NEXT_PUBLIC_WHOP_CHECKOUT_URL=$WHOP_CHECKOUT_URL
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
ODDS_API_KEY=...
```

## Project Structure

```
├── app/
│   ├── api/auth/whop/*            # OAuth start + callback routes
│   ├── api/predictions/route.ts   # Fetches Odds API data (mock fallback)
│   ├── dashboard/page.tsx         # Main predictions dashboard
│   ├── layout.tsx                 # Global providers + navbar
│   ├── login/page.tsx             # Whop sign-in page
│   └── page.tsx                   # Landing page
├── components/
│   ├── navbar.tsx                 # Minimal navbar with Whop upgrade CTA
│   ├── theme-provider.tsx         # next-themes wrapper
│   ├── theme-toggle.tsx           # Dark/light mode toggle
│   └── ui/                        # shadcn/ui primitives
└── lib/
    ├── mockData.ts                # Mock predictions + streak data
    ├── predictions.ts             # Helper to fetch Odds API data
    ├── session.ts                 # Session + membership helpers
    └── supabase.ts                # Supabase service client
└── supabase/schema.sql            # Tables for users, memberships, predictions, sessions
```

## Customisation Hooks

- **Whop integration** – Replace `WHOP_CHECKOUT_URL` in `app/dashboard/page.tsx` with your Whop checkout link.
- **Access control** – Swap the `isSubscribed` flag with real Whop entitlement logic once available; run `supabase/schema.sql` to bootstrap tables.
- **Live data** – Update `GET /api/predictions` to pull from Odds API / SportsData.io (already wired with a fallback).

## Available Scripts

- `npm run dev` – Start the development server
- `npm run build` – Create a production build
- `npm run start` – Start the production server
- `npm run lint` – Run ESLint

## Next Steps

- Integrate Whop SDK/webhooks to determine premium access.
- Swap mock predictions with real data from Odds API or SportsData.io.
- Persist user streaks and historical performance.

Enjoy building! 🎯
