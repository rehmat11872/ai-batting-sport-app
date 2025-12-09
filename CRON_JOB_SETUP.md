# ⏰ Cron Job Setup Guide - How It Works

## **Current Status** 📊

**❌ Cron job is NOT automatically running yet!**

**Current state:**
- ✅ Endpoint exists: `/api/insiders/refresh`
- ✅ Has security: `CRON_SECRET` protection
- ❌ **No cron job configured** - You must hit it manually

**To test manually:**
```bash
curl "http://localhost:3000/api/insiders/refresh"
```

---

## **How Cron Jobs Work** 🔄

### **What is a Cron Job?**

A **cron job** is a scheduled task that runs automatically at specific intervals (every 5 minutes, hourly, daily, etc.).

### **How It Works:**

```
┌─────────────────────────────────────────────────┐
│ 1. Cron Service (External)                      │
│    - Runs every 5 minutes                       │
│    - Calls your endpoint                        │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼ HTTP GET Request
┌─────────────────────────────────────────────────┐
│ 2. Your Server (Vercel/Netlify/Render)         │
│    GET /api/insiders/refresh                     │
│    Headers: Authorization: Bearer CRON_SECRET   │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│ 3. Your Code Executes                           │
│    - Fetches tweets from X API                   │
│    - Processes alerts                            │
│    - Saves to database                           │
└─────────────────────────────────────────────────┘
```

### **It's NOT a Webhook!**

**Difference:**
- **Webhook**: External service (X/Twitter) calls YOUR server when something happens
- **Cron Job**: YOUR server calls an endpoint on a schedule (polling)

**We use Cron Job because:**
- ✅ X API doesn't have webhooks for tweet search
- ✅ We need to poll X API every 5 minutes
- ✅ We control when to fetch

---

## **Setting Up Cron Jobs** 🛠️

### **Option 1: Vercel Cron Jobs** ⭐ (Recommended for Vercel)

**Vercel has built-in cron jobs!**

#### **Step 1: Create `vercel.json`**

Create `vercel.json` in project root:

```json
{
  "crons": [
    {
      "path": "/api/insiders/refresh",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

**Schedule format:** `*/5 * * * *` = Every 5 minutes

**Other schedules:**
- `*/5 * * * *` - Every 5 minutes
- `*/10 * * * *` - Every 10 minutes
- `0 * * * *` - Every hour
- `0 */6 * * *` - Every 6 hours

#### **Step 2: Set CRON_SECRET in Vercel**

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   ```
   CRON_SECRET=your-random-secret-here
   ```
3. Generate random secret:
   ```bash
   openssl rand -base64 32
   ```

#### **Step 3: Update Endpoint to Accept Vercel Cron**

The endpoint already checks for `CRON_SECRET`, but Vercel sends it differently. Update `app/api/insiders/refresh/route.ts`:

```typescript
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  
  // Check if called by Vercel Cron (has 'x-vercel-cron' header)
  const isVercelCron = request.headers.get('x-vercel-cron') === '1';
  
  // Or check Authorization header
  if (cronSecret && !isVercelCron) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // ... rest of code
}
```

**Vercel automatically calls your endpoint!** ✅

---

### **Option 2: External Cron Service** (Works with Any Host)

Use services like:
- **Cron-job.org** (Free)
- **EasyCron** (Free tier)
- **Uptime Robot** (Free)
- **GitHub Actions** (Free)

#### **Using Cron-job.org (Free & Easy)**

1. **Sign up:** https://cron-job.org
2. **Create new cron job:**
   - **URL:** `https://your-app.vercel.app/api/insiders/refresh`
   - **Schedule:** Every 5 minutes
   - **HTTP Header:**
     - Name: `Authorization`
     - Value: `Bearer YOUR_CRON_SECRET`
3. **Save** - It will call your endpoint every 5 minutes!

#### **Using GitHub Actions (Free)**

Create `.github/workflows/refresh-alerts.yml`:

```yaml
name: Refresh Insider Alerts

on:
  schedule:
    - cron: '*/5 * * * *'  # Every 5 minutes
  workflow_dispatch:  # Allow manual trigger

jobs:
  refresh:
    runs-on: ubuntu-latest
    steps:
      - name: Call Refresh Endpoint
        run: |
          curl -X GET \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            https://your-app.vercel.app/api/insiders/refresh
```

