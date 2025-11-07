import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { mockPredictions, mockStats, mockMatches, mockBets } from "@/lib/mockData";
import { StatsCard } from "@/components/stats-card";
import { PredictionCard } from "@/components/prediction-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TrendingUp, Clock, Trophy, Wallet } from "lucide-react";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/auth/signin");
  }

  const activeBets = mockBets.filter((b) => b.status === "pending");
  const upcomingMatches = mockMatches.filter((m) => m.status === "upcoming").slice(0, 3);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session.user?.email}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
        <StatsCard
          title="Wallet Balance"
          value={mockStats.walletBalance}
          description="Available funds"
        />
        <StatsCard
          title="Total Profit"
          value={mockStats.totalProfit}
          description="All-time earnings"
        />
        <StatsCard
          title="Win Rate"
          value={mockStats.winRate}
          description="Success percentage"
        />
        <StatsCard
          title="Total Bets"
          value={mockStats.totalBets}
          description="Bets placed"
        />
        <StatsCard
          title="Active Bets"
          value={mockStats.activeBets}
          description="Pending bets"
        />
      </div>

      <Tabs defaultValue="predictions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="predictions">AI Predictions</TabsTrigger>
          <TabsTrigger value="matches">Upcoming Matches</TabsTrigger>
          <TabsTrigger value="bets">Active Bets</TabsTrigger>
        </TabsList>

        <TabsContent value="predictions" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockPredictions.map((prediction) => (
              <PredictionCard key={prediction.id} prediction={prediction} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="matches" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcomingMatches.map((match) => (
              <Card key={match.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{match.homeTeam}</CardTitle>
                    <Badge variant="outline">{match.league}</Badge>
                  </div>
                  <CardDescription className="text-center py-2">vs</CardDescription>
                  <CardTitle className="text-lg">{match.awayTeam}</CardTitle>
                </CardHeader>
                <CardContent>
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
                    <Button className="w-full mt-4" asChild>
                      <Link href={`/matches/${match.id}`}>Place Bet</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="bets" className="space-y-4">
          <div className="grid gap-4">
            {activeBets.map((bet) => (
              <Card key={bet.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{bet.match}</CardTitle>
                    <Badge
                      variant={
                        bet.status === "won"
                          ? "default"
                          : bet.status === "lost"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {bet.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Bet Type</p>
                      <p className="font-semibold capitalize">{bet.betType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Amount</p>
                      <p className="font-semibold">${bet.amount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Odds</p>
                      <p className="font-semibold">{bet.odds}x</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Potential Win</p>
                      <p className="font-semibold text-green-600">${bet.potentialWin}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
