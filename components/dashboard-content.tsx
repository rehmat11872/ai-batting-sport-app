"use client";

import { useState } from "react";
import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardNav } from "@/components/dashboard-nav";
import { fetchNBAScores, fetchNFLScores, fetchSoccerScores, type FormattedGame } from "@/lib/espn";
import { fetchWeather, type FormattedWeather, type GameWeather } from "@/lib/weather";
import { type Prediction } from "@/lib/predictions";
import Link from "next/link";
import { Wind, Droplets, Cloud } from "lucide-react";

const WHOP_CHECKOUT_URL = process.env.NEXT_PUBLIC_WHOP_CHECKOUT_URL ?? "https://whop.com";

type Section = "predictions" | "nba" | "nfl" | "soccer" | "weather";

interface DashboardContentProps {
  predictions: Prediction[];
  nbaGames: FormattedGame[];
  nflGames: FormattedGame[];
  soccerGames: FormattedGame[];
  weather: FormattedWeather | null;
  isSubscribed: boolean;
}

export function DashboardContent({
  predictions,
  nbaGames,
  nflGames,
  soccerGames,
  weather,
  isSubscribed,
}: DashboardContentProps) {
  const [currentSection, setCurrentSection] = useState<Section>("predictions");

  // Free users see 2-3 cards, premium see all
  const freeLimit = 2;
  const displayPredictions = isSubscribed ? predictions : predictions.slice(0, freeLimit);
  const hiddenPredictions = isSubscribed ? 0 : Math.max(0, predictions.length - freeLimit);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Content</h2>
        <DashboardNav currentSection={currentSection} onSectionChange={setCurrentSection} />
      </div>

      {/* Today's Predictions */}
      {currentSection === "predictions" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Today&apos;s Predictions</h3>
            {!isSubscribed && hiddenPredictions > 0 && (
              <Button asChild size="sm" variant="outline">
                <Link href={WHOP_CHECKOUT_URL} target="_blank" rel="noreferrer">
                  Unlock {hiddenPredictions} More Predictions
                </Link>
              </Button>
            )}
          </div>
          {displayPredictions.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No predictions available at this time. Check back later!
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {displayPredictions.map((prediction) => (
                  <PredictionCard key={prediction.id} prediction={prediction} isSubscribed={isSubscribed} />
                ))}
              </div>
              {!isSubscribed && hiddenPredictions > 0 && (
                <LockedContentNotice count={hiddenPredictions} />
              )}
            </>
          )}
        </div>
      )}

      {/* NBA */}
      {currentSection === "nba" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">NBA Scores</h3>
            {!isSubscribed && nbaGames.length > freeLimit && (
              <Button asChild size="sm" variant="outline">
                <Link href={WHOP_CHECKOUT_URL} target="_blank" rel="noreferrer">
                  Unlock All Games
                </Link>
              </Button>
            )}
          </div>
          {nbaGames.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No NBA games available at this time.
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {(isSubscribed ? nbaGames : nbaGames.slice(0, freeLimit)).map((game) => (
                  <GameCard key={game.id} game={game} isSubscribed={isSubscribed} />
                ))}
              </div>
              {!isSubscribed && nbaGames.length > freeLimit && (
                <LockedContentNotice count={nbaGames.length - freeLimit} type="games" />
              )}
            </>
          )}
        </div>
      )}

      {/* NFL */}
      {currentSection === "nfl" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">NFL Scores</h3>
            {!isSubscribed && nflGames.length > freeLimit && (
              <Button asChild size="sm" variant="outline">
                <Link href={WHOP_CHECKOUT_URL} target="_blank" rel="noreferrer">
                  Unlock All Games
                </Link>
              </Button>
            )}
          </div>
          {nflGames.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No NFL games available at this time.
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {(isSubscribed ? nflGames : nflGames.slice(0, freeLimit)).map((game) => (
                  <GameCard key={game.id} game={game} isSubscribed={isSubscribed} />
                ))}
              </div>
              {!isSubscribed && nflGames.length > freeLimit && (
                <LockedContentNotice count={nflGames.length - freeLimit} type="games" />
              )}
            </>
          )}
        </div>
      )}

      {/* Soccer */}
      {currentSection === "soccer" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Soccer Scores</h3>
            {!isSubscribed && soccerGames.length > freeLimit && (
              <Button asChild size="sm" variant="outline">
                <Link href={WHOP_CHECKOUT_URL} target="_blank" rel="noreferrer">
                  Unlock All Games
                </Link>
              </Button>
            )}
          </div>
          {soccerGames.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No soccer games available at this time.
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {(isSubscribed ? soccerGames : soccerGames.slice(0, freeLimit)).map((game) => (
                  <GameCard key={game.id} game={game} isSubscribed={isSubscribed} />
                ))}
              </div>
              {!isSubscribed && soccerGames.length > freeLimit && (
                <LockedContentNotice count={soccerGames.length - freeLimit} type="games" />
              )}
            </>
          )}
        </div>
      )}

      {/* Weather */}
      {currentSection === "weather" && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Weather Conditions</h3>
          {weather ? (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl font-bold">{weather.temperature}°F</div>
                    <div>
                      <p className="text-lg font-semibold">{weather.location}</p>
                      <p className="text-sm text-muted-foreground">{weather.condition}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <Droplets className="h-4 w-4" />
                      <span>{weather.humidity}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wind className="h-4 w-4" />
                      <span>{weather.windSpeed} mph</span>
                    </div>
                    <div className="text-muted-foreground">
                      Feels like {weather.feelsLike}°F
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Weather data unavailable. Please check your API key.
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </section>
  );
}

function PredictionCard({ prediction, isSubscribed }: { prediction: Prediction; isSubscribed: boolean }) {
  const winPercentage = Math.round(prediction.winProbability * 100);
  const confidencePercentage = Math.round(prediction.confidence * 100);
  const [gameWeather, setGameWeather] = React.useState<GameWeather | null>(null);
  const [loadingWeather, setLoadingWeather] = React.useState(false);

  // Determine if this is an outdoor sport
  const outdoorLeagues = ["Premier League", "Serie A", "La Liga", "Bundesliga", "MLS", "Ligue 1"];
  const isOutdoor = outdoorLeagues.some(league => prediction.league.includes(league));

  // Extract location from match (simplified - in production, get from API)
  const getMatchLocation = (match: string, league: string): string | null => {
    // For now, use a default location. In production, extract from Odds API or team data
    if (league.includes("Premier League")) return "London, UK";
    if (league.includes("Serie A")) return "Milan, Italy";
    if (league.includes("La Liga")) return "Madrid, Spain";
    if (league.includes("Bundesliga")) return "Munich, Germany";
    return null;
  };

  React.useEffect(() => {
    // Fetch weather for outdoor sports (all users, not just premium)
    if (isOutdoor && prediction.kickoff) {
      const location = getMatchLocation(prediction.match, prediction.league);
      if (location) {
        setLoadingWeather(true);
        fetch(`/api/weather/game?location=${encodeURIComponent(location)}&dateTime=${encodeURIComponent(prediction.kickoff)}`)
          .then((res) => res.json())
          .then((data) => {
            setGameWeather(data.weather);
            setLoadingWeather(false);
          })
          .catch(() => {
            setLoadingWeather(false);
          });
      }
    }
  }, [isOutdoor, prediction.kickoff, prediction.match, prediction.league]);

  // Format time consistently to avoid hydration mismatch
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <Card className="relative overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <Badge variant="outline">{prediction.league}</Badge>
          <span>{formatTime(prediction.kickoff)}</span>
        </div>
        <CardTitle className="text-lg">{prediction.match}</CardTitle>
        <CardDescription>Odds refresh every 60 seconds</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <OddsPill label="Home" value={prediction.odds.home} />
          <OddsPill label="Draw" value={prediction.odds.draw} />
          <OddsPill label="Away" value={prediction.odds.away} />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>AI Win Probability</span>
            <span className="font-semibold">{winPercentage}%</span>
          </div>
          <Progress value={winPercentage} className="h-2" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Confidence</span>
            <span className="font-semibold">{confidencePercentage}%</span>
          </div>
          <Progress value={confidencePercentage} className="h-2" />
        </div>
        {/* Weather for outdoor sports (all users) */}
        {isOutdoor && (
          <div className="pt-3 border-t">
            {loadingWeather ? (
              <p className="text-xs text-muted-foreground">Loading weather...</p>
            ) : gameWeather ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Match Weather</span>
                  <span className="font-medium">{gameWeather.temperature}°F</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Cloud className="h-3 w-3" />
                    <span>{gameWeather.condition}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Droplets className="h-3 w-3" />
                    <span>{gameWeather.rainProbability}% rain</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Wind className="h-3 w-3" />
                    <span>{gameWeather.windSpeed} mph</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Forecast for {new Date(prediction.kickoff).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric' })}
                </p>
              </div>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function OddsPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border bg-muted/40 px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold">{value > 0 ? value.toFixed(2) : "N/A"}x</p>
    </div>
  );
}

function GameCard({ game, isSubscribed }: { game: FormattedGame; isSubscribed: boolean }) {
  const [gameWeather, setGameWeather] = React.useState<GameWeather | null>(null);
  const [loadingWeather, setLoadingWeather] = React.useState(false);

  React.useEffect(() => {
    // Fetch weather for outdoor sports (all users, not just premium)
    if (game.isOutdoor && game.venueCity && game.date) {
      setLoadingWeather(true);
      fetch(`/api/weather/game?location=${encodeURIComponent(game.venueCity)}&dateTime=${encodeURIComponent(game.date)}`)
        .then((res) => res.json())
        .then((data) => {
          setGameWeather(data.weather);
          setLoadingWeather(false);
        })
        .catch(() => {
          setLoadingWeather(false);
        });
    }
  }, [game.isOutdoor, game.venueCity, game.date]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Badge variant="outline">{game.league}</Badge>
          <span className="text-xs text-muted-foreground">{game.status}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{game.awayTeam}</span>
          <span className="text-sm font-semibold">{game.awayScore || "-"}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{game.homeTeam}</span>
          <span className="text-sm font-semibold">{game.homeScore || "-"}</span>
        </div>
        {game.venue && (
          <p className="text-xs text-muted-foreground mt-2">{game.venue}</p>
        )}
        {/* Weather for outdoor sports (all users) */}
        {game.isOutdoor && (
          <div className="mt-3 pt-3 border-t">
            {loadingWeather ? (
              <p className="text-xs text-muted-foreground">Loading weather...</p>
            ) : gameWeather ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Match Weather</span>
                  <span className="font-medium">{gameWeather.temperature}°F</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Cloud className="h-3 w-3" />
                    <span>{gameWeather.condition}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Droplets className="h-3 w-3" />
                    <span>{gameWeather.rainProbability}% rain</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Wind className="h-3 w-3" />
                    <span>{gameWeather.windSpeed} mph</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Forecast for {new Date(game.date).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric' })}
                </p>
              </div>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function LockedContentNotice({ count, type = "predictions" }: { count: number; type?: "predictions" | "games" }) {
  return (
    <Card className="border-dashed bg-muted/30">
      <CardContent className="flex flex-col gap-3 p-6 text-center">
        <h3 className="text-lg font-semibold">Go Premium with Whop</h3>
        <p className="text-sm text-muted-foreground">
          Unlock {count} additional {type === "predictions" ? "AI-backed predictions" : "live games"} and more premium features.
        </p>
        <Button asChild>
          <Link href={WHOP_CHECKOUT_URL} target="_blank" rel="noreferrer">
            Upgrade on Whop
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

