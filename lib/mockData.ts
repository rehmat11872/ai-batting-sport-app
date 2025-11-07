export interface Prediction {
  id: string;
  match: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  date: string;
  winProbability: number;
  confidence: number;
  predictedWinner: string;
  odds: {
    home: number;
    draw: number;
    away: number;
  };
}

export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  date: string;
  status: "upcoming" | "live" | "finished";
  score?: {
    home: number;
    away: number;
  };
  odds: {
    home: number;
    draw: number;
    away: number;
  };
}

export interface Bet {
  id: string;
  matchId: string;
  match: string;
  betType: "home" | "draw" | "away";
  amount: number;
  odds: number;
  potentialWin: number;
  status: "pending" | "won" | "lost";
  date: string;
}

export interface WalletTransaction {
  id: string;
  type: "deposit" | "withdraw" | "bet" | "win";
  amount: number;
  date: string;
  description: string;
}

export interface Notification {
  id: string;
  type: "match_start" | "bet_alert" | "result" | "system";
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export const mockPredictions: Prediction[] = [
  {
    id: "1",
    match: "Manchester United vs Liverpool",
    homeTeam: "Manchester United",
    awayTeam: "Liverpool",
    league: "Premier League",
    date: "2024-01-15T15:00:00Z",
    winProbability: 0.68,
    confidence: 0.83,
    predictedWinner: "Manchester United",
    odds: { home: 2.1, draw: 3.4, away: 3.2 },
  },
  {
    id: "2",
    match: "Barcelona vs Real Madrid",
    homeTeam: "Barcelona",
    awayTeam: "Real Madrid",
    league: "La Liga",
    date: "2024-01-16T20:00:00Z",
    winProbability: 0.74,
    confidence: 0.79,
    predictedWinner: "Barcelona",
    odds: { home: 1.9, draw: 3.6, away: 4.1 },
  },
  {
    id: "3",
    match: "Bayern Munich vs Dortmund",
    homeTeam: "Bayern Munich",
    awayTeam: "Dortmund",
    league: "Bundesliga",
    date: "2024-01-17T18:30:00Z",
    winProbability: 0.62,
    confidence: 0.75,
    predictedWinner: "Bayern Munich",
    odds: { home: 1.7, draw: 3.8, away: 5.2 },
  },
  {
    id: "4",
    match: "PSG vs Marseille",
    homeTeam: "PSG",
    awayTeam: "Marseille",
    league: "Ligue 1",
    date: "2024-01-18T21:00:00Z",
    winProbability: 0.71,
    confidence: 0.88,
    predictedWinner: "PSG",
    odds: { home: 1.6, draw: 4.0, away: 5.8 },
  },
];

export const mockMatches: Match[] = [
  {
    id: "1",
    homeTeam: "Manchester United",
    awayTeam: "Liverpool",
    league: "Premier League",
    date: "2024-01-15T15:00:00Z",
    status: "upcoming",
    odds: { home: 2.1, draw: 3.4, away: 3.2 },
  },
  {
    id: "2",
    homeTeam: "Barcelona",
    awayTeam: "Real Madrid",
    league: "La Liga",
    date: "2024-01-16T20:00:00Z",
    status: "live",
    score: { home: 2, away: 1 },
    odds: { home: 1.9, draw: 3.6, away: 4.1 },
  },
  {
    id: "3",
    homeTeam: "Bayern Munich",
    awayTeam: "Dortmund",
    league: "Bundesliga",
    date: "2024-01-17T18:30:00Z",
    status: "upcoming",
    odds: { home: 1.7, draw: 3.8, away: 5.2 },
  },
];

export const mockBets: Bet[] = [
  {
    id: "1",
    matchId: "1",
    match: "Manchester United vs Liverpool",
    betType: "home",
    amount: 50,
    odds: 2.1,
    potentialWin: 105,
    status: "pending",
    date: "2024-01-14T10:00:00Z",
  },
  {
    id: "2",
    matchId: "2",
    match: "Barcelona vs Real Madrid",
    betType: "home",
    amount: 100,
    odds: 1.9,
    potentialWin: 190,
    status: "won",
    date: "2024-01-13T12:00:00Z",
  },
  {
    id: "3",
    matchId: "3",
    match: "Bayern Munich vs Dortmund",
    betType: "away",
    amount: 75,
    odds: 5.2,
    potentialWin: 390,
    status: "lost",
    date: "2024-01-12T14:00:00Z",
  },
];

export const mockTransactions: WalletTransaction[] = [
  {
    id: "1",
    type: "deposit",
    amount: 500,
    date: "2024-01-10T10:00:00Z",
    description: "Deposit via Credit Card",
  },
  {
    id: "2",
    type: "bet",
    amount: -50,
    date: "2024-01-14T10:00:00Z",
    description: "Bet on Manchester United vs Liverpool",
  },
  {
    id: "3",
    type: "win",
    amount: 190,
    date: "2024-01-13T12:00:00Z",
    description: "Won bet on Barcelona vs Real Madrid",
  },
];

export const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "match_start",
    title: "Match Starting Soon",
    message: "Barcelona vs Real Madrid starts in 15 minutes",
    date: "2024-01-16T19:45:00Z",
    read: false,
  },
  {
    id: "2",
    type: "bet_alert",
    title: "AI Bet Alert",
    message: "High confidence prediction: Manchester United (68% win probability)",
    date: "2024-01-14T09:00:00Z",
    read: false,
  },
  {
    id: "3",
    type: "result",
    title: "Bet Result",
    message: "You won $190 on Barcelona vs Real Madrid!",
    date: "2024-01-13T22:00:00Z",
    read: true,
  },
];

export interface DashboardStats {
  totalProfit: string;
  winRate: string;
  totalBets: string;
  walletBalance: string;
  activeBets: string;
}

export const mockStats: DashboardStats = {
  totalProfit: "$240.50",
  winRate: "67%",
  totalBets: "48",
  walletBalance: "$1,240.50",
  activeBets: "3",
};
