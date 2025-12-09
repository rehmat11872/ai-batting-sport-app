# ⚡ Cron Job Quick Start

## **Current Status** ❌

**Cron job is NOT running automatically yet!**

You must call it manually:
```bash
curl "http://localhost:3000/api/insiders/refresh"
```

---

## **How It Works** 🔄

### **It's NOT a Webhook - It's Polling!**

**Webhook (what we DON'T use):**
- X/Twitter calls YOUR server when tweet happens
- ❌ X API doesn't support this

**Cron Job (what we DO use):**
- External service calls YOUR endpoint every 5 minutes
- ✅ You control when to fetch
- ✅ Works with any hosting

### **Flow:**

```
External Cron Service (every 5 min)
    ↓
HTTP GET → /api/insiders/refresh
    ↓
Your Server Processes:
  - Fetches tweets from X API
  - Filters by keywords
  - Saves to database
    ↓
Alerts appear in dashboard!
```

---

## **Setup Options** 🛠️

### **Option 1: Vercel Cron (Easiest)** ⭐

**Already configured!** Just need to:

1. **Set environment variable in Vercel:**
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Add: `CRON_SECRET` = `your-random-secret`
   - Generate secret:
     ```bash
     openssl rand -base64 32
     ```

2. **Deploy:**
   ```bash
   git push
   ```

3. **Done!** Vercel will call `/api/insiders/refresh` every 5 minutes automatically!

**File created:** `vercel.json` ✅

---

### **Option 2: External Cron Service (Works Anywhere)**

**Recommended: cron-job.org (Free)**

1. **Sign up:** https://cron-job.org (free account)

2. **Create cron job:**
   - **Title:** Refresh Insider Alerts
   - **URL:** `https://your-app.vercel.app/api/insiders/refresh`
   - **Schedule:** Every 5 minutes
   - **HTTP Header:**
     - Name: `Authorization`
     - Value: `Bearer YOUR_CRON_SECRET`

3. **Save** - It will call your endpoint every 5 minutes!

**No code changes needed!** ✅

---

### **Option 3: GitHub Actions (Free)**

**Already configured!** Just need to:

1. **Set secrets in GitHub:**
   - Repository → Settings → Secrets and variables → Actions
   - Add:
     - `CRON_SECRET` = `your-random-secret`
     - `APP_URL` = `https://your-app.vercel.app`

2. **Enable workflow:**
   - Go to Actions tab
   - Enable "Refresh Insider Alerts" workflow

3. **Done!** GitHub will call your endpoint every 5 minutes!

**File created:** `.github/workflows/refresh-alerts.yml` ✅

---

## **Testing** 🧪

### **Test Locally (Manual):**

```bash
# Without secret (will fail if CRON_SECRET is set)
curl "http://localhost:3000/api/insiders/refresh"

# With secret (will work)
curl -H "Authorization: Bearer your-secret" \
  "http://localhost:3000/api/insiders/refresh"
```

### **Test on Production:**

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  "https://your-app.vercel.app/api/insiders/refresh"
```

**Expected response:**
```json
{
  "requestedSports": ["NFL", "NBA", "Soccer"],
  "fetched": 15,
  "inserted": 12
}
```

---

## **Recommended Setup** ⭐

### **For Vercel:**

1. ✅ `vercel.json` already created
2. ✅ Set `CRON_SECRET` in Vercel dashboard
3. ✅ Deploy
4. ✅ Done!

### **For Other Hosts:**

1. ✅ Use **cron-job.org** (free, easy)
2. ✅ Set URL + Authorization header
3. ✅ Done!

---

## **Summary** ✅

**Current state:**
- ❌ Manual only (no automatic cron)

**How it works:**
- ✅ External service calls your endpoint every 5 minutes
- ✅ Your server fetches tweets, processes, saves
- ✅ NOT a webhook (you poll X API)

**Next steps:**
1. Choose option (Vercel cron or external service)
2. Set `CRON_SECRET`
3. Deploy/configure
4. Done!

**Files created:**
- ✅ `vercel.json` - Vercel cron config
- ✅ `.github/workflows/refresh-alerts.yml` - GitHub Actions
- ✅ `CRON_JOB_SETUP.md` - Detailed guide

🎉 **Ready to set up!**

