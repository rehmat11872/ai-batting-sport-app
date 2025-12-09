# 🔴 Real-Time Example: Tweet → Alert in App

## 📱 Complete Flow: Someone Tweets → Alert Appears

---

## **Scenario: Sunday 11:15 AM - NFL Game Day**

### **Step 1: Insider Tweets** 🐦

**Time: 11:15:00 AM**

@AdamSchefter tweets:
```
"BREAKING: Chiefs RB Isiah Pacheco OUT for today's game vs Bills with injury"
```

**Tweet Details:**
- Tweet ID: `1234567890123456789`
- Author: @AdamSchefter
- Time: 2025-11-17 11:15:00 AM ET
- Text: Contains keywords: "BREAKING", "OUT", "injury"

---

### **Step 2: Cron Job Triggers (Every 5 Minutes)** ⏰

**Time: 11:15:05 AM**

**Cron job calls:**
```bash
GET /api/insiders/refresh
```

**OR manually:**
```bash
curl "http://localhost:3000/api/insiders/refresh"
```

---

### **Step 3: What Happens Inside `/api/insiders/refresh`** 🔄

**File: `app/api/insiders/refresh/route.ts`**

#### **3.1: Load Game Schedules**
```javascript
// Fetches upcoming NFL/NBA/Soccer games from ESPN
const schedules = await loadSchedules(["NFL", "NBA", "Soccer"]);
// Result: { NFL: [Date("2025-11-17 13:00:00")], NBA: [], Soccer: [] }
```

#### **3.2: Build X API Query for NFL**
```javascript
// File: lib/insiders.ts → buildQueryForSport("NFL")
const query = `(from:AdamSchefter OR from:RapSheet OR from:TomPelissero ...) 
               (injury OR out OR inactive OR benched OR "will not play" OR breaking ...) 
               lang:en -is:retweet`;
```

**Actual query sent to X:**
```
(from:AdamSchefter OR from:RapSheet OR from:TomPelissero OR from:MikeGarafolo OR from:JayGlazer OR from:JFowlerESPN OR from:Rotoworld_FB OR from:RotoWireNFL OR from:NFLInjuryReport) (injury OR injured OR out OR inactive OR benched OR "will not play" OR questionable OR doubtful OR gtd OR "game time decision" OR ir OR "concussion protocol" OR "late scratch" OR starting OR lineup OR available OR sidelined OR postponed OR delayed OR weather OR moved OR rescheduled OR breaking OR update OR "just in" OR alert OR confirmed) lang:en -is:retweet
```

#### **3.3: Call X API v2 Search**
```javascript
// File: lib/x-client.ts → searchRecentTweets(query)
const response = await fetch(
  "https://api.x.com/2/tweets/search/recent?query=...&tweet.fields=created_at,lang,entities&user.fields=username,name&expansions=author_id&max_results=50",
  {
    headers: {
      Authorization: `Bearer ${X_BEARER_TOKEN}`, // ← Uses bearer token!
    }
  }
);
```

**X API Response:**
```json
{
  "data": [
    {
      "id": "1234567890123456789",
      "text": "BREAKING: Chiefs RB Isiah Pacheco OUT for today's game vs Bills with injury",
      "author_id": "123456",
      "created_at": "2025-11-17T16:15:00.000Z"
    }
  ],
  "includes": {
    "users": [
      {
        "id": "123456",
        "username": "AdamSchefter",
        "name": "Adam Schefter"
      }
    ]
  }
}
```

