import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getRecentQueries } from "@/lib/query-system";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json(
        { error: "Please login to view history" },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const limit = Math.min(50, Number(searchParams.get("limit") || 10));
    
    const queries = await getRecentQueries(session.userId, limit);
    
    return NextResponse.json({
      queries: queries.map(q => ({
        id: q.id,
        query: q.query,
        sport: q.sport,
        matchup: q.matchup,
        confidence: q.confidence,
        isFollowUp: q.isFollowUp,
        createdAt: q.createdAt.toISOString(),
        response: q.responseJson,
      })),
    });
    
  } catch (error) {
    console.error("History fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 }
    );
  }
}

