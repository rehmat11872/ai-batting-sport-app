#!/bin/bash

# Supabase Migration Script
# This script runs the schema.sql file against your Supabase database

set -e

echo "🚀 Starting Supabase migration..."

# Check if DIRECT_URL is set
if [ -z "$DIRECT_URL" ]; then
  echo "❌ ERROR: DIRECT_URL environment variable is not set"
  echo "Please set DIRECT_URL in your .env.local file"
  exit 1
fi

# Check if psql is available
if ! command -v psql &> /dev/null; then
  echo "❌ ERROR: psql is not installed"
  echo "Install PostgreSQL client tools to run migrations"
  exit 1
fi

# Run the migration
echo "📝 Running schema.sql..."
psql "$DIRECT_URL" -f supabase/schema.sql

echo "✅ Migration completed successfully!"
echo ""
echo "Next steps:"
echo "1. Verify tables in Supabase dashboard"
echo "2. Test the OAuth flow at http://localhost:3000/login"
echo "3. Check Supabase logs if you encounter any issues"

