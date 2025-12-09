# 🔔 Sports Insider Monitoring - Real-Time User Flow

## 📱 Complete User Journey Example

### **Scenario: NFL Sunday - User wants early injury news**

---

## **Step 1: User Opens App** 🚀

**Time: 11:00 AM ET (Sunday)**

1. User visits: `https://your-app.com`
2. Clicks **"Get Started"** or **"Login"**
3. Redirected to Whop OAuth
4. Logs in with Whop account
5. **✅ User saved to database** (you just saw this work!)
6. Redirected to `/dashboard`

**What happens in code:**
- `app/api/oauth/callback/route.ts` saves user to `users` table
- Creates session in `user_sessions` table
- Sets session cookie

---

## **Step 2: User Navigates to Alerts Tab** 📊

**Time: 11:05 AM ET**

1. User is on dashboard
2. Sees navigation dropdown: "Today's Predictions", "NBA", "NFL", "Soccer", **"Breaking News Alerts"**
3. Clicks **"Breaking News Alerts"**

**What happens in code:**
- `components/dashboard-content.tsx` switches to `currentSection = "alerts"`
- Calls `loadAlerts("ALL")` which fetches from `/api/insiders/alerts?limit=5`
- `app/api/insiders/alerts/route.ts` queries `alerts` table
- Returns alerts (or empty array if none yet)

**User sees:**
- If **free user**: "No alerts yet" or first 5 alerts + "Unlock Full Alerts" button
- If **premium user**: Up to 50 alerts with full details

---

## **Step 3: Background System Fetches New Tweets** 🤖

**Time: 11:10 AM ET (Automated - Every 2-5 minutes)**

**Cron job or manual trigger calls:**
```bash
GET /api/insiders/refresh
```

**What happens in code:**
1. `app/api/insiders/refresh/route.ts` runs
2. For each sport (NFL, NBA, Soccer):
   - Builds X API query: `from:AdamSchefter OR from:RapSheet ... (injury OR out OR inactive ...)`
   - Calls `lib/x-client.ts` → `searchRecentTweets(query)`
   - Uses `X_BEARER_TOKEN` to authenticate with X API v2
3. Filters tweets by keywords:
   - `lib/insiders.ts` → `detectMatchedKeywords(tweet.text)`
   - Only keeps tweets with: "injury", "out", "inactive", "benched", "BREAKING", etc.
4. Infers sport from author handle:
   - `@AdamSchefter` → NFL
   - `@ShamsCharania` → NBA
   - `@FabrizioRomano` → Soccer
5. Computes timing window:
   - Fetches ESPN schedules (NFL/NBA/Soccer games)
   - Checks if tweet time is within:
     - **NFL**: 60-150 minutes before kickoff → `windowTag: "NFL_90_MIN"`
     - **NBA**: 15-150 minutes before tipoff → `windowTag: "NBA_2H"`
     - **Soccer**: 60-150 minutes before kickoff → `windowTag: "SOC_2H"`
6. Calculates urgency score (1-10):
   - High urgency: "BREAKING" + "injury" + timing window = 9/10
   - Medium: "out" + no timing = 5/10
7. Saves to database:
   - `lib/alerts.ts` → `saveAlerts()` inserts into `alerts` table
   - Uses `ON CONFLICT (tweet_id) DO NOTHING` to avoid duplicates

**Example tweet processed:**
```
Tweet from @AdamSchefter at 11:15 AM:
"BREAKING: Chiefs RB out for today's game with injury"

→ Matched keywords: ["BREAKING", "out", "injury"]
→ Sport: NFL
→ Window tag: "NFL_90_MIN" (if game at 1:00 PM)
→ Urgency: 9/10
→ Saved to alerts table
```

---

## **Step 4: User Sees New Alert** 🔔

**Time: 11:16 AM ET**

1. User refreshes dashboard or alerts tab auto-refreshes
2. `loadAlerts()` runs again
3. New alert appears in the list!

**User sees:**
```
┌─────────────────────────────────────┐
│ 🏈 NFL  [NFL 90 MIN]                │
│ 🔔 @AdamSchefter                    │
│                                     │
│ BREAKING: Chiefs RB out for        │
│ today's game with injury            │
│                                     │
│ Keywords: [BREAKING] [out] [injury]│
│ Urgency: 9/10                       │
│ View tweet →                        │
└─────────────────────────────────────┘
```

**What happens in code:**
- `components/dashboard-content.tsx` → `AlertCard` component
- Highlights keywords with yellow background
- Shows sport badge, timing window, urgency score
- Links to X.com tweet

---

## **Step 5: User Filters by Sport** 🎯

**Time: 11:20 AM ET**

1. User clicks **"NFL"** filter button
2. Only NFL alerts shown

