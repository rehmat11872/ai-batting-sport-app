import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import {
  getUserPlanInfo,
  canMakeQuery,
  deductQuery,
  isFollowUpQuery,
  saveQueryToHistory,
  getUsageWarning,
} from "@/lib/query-system";
import { generateAIAnalysis, extractGameContext, detectSport } from "@/lib/ai-analysis";
import type { QueryResponse } from "@/types/betintel";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // Check session
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json(
        { success: false, error: "Please login to use BetIntel AI" },
        { status: 401 }
      );
    }
    
    const userId = session.userId;
    const body = await request.json();
    const { query, parentQueryId } = body;
    
    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid query" },
        { status: 400 }
      );
    }
    
    // Extract game context for follow-up detection
    const gameContext = extractGameContext(query);
    const sport = detectSport(query);
    
    // Check if this is a follow-up query (free)
    let isFollowUp = false;
    let existingParentId = parentQueryId;
    
    if (gameContext) {
      const followUpCheck = await isFollowUpQuery(userId, gameContext);
      isFollowUp = followUpCheck.isFollowUp;
      if (followUpCheck.parentQueryId) {
        existingParentId = followUpCheck.parentQueryId;
      }
    }
    
    // Check if user can make query (if not a follow-up)
    if (!isFollowUp) {
      const canQuery = await canMakeQuery(userId);
      if (!canQuery) {
        const planInfo = await getUserPlanInfo(userId);
        const warning = getUsageWarning(planInfo);
        return NextResponse.json({
          success: false,
          error: warning.message,
          queriesRemaining: 0,
          queryUsed: false,
          showUpgrade: true,
        } as QueryResponse);
      }
    }
    
    // Generate AI analysis
    const analysis = await generateAIAnalysis(query, gameContext);
    
    // Save query to history
    const queryId = await saveQueryToHistory({
      userId,
      query: query.trim(),
      gameContext,
      sport: sport || analysis.sport,
      matchup: analysis.matchup,
      responseJson: analysis,
      confidence: analysis.confidence,
      isFollowUp,
      parentQueryId: existingParentId,
    });
    
    // Deduct query if not a follow-up
    let queriesRemaining = 0;
    if (!isFollowUp) {
      queriesRemaining = await deductQuery(userId);
    } else {
      const planInfo = await getUserPlanInfo(userId);
      queriesRemaining = planInfo.queriesRemaining;
    }
    
    return NextResponse.json({
      success: true,
      analysis: {
        ...analysis,
        id: queryId,
      },
      queryUsed: !isFollowUp,
      queriesRemaining,
    } as QueryResponse);
    
  } catch (error) {
    console.error("Query error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process query. Please try again." },
      { status: 500 }
    );
  }
}