**Set secret in GitHub:**
1. Repository → Settings → Secrets → Actions
2. Add: `CRON_SECRET`

---

### **Option 3: Netlify Scheduled Functions**

If using Netlify, create `netlify/functions/scheduled-refresh.ts`:

```typescript
import type { Handler } from '@netlify/functions';

export const handler: Handler = async (event, context) => {
  // Call your API route
  const response = await fetch(`${process.env.URL}/api/insiders/refresh`, {
    headers: {
      'Authorization': `Bearer ${process.env.CRON_SECRET}`,
    },
  });
  
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Refresh triggered' }),
  };
};
```

Add to `netlify.toml`:

```toml
[build]
  functions = "netlify/functions"

[[plugins]]
  package = "@netlify/plugin-scheduled-functions"

[[schedules]]
  cron = "*/5 * * * *"
  function = "scheduled-refresh"
```

---

### **Option 4: Render Cron Jobs**

If using Render, add to `render.yaml`:

```yaml
services:
  - type: web
    name: your-app
    # ... your config

  - type: cron
    name: refresh-alerts
    schedule: "*/5 * * * *"
    startCommand: |
      curl -X GET \
        -H "Authorization: Bearer $CRON_SECRET" \
        https://your-app.onrender.com/api/insiders/refresh
```

---

## **How It Works on Server** 🖥️

### **Flow Diagram:**

```
┌─────────────────────────────────────────────────────────┐
│ EXTERNAL CRON SERVICE (Every 5 minutes)                  │
│                                                           │
│ 1. Timer triggers (5 min passed)                         │
│ 2. Makes HTTP GET request:                              │
│    GET https://your-app.com/api/insiders/refresh        │
│    Headers: Authorization: Bearer CRON_SECRET             │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ YOUR SERVER (Vercel/Netlify/Render)                      │
│                                                           │
│ 1. Receives HTTP request                                 │
│ 2. Next.js routes to: app/api/insiders/refresh/route.ts  │
│ 3. Checks Authorization header                            │
│ 4. If valid → Executes code                             │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ YOUR CODE EXECUTES                                       │
│                                                           │
│ 1. Builds X API query (insiders + keywords)              │
│ 2. Calls X API: GET /2/tweets/search/recent             │
│ 3. Processes tweets (filter, score, etc.)                │
│ 4. Saves to database (Supabase)                          │
│ 5. Returns: { fetched: 15, inserted: 12 }                │
└─────────────────────────────────────────────────────────┘
```

### **Key Points:**

1. **No server needs to be "always on"** - Vercel/Netlify wake up when called
2. **External service triggers** - Cron service calls your endpoint
3. **Stateless** - Each call is independent
4. **Secure** - Protected by `CRON_SECRET`

---

## **Testing Cron Jobs** 🧪

### **Test Locally (Manual):**

```bash
# Without secret (will fail)
curl "http://localhost:3000/api/insiders/refresh"

# With secret (will work)
curl -H "Authorization: Bearer your-secret" \
  "http://localhost:3000/api/insiders/refresh"
```

### **Test on Production:**

```bash
# With secret
curl -H "Authorization: Bearer $CRON_SECRET" \
  "https://your-app.vercel.app/api/insiders/refresh"
```

---

## **Recommended Setup** ⭐

### **For Vercel (Easiest):**

1. ✅ Create `vercel.json` with cron schedule
2. ✅ Set `CRON_SECRET` in Vercel environment variables
3. ✅ Update endpoint to accept Vercel cron header
4. ✅ Deploy - Vercel handles the rest!

### **For Other Hosts:**

1. ✅ Use **cron-job.org** (free, easy)
2. ✅ Set URL: `https://your-app.com/api/insiders/refresh`
3. ✅ Set Authorization header: `Bearer YOUR_CRON_SECRET`
4. ✅ Set schedule: Every 5 minutes
5. ✅ Done!

---

## **Summary** ✅

**Current state:**
- ❌ No cron job configured (manual only)

**How it works:**
- ✅ External service calls your endpoint every 5 minutes
- ✅ Your server processes and saves alerts
- ✅ NOT a webhook (you poll X API)

**Next steps:**
1. Choose platform (Vercel cron or external service)
2. Configure cron schedule
3. Set `CRON_SECRET`
4. Deploy!

**I'll create the configuration files for you!** 🚀

