"use client";

import { useState } from "react";
import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardNav } from "@/components/dashboard-nav";
import type { FormattedGame } from "@/lib/espn";
import type { FormattedWeather, GameWeather } from "@/lib/weather";
import { type Prediction } from "@/lib/predictions";
import type { InsiderAlert, Sport } from "@/types/insiders";
import Link from "next/link";
import { Wind, Droplets, Cloud, Bell, AlertTriangle, Clock } from "lucide-react";

const WHOP_CHECKOUT_URL = process.env.NEXT_PUBLIC_WHOP_CHECKOUT_URL ?? "https://whop.com";

type Section = "predictions" | "alerts" | "nba" | "nfl" | "soccer" | "weather";

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
  const [alerts, setAlerts] = React.useState<InsiderAlert[]>([]);
  const [alertsLoading, setAlertsLoading] = React.useState<boolean>(true);
  const [alertsError, setAlertsError] = React.useState<string | null>(null);
  const [alertsSportFilter, setAlertsSportFilter] = React.useState<"ALL" | Sport>("ALL");
  const [canViewFullAlerts, setCanViewFullAlerts] = React.useState<boolean>(isSubscribed);

  // Free users see 2-3 cards, premium see all
  const freeLimit = 2;
  const displayPredictions = isSubscribed ? predictions : predictions.slice(0, freeLimit);
  const hiddenPredictions = isSubscribed ? 0 : Math.max(0, predictions.length - freeLimit);

  const loadAlerts = React.useCallback(
    async (sport: "ALL" | Sport) => {
      try {
        setAlertsLoading(true);
        setAlertsError(null);
        const params = new URLSearchParams({ limit: isSubscribed ? "20" : "5" });
        if (sport !== "ALL") {
          params.set("sport", sport);
        }
        const res = await fetch(`/api/insiders/alerts?${params.toString()}`);
        if (!res.ok) {
          throw new Error(`Failed to load alerts (${res.status})`);
        }
        const data = await res.json();
        setAlerts(data.alerts || []);
        setCanViewFullAlerts(Boolean(data.canViewFullFeed));
      } catch (error) {
        setAlertsError("Could not load alerts right now. Please try again shortly.");
      } finally {
        setAlertsLoading(false);
      }
    },
    [isSubscribed]
  );

  React.useEffect(() => {
    loadAlerts(alertsSportFilter);
  }, [alertsSportFilter, loadAlerts]);

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

      {/* Insider Alerts */}
      {currentSection === "alerts" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-medium">Breaking News Alerts</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Insider tweets that move betting lines. Injury news, lineups, weather, and late scratches.
              </p>
            </div>
            {!canViewFullAlerts && (
              <Button asChild size="sm" variant="outline">
                <Link href={WHOP_CHECKOUT_URL} target="_blank" rel="noreferrer">
                  Unlock Full Alerts
                </Link>
              </Button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {(["ALL", "NFL", "NBA", "Soccer"] as const).map((sport) => (
              <Button
                key={sport}
                size="sm"
                variant={alertsSportFilter === sport ? "default" : "outline"}
                onClick={() => setAlertsSportFilter(sport)}
              >
                {sport === "ALL" ? "All Sports" : sport}
              </Button>
            ))}
          </div>

          {alertsError && (
            <Card className="border-amber-300 bg-amber-50 text-amber-900">
              <CardContent className="flex items-center gap-2 p-4">
                <AlertTriangle className="h-4 w-4" />
                <p className="text-sm">{alertsError}</p>
              </CardContent>
            </Card>
          )}

          {alertsLoading ? (
            <div className="grid gap-3 md:grid-cols-2">
              {Array.from({ length: 3 }).map((_, idx) => (
                <Card key={idx} className="animate-pulse">
                  <CardContent className="space-y-3 p-4">
                    <div className="h-4 w-24 rounded bg-muted" />
                    <div className="h-6 w-3/4 rounded bg-muted" />
                    <div className="h-3 w-full rounded bg-muted" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : alerts.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No alerts yet. We&apos;ll surface insider tweets as soon as they drop.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {alerts.map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
            </div>
          )}

          {!canViewFullAlerts && alerts.length > 0 && (
            <LockedContentNotice count={Math.max(0, alerts.length)} type="alerts" />
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

function AlertCard({ alert }: { alert: InsiderAlert }) {
  const highlighted = highlightKeywords(alert.text, alert.matchedKeywords);
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{alert.sport}</Badge>
            {alert.windowTag && (
              <Badge variant="secondary" className="text-xs">
                {alert.windowTag.replace(/_/g, " ")}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{formatTimeAgo(alert.tweetedAt)}</span>
          </div>
        </div>
        <CardTitle className="text-base flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          {alert.author} <span className="text-xs font-normal text-muted-foreground">{alert.authorHandle}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm leading-relaxed">{highlighted}</p>
        {alert.matchedKeywords.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {alert.matchedKeywords.map((kw) => (
              <Badge key={kw} variant="secondary" className="text-[10px]">
                {kw}
              </Badge>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Urgency: {alert.urgencyScore}/10</span>
          {alert.url && (
            <Link href={alert.url} target="_blank" rel="noreferrer" className="text-primary hover:underline">
              View tweet →
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function highlightKeywords(text: string, keywords: string[]) {
  if (!keywords || keywords.length === 0) return text;
  const escaped = keywords.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const regex = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, idx) => {
    if (keywords.some((k) => k.toLowerCase() === part.toLowerCase())) {
      return (
        <mark key={idx} className="bg-amber-100 text-amber-900 px-1 rounded">
          {part}
        </mark>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
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

function LockedContentNotice({ count, type = "predictions" }: { count: number; type?: "predictions" | "games" | "alerts" }) {
  return (
    <Card className="border-dashed bg-muted/30">
      <CardContent className="flex flex-col gap-3 p-6 text-center">
        <h3 className="text-lg font-semibold">Go Premium with Whop</h3>
        <p className="text-sm text-muted-foreground">
          Unlock {count} additional{" "}
          {type === "predictions" ? "AI-backed predictions" : type === "alerts" ? "insider alerts" : "live games"} and
          more premium features.
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

