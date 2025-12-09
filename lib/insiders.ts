import type { Sport } from "@/types/insiders";

export const insiderHandlesBySport: Record<Sport, string[]> = {
  NFL: [
    "AdamSchefter",
    "RapSheet",
    "TomPelissero",
    "MikeGarafolo",
    "JayGlazer",
    "JFowlerESPN",
    "Rotoworld_FB",
    "RotoWireNFL",
    "NFLInjuryReport",
  ],
  NBA: [
    "ShamsCharania",
    "wojespn",
    "ChrisBHaynes",
    "TheSteinLine",
    "Rotoworld_BK",
    "RotoWireNBA",
    "FantasyLabsNBA",
  ],
  Soccer: [
    "FabrizioRomano",
    "David_Ornstein",
    "DiMarzio",
    "gerardromero",
  ],
};

export const alertKeywords = [
  // Injury / availability
  "injury",
  "injured",
  "out",
  "inactive",
  "benched",
  "will not play",
  "questionable",
  "doubtful",
  "gtd",
  "game time decision",
  "ir",
  "concussion protocol",
  "late scratch",
  // Lineup
  "starting",
  "lineup",
  "available",
  "sidelined",
  // Weather / schedule changes
  "postponed",
  "delayed",
  "weather",
  "moved",
  "rescheduled",
  // Breaking indicators
  "breaking",
  "update",
  "just in",
  "alert",
  "confirmed",
];

const keywordMatchers = alertKeywords.map((word) => ({
  word,
  regex: new RegExp(`\\b${escapeKeyword(word)}\\b`, "i"),
}));

function escapeKeyword(keyword: string) {
  return keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function buildQueryForSport(sport: Sport) {
  const handles = insiderHandlesBySport[sport] || [];
  const handlePart = handles.map((h) => `from:${h}`).join(" OR ");
  const keywordPart = alertKeywords
    .map((k) => (k.includes(" ") ? `"${k}"` : k))
    .join(" OR ");

  // Filter retweets; limit to English; keep concise to avoid hitting query length limits
  return `(${handlePart}) (${keywordPart}) lang:en -is:retweet`;
}

export function detectMatchedKeywords(text: string): string[] {
  const matches = keywordMatchers
    .filter(({ regex }) => regex.test(text))
    .map(({ word }) => word);
  return Array.from(new Set(matches));
}

export function inferSportFromHandle(handle: string): Sport | null {
  const normalized = handle.replace("@", "");
  for (const [sport, handles] of Object.entries(insiderHandlesBySport)) {
    if (handles.some((h) => h.toLowerCase() === normalized.toLowerCase())) {
      return sport as Sport;
    }
  }
  return null;
}

export function computeWindowTag(
  sport: Sport,
  tweetedAt: Date,
  gameDates: Date[]
): string | null {
  const upcoming = gameDates.filter((d) => d.getTime() - tweetedAt.getTime() >= 0);
  if (upcoming.length === 0) return null;

  const withinWindow = (minStart: number, maxStart: number) =>
    upcoming.find((d) => {
      const diffMinutes = (d.getTime() - tweetedAt.getTime()) / 60000;
      return diffMinutes <= maxStart && diffMinutes >= minStart;
    });

  if (sport === "NFL") {
    if (withinWindow(60, 150)) return "NFL_90_MIN";
  } else if (sport === "NBA") {
    if (withinWindow(90, 150)) return "NBA_2H";
    if (withinWindow(15, 60)) return "NBA_LINEUP";
  } else if (sport === "Soccer") {
    if (withinWindow(60, 150)) return "SOC_2H";
  }

  return null;
}

export function computeUrgencyScore(
  matchedKeywords: string[],
  windowTag: string | null
): number {
  let score = matchedKeywords.length;
  const strongHits = ["breaking", "out", "inactive", "will not play", "late scratch"];
  if (matchedKeywords.some((k) => strongHits.includes(k.toLowerCase()))) {
    score += 2;
  }
  if (windowTag) score += 1;
  return Math.min(10, Math.max(1, score || 1));
}

