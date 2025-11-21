import { fetchPredictions, type Prediction } from "@/lib/predictions";
import { winningStreakDays, mockUserStats } from "@/lib/mockData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/session";
import { fetchNBAScores, fetchNFLScores, fetchSoccerScores } from "@/lib/espn";
import { fetchWeather } from "@/lib/weather";
import { DashboardContent } from "@/components/dashboard-content";
import { redirect } from "next/navigation";
import Link from "next/link";

const WHOP_CHECKOUT_URL = process.env.WHOP_CHECKOUT_URL ?? "https://whop.com";

export default async function DashboardPage() {
  const session = await getSession();
  
  // Redirect to login if not authenticated
  if (!session) {
    redirect("/login?redirect=/dashboard");
  }
  
  console.log("📊 Dashboard - Session check:", session ? `Logged in as ${session.name || session.email}` : "Not logged in");
  const predictions = await fetchPredictions();
  const isSubscribed = session?.isSubscribed ?? false;

  // Fetch ESPN scores and weather
  const [nbaGames, nflGames, soccerGames, weather] = await Promise.all([
    fetchNBAScores(),
    fetchNFLScores(),
    fetchSoccerScores(),
    fetchWeather(),
  ]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-medium text-primary">Today&apos;s streak</p>
        <h1 className="text-3xl font-semibold">
          Winning Streak: {winningStreakDays} days in a row
        </h1>
        <p className="text-muted-foreground">
          Live odds infused with AI confidence scores so you always know where the edge is.
        </p>
        {!session && (
          <div className="flex gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href="/login">Sign in with Whop</Link>
            </Button>
          </div>
        )}
        {session && (
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm text-muted-foreground">
              Logged in as <span className="font-medium">{session.name || session.email || "Whop Member"}</span>
            </p>
            <Badge variant={isSubscribed ? "default" : "secondary"}>
              {isSubscribed ? "Premium Active" : "Free Tier"}
            </Badge>
            {!isSubscribed && (
              <Button asChild size="sm" variant="outline">
                <Link href={WHOP_CHECKOUT_URL} target="_blank" rel="noreferrer">
                  Upgrade to Premium
                </Link>
              </Button>
            )}
          </div>
        )}
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <StatsCard label="Total Bets" value={mockUserStats.totalBets.toString()} />
        <StatsCard label="Win Rate" value={`${Math.round(mockUserStats.winRate * 100)}%`} />
        <StatsCard label="Profit" value={`$${mockUserStats.profit.toFixed(2)}`} />
      </section>

      <DashboardContent
        predictions={predictions}
        nbaGames={nbaGames}
        nflGames={nflGames}
        soccerGames={soccerGames}
        weather={weather}
        isSubscribed={isSubscribed}
      />
    </div>
  );
}

function StatsCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}
