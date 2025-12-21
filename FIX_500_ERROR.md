# 🔧 Fix: 500 Error on /api/betintel/usage

## ❌ Error

```
GET /api/betintel/usage
Status Code: 500 Internal Server Error
```

## 🔍 Most Likely Cause

**Database tables don't exist yet!**

The BetIntel system needs these tables:
- `user_plans`
- `query_usage`
- `query_history`

---

## ✅ Solution: Run Database Migrations

### **Option 1: Use Migration Script (Easiest)**

```bash
node scripts/run-migrations.js
```

This will create all required tables automatically.

### **Option 2: Run SQL in Supabase Dashboard**

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor**
4. Run this SQL:

```sql
-- User plans table
CREATE TABLE IF NOT EXISTS public.user_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  plan_type TEXT DEFAULT 'free' CHECK (plan_type IN ('free', 'starter', 'sharp', 'pro')),
  query_limit INT DEFAULT 5,
  whop_plan_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Query usage table
CREATE TABLE IF NOT EXISTS public.query_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  queries_used INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, period_start)
);

-- Query history table
CREATE TABLE IF NOT EXISTS public.query_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  game_context TEXT,
  sport TEXT,
  matchup TEXT,
  response_json JSONB,
  confidence INT DEFAULT 0,
  is_follow_up BOOLEAN DEFAULT FALSE,
  parent_query_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User notifications table
CREATE TABLE IF NOT EXISTS public.user_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  alert_id UUID,
  type TEXT DEFAULT 'breaking' CHECK (type IN ('injury', 'lineup', 'weather', 'breaking')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  sport TEXT,
  matchup TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_plans_user_id ON public.user_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_query_usage_user_id ON public.query_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_query_history_user_id ON public.query_history(user_id);
CREATE INDEX IF NOT EXISTS idx_query_history_game_context ON public.query_history(game_context);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON public.user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_is_read ON public.user_notifications(is_read);
```

5. Click **Run**

---

## 🧪 Test After Migration

1. Restart your dev server:
   ```bash
   npm run dev
   ```

2. Visit: http://localhost:3000/betintel

3. Should work now! ✅

---

## 🔍 Check Server Logs

If still getting errors, check your terminal for the actual error message. The updated code now shows more detailed error messages in development mode.

---

## 📝 Summary

**The 500 error is because:**
- Database tables (`user_plans`, `query_usage`) don't exist
- Prisma tries to query them → fails → 500 error

**Fix:**
- Run `node scripts/run-migrations.js`
- Or run SQL in Supabase Dashboard

After creating tables, the error should be resolved! 🎉

