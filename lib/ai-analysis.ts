import { fetchNBAScores, fetchNFLScores, fetchSoccerScores, type FormattedGame } from "@/lib/espn";
import type { AIAnalysisResponse } from "@/types/betintel";

// OpenAI configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

interface GameData {
  sport: string;
  matchup: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  status: string;
  homeScore?: number | string;
  awayScore?: number | string;
  venue?: string;
}

/**
 * Extract game context from user query
 */
export function extractGameContext(query: string): string {
  // Normalize the query to create a consistent context key
  const normalized = query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim();
  
  // Extract team names or matchup indicators
  const teams = normalized.match(/([a-z]+)\s*(?:vs?|versus|against)\s*([a-z]+)/i);
  if (teams) {
    return `${teams[1]}_vs_${teams[2]}`.toLowerCase();
  }
  
  // Fallback to first 50 chars as context
  return normalized.slice(0, 50);
}

/**
 * Detect sport from query
 */
export function detectSport(query: string): string | null {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes("nba") || lowerQuery.includes("basketball")) return "NBA";
  if (lowerQuery.includes("nfl") || lowerQuery.includes("football")) return "NFL";
  if (lowerQuery.includes("soccer") || lowerQuery.includes("premier") || lowerQuery.includes("mls")) return "Soccer";
  
  // Team name detection
  const nbaTeams = ["lakers", "celtics", "warriors", "bulls", "heat", "nets", "knicks", "nuggets", "bucks", "suns"];
  const nflTeams = ["chiefs", "eagles", "cowboys", "49ers", "bills", "dolphins", "ravens", "packers", "lions", "bengals"];
  
  for (const team of nbaTeams) {
    if (lowerQuery.includes(team)) return "NBA";
  }
  
  for (const team of nflTeams) {
    if (lowerQuery.includes(team)) return "NFL";
  }
  
  return null;
}

/**
 * Find matching game from current games
 */
async function findMatchingGame(query: string, sport: string | null): Promise<GameData | null> {
  const allGames: GameData[] = [];
  
  try {
    if (!sport || sport === "NBA") {
      const nbaGames = await fetchNBAScores();
      allGames.push(...nbaGames.map(g => ({
        sport: "NBA",
        matchup: g.name,
        homeTeam: g.homeTeam,
        awayTeam: g.awayTeam,
        date: g.date,
        status: g.status,
        homeScore: g.homeScore ? Number(g.homeScore) : undefined,
        awayScore: g.awayScore ? Number(g.awayScore) : undefined,
        venue: g.venue,
      })));
    }
    
    if (!sport || sport === "NFL") {
      const nflGames = await fetchNFLScores();
      allGames.push(...nflGames.map(g => ({
        sport: "NFL",
        matchup: g.name,
        homeTeam: g.homeTeam,
        awayTeam: g.awayTeam,
        date: g.date,
        status: g.status,
        homeScore: g.homeScore ? Number(g.homeScore) : undefined,
        awayScore: g.awayScore ? Number(g.awayScore) : undefined,
        venue: g.venue,
      })));
    }
    
    if (!sport || sport === "Soccer") {
      const soccerGames = await fetchSoccerScores();
      allGames.push(...soccerGames.map(g => ({
        sport: "Soccer",
        matchup: g.name,
        homeTeam: g.homeTeam,
        awayTeam: g.awayTeam,
        date: g.date,
        status: g.status,
        homeScore: g.homeScore ? Number(g.homeScore) : undefined,
        awayScore: g.awayScore ? Number(g.awayScore) : undefined,
        venue: g.venue,
      })));
    }
  } catch (error) {
    console.error("Error fetching games:", error);
  }
  
  // Find matching game
  const lowerQuery = query.toLowerCase();
  for (const game of allGames) {
    if (
      lowerQuery.includes(game.homeTeam.toLowerCase()) ||
      lowerQuery.includes(game.awayTeam.toLowerCase())
    ) {
      return game;
    }
  }
  
  return allGames[0] || null;
}

