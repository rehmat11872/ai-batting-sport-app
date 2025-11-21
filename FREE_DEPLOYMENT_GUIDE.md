# 🚀 Free Deployment Guide - Step by Step

## 🎯 Best Free Options

### 1. **Vercel** (Recommended - Best for Next.js) ⭐
- ✅ **100% Free** for personal projects
- ✅ Made by Next.js creators
- ✅ Automatic deployments from GitHub
- ✅ Free SSL/HTTPS
- ✅ Serverless functions (API routes work perfectly)

### 2. **Netlify** (Alternative)
- ✅ Free tier available
- ✅ Good Next.js support
- ✅ Free SSL/HTTPS

### 3. **Render** (Alternative)
- ✅ Free tier available
- ✅ Good for full-stack apps

---

## 🟢 Option 1: Deploy to Vercel (Easiest)

### Step 1: Push Code to GitHub

```bash
# In your project folder
git init
git add .
git commit -m "Initial commit"
git branch -M main

# Create a new repository on GitHub.com, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

### Step 2: Sign Up for Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub

### Step 3: Import Your Project

1. Click **"Add New"** → **"Project"**
2. Find your repository and click **"Import"**
3. Vercel will auto-detect Next.js settings ✅

### Step 4: Add Environment Variables

**Before deploying, add all your `.env.local` variables:**

1. In Vercel project settings, go to **"Environment Variables"**
2. Click **"Add New"** for each variable:

```
NEXT_PUBLIC_WHOP_APP_ID=app_82Pl9BUXNXGzVZ
WHOP_API_KEY=apik_sep3bU4s1SEhL_A2018129_799335a5d65d27271cbd5e66fb10854d463dc65c646f8318d9ab29dbf8670d58
WHOP_REDIRECT_URI=https://your-app-name.vercel.app/oauth/callback
WHOP_CHECKOUT_URL=https://whop.com/checkout/plan_GKSAvo4qoQDGU?d2c=true
NEXT_PUBLIC_WHOP_CHECKOUT_URL=https://whop.com/checkout/plan_GKSAvo4qoQDGU?d2c=true
DATABASE_URL=postgresql://postgres.epenwftaxaynafpvrlem:Hackercs@11@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.epenwftaxaynafpvrlem:Hackercs@11@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres
SUPABASE_URL=https://epenwftaxaynafpvrlem.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwZW53ZnRheGF5bmFmcHZybGVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4Njg0NTcsImV4cCI6MjA3ODQ0NDU3fQ.XU4vXF52EWWD79srjVAJ9zMPEeqIm8Gra7PrOyllpfs
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwZW53ZnRheGF5bmFmcHZybGVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjg2ODQ1NywiZXhwIjoyMDc4NDQ0NDU3fQ.GJAyVkQIZflYrg7dYil1I6FhwisY9ICFFD-p_ssuOLQ
ODDS_API_KEY=847717ddfe109d6d1c2d1aae40376b00
WEATHER_API_KEY=714cb44662db4f389dd02203251511
```

**Important:** 
- Replace `your-app-name.vercel.app` with your actual Vercel URL (you'll get this after first deploy)
- Add variables for **Production**, **Preview**, and **Development** environments

### Step 5: Deploy

1. Click **"Deploy"** button
2. Wait 2-3 minutes for build to complete
3. Your app is live! 🎉

### Step 6: Update Redirect URI

**After first deployment:**

1. Copy your Vercel URL (e.g., `https://ai-sports-betting.vercel.app`)
2. Go to **Vercel** → **Settings** → **Environment Variables**
3. Update `WHOP_REDIRECT_URI` to: `https://your-app.vercel.app/oauth/callback`
4. Go to **Whop Dashboard** → **Your App** → **OAuth Settings**
5. Add redirect URI: `https://your-app.vercel.app/oauth/callback`
6. Click **"Redeploy"** in Vercel

---

## 🔵 Option 2: Deploy to Netlify

### Step 1: Push Code to GitHub (Same as Vercel Step 1)

### Step 2: Sign Up for Netlify

