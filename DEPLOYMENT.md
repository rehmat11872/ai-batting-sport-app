# 🚀 Deployment Guide

This guide covers deploying your AI Sports Betting App to **Vercel**, **Netlify**, and **Render** for free.

## 📋 Prerequisites

- GitHub account (recommended for all platforms)
- Your app code pushed to a GitHub repository
- All environment variables ready

---

## 🟢 Option 1: Vercel (Recommended for Next.js)

**Why Vercel?** Made by Next.js creators, best integration, free tier includes:
- Unlimited deployments
- Serverless functions (API routes)
- Automatic HTTPS
- Edge network
- Free custom domains

### Steps:

1. **Push code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

2. **Sign up/Login to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub

3. **Import Project**
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Vercel auto-detects Next.js

4. **Configure Environment Variables**
   - In project settings, go to "Environment Variables"
   - Add all variables from `.env.local`:
     ```
     NEXT_PUBLIC_WHOP_APP_ID=app_82Pl9BUXNXGzVZ
     WHOP_API_KEY=apik_sep3bU4s1SEhL_A2018129_799335a5d65d27271cbd5e66fb10854d463dc65c646f8318d9ab29dbf8670d58
     WHOP_REDIRECT_URI=https://your-app.vercel.app/oauth/callback
     WHOP_CHECKOUT_URL=https://whop.com/checkout/plan_GKSAvo4qoQDGU?d2c=true
     NEXT_PUBLIC_WHOP_CHECKOUT_URL=https://whop.com/checkout/plan_GKSAvo4qoQDGU?d2c=true
     DATABASE_URL=your-supabase-url
     DIRECT_URL=your-supabase-direct-url
     SUPABASE_URL=your-supabase-url
     SUPABASE_ANON_KEY=your-supabase-anon-key
     SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-key
     ODDS_API_KEY=847717ddfe109d6d1c2d1aae40376b00
     WEATHER_API_KEY=714cb44662db4f389dd02203251511
     ```

5. **Update Redirect URI**
   - After first deployment, copy your Vercel URL
   - Update `WHOP_REDIRECT_URI` in Vercel environment variables
   - Update redirect URI in Whop Dashboard: `https://your-app.vercel.app/oauth/callback`
   - Redeploy

6. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app is live! 🎉

### Build Settings (Auto-detected):
- **Framework Preset:** Next.js
- **Build Command:** `npm run build` (auto)
- **Output Directory:** `.next` (auto)
- **Install Command:** `npm install` (auto)

---

## 🔵 Option 2: Netlify

**Free tier includes:**
- 100GB bandwidth/month
- Serverless functions
- Automatic HTTPS
- Free custom domains

### Steps:

1. **Push code to GitHub** (same as Vercel step 1)

2. **Sign up/Login to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Sign up with GitHub

3. **Create new site**
   - Click "Add new site" → "Import an existing project"
   - Connect to GitHub and select your repository

4. **Configure Build Settings**
   ```
   Build command: npm run build
   Publish directory: .next
   ```

5. **Add Environment Variables**
   - Go to Site settings → Environment variables
   - Add all variables from `.env.local`
   - **Important:** Update `WHOP_REDIRECT_URI` to your Netlify URL

6. **Update Netlify Configuration**
   Create `netlify.toml` in project root:
   ```toml
   [build]
     command = "npm run build"
     publish = ".next"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200

   [[plugins]]
     package = "@netlify/plugin-nextjs"
   ```

7. **Install Netlify Next.js Plugin**
   ```bash
   npm install --save-dev @netlify/plugin-nextjs
   ```

8. **Deploy**
   - Click "Deploy site"
   - Wait for build
   - Your app is live!

### Update Redirect URI:
- After deployment, update `WHOP_REDIRECT_URI` in Netlify env vars
- Update in Whop Dashboard: `https://your-app.netlify.app/oauth/callback`

---

## 🟣 Option 3: Render

**Free tier includes:**
- 750 hours/month (enough for 24/7)
- Automatic HTTPS
- Free custom domains
- Auto-deploy from GitHub

