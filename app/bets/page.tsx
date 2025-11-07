import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { mockBets } from "@/lib/mockData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function BetsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/auth/signin");
  }

  const pendingBets = mockBets.filter((b) => b.status === "pending");
  const wonBets = mockBets.filter((b) => b.status === "won");
  const lostBets = mockBets.filter((b) => b.status === "lost");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Bets</h1>
        <p className="text-muted-foreground">Track all your betting history</p>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Bets</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingBets.length})</TabsTrigger>
          <TabsTrigger value="won">Won ({wonBets.length})</TabsTrigger>
          <TabsTrigger value="lost">Lost ({lostBets.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4">
            {mockBets.map((bet) => (
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
                  <CardDescription>
                    {new Date(bet.date).toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Bet Type</p>
                      <p className="font-semibold capitalize">{bet.betType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Stake</p>
                      <p className="font-semibold">${bet.amount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Odds</p>
                      <p className="font-semibold">{bet.odds}x</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Potential Win</p>
                      <p
                        className={`font-semibold ${
                          bet.status === "won"
                            ? "text-green-600"
                            : bet.status === "lost"
                            ? "text-red-600"
                            : "text-blue-600"
                        }`}
                      >
                        ${bet.potentialWin}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <div className="grid gap-4">
            {pendingBets.map((bet) => (
              <Card key={bet.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{bet.match}</CardTitle>
                    <Badge variant="secondary">{bet.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Bet Type</p>
                      <p className="font-semibold capitalize">{bet.betType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Stake</p>
                      <p className="font-semibold">${bet.amount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Odds</p>
                      <p className="font-semibold">{bet.odds}x</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Potential Win</p>
                      <p className="font-semibold text-blue-600">${bet.potentialWin}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="won" className="space-y-4">
          <div className="grid gap-4">
            {wonBets.map((bet) => (
              <Card key={bet.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{bet.match}</CardTitle>
                    <Badge variant="default">{bet.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Bet Type</p>
                      <p className="font-semibold capitalize">{bet.betType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Stake</p>
                      <p className="font-semibold">${bet.amount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Odds</p>
                      <p className="font-semibold">{bet.odds}x</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Won</p>
                      <p className="font-semibold text-green-600">${bet.potentialWin}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="lost" className="space-y-4">
          <div className="grid gap-4">
            {lostBets.map((bet) => (
              <Card key={bet.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{bet.match}</CardTitle>
                    <Badge variant="destructive">{bet.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Bet Type</p>
                      <p className="font-semibold capitalize">{bet.betType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Stake</p>
                      <p className="font-semibold">${bet.amount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Odds</p>
                      <p className="font-semibold">{bet.odds}x</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Lost</p>
                      <p className="font-semibold text-red-600">-${bet.amount}</p>
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