#### **3.4: Process Each Tweet**
```javascript
for (const tweet of tweets) {
  // 1. Check for keywords
  const matchedKeywords = detectMatchedKeywords(tweet.text);
  // Result: ["BREAKING", "out", "injury"]
  
  // 2. Skip if no keywords
  if (matchedKeywords.length === 0) continue; // ← This tweet passes!
  
  // 3. Get author info
  const user = userById.get(tweet.author_id);
  // Result: { username: "AdamSchefter", name: "Adam Schefter" }
  
  // 4. Infer sport from handle
  const inferredSport = inferSportFromHandle("AdamSchefter");
  // Result: "NFL"
  
  // 5. Check timing window
  const gameTime = new Date("2025-11-17 13:00:00"); // 1:00 PM kickoff
  const tweetedAt = new Date("2025-11-17 11:15:00"); // 11:15 AM
  const diffMinutes = (gameTime - tweetedAt) / 60000; // 105 minutes
  // Result: windowTag = "NFL_90_MIN" (within 60-150 min window)
  
  // 6. Calculate urgency
  const urgencyScore = computeUrgencyScore(["BREAKING", "out", "injury"], "NFL_90_MIN");
  // Result: 9/10 (high urgency: breaking + out + timing window)
  
  // 7. Prepare alert
  preparedAlerts.push({
    tweetId: "1234567890123456789",
    author: "Adam Schefter",
    authorHandle: "@AdamSchefter",
    sport: "NFL",
    text: "BREAKING: Chiefs RB Isiah Pacheco OUT for today's game vs Bills with injury",
    matchedKeywords: ["BREAKING", "out", "injury"],
    tweetedAt: new Date("2025-11-17T16:15:00.000Z"),
    url: "https://x.com/AdamSchefter/status/1234567890123456789",
    urgencyScore: 9,
    windowTag: "NFL_90_MIN",
    isPremium: true,
    rawJson: tweet
  });
}
```

#### **3.5: Save to Database**
```javascript
// File: lib/alerts.ts → saveAlerts(preparedAlerts)
await prisma.$executeRaw`
  INSERT INTO alerts (
    id, tweet_id, author, author_handle, sport, text,
    matched_keywords, tweeted_at, url, urgency_score,
    window_tag, is_premium, raw_json
  )
  VALUES (
    ${uuid()}, '1234567890123456789', 'Adam Schefter', '@AdamSchefter',
    'NFL', 'BREAKING: Chiefs RB...', ARRAY['BREAKING', 'out', 'injury'],
    '2025-11-17T16:15:00.000Z', 'https://x.com/...', 9,
    'NFL_90_MIN', true, '{"id":"1234567890"...}'
  )
  ON CONFLICT (tweet_id) DO NOTHING;
`;
```

**Response:**
```json
{
  "requestedSports": ["NFL", "NBA", "Soccer"],
  "fetched": 1,
  "inserted": 1
}
```

---

### **Step 4: User Opens Alerts Tab** 👤

**Time: 11:16:00 AM (1 minute after tweet)**

**User action:**
1. User is logged in on dashboard
2. Clicks "Breaking News Alerts" tab

**What happens:**
```javascript
// File: components/dashboard-content.tsx
const loadAlerts = async () => {
  const res = await fetch(`/api/insiders/alerts?limit=${isSubscribed ? 50 : 5}`);
  const data = await res.json();
  setAlerts(data.alerts);
};
```

**API Call:**
```bash
GET /api/insiders/alerts?limit=5
```

**Backend (`app/api/insiders/alerts/route.ts`):**
```javascript
// 1. Check session
const session = await getSession();
const isSubscribed = session?.isSubscribed ?? false; // false for free user

// 2. Set limit
const maxLimit = isSubscribed ? 50 : 5; // Free: 5, Premium: 50
const limit = Math.min(requestedLimit, maxLimit); // limit = 5

// 3. Query database
const alerts = await fetchAlertsFromDb({ sport: null, limit: 5 });

// 4. Return
return NextResponse.json({
  alerts: [
    {
      id: "uuid-here",
      tweetId: "1234567890123456789",
      author: "Adam Schefter",
      authorHandle: "@AdamSchefter",
      sport: "NFL",
      text: "BREAKING: Chiefs RB Isiah Pacheco OUT for today's game vs Bills with injury",
      matchedKeywords: ["BREAKING", "out", "injury"],
      tweetedAt: "2025-11-17T16:15:00.000Z",
      url: "https://x.com/AdamSchefter/status/1234567890123456789",
      urgencyScore: 9,
      windowTag: "NFL_90_MIN",
      isPremium: true
    }
  ],
  canViewFullFeed: false // Free user
});
```

