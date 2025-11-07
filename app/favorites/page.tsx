"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Star } from "lucide-react";
import { mockMatches, mockPredictions } from "@/lib/mockData";

export default function FavoritesPage() {
  const [favoriteTeams, setFavoriteTeams] = useState<string[]>([
    "Manchester United",
    "Barcelona",
    "Bayern Munich",
  ]);
  const [favoriteLeagues, setFavoriteLeagues] = useState<string[]>([
    "Premier League",
    "La Liga",
  ]);

  const toggleTeam = (team: string) => {
    setFavoriteTeams((prev) =>
      prev.includes(team) ? prev.filter((t) => t !== team) : [...prev, team]
    );
  };

  const toggleLeague = (league: string) => {
    setFavoriteLeagues((prev) =>
      prev.includes(league) ? prev.filter((l) => l !== league) : [...prev, league]
    );
  };

  const favoriteMatches = mockMatches.filter(
    (m) =>
      favoriteTeams.includes(m.homeTeam) ||
      favoriteTeams.includes(m.awayTeam) ||
      favoriteLeagues.includes(m.league)
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Favorites</h1>
        <p className="text-muted-foreground">Manage your favorite teams and leagues</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Favorite Teams</CardTitle>
            <CardDescription>Teams you follow</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {["Manchester United", "Liverpool", "Barcelona", "Real Madrid", "Bayern Munich", "Dortmund"].map(
                (team) => (
                  <div
                    key={team}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <span className="font-medium">{team}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleTeam(team)}
                    >
                      <Heart
                        className={`h-5 w-5 ${
                          favoriteTeams.includes(team)
                            ? "fill-red-500 text-red-500"
                            : "text-muted-foreground"
                        }`}
                      />
                    </Button>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Favorite Leagues</CardTitle>
            <CardDescription>Leagues you follow</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {["Premier League", "La Liga", "Bundesliga", "Ligue 1", "Serie A", "Champions League"].map(
                (league) => (
                  <div
                    key={league}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <span className="font-medium">{league}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleLeague(league)}
                    >
                      <Star
                        className={`h-5 w-5 ${
                          favoriteLeagues.includes(league)
                            ? "fill-yellow-500 text-yellow-500"
                            : "text-muted-foreground"
                        }`}
                      />
                    </Button>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Matches with Favorites</CardTitle>
          <CardDescription>Upcoming matches involving your favorites</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {favoriteMatches.map((match) => (
              <Card key={match.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{match.league}</Badge>
                    {match.status === "live" && (
                      <Badge variant="destructive">LIVE</Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg mt-4">{match.homeTeam}</CardTitle>
                  <CardDescription className="text-center py-2">vs</CardDescription>
                  <CardTitle className="text-lg">{match.awayTeam}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Home</span>
                      <span className="font-semibold">{match.odds.home}x</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Draw</span>
                      <span className="font-semibold">{match.odds.draw}x</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Away</span>
                      <span className="font-semibold">{match.odds.away}x</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

