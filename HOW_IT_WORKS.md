# 🔄 How the X/Twitter → Analysis → Notification System Works

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: CRON JOB TRIGGERS (Every 5 minutes)                 │
│                                                              │
│ Vercel Cron or GitHub Actions calls:                        │
│ GET /api/insiders/refresh                                    │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: FETCH GAME SCHEDULES                                │
│                                                              │
│ - Fetches upcoming NFL, NBA, Soccer games from ESPN         │
│ - Gets game times (e.g., "2025-11-17 13:00:00")            │
│ - Used to determine pre-match windows (1-2 hours before)   │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: FETCH TWEETS FROM X/TWITTER                        │
│                                                              │
│ For each sport (NFL, NBA, Soccer):                         │
│                                                              │
│ Query: (from:AdamSchefter OR from:RapSheet OR ...)         │
│        (injury OR out OR inactive OR breaking OR ...)        │
│        lang:en -is:retweet                                  │
│                                                              │
│ Calls: X API v2 /tweets/search/recent                      │
│ Uses: X_BEARER_TOKEN for authentication                     │
│                                                              │
│ Returns: Recent tweets from trusted insiders                │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: ANALYZE TWEETS                                      │
│                                                              │
│ For each tweet:                                             │
│                                                              │
│ 1. ✅ Check for keywords:                                   │
│    - "injury", "out", "inactive", "breaking", etc.         │
│    - If no keywords → Skip tweet                            │
│                                                              │
│ 2. ✅ Infer sport from author:                               │
│    - @AdamSchefter → NFL                                    │
│    - @ShamsCharania → NBA                                   │
│    - @FabrizioRomano → Soccer                               │
│                                                              │
│ 3. ✅ Check timing window:                                   │
│    - NFL: 60-150 min before game = "NFL_90_MIN"            │
│    - NBA: 90-150 min before = "NBA_2H"                      │
│    - Soccer: 60-150 min before = "SOC_2H"                   │
│                                                              │
│ 4. ✅ Calculate urgency score:                               │
│    - Base: Number of keywords matched                       │
│    - +2 for strong keywords ("breaking", "out")             │
│    - +1 if within pre-match window                          │
│    - Score: 1-10 (10 = highest urgency)                     │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 5: SAVE ALERTS TO DATABASE                            │
│                                                              │
│ - Save all processed alerts to `alerts` table              │
│ - Deduplicate by tweet_id (ON CONFLICT DO NOTHING)         │
│ - Store: tweet text, author, keywords, urgency, window      │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 6: CREATE NOTIFICATIONS (Pre-Match Alerts)             │
│                                                              │
│ Filter high-priority alerts:                                │
│ ✅ urgencyScore >= 6 OR                                     │
│ ✅ windowTag != null (within 1-2 hours before game)         │
│                                                              │
│ For each premium user:                                       │
│                                                              │
│ 1. Determine notification type:                             │
│    - Keywords: "injury", "out" → 🚨 Injury Alert            │
│    - Keywords: "starting", "lineup" → 📋 Lineup Change     │
│    - Keywords: "weather" → 🌧️ Weather Update               │
│    - Default → ⚡ Breaking News                             │
│                                                              │
│ 2. Create notification in database:                        │
│    - Title: "🚨 Injury Alert"                               │
│    - Message: Tweet text (first 500 chars)                 │
│    - Sport: NFL/NBA/Soccer                                  │
│    - isRead: false                                          │
│                                                              │
│ 3. User sees notification in:                               │
│    - Navbar bell icon (with unread count badge)             │
│    - BetIntel dashboard                                      │
└──────────────────────────────────────────────────────────┘
```

---

## Real Example Flow

### Scenario: Sunday 11:15 AM - NFL Game at 1:00 PM

**11:15:00 AM** - @AdamSchefter tweets:
```
"BREAKING: Chiefs RB Isiah Pacheco OUT for today's game vs Bills with injury"
```

**11:15:05 AM** - Cron job runs:
1. ✅ Fetches game schedule → Finds Chiefs vs Bills at 1:00 PM
2. ✅ Searches X API → Finds @AdamSchefter's tweet
3. ✅ Analyzes tweet:
   - Keywords: ["BREAKING", "out", "injury"] ✅
   - Sport: NFL (from @AdamSchefter)
   - Timing: 105 minutes before game → `windowTag: "NFL_90_MIN"` ✅
   - Urgency: 9/10 (high!)
4. ✅ Saves to alerts table
5. ✅ Creates notification for all premium users:
   - Type: "injury"
   - Title: "🚨 Injury Alert"
   - Message: "BREAKING: Chiefs RB Isiah Pacheco OUT..."

**11:15:10 AM** - Premium users see:
- 🔔 Notification bell shows "1" badge
- Click bell → See "🚨 Injury Alert" notification
- Can view full tweet and analysis

---

## Key Features

### ✅ Pre-Match Timing Windows

| Sport | Window | Tag | Example |
|-------|--------|-----|---------|
| **NFL** | 60-150 min before | `NFL_90_MIN` | Tweet at 11:15 AM for 1:00 PM game |
| **NBA** | 90-150 min before | `NBA_2H` | Tweet at 5:00 PM for 7:00 PM game |
| **NBA** | 15-60 min before | `NBA_LINEUP` | Lineup announcements |
| **Soccer** | 60-150 min before | `SOC_2H` | Tweet at 6:00 PM for 8:00 PM match |

### ✅ Urgency Scoring

- **1-3**: Low priority (general news)
- **4-5**: Medium priority
- **6-7**: High priority → **Creates notification**
- **8-10**: Critical → **Creates notification**

### ✅ Notification Types

| Type | Trigger Keywords | Icon |
|------|-----------------|------|
| **Injury** | injury, out, inactive, DNP, IR | 🚨 |
| **Lineup** | starting, lineup, benched | 📋 |
| **Weather** | weather, postponed, delayed | 🌧️ |
| **Breaking** | breaking, update, alert | ⚡ |

---

## What Gets Notified?

### ✅ **WILL Create Notification:**
- ✅ Urgency score >= 6
- ✅ Tweet within 1-2 hours before game (`windowTag` exists)
- ✅ Contains keywords: injury, out, inactive, breaking, etc.
- ✅ User has active premium subscription

### ❌ **WON'T Create Notification:**
- ❌ Urgency score < 6 AND not in pre-match window
- ❌ Free users (notifications are premium feature)
- ❌ General news tweets (no keywords)
- ❌ Tweets more than 2 hours before game

---

## Configuration

### **Insider Accounts Monitored:**

**NFL:**
- @AdamSchefter, @RapSheet, @TomPelissero, @MikeGarafolo, @JayGlazer, @JFowlerESPN, @Rotoworld_FB, @RotoWireNFL, @NFLInjuryReport

**NBA:**
- @ShamsCharania, @wojespn, @ChrisBHaynes, @TheSteinLine, @Rotoworld_BK, @RotoWireNBA, @FantasyLabsNBA

**Soccer:**
- @FabrizioRomano, @David_Ornstein, @DiMarzio, @gerardromero

### **Keywords Tracked:**
- Injury: injury, injured, out, inactive, DNP, IR, concussion
- Lineup: starting, lineup, benched, available
- Weather: weather, postponed, delayed, rescheduled
- Breaking: BREAKING, update, alert, confirmed

---

## Summary

✅ **Yes, it works exactly like you described:**

1. **Cron job runs** (every 5 minutes)
2. **Fetches tweets** from X/Twitter insider accounts
3. **Analyzes tweets** for keywords, timing, urgency
4. **Creates notifications** for important alerts 1-2 hours before matches
5. **Users see notifications** in navbar bell icon

**The system automatically:**
- ✅ Monitors trusted insiders
- ✅ Detects pre-match timing (1-2 hours before)
- ✅ Filters for important keywords
- ✅ Sends notifications to premium users
- ✅ Categorizes by type (injury, lineup, weather, breaking)

🎉 **Everything is working!**

