-- Enable UUIDs
create extension if not exists "uuid-ossp";

-- Users table - stores Whop customer information
create table if not exists public.users (
  id uuid primary key default uuid_generate_v4(),
  whop_customer_id text unique,
  email text unique,
  name text,
  avatar_url text,
  created_at timestamptz default now()
);

-- Memberships table - tracks Whop subscription status
create table if not exists public.memberships (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade,
  whop_plan_id text,
  status text check (status in ('active', 'expired', 'trial', 'canceled')),
  access_expires_at timestamptz,
  updated_at timestamptz default now(),
  unique(user_id)
);

-- Predictions table - optional cache for AI predictions
create table if not exists public.predictions (
  id uuid primary key default uuid_generate_v4(),
  event_id text,
  league text,
  match text,
  kickoff timestamptz,
  odds_home numeric,
  odds_draw numeric,
  odds_away numeric,
  ai_win_probability numeric,
  ai_confidence numeric,
  tier text default 'free' check (tier in ('free', 'premium')),
  created_at timestamptz default now()
);

-- User sessions table - stores session tokens for authentication
create table if not exists public.user_sessions (
  token text primary key,
  user_id uuid references public.users(id) on delete cascade,
  expires_at timestamptz,
  created_at timestamptz default now()
);

-- Alerts table - stores insider alerts sourced from X/Twitter
create table if not exists public.alerts (
  id uuid primary key default uuid_generate_v4(),
  tweet_id text unique,
  author text,
  author_handle text,
  sport text,
  text text,
  matched_keywords text[],
  tweeted_at timestamptz,
  created_at timestamptz default now(),
  url text,
  urgency_score int default 0,
  window_tag text,
  is_premium boolean default true,
  raw_json jsonb
);

-- ============================================
-- BetIntel AI Query System
-- ============================================

-- User plans table - tracks subscription tier and query limits
create table if not exists public.user_plans (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid unique references public.users(id) on delete cascade,
  plan_type text default 'free' check (plan_type in ('free', 'starter', 'sharp', 'pro')),
  query_limit int default 5,
  whop_plan_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Query usage table - tracks monthly query consumption
create table if not exists public.query_usage (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade,
  period_start timestamptz not null,
  period_end timestamptz not null,
  queries_used int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, period_start)
);

-- Query history table - stores all AI queries and responses
create table if not exists public.query_history (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade,
  query text not null,
  game_context text,
  sport text,
  matchup text,
  response_json jsonb,
  confidence int default 0,
  is_follow_up boolean default false,
  parent_query_id uuid,
  created_at timestamptz default now()
);

-- Indexes for performance
create index if not exists idx_memberships_user_id on public.memberships(user_id);
create index if not exists idx_user_sessions_token on public.user_sessions(token);
create index if not exists idx_user_sessions_expires_at on public.user_sessions(expires_at);
create index if not exists idx_users_whop_customer_id on public.users(whop_customer_id);
create index if not exists idx_alerts_sport on public.alerts(sport);
create index if not exists idx_alerts_tweeted_at on public.alerts(tweeted_at);
create index if not exists idx_user_plans_user_id on public.user_plans(user_id);
create index if not exists idx_query_usage_user_id on public.query_usage(user_id);
create index if not exists idx_query_history_user_id on public.query_history(user_id);
create index if not exists idx_query_history_game_context on public.query_history(game_context);