### Steps:

1. **Push code to GitHub** (same as Vercel step 1)

2. **Sign up/Login to Render**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

3. **Create New Web Service**
   - Click "New" → "Web Service"
   - Connect your GitHub repository

4. **Configure Service**
   ```
   Name: ai-sports-betting-app
   Environment: Node
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

5. **Add Environment Variables**
   - Scroll to "Environment Variables"
   - Add all variables from `.env.local`
   - **Important:** Update `WHOP_REDIRECT_URI` to your Render URL

6. **Select Plan**
   - Choose "Free" plan
   - Click "Create Web Service"

7. **Update Redirect URI**
   - After first deployment, copy your Render URL
   - Update `WHOP_REDIRECT_URI` in Render environment variables
   - Update in Whop Dashboard: `https://your-app.onrender.com/oauth/callback`
   - Redeploy

8. **Deploy**
   - Render auto-deploys
   - Wait for build (takes 5-10 minutes first time)
   - Your app is live!

---

## ⚙️ Important Configuration Updates

### 1. Update Whop Redirect URI

After deployment, update in **Whop Dashboard**:
- Go to your Whop App settings
- Update OAuth Redirect URI to your production URL:
  - Vercel: `https://your-app.vercel.app/oauth/callback`
  - Netlify: `https://your-app.netlify.app/oauth/callback`
  - Render: `https://your-app.onrender.com/oauth/callback`

### 2. Update Environment Variables

Update `WHOP_REDIRECT_URI` in your platform's environment variables to match your production URL.

### 3. Database (Supabase)

Your Supabase database is already hosted separately, so no changes needed! Just ensure:
- `DATABASE_URL` and `DIRECT_URL` are set correctly
- Database allows connections from your deployment platform

---

## 🔧 Post-Deployment Checklist

- [ ] All environment variables set
- [ ] `WHOP_REDIRECT_URI` updated to production URL
- [ ] Redirect URI updated in Whop Dashboard
- [ ] Test OAuth login flow
- [ ] Test dashboard access
- [ ] Test API routes (predictions, weather, ESPN)
- [ ] Check console for errors

---

## 🆚 Platform Comparison

| Feature | Vercel | Netlify | Render |
|---------|--------|---------|--------|
| **Next.js Support** | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐⭐ Good | ⭐⭐⭐ Good |
| **Free Tier** | Unlimited | 100GB/month | 750 hrs/month |
| **Build Time** | Fast (~2 min) | Fast (~3 min) | Slower (~5-10 min) |
| **Serverless Functions** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Auto HTTPS** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Custom Domain** | ✅ Free | ✅ Free | ✅ Free |
| **Cold Starts** | Minimal | Minimal | Can be slow |

**Recommendation:** Use **Vercel** for best Next.js experience, or **Netlify** as alternative.

---

## 🐛 Troubleshooting

### Build Fails
- Check build logs for errors
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### Environment Variables Not Working
- Double-check variable names (case-sensitive)
- Redeploy after adding variables
- Check platform-specific requirements

### OAuth Not Working
- Verify redirect URI matches exactly
- Check both Whop Dashboard and platform env vars
- Ensure HTTPS is enabled (required for OAuth)

### Database Connection Issues
- Verify Supabase allows connections from your platform
- Check `DATABASE_URL` format
- Ensure `DIRECT_URL` is set for migrations

---

## 📚 Additional Resources

- [Vercel Next.js Docs](https://vercel.com/docs/frameworks/nextjs)
- [Netlify Next.js Docs](https://docs.netlify.com/integrations/frameworks/next-js/)
- [Render Next.js Docs](https://render.com/docs/deploy-nextjs-app)

---

## ✅ Quick Start (Vercel - Recommended)

```bash
# 1. Push to GitHub
git init
git add .
git commit -m "Ready for deployment"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main

# 2. Go to vercel.com and import project
# 3. Add environment variables
# 4. Deploy!
```

**That's it!** Your app will be live in ~2 minutes. 🚀

