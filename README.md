# AI Sports Betting App

A Next.js 14 application for AI-powered sports betting predictions with user authentication, dashboard, and pricing plans.

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful UI components
- **NextAuth.js v5** - Authentication (Email + Google)
- **next-themes** - Dark/Light mode support
- **ESLint** - Code linting

## Features

✅ **User Management**
- NextAuth.js authentication with Email and Google providers
- Protected dashboard route
- Sign In/Sign Out functionality

✅ **Dashboard**
- Mock statistics (Total Profit, Win Rate, Total Bets)
- AI Predictions display with confidence bars
- Protected route (requires authentication)

✅ **Pricing Page**
- Free and Premium plan cards
- Stripe integration placeholder

✅ **Theme Support**
- Dark/Light mode toggle
- System theme detection

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file in the root directory:
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Optional: For Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**Note:** For demo purposes, you can sign in with any email and password "password" (no Google OAuth setup required).

## Running the App

To start the development server:

```bash
npm run dev
```

The app will be available at **http://localhost:3000**

## Project Structure

```
├── app/
│   ├── api/auth/[...nextauth]/  # NextAuth API route
│   ├── auth/signin/             # Sign in page
│   ├── dashboard/               # Protected dashboard
│   ├── pricing/                 # Pricing page
│   └── page.tsx                 # Home page
├── components/
│   ├── ui/                      # shadcn/ui components
│   ├── navbar.tsx               # Navigation bar
│   ├── theme-toggle.tsx         # Theme switcher
│   ├── prediction-card.tsx      # Prediction display card
│   └── stats-card.tsx           # Statistics card
├── lib/
│   ├── auth.config.ts           # NextAuth configuration
│   ├── auth.ts                  # Auth helper functions
│   └── mockData.ts              # Mock predictions and stats
├── server/                      # Backend logic (to be implemented)
└── types/                       # TypeScript type definitions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Authentication

### Demo Credentials
- **Email:** Any email address
- **Password:** `password`

### Google OAuth (Optional)
To enable Google sign-in:
1. Create a Google OAuth app at [Google Cloud Console](https://console.cloud.google.com/)
2. Add the Client ID and Secret to `.env.local`
3. Add `http://localhost:3000/api/auth/callback/google` as a redirect URI

## Next Steps

- [ ] Set up tRPC for type-safe API calls
- [ ] Configure Prisma for database management
- [ ] Integrate real AI APIs for predictions
- [ ] Implement Stripe payment integration
- [ ] Add user profile management

