import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { mockMatches, mockPredictions } from "@/lib/mockData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, Play, Trophy, TrendingUp } from "lucide-react";

export default async function MatchesPage() {
  const session = await getSession();

  if (!session) {
    redirect("/auth/signin");
  }

  const liveMatches = mockMatches.filter((m) => m.status === "live");
  const upcomingMatches = mockMatches.filter((m) => m.status === "upcoming");
  const finishedMatches = mockMatches.filter((m) => m.status === "finished");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Live Matches & Odds</h1>
        <p className="text-muted-foreground">Track matches and place bets in real-time</p>
      </div>

      <Tabs defaultValue="live" className="space-y-4">
        <TabsList>
          <TabsTrigger value="live">
            Live ({liveMatches.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingMatches.length})
          </TabsTrigger>
          <TabsTrigger value="finished">
            Finished ({finishedMatches.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {liveMatches.map((match) => (
              <Card key={match.id} className="border-green-500">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <Play className="h-3 w-3" />
                      LIVE
                    </Badge>
                    <Badge variant="outline">{match.league}</Badge>
                  </div>
                  <CardTitle className="text-lg mt-4">{match.homeTeam}</CardTitle>
                  <CardDescription className="text-center py-2">
                    {match.score?.home} - {match.score?.away}
                  </CardDescription>
                  <CardTitle className="text-lg">{match.awayTeam}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Home Win</span>
                      <span className="font-semibold">{match.odds.home}x</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Draw</span>
                      <span className="font-semibold">{match.odds.draw}x</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Away Win</span>
                      <span className="font-semibold">{match.odds.away}x</span>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="w-full mt-4">Place Bet</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Place Bet</DialogTitle>
                          <DialogDescription>
                            {match.homeTeam} vs {match.awayTeam}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Bet Type</Label>
                            <select className="w-full px-3 py-2 border rounded-md">
                              <option>Home Win</option>
                              <option>Draw</option>
                              <option>Away Win</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="bet-amount">Amount</Label>
                            <Input id="bet-amount" type="number" placeholder="50" />
                          </div>
                          <div className="p-3 bg-muted rounded-md">
                            <div className="flex justify-between text-sm">
                              <span>Potential Win</span>
                              <span className="font-semibold">$105.00</span>
                            </div>
                          </div>
                          <Button className="w-full">Confirm Bet</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcomingMatches.map((match) => {
              const prediction = mockPredictions.find((p) => p.id === match.id);
              return (
                <Card key={match.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(match.date).toLocaleDateString()}
                      </Badge>
                      <Badge variant="outline">{match.league}</Badge>
                    </div>
                    <CardTitle className="text-lg mt-4">{match.homeTeam}</CardTitle>
                    <CardDescription className="text-center py-2">vs</CardDescription>
                    <CardTitle className="text-lg">{match.awayTeam}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {prediction && (
                      <div className="mb-4 p-3 bg-muted rounded-md">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">AI Prediction</span>
                          <Badge variant="secondary">
                            {Math.round(prediction.confidence * 100)}% confidence
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {prediction.predictedWinner} to win ({Math.round(prediction.winProbability * 100)}%)
                        </p>
                      </div>
                    )}
                    <div className="space-y-3">
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
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="w-full mt-4">Place Bet</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Place Bet</DialogTitle>
                            <DialogDescription>
                              {match.homeTeam} vs {match.awayTeam}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label>Bet Type</Label>
                              <select className="w-full px-3 py-2 border rounded-md">
                                <option>Home Win</option>
                                <option>Draw</option>
                                <option>Away Win</option>
                              </select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="bet-amount-upcoming">Amount</Label>
                              <Input id="bet-amount-upcoming" type="number" placeholder="50" />
                            </div>
                            <div className="p-3 bg-muted rounded-md">
                              <div className="flex justify-between text-sm">
                                <span>Potential Win</span>
                                <span className="font-semibold">$105.00</span>
                              </div>
                            </div>
                            <Button className="w-full">Confirm Bet</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="finished" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {finishedMatches.length > 0 ? (
              finishedMatches.map((match) => (
                <Card key={match.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Trophy className="h-3 w-3" />
                        Finished
                      </Badge>
                      <Badge variant="outline">{match.league}</Badge>
                    </div>
                    <CardTitle className="text-lg mt-4">{match.homeTeam}</CardTitle>
                    <CardDescription className="text-center py-2">
                      {match.score?.home} - {match.score?.away}
                    </CardDescription>
                    <CardTitle className="text-lg">{match.awayTeam}</CardTitle>
                  </CardHeader>
                </Card>
              ))
            ) : (
              <p className="text-muted-foreground">No finished matches</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

