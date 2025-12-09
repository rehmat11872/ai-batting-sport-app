# 📸 Step-by-Step: Update OAuth Redirect URI

## 🎯 What You Need to Do

Update the OAuth callback URL from `http://localhost:3000/oauth/callback` to `https://ai-batting-sport-app.vercel.app/oauth/callback`

---

## Part 1: Update Vercel Environment Variables

### Step 1: Go to Vercel Dashboard

1. Open your browser
2. Go to: **https://vercel.com**
3. **Login** with your GitHub account

### Step 2: Select Your Project

1. You'll see a list of projects
2. Click on: **`ai-batting-sport-app`** (or your project name)

### Step 3: Open Settings

1. At the top, click the **"Settings"** tab
2. In the left sidebar, click **"Environment Variables"**

### Step 4: Find WHOP_REDIRECT_URI

1. Scroll down to find **`WHOP_REDIRECT_URI`** in the list
2. You'll see it currently says: `http://localhost:3000/oauth/callback`

### Step 5: Edit the Variable

**Option A: Edit Existing**
1. Click the **pencil icon** (✏️) next to `WHOP_REDIRECT_URI`
2. Change the value to:
   ```
   https://ai-batting-sport-app.vercel.app/oauth/callback
   ```
3. Make sure all environments are checked:
   - ✅ Production
   - ✅ Preview  
   - ✅ Development
4. Click **"Save"**

**Option B: Delete and Recreate**
1. Click the **trash icon** (🗑️) to delete the old one
2. Click **"Add New"** button
3. Enter:
   - **Key:** `WHOP_REDIRECT_URI`
   - **Value:** `https://ai-batting-sport-app.vercel.app/oauth/callback`
   - **Environments:** Select all (Production, Preview, Development)
4. Click **"Save"**

### Step 6: Redeploy

1. Go to **"Deployments"** tab (at the top)
2. Find your latest deployment
3. Click the **"..."** (three dots) menu
4. Click **"Redeploy"**
5. Wait for deployment to finish (1-2 minutes)

---

## Part 2: Update Whop Dashboard

### Step 1: Go to Whop Dashboard

1. Open your browser
2. Go to: **https://whop.com/dashboard**
3. **Login** to your Whop account

### Step 2: Find Your App

1. In the left sidebar, click **"Apps"** or **"My Apps"**
2. Find your app (it should show App ID: `app_82Pl9BUXNXGzVZ`)
3. **Click on the app** to open it

### Step 3: Open OAuth Settings

1. Look for **"OAuth"** or **"Settings"** tab
2. Click on it
3. Find **"Redirect URIs"** or **"Allowed Redirect URIs"** section

### Step 4: Add Production URL

1. You'll see a list of redirect URIs (probably just localhost)
2. Click **"Add Redirect URI"** or **"+"** button
3. Enter:
   ```
   https://ai-batting-sport-app.vercel.app/oauth/callback
   ```
4. Click **"Save"** or **"Add"**

**Note:** You can keep the localhost one for local development:
- `http://localhost:3000/oauth/callback` (for local dev)
- `https://ai-batting-sport-app.vercel.app/oauth/callback` (for production)

---

## Part 3: Test It Works

### Step 1: Test Login

1. Go to: **https://ai-batting-sport-app.vercel.app/login**
2. Click **"Continue with Whop"**
3. You should be redirected to Whop login page
4. After logging in, you should be redirected back to your app
5. You should see the dashboard

### Step 2: Check for Errors

If you see an error:
- **"Redirect URI mismatch"** → Check both URLs match exactly
- **"Invalid redirect URI"** → Make sure it's added in Whop Dashboard
- **"Page not found"** → Check Vercel deployment is complete

---

## 📋 Quick Checklist

### Vercel:
- [ ] Logged into Vercel
- [ ] Selected project `ai-batting-sport-app`
- [ ] Went to Settings → Environment Variables
- [ ] Updated `WHOP_REDIRECT_URI` to: `https://ai-batting-sport-app.vercel.app/oauth/callback`
- [ ] Saved the variable
- [ ] Redeployed the project

### Whop Dashboard:
- [ ] Logged into Whop Dashboard
- [ ] Found my app
- [ ] Went to OAuth/Settings
- [ ] Added redirect URI: `https://ai-batting-sport-app.vercel.app/oauth/callback`
- [ ] Saved the changes

### Testing:
- [ ] Tested login flow
- [ ] OAuth redirect works
- [ ] User can login successfully

---

## 🎯 Exact Values to Use

**Vercel Environment Variable:**
```
Key: WHOP_REDIRECT_URI
Value: https://ai-batting-sport-app.vercel.app/oauth/callback
```

**Whop Dashboard Redirect URI:**
```
https://ai-batting-sport-app.vercel.app/oauth/callback
```

**Both must be EXACTLY the same!** ✅

---

## 🆘 Need Help?

### Can't Find Environment Variables in Vercel?
- Make sure you're in the **Settings** tab
- Look for **"Environment Variables"** in the left sidebar
- If you don't see it, make sure you're the project owner

### Can't Find OAuth Settings in Whop?
- Make sure you're logged into the correct Whop account
- The app should be under **"Apps"** or **"My Apps"**
- Look for **"OAuth"**, **"Settings"**, or **"Configuration"** tabs

### Still Not Working?
1. Double-check both URLs match exactly (no trailing slash, correct domain)
2. Make sure Vercel deployment completed successfully
3. Try clearing browser cache and testing in incognito mode
4. Check Vercel logs for any errors

---

## ✅ Success!

Once both are updated and you've redeployed, your OAuth flow will work on production! 🎉


