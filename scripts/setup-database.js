/**
 * Database Setup Script
 * Creates all required tables in Supabase
 * 
 * Run: node scripts/setup-database.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupDatabase() {
  console.log('🚀 Setting up database tables...\n');

  try {
    // Execute SQL statements one by one
    const statements = [
      `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`,
      `CREATE TABLE IF NOT EXISTS public.users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        whop_customer_id TEXT UNIQUE,
        email TEXT UNIQUE,
        name TEXT,
        avatar_url TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )`,
      `CREATE TABLE IF NOT EXISTS public.memberships (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
        whop_plan_id TEXT,
        status TEXT CHECK (status IN ('active', 'expired', 'trial', 'canceled')),
        access_expires_at TIMESTAMPTZ,
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id)
      )`,
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
      `CREATE TABLE IF NOT EXISTS public.user_sessions (
        token TEXT PRIMARY KEY,
        user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
        expires_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )`,
      `CREATE INDEX IF NOT EXISTS idx_memberships_user_id ON public.memberships(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON public.user_sessions(token)`,
      `CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON public.user_sessions(expires_at)`,
      `CREATE INDEX IF NOT EXISTS idx_users_whop_customer_id ON public.users(whop_customer_id)`,
    ];

    // Execute each statement
    for (const sql of statements) {
      try {
        await prisma.$executeRawUnsafe(sql);
      } catch (err) {
        // Ignore "already exists" errors
        if (!err.message.includes('already exists') && !err.message.includes('duplicate')) {
          throw err;
        }
      }
    }

    console.log('✅ Database tables created successfully!\n');
    console.log('Tables created:');
    console.log('  - users');
    console.log('  - memberships');
    console.log('  - predictions');
    console.log('  - user_sessions\n');
    console.log('🎉 Setup complete! You can now login.\n');

  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    console.error('\n💡 Alternative: Use Supabase Dashboard');
    console.error('   1. Go to https://supabase.com/dashboard');
    console.error('   2. Select your project');
    console.error('   3. Click SQL Editor');
    console.error('   4. Copy SQL from supabase/schema.sql');
    console.error('   5. Paste and Run\n');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setupDatabase();