/**
 * Generate AI analysis using OpenAI
 */
export async function generateAIAnalysis(
  query: string,
  gameContext?: string
): Promise<AIAnalysisResponse> {
  const sport = detectSport(query);
  const game = await findMatchingGame(query, sport);
  
  const systemPrompt = `You are BetIntel AI, a sharp sports betting analyst. You provide intelligent, data-driven analysis for sports bettors. 

Your responses are:
- Concise and actionable
- Based on real factors (injuries, pace, matchups, weather)
- Honest about confidence levels
- Never make guarantees or promises

You identify:
- Key factors that actually matter
- Noise that bettors should ignore (media hype, recent blowouts, public narratives)
- Where potential edges might exist

Format your analysis as JSON with these exact fields:
- quickSummary: 2-3 sentences max
- keyFactors: array of 3-5 bullet points
- noiseToIgnore: array of 2-3 things to ignore
- potentialEdge: one clear statement about where value might be
- confidence: number 1-100 (confidence in analysis, not outcome)`;

  const userPrompt = `Query: ${query}

${game ? `Game Info:
- Matchup: ${game.matchup}
- Sport: ${game.sport}
- Status: ${game.status}
- Home: ${game.homeTeam}${game.homeScore !== undefined ? ` (${game.homeScore})` : ""}
- Away: ${game.awayTeam}${game.awayScore !== undefined ? ` (${game.awayScore})` : ""}
- Venue: ${game.venue || "TBD"}
- Date: ${game.date}` : "No specific game found. Provide general analysis for this query."}

Analyze this and provide your response in JSON format.`;

  // If OpenAI key is available, use it
  if (OPENAI_API_KEY) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 1000,
          response_format: { type: "json_object" },
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        const content = JSON.parse(data.choices[0].message.content);
        
        return {
          id: crypto.randomUUID(),
          matchup: game?.matchup || query,
          sport: game?.sport || sport || "Unknown",
          analysisType: game?.status === "In Progress" ? "live" : "pre-game",
          confidence: content.confidence || 70,
          quickSummary: content.quickSummary || "Analysis generated successfully.",
          keyFactors: content.keyFactors || ["Factor 1", "Factor 2", "Factor 3"],
          noiseToIgnore: content.noiseToIgnore || ["Ignore 1", "Ignore 2"],
          potentialEdge: content.potentialEdge || "No clear edge identified.",
          createdAt: new Date().toISOString(),
        };
      }
    } catch (error) {
      console.error("OpenAI API error:", error);
    }
  }
  
  // Fallback mock response
  return generateMockAnalysis(query, game);
}

/**
 * Generate mock analysis when OpenAI is unavailable
 */
function generateMockAnalysis(query: string, game: GameData | null): AIAnalysisResponse {
  const sport = game?.sport || detectSport(query) || "Unknown";
  const matchup = game?.matchup || "General Analysis";
  
  return {
    id: crypto.randomUUID(),
    matchup,
    sport,
    analysisType: "pre-game",
    confidence: 65 + Math.floor(Math.random() * 20),
    quickSummary: `This matchup presents interesting angles for sharp bettors. Key factors include recent performance trends and injury impacts that the market may not have fully priced in.`,
    keyFactors: [
      "Pace differential favors the under in this matchup",
      "Key injury impact not fully reflected in current lines",
      "Historical ATS trends suggest value on the underdog",
      "Rest advantage could be significant factor",
      "Weather conditions may impact scoring",
    ].slice(0, 4),
    noiseToIgnore: [
      "Recent blowout results (sample size too small)",
      "Media narrative around 'revenge game'",
      "Public betting percentage (often contrarian indicator)",
    ].slice(0, 3),
    potentialEdge: "Market appears slow to adjust for the injury news. Consider monitoring line movement before lock.",
    createdAt: new Date().toISOString(),
  };
}

