/**
 * Database Migration Script
 * Runs all SQL migrations to create/update tables
 * 
 * Usage: node scripts/run-migrations.js
 */

require('dotenv').config({ path: '.env.local' });

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function runMigrations() {
  console.log('🚀 Running database migrations...\n');

  try {
    const migrations = [
      // Enable UUID extension
      `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`,
      
      // Users table
      `CREATE TABLE IF NOT EXISTS public.users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        whop_customer_id TEXT UNIQUE,
        email TEXT UNIQUE,
        name TEXT,
        avatar_url TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )`,
      
      // Memberships table
      `CREATE TABLE IF NOT EXISTS public.memberships (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
        whop_plan_id TEXT,
        status TEXT CHECK (status IN ('active', 'expired', 'trial', 'canceled')),
        access_expires_at TIMESTAMPTZ,
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id)
      )`,
      
      // Predictions table
      `CREATE TABLE IF NOT EXISTS public.predictions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        event_id TEXT,
        league TEXT,
        match TEXT,
        kickoff TIMESTAMPTZ,
        odds_home NUMERIC,
        odds_draw NUMERIC,
        odds_away NUMERIC,
        ai_win_probability NUMERIC,
        ai_confidence NUMERIC,
        tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'premium')),
        created_at TIMESTAMPTZ DEFAULT NOW()
      )`,
      
      // User sessions table
      `CREATE TABLE IF NOT EXISTS public.user_sessions (
        token TEXT PRIMARY KEY,
        user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
        expires_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )`,
      
      // Alerts table (X/Twitter insider alerts)
      `CREATE TABLE IF NOT EXISTS public.alerts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tweet_id TEXT UNIQUE,
        author TEXT,
        author_handle TEXT,
        sport TEXT,
        text TEXT,
        matched_keywords TEXT[],
        tweeted_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        url TEXT,
        urgency_score INT DEFAULT 0,
        window_tag TEXT,
        is_premium BOOLEAN DEFAULT TRUE,
        raw_json JSONB
      )`,
      
      // User plans table (BetIntel)
      `CREATE TABLE IF NOT EXISTS public.user_plans (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
        plan_type TEXT DEFAULT 'free' CHECK (plan_type IN ('free', 'starter', 'sharp', 'pro')),
        query_limit INT DEFAULT 5,
        whop_plan_id TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )`,
      
      // Query usage table (BetIntel)
      `CREATE TABLE IF NOT EXISTS public.query_usage (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
        period_start TIMESTAMPTZ NOT NULL,
        period_end TIMESTAMPTZ NOT NULL,
        queries_used INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, period_start)
      )`,
      
      // Query history table (BetIntel)
      `CREATE TABLE IF NOT EXISTS public.query_history (
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
      )`,
      
      // User notifications table (for pre-match alerts)
      `CREATE TABLE IF NOT EXISTS public.user_notifications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
        alert_id UUID REFERENCES public.alerts(id) ON DELETE CASCADE,
        type TEXT DEFAULT 'injury' CHECK (type IN ('injury', 'lineup', 'weather', 'breaking')),
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        sport TEXT,
        matchup TEXT,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )`,
      
      // Indexes
      `CREATE INDEX IF NOT EXISTS idx_memberships_user_id ON public.memberships(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON public.user_sessions(token)`,
      `CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON public.user_sessions(expires_at)`,
      `CREATE INDEX IF NOT EXISTS idx_users_whop_customer_id ON public.users(whop_customer_id)`,
      `CREATE INDEX IF NOT EXISTS idx_alerts_sport ON public.alerts(sport)`,
      `CREATE INDEX IF NOT EXISTS idx_alerts_tweeted_at ON public.alerts(tweeted_at)`,
      `CREATE INDEX IF NOT EXISTS idx_user_plans_user_id ON public.user_plans(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_query_usage_user_id ON public.query_usage(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_query_history_user_id ON public.query_history(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_query_history_game_context ON public.query_history(game_context)`,
      `CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON public.user_notifications(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_user_notifications_is_read ON public.user_notifications(is_read)`,
    ];

    let successCount = 0;
    let skipCount = 0;

    for (const sql of migrations) {
      try {
        await prisma.$executeRawUnsafe(sql);
        successCount++;
        // Extract table/index name for logging
        const match = sql.match(/(?:TABLE|INDEX).*?public\.(\w+)/i);
        if (match) {
          console.log(`  ✓ ${match[1]}`);
        }
      } catch (err) {
        if (err.message.includes('already exists') || err.message.includes('duplicate')) {
          skipCount++;
        } else {
          throw err;
        }
      }
    }

    console.log(`\n✅ Migrations complete!`);
    console.log(`   ${successCount} executed, ${skipCount} skipped (already exist)\n`);

    console.log('Tables:');
    console.log('  - users');
    console.log('  - memberships');
    console.log('  - predictions');
    console.log('  - user_sessions');
    console.log('  - alerts');
    console.log('  - user_plans');
    console.log('  - query_usage');
    console.log('  - query_history');
    console.log('  - user_notifications\n');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\n💡 If you see connection errors:');
    console.error('   1. Check DATABASE_URL in .env.local');
    console.error('   2. Make sure Supabase project is running');
    console.error('   3. Try running SQL directly in Supabase Dashboard\n');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runMigrations();