---

### **Step 5: Alert Appears in UI** 🎨

**Time: 11:16:01 AM**

**User sees:**

```
┌─────────────────────────────────────────────────┐
│ 🏈 NFL  [NFL 90 MIN]                            │
│ 🔔 @AdamSchefter                                │
│                                                 │
│ BREAKING: Chiefs RB Isiah Pacheco OUT for       │
│ today's game vs Bills with injury               │
│                                                 │
│ Keywords: [BREAKING] [out] [injury]             │
│ Urgency: 9/10                                   │
│ View tweet →                                    │
└─────────────────────────────────────────────────┘
```

**If more alerts exist:**
- **Free user**: Sees 5 alerts + "Unlock Full Alerts" button
- **Premium user**: Sees up to 50 alerts, no limit message

---

## **Why X_BEARER_TOKEN vs X_API_KEY + X_API_KEY_SECRET?** 🔑

### **The Difference:**

| Type | Purpose | How to Get | Used For |
|------|---------|------------|----------|
| **X_API_KEY** | OAuth client ID | From X Developer Portal | OAuth flow (user login) |
| **X_API_KEY_SECRET** | OAuth client secret | From X Developer Portal | OAuth flow (user login) |
| **X_BEARER_TOKEN** | App-only access token | Generate from API key/secret | Direct API calls (no user login) |

### **Why We Need Bearer Token:**

**X API v2 has 2 authentication methods:**

1. **OAuth 2.0 User Context** (requires user login)
   - Uses: `X_API_KEY` + `X_API_KEY_SECRET`
   - User must authorize your app
   - Can access user-specific data

2. **App-Only Bearer Token** (no user login needed) ✅ **We use this!**
   - Uses: `X_BEARER_TOKEN`
   - No user authorization needed
   - Perfect for reading public tweets
   - Simpler for server-side automation

### **How to Generate X_BEARER_TOKEN:**

**Option 1: X Developer Portal (Easiest)**
1. Go to https://developer.twitter.com/en/portal/dashboard
2. Select your App
3. Go to "Keys and tokens"
4. Under "Bearer Token", click "Generate"
5. Copy the token → `X_BEARER_TOKEN` in `.env.local`

**Option 2: Generate from API Key/Secret (Programmatic)**
```bash
# Base64 encode your API key and secret
echo -n "YOUR_API_KEY:YOUR_API_KEY_SECRET" | base64

# Then call X API to get bearer token
curl -X POST "https://api.x.com/oauth2/token" \
  -H "Authorization: Basic <base64_encoded>" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials"

# Response:
# {
#   "access_token": "AAAAAAAAAAAAAAAAAAAAA...",
#   "token_type": "bearer"
# }
# Copy "access_token" → X_BEARER_TOKEN
```

**Your `.env.local` should have:**
```env
# OAuth (for user login - not used for alerts)
X_API_KEY=VIWOGJrh5nhTmemdS2P2QMKN4
X_API_KEY_SECRET=cFwuLvcemwKnCqiS80d12Pwya61LuDricYozK4BRo49zHM4eEL

# App-only bearer token (for fetching tweets)
X_BEARER_TOKEN=AAAAAAAAAAAAAAAAAAAAA...  # ← Generate this!
```

---

## **Complete Data Flow Diagram** 📊

