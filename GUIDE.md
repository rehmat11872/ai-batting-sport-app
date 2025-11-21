# 🎯 AI Sports Betting App - Complete Guide

## 📋 Overview

This is a Next.js 14 app that provides AI-powered sports betting predictions with:
- **Whop OAuth** for user authentication
- **Supabase** database for user data and sessions
- **ESPN API** for NBA, NFL, and Soccer scores
- **Weather API** for weather conditions
- **Odds API** for betting odds

## 🚀 Quick Start

### 1. Environment Variables

Create `.env.local` with:

```env
# Whop OAuth
NEXT_PUBLIC_WHOP_APP_ID=app_82Pl9BUXNXGzVZ
WHOP_API_KEY=apik_sep3bU4s1SEhL_A2018129_799335a5d65d27271cbd5e66fb10854d463dc65c646f8318d9ab29dbf8670d58
WHOP_REDIRECT_URI=http://localhost:3000/oauth/callback
WHOP_CHECKOUT_URL=https://whop.com/checkout/plan_GKSAvo4qoQDGU?d2c=true
NEXT_PUBLIC_WHOP_CHECKOUT_URL=https://whop.com/checkout/plan_GKSAvo4qoQDGU?d2c=true

# Supabase Database
DATABASE_URL="postgresql://postgres.epenwftaxaynafpvrlem:Hackercs@11@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.epenwftaxaynafpvrlem:Hackercs@11@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"
SUPABASE_URL=https://epenwftaxaynafpvrlem.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwZW53ZnRheGF5bmFmcHZybGVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4Njg0NTcsImV4cCI6MjA3ODQ0NDQ1N30.XU4vXF52EWWD79srjVAJ9zMPEeqIm8Gra7PrOyllpfs
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwZW53ZnRheGF5bmFmcHZybGVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjg2ODQ1NywiZXhwIjoyMDc4NDQ0NDU3fQ.GJAyVkQIZflYrg7dYil1I6FhwisY9ICFFD-p_ssuOLQ

# Odds API
ODDS_API_KEY=847717ddfe109d6d1c2d1aae40376b00

# Weather API
WEATHER_API_KEY=714cb44662db4f389dd02203251511
```

### 2. Setup Database

```bash
# Generate Prisma client
npx prisma generate

# Create tables (if not already created)
node scripts/setup-database.js

# Or use Prisma Studio to view database
npx prisma studio
```

### 3. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## 🔐 Authentication Flow

### How Whop OAuth Works

1. **User clicks "Login with Whop"** → `/api/oauth/init`
   - Creates OAuth authorization URL
   - Sets state cookie for CSRF protection
   - Redirects to Whop

2. **User authorizes** → Whop redirects to `/oauth/callback`
   - Proxy route forwards to `/api/oauth/callback`

3. **Callback handler** (`/api/oauth/callback/route.ts`):
   - Exchanges code for access token
   - Fetches user data from Whop API
   - Saves user to Supabase database
   - Creates session in database
   - Sets session cookie
   - Redirects to dashboard

4. **Session check** (`lib/session.ts`):
   - Reads session cookie
   - Validates session in database
   - Returns user info and subscription status

### Debugging Login

**Check terminal logs for:**
```
✅ User data fetched successfully!
📋 Full user response: {...}
💾 Preparing to save user to database
📋 User data to save: {...}
✅ User saved to database successfully!
🔐 Creating session: {...}
✅ Session created successfully
🍪 Setting session cookie
✅ OAuth callback complete - user logged in!
```

**If login fails:**
1. Check browser cookies (DevTools → Application → Cookies)
   - Should see `session_token` cookie
2. Check database with Prisma Studio
   - `users` table should have your data
   - `user_sessions` table should have session token
3. Check server terminal for error logs

## 📊 Dashboard Features

### 1. User Stats
- Total Bets
- Win Rate
- Profit

### 2. Weather Conditions
- Current temperature
- Condition (sunny, cloudy, etc.)
- Humidity
- Wind speed
- Feels like temperature

### 3. Live Scores (ESPN API)
- **NBA** - Latest NBA games and scores
- **NFL** - Latest NFL games and scores
- **Soccer** - Multiple leagues (Premier League, MLS, La Liga, Serie A, Ligue 1)

### 4. AI Predictions
- Live odds from Odds API
- AI win probability
- Confidence scores
- Premium predictions (locked for free users)

## 🗄️ Database Schema

### Tables

1. **users**
   - `id` (UUID)
   - `whopCustomerId` (unique)
   - `email`
   - `name`
   - `avatarUrl`
   - `createdAt`

2. **memberships**
   - `id` (UUID)
   - `userId` (FK to users)
   - `whopPlanId`
   - `status` (active, expired, trial, canceled)
   - `accessExpiresAt`

3. **user_sessions**
   - `token` (primary key)
   - `userId` (FK to users)
   - `expiresAt`
   - `createdAt`

4. **predictions**
   - `id` (UUID)
   - `eventId`
   - `league`
   - `match`
   - `kickoff`
   - `oddsHome`, `oddsDraw`, `oddsAway`
   - `aiWinProbability`, `aiConfidence`
   - `tier` (free, premium)

## 🔧 API Routes

- `/api/oauth/init` - Start OAuth flow
- `/api/oauth/callback` - Handle OAuth callback
- `/api/auth/session` - Get current session (for client components)
- `/api/auth/logout` - Logout user
- `/api/webhooks/whop` - Handle Whop webhooks (for membership updates)

## 📝 Key Files

- `app/dashboard/page.tsx` - Main dashboard with scores and predictions
- `app/api/oauth/callback/route.ts` - OAuth callback handler
- `lib/session.ts` - Session management
- `lib/espn.ts` - ESPN API integration
- `lib/weather.ts` - Weather API integration
- `lib/predictions.ts` - Odds API integration
- `prisma/schema.prisma` - Database schema

## 🐛 Troubleshooting

### Login not working
- Check `.env.local` has correct Whop credentials
- Check redirect URI matches Whop dashboard settings
- Check terminal logs for detailed error messages
- Verify database tables exist

### User data not saving
- Check terminal logs for "User data fetched" message
- Verify database connection in `.env.local`
- Check Prisma Studio to see if user was created

### Session not persisting
- Check browser cookies are enabled
- Verify `session_token` cookie exists
- Check `user_sessions` table in database

### ESPN/Weather API not working
- Check API keys in `.env.local`
- Check terminal for API error messages
- Verify network requests in browser DevTools

## 🎯 Next Steps

1. **Test login flow** - Try logging in with Whop
2. **Check dashboard** - Verify scores and weather display
3. **Test premium** - Subscribe on Whop and verify premium access
4. **Monitor logs** - Watch terminal for any errors

## 📚 Resources

- [Whop OAuth Docs](https://docs.whop.com)
- [ESPN API (Unofficial)](https://gist.github.com/akeaswaran/b48b02f1c94f873c6655e7129910fc3b)
- [Weather API Docs](https://www.weatherapi.com/docs/)
- [Next.js 14 Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)

