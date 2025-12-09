import { Prisma } from "@prisma/client";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import type { InsiderAlert, Sport } from "@/types/insiders";

export interface AlertInsert {
  tweetId: string;
  author: string;
  authorHandle: string;
  sport: Sport;
  text: string;
  matchedKeywords: string[];
  tweetedAt: Date;
  url?: string | null;
  urgencyScore: number;
  windowTag?: string | null;
  isPremium?: boolean;
  rawJson?: any;
}

export async function saveAlerts(alerts: AlertInsert[]) {
  if (alerts.length === 0) return { inserted: 0 };

  let inserted = 0;
  for (const alert of alerts) {
    try {
      await prisma.$executeRaw`
        INSERT INTO alerts (
          id,
          tweet_id,
          author,
          author_handle,
          sport,
          text,
          matched_keywords,
          tweeted_at,
          created_at,
          url,
          urgency_score,
          window_tag,
          is_premium,
          raw_json
        )
        VALUES (
          ${randomUUID()}::uuid,
          ${alert.tweetId},
          ${alert.author},
          ${alert.authorHandle},
          ${alert.sport},
          ${alert.text},
          ${alert.matchedKeywords}::text[],
          ${alert.tweetedAt.toISOString()}::timestamptz,
          NOW(),
          ${alert.url ?? null},
          ${alert.urgencyScore},
          ${alert.windowTag ?? null},
          ${alert.isPremium ?? true},
          ${alert.rawJson ? JSON.stringify(alert.rawJson) : null}::jsonb
        )
        ON CONFLICT (tweet_id) DO NOTHING;
      `;
      inserted += 1;
    } catch (error) {
      console.error("Error saving alert", error);
    }
  }

  return { inserted };
}

export async function fetchAlertsFromDb(options: {
  sport?: Sport | null;
  limit: number;
}): Promise<InsiderAlert[]> {
  const { sport, limit } = options;

  const rows = await prisma.$queryRaw<
    {
      id: string;
      tweet_id: string;
      author: string;
      author_handle: string;
      sport: string;
      text: string;
      matched_keywords: string[];
      tweeted_at: Date;
      created_at: Date;
      url: string | null;
      urgency_score: number;
      window_tag: string | null;
      is_premium: boolean;
    }[]
  >`
    SELECT
      id,
      tweet_id,
      author,
      author_handle,
      sport,
      text,
      matched_keywords,
      tweeted_at,
      created_at,
      url,
      urgency_score,
      window_tag,
      is_premium
    FROM alerts
    ${sport ? Prisma.sql`WHERE sport = ${sport}` : Prisma.empty}
    ORDER BY tweeted_at DESC
    LIMIT ${limit}
  `;

  return rows.map((row) => ({
    id: row.id,
    tweetId: row.tweet_id,
    author: row.author,
    authorHandle: row.author_handle,
    sport: row.sport as Sport,
    text: row.text,
    matchedKeywords: row.matched_keywords || [],
    tweetedAt: row.tweeted_at?.toISOString?.() ?? new Date(row.tweeted_at).toISOString(),
    createdAt: row.created_at?.toISOString?.() ?? new Date(row.created_at).toISOString(),
    url: row.url,
    urgencyScore: row.urgency_score ?? 0,
    windowTag: row.window_tag,
    isPremium: row.is_premium,
  }));
}

