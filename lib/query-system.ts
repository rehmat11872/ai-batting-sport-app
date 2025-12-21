import { prisma } from "@/lib/prisma";
import type { PlanType, UserPlanInfo, UsageWarning, PLAN_CONFIGS } from "@/types/betintel";

// Plan query limits
const PLAN_LIMITS: Record<PlanType, number> = {
  free: 5,
  starter: 50,
  sharp: 200,
  pro: 750,
};

/**
 * Get or create user plan and usage info
 */
export async function getUserPlanInfo(userId: string): Promise<UserPlanInfo> {
  try {
    // Get current period (monthly)
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    
    // Get or create user plan
    let userPlan = await prisma.userPlan.findUnique({
      where: { userId },
    });
    
    if (!userPlan) {
      try {
        userPlan = await prisma.userPlan.create({
          data: {
            userId,
            planType: "free",
            queryLimit: PLAN_LIMITS.free,
          },
        });
      } catch (createError: any) {
        // If table doesn't exist, return default values
        if (createError?.code === "P2021" || createError?.message?.includes("does not exist")) {
          console.error("user_plans table does not exist. Run migrations first.");
          return {
            planType: "free",
            queryLimit: PLAN_LIMITS.free,
            queriesUsed: 0,
            queriesRemaining: PLAN_LIMITS.free,
            periodStart,
            periodEnd,
            daysUntilReset: Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
            usagePercent: 0,
          };
        }
        throw createError;
      }
    }
    
    // Get or create usage for current period
    let usage = await prisma.queryUsage.findFirst({
      where: {
        userId,
        periodStart,
      },
    });
    
    if (!usage) {
      try {
        usage = await prisma.queryUsage.create({
          data: {
            userId,
            periodStart,
            periodEnd,
            queriesUsed: 0,
          },
        });
      } catch (createError: any) {
        // If table doesn't exist, return default values
        if (createError?.code === "P2021" || createError?.message?.includes("does not exist")) {
          console.error("query_usage table does not exist. Run migrations first.");
          return {
            planType: (userPlan?.planType as PlanType) || "free",
            queryLimit: userPlan?.queryLimit || PLAN_LIMITS.free,
            queriesUsed: 0,
            queriesRemaining: userPlan?.queryLimit || PLAN_LIMITS.free,
            periodStart,
            periodEnd,
            daysUntilReset: Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
            usagePercent: 0,
          };
        }
        throw createError;
      }
    }
    
    const queryLimit = userPlan.queryLimit;
    const queriesUsed = usage.queriesUsed;
    const queriesRemaining = Math.max(0, queryLimit - queriesUsed);
    const daysUntilReset = Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const usagePercent = queryLimit > 0 ? (queriesUsed / queryLimit) * 100 : 100;
    
    return {
      planType: userPlan.planType as PlanType,
      queryLimit,
      queriesUsed,
      queriesRemaining,
      periodStart,
      periodEnd,
      daysUntilReset,
      usagePercent,
    };
  } catch (error: any) {
    console.error("getUserPlanInfo error:", error);
    // Return default values on error
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    return {
      planType: "free",
      queryLimit: PLAN_LIMITS.free,
      queriesUsed: 0,
      queriesRemaining: PLAN_LIMITS.free,
      periodStart,
      periodEnd,
      daysUntilReset: Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
      usagePercent: 0,
    };
  }
}

/**
 * Check if user can make a query
 */
export async function canMakeQuery(userId: string): Promise<boolean> {
  const planInfo = await getUserPlanInfo(userId);
  return planInfo.queriesRemaining > 0;
}

/**
 * Deduct a query from user's usage
 */
export async function deductQuery(userId: string): Promise<number> {
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  
  // Update or create usage record
  const usage = await prisma.queryUsage.upsert({
    where: {
      userId_periodStart: {
        userId,
        periodStart,
      },
    },
    update: {
      queriesUsed: { increment: 1 },
      updatedAt: now,
    },
    create: {
      userId,
      periodStart,
      periodEnd: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59),
      queriesUsed: 1,
    },
  });
  
  const planInfo = await getUserPlanInfo(userId);
  return planInfo.queriesRemaining;
}

/**
 * Check if query is a follow-up (same game context)
 */
export async function isFollowUpQuery(
  userId: string,
  gameContext: string
): Promise<{ isFollowUp: boolean; parentQueryId?: string }> {
  // Look for recent query with same game context (within last 24 hours)
  const recentQuery = await prisma.queryHistory.findFirst({
    where: {
      userId,
      gameContext,
      isFollowUp: false,
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    },
    orderBy: { createdAt: "desc" },
  });
  
  if (recentQuery) {
    return { isFollowUp: true, parentQueryId: recentQuery.id };
  }
  
  return { isFollowUp: false };
}

/**
 * Save query to history
 */
export async function saveQueryToHistory(data: {
  userId: string;
  query: string;
  gameContext?: string;
  sport?: string;
  matchup?: string;
  responseJson?: any;
  confidence?: number;
  isFollowUp?: boolean;
  parentQueryId?: string;
}): Promise<string> {
  const result = await prisma.queryHistory.create({
    data: {
      userId: data.userId,
      query: data.query,
      gameContext: data.gameContext,
      sport: data.sport,
      matchup: data.matchup,
      responseJson: data.responseJson,
      confidence: data.confidence ?? 0,
      isFollowUp: data.isFollowUp ?? false,
      parentQueryId: data.parentQueryId,
    },
  });
  
  return result.id;
}

/**
 * Get usage warning based on current usage
 */
export function getUsageWarning(planInfo: UserPlanInfo): UsageWarning {
  const { usagePercent, queriesRemaining, daysUntilReset } = planInfo;
  
  if (queriesRemaining === 0) {
    return {
      type: "depleted",
      message: "You've used all your BetIntel queries for this month.",
      showUpgrade: true,
    };
  }
  
  if (usagePercent >= 95) {
    return {
      type: "critical",
      message: `Almost out of queries. Only ${queriesRemaining} remaining.`,
      showUpgrade: true,
    };
  }
  
  if (usagePercent >= 80) {
    return {
      type: "low",
      message: `Running low on queries. ${queriesRemaining} remaining.`,
      showUpgrade: true,
    };
  }
  
  return {
    type: "none",
    message: "",
    showUpgrade: false,
  };
}

/**
 * Update user plan (after Whop webhook)
 */
export async function updateUserPlan(
  userId: string,
  planType: PlanType,
  whopPlanId?: string
): Promise<void> {
  await prisma.userPlan.upsert({
    where: { userId },
    update: {
      planType,
      queryLimit: PLAN_LIMITS[planType],
      whopPlanId,
      updatedAt: new Date(),
    },
    create: {
      userId,
      planType,
      queryLimit: PLAN_LIMITS[planType],
      whopPlanId,
    },
  });
}

/**
 * Get recent query history for user
 */
export async function getRecentQueries(userId: string, limit: number = 10) {
  return prisma.queryHistory.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

