import { NextRequest, NextResponse } from "next/server";
import { fetchAlertsFromDb } from "@/lib/alerts";
import { getSession } from "@/lib/session";
import type { Sport } from "@/types/insiders";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await getSession();
  const isSubscribed = session?.isSubscribed ?? false;

  const { searchParams } = new URL(request.url);
  const sportParam = searchParams.get("sport");
  const limitParam = Number(searchParams.get("limit") || 20);
  const requestedLimit = Number.isFinite(limitParam) ? limitParam : 20;
  const maxLimit = isSubscribed ? 10 : 5;
  const limit = Math.min(Math.max(requestedLimit, 1), maxLimit);

  const allowedSport: Sport | null = sportParam
    ? normalizeSport(sportParam)
    : null;

  const alerts = await fetchAlertsFromDb({
    sport: allowedSport,
    limit,
  });

  return NextResponse.json({
    alerts,
    canViewFullFeed: isSubscribed,
  });
}

function normalizeSport(value: string): Sport | null {
  const lower = value.toLowerCase();
  if (lower === "nfl") return "NFL";
  if (lower === "nba") return "NBA";
  if (lower === "soccer") return "Soccer";
  return null;
}

