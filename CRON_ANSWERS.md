# ❓ Cron Job Questions - All Answers

## **1. Is Cron Job Working?** ❌

**NO - Currently it's NOT automatically running!**

**Current state:**
- ✅ Endpoint exists: `/api/insiders/refresh`
- ✅ Has security protection (`CRON_SECRET`)
- ❌ **No cron job configured** - You must hit it manually

**To test manually:**
```bash
curl "http://localhost:3000/api/insiders/refresh"
```

---

## **2. Do We Need to Hit Manually?** ✅

**YES - Currently yes!**

Until you set up a cron job, you must call it manually:
- Via browser: `http://localhost:3000/api/insiders/refresh`
- Via curl: `curl "http://localhost:3000/api/insiders/refresh"`
- Via Postman/API client

**After setup:** It will run automatically every 5 minutes! ⏰

---

## **3. How Does Cron Work with Server?** 🖥️

### **How It Works:**

```
┌─────────────────────────────────────────────────┐
│ EXTERNAL CRON SERVICE                           │
│ (Vercel Cron / cron-job.org / GitHub Actions)   │
│                                                 │
│ Every 5 minutes:                               │
│   → Makes HTTP GET request                      │
│   → To: https://your-app.com/api/insiders/refresh │
│   → With: Authorization: Bearer CRON_SECRET     │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼ HTTP Request
┌─────────────────────────────────────────────────┐
│ YOUR SERVER (Vercel/Netlify/Render)             │
│                                                 │
│ 1. Receives HTTP request                        │
│ 2. Next.js routes to:                           │
│    app/api/insiders/refresh/route.ts            │
│ 3. Checks security (CRON_SECRET)                │
│ 4. If valid → Executes code                     │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│ YOUR CODE EXECUTES                              │
│                                                 │
│ 1. Builds X API query                           │
│    (insiders + keywords)                        │
│                                                 │
│ 2. Calls X API:                                 │
│    GET /2/tweets/search/recent                  │
│    Authorization: Bearer X_BEARER_TOKEN         │
│                                                 │
│ 3. X API returns tweets:                        │
│    { data: [{ id, text, author_id }] }         │
│                                                 │
│ 4. Processes tweets:                            │
│    - Filters by keywords                        │
│    - Infers sport                               │
│    - Calculates urgency                         │
│                                                 │
│ 5. Saves to database:                           │
│    INSERT INTO alerts (...)                     │
│                                                 │
│ 6. Returns response:                            │
│    { fetched: 15, inserted: 12 }                │
└─────────────────────────────────────────────────┘
```

### **Key Points:**

1. **Server doesn't need to be "always on"**
   - Vercel/Netlify wake up when called
   - Serverless functions scale automatically

2. **External service triggers**
   - Cron service (Vercel/cron-job.org) calls your endpoint
   - You don't need a running server process

3. **Stateless execution**
   - Each call is independent
   - No memory/state between calls

4. **Secure**
   - Protected by `CRON_SECRET`
   - Only authorized calls can trigger

---

## **4. How Does It Work - Action or Webhook?** 🔄

### **It's an ACTION (HTTP Endpoint), NOT a Webhook!**

**Difference:**

| Type | How It Works | Who Calls |
|------|-------------|-----------|
| **Webhook** | External service (X/Twitter) calls YOUR server when something happens | External service |
| **Cron Job** ✅ | External service calls YOUR endpoint on a schedule | External service |
| **Action** ✅ | Your endpoint that does work | Called by cron |

### **Why Not Webhook?**

- ❌ X API doesn't have webhooks for tweet search
- ❌ X doesn't notify you when insiders tweet
- ✅ We must poll X API ourselves

### **Why Cron Job?**

- ✅ We control when to fetch (every 5 minutes)
- ✅ We poll X API for new tweets
- ✅ Works with any hosting platform
- ✅ Simple and reliable

### **Flow:**

```
Cron Service (every 5 min)
    ↓
Calls: GET /api/insiders/refresh
    ↓
Your Code Executes:
  - Fetches tweets from X API
  - Processes alerts
  - Saves to database
    ↓
Alerts appear in dashboard!
```

**It's a scheduled HTTP endpoint call, not a webhook!**

---

## **5. How to Set It Up** 🛠️

### **Option 1: Vercel Cron (Recommended)** ⭐

**Already configured!** Files created:
- ✅ `vercel.json` - Cron configuration

**Steps:**
1. Set `CRON_SECRET` in Vercel dashboard
2. Deploy
3. Done! Vercel calls it every 5 minutes automatically

### **Option 2: External Service (cron-job.org)**

**Free and works with any host:**
1. Sign up: https://cron-job.org
2. Create cron job:
   - URL: `https://your-app.com/api/insiders/refresh`
   - Schedule: Every 5 minutes
   - Header: `Authorization: Bearer YOUR_CRON_SECRET`
3. Save - Done!

### **Option 3: GitHub Actions**

**Already configured!** File created:
- ✅ `.github/workflows/refresh-alerts.yml`

**Steps:**
1. Set secrets in GitHub (CRON_SECRET, APP_URL)
2. Enable workflow
3. Done! GitHub calls it every 5 minutes

---

## **Summary** ✅

**Q: Is cron job working?**
- ❌ No - Currently manual only

**Q: Do we need to hit manually?**
- ✅ Yes - Until you set up cron

**Q: How does cron work with server?**
- ✅ External service calls your HTTP endpoint every 5 minutes
- ✅ Your server processes and saves alerts
- ✅ Serverless (no always-on server needed)

**Q: How does it work - action or webhook?**
- ✅ It's an **ACTION** (HTTP endpoint)
- ✅ NOT a webhook (X doesn't support it)
- ✅ Cron service calls your endpoint on schedule

**Next Steps:**
1. Choose setup option (Vercel cron recommended)
2. Set `CRON_SECRET` environment variable
3. Deploy/configure
4. Done! It will run automatically every 5 minutes! ⏰

**Files Created:**
- ✅ `vercel.json` - Vercel cron config
- ✅ `.github/workflows/refresh-alerts.yml` - GitHub Actions
- ✅ `CRON_JOB_SETUP.md` - Detailed guide
- ✅ `CRON_QUICK_START.md` - Quick setup

🎉 **Everything is ready - just need to configure!**

