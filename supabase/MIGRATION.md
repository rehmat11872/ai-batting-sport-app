# Supabase Migration Guide

## Step 1: Run the SQL Schema

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `epenwftaxaynafpvrlem`
3. Navigate to **SQL Editor**
4. Copy the entire contents of `supabase/schema.sql`
5. Paste into the SQL Editor
6. Click **Run** (or press Cmd/Ctrl + Enter)

Alternatively, use the command line:

```bash
psql "$DIRECT_URL" -f supabase/schema.sql
```

## Step 2: Verify Tables Created

Run this query in Supabase SQL Editor to verify:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'memberships', 'predictions', 'user_sessions');
```

You should see all 4 tables listed.

## Step 3: Test the Schema

Insert a test user to verify relationships:

```sql
-- Insert test user
INSERT INTO public.users (whop_customer_id, email, name)
VALUES ('test_123', 'test@example.com', 'Test User')
ON CONFLICT (whop_customer_id) DO NOTHING;

-- Insert test membership
INSERT INTO public.memberships (user_id, whop_plan_id, status)
SELECT id, 'plan_123', 'active'
FROM public.users
WHERE whop_customer_id = 'test_123'
ON CONFLICT (user_id) DO UPDATE SET status = 'active';

-- Verify
SELECT u.*, m.status as membership_status
FROM public.users u
LEFT JOIN public.memberships m ON m.user_id = u.id
WHERE u.whop_customer_id = 'test_123';
```

## Step 4: Set Up Row Level Security (Optional but Recommended)

For production, enable RLS policies:

```sql
-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own data
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can view own membership" ON public.memberships
  FOR SELECT USING (user_id IN (
    SELECT id FROM public.users WHERE whop_customer_id = auth.jwt() ->> 'whop_customer_id'
  ));
```

## Troubleshooting

- **Permission denied**: Make sure you're using the service role key in server-side code
- **Table already exists**: Drop tables first if needed: `DROP TABLE IF EXISTS public.user_sessions, public.memberships, public.predictions, public.users CASCADE;`
- **Connection issues**: Verify your `DIRECT_URL` has the correct password and is accessible

