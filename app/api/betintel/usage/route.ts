import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getUserPlanInfo, getUsageWarning } from "@/lib/query-system";
import { PLAN_CONFIGS } from "@/types/betintel";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json(
        { error: "Please login to view usage" },
        { status: 401 }
      );
    }
    
    const planInfo = await getUserPlanInfo(session.userId);
    const warning = getUsageWarning(planInfo);
    const planConfig = PLAN_CONFIGS[planInfo.planType];
    
    return NextResponse.json({
      plan: {
        type: planInfo.planType,
        name: planConfig.name,
        features: planConfig.features,
      },
      usage: {
        queriesUsed: planInfo.queriesUsed,
        queryLimit: planInfo.queryLimit,
        queriesRemaining: planInfo.queriesRemaining,
        usagePercent: Math.round(planInfo.usagePercent),
        periodStart: planInfo.periodStart.toISOString(),
        periodEnd: planInfo.periodEnd.toISOString(),
        daysUntilReset: planInfo.daysUntilReset,
      },
      warning,
    });
    
  } catch (error: any) {
    console.error("Usage fetch error:", error);
    console.error("Error details:", {
      message: error?.message,
      stack: error?.stack,
      code: error?.code,
    });
    return NextResponse.json(
      { 
        error: "Failed to fetch usage",
        details: process.env.NODE_ENV === "development" ? error?.message : undefined,
      },
      { status: 500 }
    );
  }
}

