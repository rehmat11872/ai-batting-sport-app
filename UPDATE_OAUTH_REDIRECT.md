# 🔧 Update OAuth Redirect URI for Vercel Deployment

## 🎯 Your Vercel URL
**Production URL:** `https://ai-batting-sport-app.vercel.app`

**OAuth Callback URL:** `https://ai-batting-sport-app.vercel.app/oauth/callback`

---

## 📋 Step-by-Step Instructions

### Step 1: Update Vercel Environment Variables

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Login and select your project: `ai-batting-sport-app`

2. **Navigate to Settings**
   - Click on your project
   - Go to **"Settings"** tab
   - Click **"Environment Variables"** in the sidebar

3. **Update WHOP_REDIRECT_URI**
   - Find `WHOP_REDIRECT_URI` in the list
   - Click **"Edit"** or delete and recreate it
   - Set the value to:
     ```
     https://ai-batting-sport-app.vercel.app/oauth/callback
     ```
   - Make sure it's set for **Production**, **Preview**, and **Development** environments
   - Click **"Save"**

4. **Redeploy**
   - Go to **"Deployments"** tab
   - Click the **"..."** menu on the latest deployment
   - Click **"Redeploy"**
   - Or push a new commit to trigger auto-deploy

---

### Step 2: Update Whop Dashboard

1. **Go to Whop Dashboard**
   - Visit [whop.com/dashboard](https://whop.com/dashboard)
   - Login to your account

2. **Navigate to Your App**
   - Go to **"Apps"** section
   - Find your app (App ID: `app_82Pl9BUXNXGzVZ`)
   - Click on it to open settings

3. **Update OAuth Redirect URIs**
   - Go to **"OAuth"** or **"Settings"** section
   - Find **"Redirect URIs"** or **"Allowed Redirect URIs"**
   - **Add** the new production URL:
     ```
     https://ai-batting-sport-app.vercel.app/oauth/callback
     ```
   - **Keep** the localhost URL for development (optional):
     ```
     http://localhost:3000/oauth/callback
     ```
   - Click **"Save"** or **"Update"**

---

## ✅ Verification Checklist

After updating both places:

- [ ] ✅ `WHOP_REDIRECT_URI` updated in Vercel environment variables
- [ ] ✅ Redirect URI added in Whop Dashboard
- [ ] ✅ Vercel deployment redeployed
- [ ] ✅ Test login flow:
  1. Go to `https://ai-batting-sport-app.vercel.app/login`
  2. Click "Continue with Whop"
  3. Complete OAuth flow
  4. Should redirect back to your app successfully

---

## 🔍 Current Setup

**Your OAuth Flow:**
1. User clicks login → `/api/oauth/init`
2. Redirects to Whop OAuth page
3. User authorizes → Whop redirects to: `/oauth/callback`
4. Your app processes callback → Redirects to dashboard

**Important URLs:**
- **Login Page:** `https://ai-batting-sport-app.vercel.app/login`
- **OAuth Init:** `https://ai-batting-sport-app.vercel.app/api/oauth/init`
- **OAuth Callback:** `https://ai-batting-sport-app.vercel.app/oauth/callback`
- **Dashboard:** `https://ai-batting-sport-app.vercel.app/dashboard`

---

## 🐛 Troubleshooting

### Issue: "Redirect URI mismatch"

**Solution:**
- Make sure the URL in Vercel env vars **exactly matches** the URL in Whop Dashboard
- Check for trailing slashes (should be no trailing slash)
- Make sure it's HTTPS (not HTTP)
- Redeploy after updating

### Issue: "Invalid redirect URI"

**Solution:**
- Verify the URL is added in Whop Dashboard
- Check the URL format: `https://your-domain.vercel.app/oauth/callback`
- Make sure `/oauth/callback` route exists (it does - it's in `app/oauth/callback/route.ts`)

### Issue: Callback not working after update

**Solution:**
1. Clear browser cache
2. Try incognito mode
3. Check Vercel logs for errors
4. Verify environment variables are saved correctly

---

## 📝 Quick Reference

**Vercel Environment Variable:**
```
WHOP_REDIRECT_URI=https://ai-batting-sport-app.vercel.app/oauth/callback
```

**Whop Dashboard Redirect URI:**
```
https://ai-batting-sport-app.vercel.app/oauth/callback
```

**Both must match exactly!** ✅


