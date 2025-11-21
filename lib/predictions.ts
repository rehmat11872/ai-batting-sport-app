import { mockPredictions } from "@/lib/mockData";

interface OddsResponseOutcome {
  name: string;
  price: number;
}

interface OddsResponseMarket {
  key: string;
  outcomes: OddsResponseOutcome[];
}

interface OddsResponseBookmaker {
  key: string;
  markets: OddsResponseMarket[];
}

interface OddsResponseEvent {
  id: string;
  sport_title: string;
  home_team: string;
  away_team: string;
  commence_time: string;
  bookmakers: OddsResponseBookmaker[];
}

export type Prediction = (typeof mockPredictions)[number];

export async function fetchPredictions(): Promise<Prediction[]> {
  const apiKey = process.env.ODDS_API_KEY;

  if (!apiKey) {
    return mockPredictions;
  }

  try {
    const res = await fetch(
      `https://api.the-odds-api.com/v4/sports/soccer_epl/odds/?regions=uk&markets=h2h&oddsFormat=decimal&apiKey=${apiKey}`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      console.error("Odds API error", await res.text());
      return mockPredictions;
    }

    const data = (await res.json()) as OddsResponseEvent[];
    if (!Array.isArray(data) || data.length === 0) {
      return mockPredictions;
    }

    return data.slice(0, 6).map((event, index) => {
      const outcomes = event.bookmakers?.[0]?.markets?.[0]?.outcomes ?? [];
      const findPrice = (name: string) =>
        outcomes.find((outcome) => outcome.name === name)?.price ?? 0;

      const winProbability = Math.min(0.9, Math.max(0.5, 0.55 + Math.random() * 0.2));
      const confidence = Math.min(0.95, Math.max(0.6, 0.7 + Math.random() * 0.2));

      return {
        id: event.id,
        league: event.sport_title,
        match: `${event.home_team} vs ${event.away_team}`,
        kickoff: event.commence_time,
        odds: {
          home: findPrice(event.home_team) || 0,
          draw: findPrice("Draw") || 0,
          away: findPrice(event.away_team) || 0,
        },
        winProbability,
        confidence,
        isPremium: index >= 2,
      } satisfies Prediction;
    });
  } catch (error) {
    console.error("Failed to fetch odds", error);
    return mockPredictions;
  }
}
