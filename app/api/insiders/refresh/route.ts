import { NextRequest, NextResponse } from "next/server";
import { fetchNBAScores, fetchNFLScores, fetchSoccerScores } from "@/lib/espn";
import { saveAlerts } from "@/lib/alerts";
import {
  buildQueryForSport,
  computeUrgencyScore,
  computeWindowTag,
  detectMatchedKeywords,
  inferSportFromHandle,
} from "@/lib/insiders";
import { searchRecentTweets } from "@/lib/x-client";
import { prisma } from "@/lib/prisma";
import type { Sport } from "@/types/insiders";

export const dynamic = "force-dynamic";

type XTweet = {
  id: string;
  text: string;
  author_id: string;
  created_at: string;
};

type XUser = {
  id: string;
  username: string;
  name?: string;
  profile_image_url?: string;
};

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  
  // Check if called by Vercel Cron (has special header)
  const isVercelCron = request.headers.get("x-vercel-cron") === "1";
  
  // If CRON_SECRET is set and not Vercel cron, require authorization
  if (cronSecret && !isVercelCron) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  if (!process.env.X_BEARER_TOKEN) {
    return NextResponse.json(
      { error: "Missing X_BEARER_TOKEN env var" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const sportParam = searchParams.get("sport");
  const sports: Sport[] = sportParam
    ? sportParam
        .split(",")
        .map((s) => normalizeSport(s))
        .filter((s): s is Sport => Boolean(s))
    : ["NFL", "NBA", "Soccer"];

  const schedules = await loadSchedules(sports);
  const preparedAlerts = [];

  for (const sport of sports) {
    try {
      const query = buildQueryForSport(sport);
      const data = await searchRecentTweets(query);
      const tweets: XTweet[] = data?.data ?? [];
      const users: XUser[] = data?.includes?.users ?? [];
      const userById = new Map(users.map((u) => [u.id, u]));

      for (const tweet of tweets) {
        const matchedKeywords = detectMatchedKeywords(tweet.text || "");
        if (matchedKeywords.length === 0) continue;

        const user = userById.get(tweet.author_id);
        const authorHandle = user?.username || "unknown";
        const authorName = user?.name || authorHandle;
        const inferredSport = inferSportFromHandle(authorHandle) || sport;
        const tweetedAt = new Date(tweet.created_at);
        const windowTag = computeWindowTag(inferredSport, tweetedAt, schedules[inferredSport] || []);
        const urgencyScore = computeUrgencyScore(matchedKeywords, windowTag);

        preparedAlerts.push({
          tweetId: tweet.id,
          author: authorName,
          authorHandle: authorHandle.startsWith("@") ? authorHandle : `@${authorHandle}`,
          sport: inferredSport,
          text: tweet.text,
          matchedKeywords,
          tweetedAt,
          url: user?.username ? `https://x.com/${user.username}/status/${tweet.id}` : undefined,
          urgencyScore,
          windowTag,
          isPremium: true,
          rawJson: tweet,
        });
      }
    } catch (error) {
      console.error(`Error fetching ${sport} alerts`, error);
    }
  }

  const { inserted, alertIds } = await saveAlerts(preparedAlerts);

  // Create notifications for high-urgency alerts (urgency >= 6 or within game window)
  let notificationsCreated = 0;
  
  if (inserted > 0) {
    try {
      // Get all subscribed users to notify
      const subscribedUsers = await prisma.user.findMany({
        where: {
          memberships: {
            some: {
              status: "active",
            },
          },
        },
        select: { id: true },
      });

      // Filter high-priority alerts (pre-match alerts)
      const highPriorityAlerts = preparedAlerts.filter(
        (alert) => alert.urgencyScore >= 6 || alert.windowTag !== null
      );

      // Create notifications for each user
      for (const user of subscribedUsers) {
        for (const alert of highPriorityAlerts) {
          // Determine notification type
          let notificationType = "breaking";
          const keywords = alert.matchedKeywords.map((k: string) => k.toLowerCase());
          
          if (keywords.some((k: string) => ["injury", "injured", "out", "dnp", "ir", "concussion"].includes(k))) {
            notificationType = "injury";
          } else if (keywords.some((k: string) => ["starting", "lineup", "benched", "inactive"].includes(k))) {
            notificationType = "lineup";
          } else if (keywords.some((k: string) => ["weather", "postponed", "delayed"].includes(k))) {
            notificationType = "weather";
          }

          const titles: Record<string, string> = {
            injury: "🚨 Injury Alert",
            lineup: "📋 Lineup Change",
            weather: "🌧️ Weather Update",
            breaking: "⚡ Breaking News",
          };

          try {
            await prisma.userNotification.create({
              data: {
                userId: user.id,
                type: notificationType as any,
                title: titles[notificationType],
                message: alert.text.slice(0, 500),
                sport: alert.sport,
                isRead: false,
              },
            });
            notificationsCreated++;
          } catch (e) {
            // Ignore duplicate notification errors
          }
        }
      }
    } catch (error) {
      console.error("Error creating notifications:", error);
    }
  }

  return NextResponse.json({
    requestedSports: sports,
    fetched: preparedAlerts.length,
    inserted,
    notificationsCreated,
  });
}

async function loadSchedules(sports: Sport[]) {
  const schedule: Record<Sport, Date[]> = {
    NFL: [],
    NBA: [],
    Soccer: [],
  };

  await Promise.all(
    sports.map(async (sport) => {
      if (sport === "NFL") {
        const games = await fetchNFLScores();
        schedule.NFL = games.map((g) => new Date(g.date)).filter((d) => !isNaN(d.getTime()));
      } else if (sport === "NBA") {
        const games = await fetchNBAScores();
        schedule.NBA = games.map((g) => new Date(g.date)).filter((d) => !isNaN(d.getTime()));
      } else if (sport === "Soccer") {
        const games = await fetchSoccerScores();
        schedule.Soccer = games.map((g) => new Date(g.date)).filter((d) => !isNaN(d.getTime()));
      }
    })
  );

  return schedule;
}

function normalizeSport(value: string): Sport | null {
  const lower = value.toLowerCase();
  if (lower === "nfl") return "NFL";
  if (lower === "nba") return "NBA";
  if (lower === "soccer") return "Soccer";
  return null;
}

