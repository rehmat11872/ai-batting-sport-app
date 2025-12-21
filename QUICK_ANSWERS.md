## 🎯 Quick Answers to Your Questions

## **1. Real-Time Example: Tweet → Alert**

### **Scenario:**
- **11:15 AM**: @AdamSchefter tweets "BREAKING: Player X OUT with injury"
- **11:15:05 AM**: Cron job runs `GET /api/insiders/refresh`
- **11:15:10 AM**: System processes tweet, saves to database
- **11:16 AM**: User opens "Breaking News Alerts" tab
- **11:16:01 AM**: Alert appears in UI!

**Free user sees:** 5 alerts  
**Premium user sees:** 10 alerts

---

## **2. What Happens When Cron/Manual Hits `/api/insiders/refresh`?**

### **Step-by-Step:**

1. **Build Query** (`lib/insiders.ts`)
   ```
   Query: (from:AdamSchefter OR from:RapSheet ...) 
          (injury OR out OR inactive OR breaking ...) 
          lang:en -is:retweet
   ```

2. **Call X API** (`lib/x-client.ts`)
   ```
   GET https://api.x.com/2/tweets/search/recent?query=...
   Headers: Authorization: Bearer X_BEARER_TOKEN
   ```

3. **X API Returns Tweets**
   ```json
   {
     "data": [
       {
         "id": "1234567890",
         "text": "BREAKING: Player X OUT...",
         "author_id": "123",
         "created_at": "2025-11-17T16:15:00Z"
       }
     ],
     "includes": {
       "users": [
         {
           "id": "123",
           "username": "AdamSchefter",
           "name": "Adam Schefter"
         }
       ]
     }
   }
   ```

4. **Process Each Tweet**
   - Filter by keywords: "BREAKING", "out", "injury" ✅
   - Infer sport: @AdamSchefter → NFL
   - Check timing: 90 min before game? → `windowTag: "NFL_90_MIN"`
   - Calculate urgency: 9/10

5. **Save to Database**
   ```sql
   INSERT INTO alerts (tweet_id, author, text, ...)
   VALUES ('1234567890', 'Adam Schefter', 'BREAKING: ...', ...)
   ON CONFLICT (tweet_id) DO NOTHING;
   ```

6. **Return Response**
   ```json
   {
     "requestedSports": ["NFL", "NBA", "Soccer"],
     "fetched": 15,
     "inserted": 12
   }
   ```

---

## **3. How Data Comes from Twitter/X?**

### **Flow:**

```
Your Server → X API v2 → Returns JSON → Your Database
```

**Details:**
1. Your server calls: `https://api.x.com/2/tweets/search/recent`
2. Uses `X_BEARER_TOKEN` for authentication
3. X API searches recent tweets matching your query
4. Returns JSON with tweets + user info
5. Your code processes and saves to database

**No webhooks needed!** You poll X API every 5 minutes.

---

## **4. What Does `GET /api/insiders/refresh` Do?**

**Summary:**
- ✅ Fetches tweets from trusted insiders (NFL/NBA/Soccer)
- ✅ Filters by keywords (injury, out, breaking, etc.)
- ✅ Processes timing windows (90 min before game, etc.)
- ✅ Saves alerts to database
- ✅ Returns count of fetched/inserted alerts

**File:** `app/api/insiders/refresh/route.ts`

---

## **5. Why Need `X_BEARER_TOKEN` When We Have `X_API_KEY` + `X_API_KEY_SECRET`?**

### **The Difference:**

| Token | Purpose | Used For |
|-------|---------|----------|
| `X_API_KEY` + `X_API_KEY_SECRET` | OAuth 2.0 | User login/authorization |
| `X_BEARER_TOKEN` | App-only auth | **Reading public tweets** (what we need!) |

### **Why Bearer Token:**

- ✅ **No user login needed** - Perfect for server-side automation
- ✅ **Simpler** - Just one token, no OAuth flow
- ✅ **Read-only** - Can search public tweets without user permission
- ✅ **Required for X API v2** - Search endpoints need bearer token

### **How to Get Bearer Token:**

**Option 1: Use the script I created**
```bash
node scripts/get-bearer-token.js
```

**Option 2: X Developer Portal**
1. Go to https://developer.twitter.com/en/portal/dashboard
2. Your App → Keys and tokens
3. Generate Bearer Token
4. Copy to `.env.local`

**Option 3: Manual curl**
```bash
# Base64 encode (already done for you):
# VklXT0dKcmg1bmhUbWVtZFMyUDJRTUtONDpjRnd1THZjZW13S25DcWlTODBkMTJQd3lhNjFMdURyaWNZb3pLNEJSbzQ5ekhNNGVFTA==

curl -X POST "https://api.x.com/oauth2/token" \
  -H "Authorization: Basic VklXT0dKcmg1bmhUbWVtZFMyUDJRTUtONDpjRnd1THZjZW13S25DcWlTODBkMTJQd3lhNjFMdURyaWNZb3pLNEJSbzQ5ekhNNGVFTA==" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials"
```

**Response:**
```json
{
  "access_token": "AAAAAAAAAAAAAAAAAAAAA...",
  "token_type": "bearer"
}
```

**Copy `access_token` → Add to `.env.local`:**
```env
X_BEARER_TOKEN=AAAAAAAAAAAAAAAAAAAAA...
```

---

## **6. Free vs Premium Limits**

**Current Settings:**
- **Free user:** 5 alerts
- **Premium user:** 10 alerts

**Code location:** `app/api/insiders/alerts/route.ts`
```typescript
const maxLimit = isSubscribed ? 10 : 5; // ← Free: 5, Premium: 10
```

---

## **Quick Test Steps** 🧪

### **1. Get Bearer Token:**
```bash
node scripts/get-bearer-token.js
```

### **2. Add to `.env.local`:**
```env
X_BEARER_TOKEN=<paste_token_here>
```

### **3. Restart dev server:**
```bash
npm run dev
```

### **4. Test refresh:**
```bash
curl "http://localhost:3000/api/insiders/refresh"
```

### **5. View alerts:**
- Go to `http://localhost:3000/dashboard`
- Click "Breaking News Alerts"
- See alerts!

---

## **Summary** ✅

**All Questions Answered:**
1. ✅ Real-time example: Tweet → Alert in 1-2 minutes
2. ✅ Cron flow: Build query → Call X API → Process → Save
3. ✅ Data from X: X API v2 returns JSON tweets
4. ✅ `/api/insiders/refresh`: Fetches, filters, saves alerts
5. ✅ `X_BEARER_TOKEN`: App-only auth for reading tweets (different from OAuth keys)
6. ✅ Limits: Free 5, Premium 10

**Next Step:** Generate `X_BEARER_TOKEN` and test! 🚀

