export type Sport = "NFL" | "NBA" | "Soccer";

export interface InsiderAlert {
  id: string;
  tweetId: string;
  author: string;
  authorHandle: string;
  sport: Sport;
  text: string;
  matchedKeywords: string[];
  tweetedAt: string;
  createdAt: string;
  url?: string | null;
  urgencyScore: number;
  windowTag?: string | null;
  isPremium: boolean;
}