**What happens in code:**
- `setAlertsSportFilter("NFL")`
- Calls `/api/insiders/alerts?sport=NFL&limit=5`
- Backend filters: `WHERE sport = 'NFL'`

---

## **Step 6: Premium User Gets Full Access** ⭐

**Time: 11:25 AM ET**

**If user upgrades to premium:**
1. User clicks "Upgrade to Premium" → Whop checkout
2. Completes payment
3. Whop webhook updates `memberships` table → `status: "active"`
4. User refreshes dashboard
5. Now sees **up to 50 alerts** instead of 5
6. No "Unlock Full Alerts" message

**What happens in code:**
- `app/api/webhooks/whop/route.ts` receives webhook
- Updates `memberships` table
- `lib/session.ts` → `getSession()` checks membership
- Returns `isSubscribed: true`
- `app/api/insiders/alerts/route.ts` allows `limit: 50` for premium

---

## **Real-Time Example Timeline** ⏰

### **Sunday, 11:00 AM - NFL Game Day**

| Time | Event | What User Sees |
|------|-------|----------------|
| **11:00 AM** | User logs in | Dashboard loads |
| **11:05 AM** | Opens Alerts tab | "No alerts yet" (empty) |
| **11:10 AM** | Cron runs refresh | Background: Fetches tweets |
| **11:11 AM** | @AdamSchefter tweets | "BREAKING: Player X out" |
| **11:12 AM** | System processes tweet | Saved to database |
| **11:13 AM** | User refreshes alerts | **Alert appears!** 🔔 |
| **11:15 AM** | @RapSheet tweets | "Injury update: Player Y questionable" |
| **11:16 AM** | System processes | Second alert saved |
| **11:17 AM** | User sees both alerts | 2 NFL alerts with keywords highlighted |
| **11:30 AM** | NFL inactive lists drop | More alerts flood in |
| **11:35 AM** | User has 8 alerts | Free user sees 5, premium sees all 8 |

---

## **How to Test This Right Now** 🧪

### **1. Make sure alerts table exists:**
```bash
# Already done! ✅
node scripts/setup-database.js
```

### **2. Set X_BEARER_TOKEN in .env.local:**
```env
X_BEARER_TOKEN=your_actual_bearer_token_here
```

### **3. Manually trigger refresh:**
```bash
# In browser or terminal:
curl "http://localhost:3000/api/insiders/refresh"

# Or with cron secret (if set):
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  "http://localhost:3000/api/insiders/refresh"
```

**Expected response:**
```json
{
  "requestedSports": ["NFL", "NBA", "Soccer"],
  "fetched": 15,
  "inserted": 12
}
```

### **4. View alerts in dashboard:**
1. Go to `http://localhost:3000/dashboard`
2. Click "Breaking News Alerts" tab
3. You should see alerts (if any were fetched)

### **5. Test API directly:**
```bash
# Get all alerts
curl "http://localhost:3000/api/insiders/alerts?limit=10"

# Get NFL only
curl "http://localhost:3000/api/insiders/alerts?sport=NFL&limit=5"
```

---

## **What Each Component Does** 🔧

| Component | Purpose | When It Runs |
|-----------|---------|--------------|
| `lib/insiders.ts` | Insider lists, keywords, timing logic | On refresh |
| `lib/x-client.ts` | X API v2 search | On refresh |
| `app/api/insiders/refresh/route.ts` | Fetch & save alerts | Cron/manual |
| `app/api/insiders/alerts/route.ts` | Read alerts for UI | User visits alerts tab |
| `lib/alerts.ts` | Database save/read | On refresh & alerts API |
| `components/dashboard-content.tsx` | Display alerts UI | User navigates to alerts |
| `components/dashboard-nav.tsx` | Navigation dropdown | Always visible |

---

## **Production Setup** 🚀

### **Cron Job (Vercel/Netlify/Render):**

**Vercel:**
Create `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/insiders/refresh",
    "schedule": "*/5 * * * *"
  }]
}
```

**Netlify:**
Use Netlify Functions with scheduled triggers

**Render:**
Use Render Cron Jobs

**Every 5 minutes:**
- System fetches new tweets
- Processes keywords
- Saves alerts
- Users see updates when they refresh

---

## **Summary** ✅

**Your app now has:**
- ✅ Database working (login succeeded!)
- ✅ Alerts table created
- ✅ Full insider monitoring system coded
- ✅ Premium gating implemented
- ✅ Real-time alerts display

**To make it live:**
1. Set `X_BEARER_TOKEN` in `.env.local`
2. Run refresh manually or set up cron
3. Users will see alerts in dashboard!

**The flow is:**
1. User logs in → Dashboard
2. Clicks "Breaking News Alerts"
3. System fetches tweets every 5 min (cron)
4. Alerts appear with keywords highlighted
5. Premium users see more alerts

🎉 **Everything is ready!**

