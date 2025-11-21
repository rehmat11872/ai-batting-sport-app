// ESPN API integration for NBA, NFL, and Soccer

export interface ESPNScore {
  id: string;
  name: string;
  shortName: string;
  date: string;
  competitions: Array<{
    id: string;
    date: string;
    attendance?: number;
    type: {
      id: string;
      abbreviation: string;
    };
    status: {
      clock?: number;
      displayClock: string;
      period: number;
      type: {
        id: string;
        name: string;
        state: string;
        completed: boolean;
        description: string;
        detail: string;
        shortDetail: string;
      };
    };
    competitors: Array<{
      id: string;
      uid: string;
      type: string;
      order: number;
      homeAway: string;
      team: {
        id: string;
        uid: string;
        location: string;
        name: string;
        abbreviation: string;
        displayName: string;
        shortDisplayName: string;
        color: string;
        alternateColor: string;
        logo: string;
      };
      score?: string;
      record?: Array<{
        name: string;
        abbreviation?: string;
        type: string;
        summary: string;
      }>;
    }>;
    venue?: {
      id: string;
      fullName: string;
      address: {
        city: string;
        state: string;
      };
    };
    league?: {
      id: string;
      uid: string;
      name: string;
      abbreviation: string;
    };
  }>;
  links: Array<{
    language: string;
    rel: string[];
    href: string;
    text: string;
    shortText: string;
    isExternal: boolean;
    isPremium: boolean;
  }>;
}

export interface FormattedGame {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: string;
  awayScore?: string;
  status: string;
  date: string;
  league: string;
  venue?: string;
  venueCity?: string;
  venueState?: string;
  isOutdoor?: boolean; // True for NFL, Soccer (outdoor sports)
}

export async function fetchNBAScores(): Promise<FormattedGame[]> {
  try {
    const res = await fetch(
      "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard",
      { next: { revalidate: 60 } }
    );

    if (!res.ok) {
      console.error("ESPN NBA API error:", res.status);
      return [];
    }

    const data = await res.json();
    return formatESPNGames(data.events || [], "NBA");
  } catch (error) {
    console.error("Failed to fetch NBA scores:", error);
    return [];
  }
}

export async function fetchNFLScores(): Promise<FormattedGame[]> {
  try {
    const res = await fetch(
      "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard",
      { next: { revalidate: 60 } }
    );

    if (!res.ok) {
      console.error("ESPN NFL API error:", res.status);
      return [];
    }

    const data = await res.json();
    return formatESPNGames(data.events || [], "NFL");
  } catch (error) {
    console.error("Failed to fetch NFL scores:", error);
    return [];
  }
}

export async function fetchSoccerScores(): Promise<FormattedGame[]> {
  try {
    // Fetch multiple soccer leagues
    const leagues = ["eng.1", "usa.1", "esp.1", "ita.1", "fra.1"];
    const allGames: FormattedGame[] = [];

    for (const league of leagues) {
      try {
        const res = await fetch(
          `https://site.api.espn.com/apis/site/v2/sports/soccer/${league}/scoreboard`,
          { next: { revalidate: 60 } }
        );

        if (res.ok) {
          const data = await res.json();
          const games = formatESPNGames(data.events || [], getLeagueName(league));
          allGames.push(...games);
        }
      } catch (error) {
        console.error(`Failed to fetch ${league} scores:`, error);
      }
    }

    return allGames.slice(0, 10); // Limit to 10 games
  } catch (error) {
    console.error("Failed to fetch soccer scores:", error);
    return [];
  }
}

function formatESPNGames(events: ESPNScore[], league: string): FormattedGame[] {
  // Determine if sport is outdoor
  const outdoorSports = ["NFL", "Soccer", "Premier League", "MLS", "La Liga", "Serie A", "Ligue 1"];
  const isOutdoor = outdoorSports.includes(league);

  return events.map((event) => {
    const competition = event.competitions?.[0];
    const competitors = competition?.competitors || [];
    
    const homeTeam = competitors.find((c) => c.homeAway === "home");
    const awayTeam = competitors.find((c) => c.homeAway === "away");

    const venue = competition?.venue;
    const venueCity = venue?.address?.city;
    const venueState = venue?.address?.state;
    const venueLocation = venueCity && venueState ? `${venueCity}, ${venueState}` : venueCity || venue?.fullName || "";

    return {
      id: event.id,
      homeTeam: homeTeam?.team?.displayName || homeTeam?.team?.name || "TBD",
      awayTeam: awayTeam?.team?.displayName || awayTeam?.team?.name || "TBD",
      homeScore: homeTeam?.score,
      awayScore: awayTeam?.score,
      status: competition?.status?.type?.shortDetail || competition?.status?.type?.detail || "Scheduled",
      date: competition?.date || event.date,
      league,
      venue: venue?.fullName,
      venueCity: venueLocation,
      venueState: venueState,
      isOutdoor,
    };
  });
}

function getLeagueName(leagueCode: string): string {
  const leagueMap: Record<string, string> = {
    "eng.1": "Premier League",
    "usa.1": "MLS",
    "esp.1": "La Liga",
    "ita.1": "Serie A",
    "fra.1": "Ligue 1",
  };
  return leagueMap[leagueCode] || "Soccer";
}

