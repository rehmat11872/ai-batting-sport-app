const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });

const prisma = new PrismaClient();

async function fixEnums() {
  console.log('🔧 Fixing database enum types...\n');

  try {
    // Create MembershipStatus enum
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        CREATE TYPE "public"."MembershipStatus" AS ENUM ('active', 'expired', 'trial', 'canceled');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('✅ Created MembershipStatus enum');

    // Create PredictionTier enum
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        CREATE TYPE "public"."PredictionTier" AS ENUM ('free', 'premium');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('✅ Created PredictionTier enum');

    // Drop existing CHECK constraints
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "public"."memberships" DROP CONSTRAINT IF EXISTS memberships_status_check;
    `);
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "public"."predictions" DROP CONSTRAINT IF EXISTS predictions_tier_check;
    `);
    console.log('✅ Dropped CHECK constraints');

    // Update memberships table to use enum
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "public"."memberships" 
      ALTER COLUMN "status" TYPE "public"."MembershipStatus" 
      USING status::text::"public"."MembershipStatus";
    `);
    console.log('✅ Updated memberships.status to use enum');

    // Update predictions table to use enum (drop default first, then restore)
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "public"."predictions" 
      ALTER COLUMN "tier" DROP DEFAULT;
    `);
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "public"."predictions" 
      ALTER COLUMN "tier" TYPE "public"."PredictionTier" 
      USING tier::text::"public"."PredictionTier";
    `);
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "public"."predictions" 
      ALTER COLUMN "tier" SET DEFAULT 'free'::"public"."PredictionTier";
    `);
    console.log('✅ Updated predictions.tier to use enum');

    console.log('\n✅ Database enums fixed successfully!');
  } catch (error) {
    console.error('❌ Error fixing enums:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

fixEnums();