```
┌─────────────────────────────────────────────────────────┐
│ 1. CRON JOB (Every 5 min)                               │
│    GET /api/insiders/refresh                            │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 2. BUILD QUERY                                           │
│    lib/insiders.ts → buildQueryForSport("NFL")          │
│    Query: (from:AdamSchefter OR ...) (injury OR ...)    │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 3. CALL X API v2                                         │
│    lib/x-client.ts → searchRecentTweets(query)          │
│    Authorization: Bearer X_BEARER_TOKEN                  │
│    Endpoint: https://api.x.com/2/tweets/search/recent   │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 4. X API RETURNS TWEETS                                  │
│    {                                                     │
│      "data": [{ id, text, author_id, created_at }],     │
│      "includes": { users: [{ username, name }] }       │
│    }                                                     │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 5. PROCESS TWEETS                                        │
│    - Filter by keywords (injury, out, breaking...)      │
│    - Infer sport from author handle                     │
│    - Check timing window (90 min before game?)           │
│    - Calculate urgency score (1-10)                     │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 6. SAVE TO DATABASE                                     │
│    lib/alerts.ts → saveAlerts()                         │
│    INSERT INTO alerts (tweet_id, author, text, ...)     │
│    ON CONFLICT DO NOTHING (avoid duplicates)            │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 7. USER OPENS ALERTS TAB                                │
│    GET /api/insiders/alerts?limit=5                     │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 8. QUERY DATABASE                                       │
│    SELECT * FROM alerts                                  │
│    ORDER BY tweeted_at DESC                              │
│    LIMIT 5 (free) or 50 (premium)                       │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ 9. DISPLAY IN UI                                        │
│    components/dashboard-content.tsx                      │
│    - Show alert cards                                   │
│    - Highlight keywords                                 │
│    - Free: 5 alerts, Premium: 50 alerts                 │
└─────────────────────────────────────────────────────────┘
```

---

## **Free vs Premium Limits** 💎

### **Free User:**
- **Limit**: 5 alerts
- **API Call**: `GET /api/insiders/alerts?limit=5`
- **Database Query**: `LIMIT 5`
- **UI Shows**: 5 alerts + "Unlock Full Alerts" button

### **Premium User:**
- **Limit**: 50 alerts
- **API Call**: `GET /api/insiders/alerts?limit=50`
- **Database Query**: `LIMIT 50`
- **UI Shows**: Up to 50 alerts, no limit message

**Code location:**
```typescript
// app/api/insiders/alerts/route.ts
const maxLimit = isSubscribed ? 50 : 5; // ← Free: 5, Premium: 50
```

---

## **How to Test Right Now** 🧪

### **1. Generate X_BEARER_TOKEN:**

**Quick method (using your existing keys):**
```bash
# Base64 encode
echo -n "VIWOGJrh5nhTmemdS2P2QMKN4:cFwuLvcemwKnCqiS80d12Pwya61LuDricYozK4BRo49zHM4eEL" | base64

# Get bearer token
curl -X POST "https://api.x.com/oauth2/token" \
  -H "Authorization: Basic <paste_base64_here>" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials"
```

**Or use X Developer Portal:**
1. Go to https://developer.twitter.com/en/portal/dashboard
2. Your App → Keys and tokens
3. Generate Bearer Token
4. Copy to `.env.local`

### **2. Add to `.env.local`:**
```env
X_BEARER_TOKEN=AAAAAAAAAAAAAAAAAAAAA...  # Paste token here
```

### **3. Restart dev server:**
```bash
npm run dev
```

### **4. Trigger refresh:**
```bash
curl "http://localhost:3000/api/insiders/refresh"
```

**Expected response:**
```json
{
  "requestedSports": ["NFL", "NBA", "Soccer"],
  "fetched": 15,
  "inserted": 12
}
```

### **5. View alerts:**
- Go to `http://localhost:3000/dashboard`
- Click "Breaking News Alerts"
- You should see alerts!

---

## **Summary** ✅

**What `/api/insiders/refresh` does:**
1. ✅ Builds X API query (insiders + keywords)
2. ✅ Calls X API v2 with `X_BEARER_TOKEN`
3. ✅ Filters tweets by keywords
4. ✅ Processes timing windows
5. ✅ Saves alerts to database

**Why `X_BEARER_TOKEN`:**
- ✅ App-only auth (no user login needed)
- ✅ Simpler for server-side automation
- ✅ Different from `X_API_KEY`/`X_API_KEY_SECRET` (those are for OAuth)

**Free vs Premium:**
- ✅ Free: 5 alerts
- ✅ Premium: 50 alerts

**Real-time flow:**
- ✅ Tweet → Cron fetches → Processes → Saves → User sees alert

🎉 **Everything is ready! Just add `X_BEARER_TOKEN` and test!**

