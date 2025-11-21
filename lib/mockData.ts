export interface Prediction {
  id: string;
  league: string;
  match: string;
  kickoff: string;
  odds: {
    home: number;
    draw: number;
    away: number;
  };
  winProbability: number;
  confidence: number;
  isPremium: boolean;
}

export const mockPredictions: Prediction[] = [
  {
    id: "pre-1",
    league: "Premier League",
    match: "Manchester City vs Arsenal",
    kickoff: "2024-01-20T16:30:00Z",
    odds: { home: 1.95, draw: 3.5, away: 3.9 },
    winProbability: 0.64,
    confidence: 0.81,
    isPremium: false,
  },
  {
    id: "pre-2",
    league: "Serie A",
    match: "Inter Milan vs Napoli",
    kickoff: "2024-01-20T19:45:00Z",
    odds: { home: 2.2, draw: 3.2, away: 3.4 },
    winProbability: 0.59,
    confidence: 0.76,
    isPremium: false,
  },
  {
    id: "pre-3",
    league: "La Liga",
    match: "Barcelona vs Atletico Madrid",
    kickoff: "2024-01-21T20:00:00Z",
    odds: { home: 2.05, draw: 3.4, away: 3.6 },
    winProbability: 0.61,
    confidence: 0.83,
    isPremium: true,
  },
  {
    id: "pre-4",
    league: "Bundesliga",
    match: "Bayern Munich vs Bayer Leverkusen",
    kickoff: "2024-01-21T18:30:00Z",
    odds: { home: 1.8, draw: 3.8, away: 4.4 },
    winProbability: 0.68,
    confidence: 0.88,
    isPremium: true,
  },
];

export const winningStreakDays = 4;

export const mockUserStats = {
  totalBets: 128,
  winRate: 0.64,
  profit: 1240.5,
};
