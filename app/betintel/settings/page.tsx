"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, ArrowLeft, User, CreditCard, Clock, AlertTriangle, LogOut } from "lucide-react";
import Link from "next/link";

interface UserData {
  email?: string;
  name?: string;
  avatarUrl?: string;
}

interface UsageData {
  plan: {
    type: string;
    name: string;
    features: string[];
  };
  usage: {
    queriesUsed: number;
    queryLimit: number;
    queriesRemaining: number;
    usagePercent: number;
    periodStart: string;
    periodEnd: string;
    daysUntilReset: number;
  };
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/session").then((r) => r.json()),
      fetch("/api/betintel/usage").then((r) => r.json()),
    ])
      .then(([sessionData, usageData]) => {
        if (sessionData.email) {
          setUser(sessionData);
        }
        if (usageData.plan) {
          setUsage(usageData);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/betintel">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to BetIntel
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Account Settings</h1>
              <p className="text-muted-foreground">Manage your BetIntel account</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt="Avatar"
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <p className="font-medium">{user?.name || "User"}</p>
                  <p className="text-sm text-muted-foreground">{user?.email || "No email"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Plan */}
          {usage && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Current Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-lg">{usage.plan.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {usage.usage.queryLimit} queries per month
                    </p>
                  </div>
                  <Badge variant="outline">{usage.plan.type.toUpperCase()}</Badge>
                </div>
                <Link href="/betintel/upgrade">
                  <Button variant="outline" className="w-full">
                    Upgrade Plan
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Usage */}
          {usage && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Query Usage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-3xl font-bold">{usage.usage.queriesRemaining}</span>
                    <span className="text-muted-foreground"> / {usage.usage.queryLimit}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {usage.usage.queriesUsed} used
                  </span>
                </div>
                <Progress value={100 - usage.usage.usagePercent} className="h-2" />
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Resets in {usage.usage.daysUntilReset} days</span>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 text-sm">
                  <p className="text-muted-foreground">
                    <strong>Period:</strong>{" "}
                    {new Date(usage.usage.periodStart).toLocaleDateString()} -{" "}
                    {new Date(usage.usage.periodEnd).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Features */}
          {usage && (
            <Card>
              <CardHeader>
                <CardTitle>Plan Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {usage.plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <span className="text-primary">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Danger Zone */}
          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Account Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                You can cancel your subscription anytime from Whop.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

