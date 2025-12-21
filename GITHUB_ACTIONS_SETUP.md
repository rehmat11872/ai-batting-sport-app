# 🔧 GitHub Actions Cron Job Setup

## ❌ Current Error

```
curl: (3) URL rejected: No host part in the URL
Error: Process completed with exit code 3.
```

**Reason:** `APP_URL` secret is not set in GitHub repository.

---

## ✅ How to Fix

### **Step 1: Get Your Vercel URL**

1. Go to https://vercel.com/dashboard
2. Select your project
3. Copy the URL (e.g., `https://ai-sports-betting.vercel.app`)

### **Step 2: Add GitHub Secrets**

1. Go to your GitHub repository
2. Click **Settings** (top menu)
3. Click **Secrets and variables** → **Actions** (left sidebar)
4. Click **New repository secret**

#### **Secret 1: APP_URL**

- **Name:** `APP_URL`
- **Value:** `https://your-app.vercel.app` (your actual Vercel URL)
- Click **Add secret**

#### **Secret 2: CRON_SECRET**

- **Name:** `CRON_SECRET`
- **Value:** (same value as in your `.env.local` file)
  - If you don't have one, generate it:
    ```bash
    openssl rand -base64 32
    ```
- Click **Add secret**

### **Step 3: Verify Secrets**

After adding, you should see:
- ✅ `APP_URL` in the secrets list
- ✅ `CRON_SECRET` in the secrets list

**Note:** Secrets are hidden (shows `***`), you can't see the values after saving.

---

## 🧪 Test the Cron Job

### **Option 1: Manual Trigger**

1. Go to your GitHub repo
2. Click **Actions** tab
3. Select **Refresh Insider Alerts** workflow
4. Click **Run workflow** → **Run workflow**
5. Watch it execute

### **Option 2: Wait for Schedule**

The cron runs automatically every 5 minutes:
```yaml
schedule:
  - cron: '*/5 * * * *'
```

---

## 📋 Complete Setup Checklist

- [ ] Deploy app to Vercel
- [ ] Get Vercel URL (e.g., `https://your-app.vercel.app`)
- [ ] Add `APP_URL` secret in GitHub (your Vercel URL)
- [ ] Add `CRON_SECRET` secret in GitHub (same as `.env.local`)
- [ ] Test workflow manually
- [ ] Verify cron runs every 5 minutes

---

## 🔍 Troubleshooting

### **Error: "URL rejected: No host part"**
- ✅ **Fix:** Add `APP_URL` secret in GitHub

### **Error: "Unauthorized" (401)**
- ✅ **Fix:** Add `CRON_SECRET` secret in GitHub (must match `.env.local`)

### **Error: "Connection refused" or "Failed to connect"**
- ✅ **Fix:** Make sure your Vercel app is deployed and running
- ✅ **Fix:** Check if `APP_URL` is correct (no trailing slash)

### **Error: "Missing X_BEARER_TOKEN"**
- ✅ **Fix:** Add `X_BEARER_TOKEN` to Vercel environment variables
- ✅ Go to Vercel Dashboard → Project → Settings → Environment Variables

---

## 🎯 Quick Setup Commands

```bash
# Generate CRON_SECRET
openssl rand -base64 32

# Copy this value to:
# 1. .env.local (for local testing)
# 2. GitHub Secrets → CRON_SECRET
# 3. Vercel Environment Variables → CRON_SECRET
```

---

## 📝 Example Secrets

**GitHub Secrets:**
```
APP_URL = https://ai-sports-betting.vercel.app
CRON_SECRET = abc123xyz789... (generated secret)
```

**Vercel Environment Variables:**
```
CRON_SECRET = abc123xyz789... (same as GitHub)
X_BEARER_TOKEN = AAAA... (from X Developer Portal)
```

---

## ✅ After Setup

Once secrets are added:
1. Go to **Actions** tab
2. Click **Refresh Insider Alerts**
3. Click **Run workflow**
4. Should see: `✅ Success! Cron job completed.`

The workflow will now run automatically every 5 minutes! 🎉