1. Go to [netlify.com](https://netlify.com)
2. Click **"Sign up"** → **"Sign up with GitHub"**

### Step 3: Create New Site

1. Click **"Add new site"** → **"Import an existing project"**
2. Connect to GitHub and select your repository
3. Netlify will auto-detect Next.js

### Step 4: Configure Build Settings

**Build settings:**
- **Build command:** `npm run build`
- **Publish directory:** `.next`
- **Node version:** 18.x or 20.x

### Step 5: Add Environment Variables

1. Go to **Site settings** → **Environment variables**
2. Add all variables from Step 4 above (same as Vercel)

### Step 6: Deploy

1. Click **"Deploy site"**
2. Wait for build to complete
3. Your app is live!

---

## 📋 Environment Variables Checklist

Copy these from your `.env.local` file:

### Required Variables:

```bash
# Whop OAuth
NEXT_PUBLIC_WHOP_APP_ID=app_82Pl9BUXNXGzVZ
WHOP_API_KEY=apik_sep3bU4s1SEhL_A2018129_799335a5d65d27271cbd5e66fb10854d463dc65c646f8318d9ab29dbf8670d58
WHOP_REDIRECT_URI=https://your-app.vercel.app/oauth/callback
WHOP_CHECKOUT_URL=https://whop.com/checkout/plan_GKSAvo4qoQDGU?d2c=true
NEXT_PUBLIC_WHOP_CHECKOUT_URL=https://whop.com/checkout/plan_GKSAvo4qoQDGU?d2c=true

# Supabase Database
DATABASE_URL=postgresql://postgres.epenwftaxaynafpvrlem:Hackercs@11@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.epenwftaxaynafpvrlem:Hackercs@11@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres
SUPABASE_URL=https://epenwftaxaynafpvrlem.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwZW53ZnRheGF5bmFmcHZybGVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4Njg0NTcsImV4cCI6MjA3ODQ0NDU3fQ.XU4vXF52EWWD79srjVAJ9zMPEeqIm8Gra7PrOyllpfs
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwZW53ZnRheGF5bmFmcHZybGVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjg2ODQ1NywiZXhwIjoyMDc4NDQ0NDU3fQ.GJAyVkQIZflYrg7dYil1I6FhwisY9ICFFD-p_ssuOLQ

# APIs
ODDS_API_KEY=847717ddfe109d6d1c2d1aae40376b00
WEATHER_API_KEY=714cb44662db4f389dd02203251511
```

### Important Notes:

1. **WHOP_REDIRECT_URI** - Update this AFTER first deployment with your actual URL
2. **All variables** - Must be added in platform's environment variables section
3. **No .env.local** - Don't commit `.env.local` to GitHub (it's in `.gitignore`)

---

## 🔧 Post-Deployment Checklist

After deploying:

- [ ] ✅ App is accessible at your URL
- [ ] ✅ Update `WHOP_REDIRECT_URI` in environment variables
- [ ] ✅ Add redirect URI in Whop Dashboard
- [ ] ✅ Test login flow
- [ ] ✅ Test dashboard access
- [ ] ✅ Test API routes (predictions, weather, etc.)
- [ ] ✅ Configure webhook URL in Whop Dashboard: `https://your-app.vercel.app/api/webhooks/whop`

---

## 🐛 Troubleshooting

### Build Fails

**Error: "Prisma Client not generated"**
- ✅ Already handled! `postinstall` script runs `prisma generate` automatically

**Error: "Environment variable missing"**
- ✅ Check all variables are added in platform settings
- ✅ Make sure variable names match exactly (case-sensitive)

**Error: "Module not found"**
- ✅ Run `npm install` locally first
- ✅ Check `package.json` dependencies

### App Works But Login Fails

**Issue: OAuth redirect error**
- ✅ Check `WHOP_REDIRECT_URI` matches exactly in:
  - Vercel/Netlify environment variables
  - Whop Dashboard OAuth settings
- ✅ Must use HTTPS (not HTTP)

**Issue: Session not persisting**
- ✅ Check cookies are enabled
- ✅ Check `secure` flag matches environment (production = true)

---

## 📊 Free Tier Limits

### Vercel Free Tier:
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ 100 serverless function executions/day
- ✅ Perfect for this app!

### Netlify Free Tier:
- ✅ 100GB bandwidth/month
- ✅ 300 build minutes/month
- ✅ 125K serverless function invocations/month

---

## 🎯 Quick Start (Vercel - 5 Minutes)

1. **Push to GitHub** (2 min)
   ```bash
   git init && git add . && git commit -m "Deploy"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Import to Vercel** (1 min)
   - Go to vercel.com → Import project → Select repo

3. **Add Environment Variables** (2 min)
   - Copy all from `.env.local`
   - Paste into Vercel environment variables

4. **Deploy** (1 min)
   - Click "Deploy"
   - Wait for build

5. **Update Redirect URI** (1 min)
   - Copy Vercel URL
   - Update in Vercel env vars and Whop Dashboard

**Total: ~5 minutes!** 🚀

---

## ✅ Summary

**Best Option:** Vercel (made for Next.js)

**Steps:**
1. Push code to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy
5. Update redirect URI

**That's it!** Your app will be live and free! 🎉

