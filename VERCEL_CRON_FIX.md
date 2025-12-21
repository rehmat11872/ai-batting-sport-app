# 🔧 Fix: Vercel Deployment Failure + Cron Job Limits

## ❌ Problems

1. **Vercel Deployment Failed** - Build or configuration error
2. **Cron Job Schedule Issue** - You're on Hobby plan (free), but cron is set to run every 5 minutes

## 📋 Vercel Hobby Plan Limits

According to Vercel docs:
- ✅ **2 cron jobs max** per account
- ✅ **Once per day** only (not every 5 minutes!)
- ⚠️ **No guaranteed timing** (could run anywhere in the hour)

**Your current schedule:** `*/5 * * * *` (every 5 minutes) ❌ **Won't work on Hobby plan!**

---

## ✅ Solutions

### **Option 1: Use Once-Per-Day Schedule (Updated)**

I've updated `vercel.json` to run **once per day at 12:00 PM UTC**:

```json
{
  "crons": [
    {
      "path": "/api/insiders/refresh",
      "schedule": "0 12 * * *"
    }
  ]
}
```

**Pros:**
- ✅ Works on Hobby plan
- ✅ Free
- ✅ Simple

**Cons:**
- ❌ Only runs once per day (not every 5 minutes)

---

### **Option 2: Use GitHub Actions (Recommended)** ⭐

**Already configured!** Use GitHub Actions instead of Vercel cron:

1. **Add secrets in GitHub:**
   - `APP_URL` = `https://ai-batting-sport-app.vercel.app`
   - `CRON_SECRET` = (same as in .env.local)

2. **GitHub Actions will run every 5 minutes** ✅
3. **Free and unlimited!** ✅

**File:** `.github/workflows/refresh-alerts.yml`

**Pros:**
- ✅ Runs every 5 minutes (as you want)
- ✅ Free
- ✅ More reliable

**Cons:**
- ❌ Need to set up GitHub secrets

---

### **Option 3: Remove Vercel Cron, Use GitHub Actions Only**

If you want to use GitHub Actions exclusively:

1. **Delete or comment out `vercel.json`:**
   ```json
   {
     "crons": []
   }
   ```

2. **Use GitHub Actions** (already set up)

---

## 🔍 Fix Deployment Failure

The deployment might be failing due to:

### **1. Build Errors**

Check Vercel deployment logs for:
- Prisma generation errors
- TypeScript errors
- Missing dependencies

**Fix:** Make sure `package.json` has all dependencies.

### **2. Missing Environment Variables**

Vercel needs these environment variables:

**Required:**
- `DATABASE_URL`
- `DIRECT_URL`
- `NEXT_PUBLIC_WHOP_APP_ID`
- `WHOP_API_KEY`
- `WHOP_REDIRECT_URI`
- `X_BEARER_TOKEN`
- `OPENAI_API_KEY`

**Optional:**
- `CRON_SECRET`
- `WEATHER_API_KEY`

**To add in Vercel:**
1. Go to Vercel Dashboard → Your Project
2. Settings → Environment Variables
3. Add each variable
4. Redeploy

### **3. Prisma Build Issues**

Make sure `postinstall` script runs:
```json
"postinstall": "prisma generate"
```

This should auto-generate Prisma client during build.

---

## 🎯 Recommended Setup for Hobby Plan

### **Best Approach:**

1. **Remove Vercel Cron** (or set to once per day)
2. **Use GitHub Actions** for 5-minute intervals
3. **Set up GitHub secrets** (`APP_URL`, `CRON_SECRET`)

**Why?**
- ✅ GitHub Actions: Free, unlimited, runs every 5 minutes
- ✅ Vercel Cron: Limited to once per day on Hobby plan

---

## 📝 Quick Fix Steps

### **Step 1: Update vercel.json (Already Done)**

Changed from `*/5 * * * *` to `0 12 * * *` (once per day at noon UTC)

### **Step 2: Set Up GitHub Actions**

1. Go to GitHub repo → Settings → Secrets and variables → Actions
2. Add `APP_URL` = `https://ai-batting-sport-app.vercel.app`
3. Add `CRON_SECRET` = (from your .env.local)
4. Test: Actions tab → Run workflow

### **Step 3: Check Vercel Environment Variables**

Make sure all required env vars are set in Vercel dashboard.

### **Step 4: Redeploy**

Push your changes and Vercel should deploy successfully.

---

## 📊 Comparison

| Method | Frequency | Cost | Reliability |
|--------|-----------|------|-------------|
| **Vercel Cron (Hobby)** | Once/day | Free | ⚠️ Not guaranteed timing |
| **Vercel Cron (Pro)** | Unlimited | $20/mo | ✅ Reliable |
| **GitHub Actions** | Every 5 min | Free | ✅ Reliable |

**Recommendation:** Use GitHub Actions for 5-minute intervals! ⭐

---

## ✅ Summary

**Current issue:**
- Cron schedule `*/5 * * * *` doesn't work on Hobby plan
- Deployment might be failing due to build/env issues

**Fixed:**
- ✅ Updated `vercel.json` to `0 12 * * *` (once per day)
- ✅ GitHub Actions already configured for 5-minute intervals

**Next steps:**
1. Set up GitHub secrets (`APP_URL`, `CRON_SECRET`)
2. Check Vercel environment variables
3. Redeploy

🎉 **You'll have both:**
- Vercel cron: Once per day (backup)
- GitHub Actions: Every 5 minutes (primary)

