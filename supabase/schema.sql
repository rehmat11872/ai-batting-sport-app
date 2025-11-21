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

-- Indexes for performance
create index if not exists idx_memberships_user_id on public.memberships(user_id);
create index if not exists idx_user_sessions_token on public.user_sessions(token);
create index if not exists idx_user_sessions_expires_at on public.user_sessions(expires_at);
create index if not exists idx_users_whop_customer_id on public.users(whop_customer_id);

