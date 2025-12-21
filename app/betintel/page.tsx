"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, Send, Sparkles, AlertTriangle, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

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
    daysUntilReset: number;
  };
  warning: {
    type: string;
    message: string;
    showUpgrade: boolean;
  };
}

interface AIAnalysis {
  id: string;
  matchup: string;
  sport: string;
  analysisType: string;
  confidence: number;
  quickSummary: string;
  keyFactors: string[];
  noiseToIgnore: string[];
  potentialEdge: string;
  createdAt: string;
}

const placeholderQueries = [
  "Break down Lakers vs Nuggets tonight",
  "Is the total inflated in Bills vs Dolphins?",
  "Which games tonight are worth ignoring?",
  "Compare spread vs total value here",
  "Analyze Chiefs vs Ravens matchup",
];

export default function BetIntelPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [queriesRemaining, setQueriesRemaining] = useState<number | null>(null);
  const [queryUsedToast, setQueryUsedToast] = useState<string | null>(null);
  const [isLoadingUsage, setIsLoadingUsage] = useState(true);

  // Rotate placeholder
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholderQueries.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Fetch usage on mount
  useEffect(() => {
    fetchUsage();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUsage = async () => {
    setIsLoadingUsage(true);
    try {
      const res = await fetch("/api/betintel/usage");
      if (res.ok) {
        const data = await res.json();
        // Ensure warning exists with default values
        if (!data.warning) {
          data.warning = {
            type: "none",
            message: "",
            showUpgrade: false,
          };
        }
        // Ensure usage exists
        if (!data.usage) {
          data.usage = {
            queriesUsed: 0,
            queryLimit: 5,
            queriesRemaining: 5,
            usagePercent: 0,
            daysUntilReset: 30,
          };
        }
        // Ensure plan exists
        if (!data.plan) {
          data.plan = {
            type: "free",
            name: "Free",
            features: [],
          };
        }
        setUsage(data);
        setQueriesRemaining(data.usage?.queriesRemaining ?? 0);
      } else if (res.status === 401) {
        router.push("/login?redirect=/betintel");
        return;
      } else {
        // If API fails, set default usage
        setUsage({
          plan: { type: "free", name: "Free", features: [] },
          usage: {
            queriesUsed: 0,
            queryLimit: 5,
            queriesRemaining: 5,
            usagePercent: 0,
            daysUntilReset: 30,
          },
          warning: {
            type: "none",
            message: "",
            showUpgrade: false,
          },
        });
      }
    } catch (err) {
      console.error("Failed to fetch usage:", err);
      // Set default on error
      setUsage({
        plan: { type: "free", name: "Free", features: [] },
        usage: {
          queriesUsed: 0,
          queryLimit: 5,
          queriesRemaining: 5,
          usagePercent: 0,
          daysUntilReset: 30,
        },
        warning: {
          type: "none",
          message: "",
          showUpgrade: false,
        },
      });
    } finally {
      setIsLoadingUsage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const res = await fetch("/api/betintel/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.showUpgrade) {
          setShowUpgradeModal(true);
        }
        setError(data.error || "Failed to process query");
        return;
      }

      setAnalysis(data.analysis);
      setQueriesRemaining(data.queriesRemaining);

      // Show toast if query was used
      if (data.queryUsed) {
        setQueryUsedToast(`🧠 1 query used · ${data.queriesRemaining} remaining`);
        setTimeout(() => setQueryUsedToast(null), 3000);
      }

      // Refresh usage
      fetchUsage();
    } catch (err) {
      setError("Failed to connect. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while fetching usage
  if (isLoadingUsage) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
              <p className="text-muted-foreground">Loading BetIntel AI...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">BetIntel AI</h1>
              <p className="text-sm text-muted-foreground">Sharp analysis, no hype</p>
            </div>
          </div>
          <Link href="/betintel/settings">
            <Button variant="ghost" size="sm">Settings</Button>
          </Link>
        </div>

        {/* Usage Card */}
        {usage && (
          <Card className="mb-6 border-primary/20">
            <CardContent className="py-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" />
                  <span className="font-medium">Intelligence Queries Remaining</span>
                </div>
                <Badge variant={usage.usage.usagePercent >= 80 ? "destructive" : "secondary"}>
                  {usage.plan.name}
                </Badge>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold">{usage.usage.queriesRemaining}</span>
                <span className="text-muted-foreground">/ {usage.usage.queryLimit} this month</span>
              </div>
              <Progress 
                value={100 - usage.usage.usagePercent} 
                className="h-2 mb-2"
              />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Resets in {usage.usage.daysUntilReset} days
                </span>
                {usage?.warning?.showUpgrade && (
                  <Link href="/betintel/upgrade">
                    <Button variant="link" size="sm" className="text-primary p-0 h-auto">
                      Upgrade for more
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Warning Banner */}
        {usage?.warning && usage.warning.type !== "none" && (
          <div className={`mb-6 p-4 rounded-lg flex items-center justify-between ${
            usage.warning.type === "depleted" ? "bg-destructive/10 border border-destructive/20" :
            usage.warning.type === "critical" ? "bg-amber-500/10 border border-amber-500/20" :
            "bg-amber-500/5 border border-amber-500/10"
          }`}>
            <div className="flex items-center gap-2">
              <AlertTriangle className={`h-4 w-4 ${
                usage.warning.type === "depleted" ? "text-destructive" : "text-amber-500"
              }`} />
              <span className="text-sm">{usage.warning.message}</span>
            </div>
            <Link href="/betintel/upgrade">
              <Button size="sm" variant={usage.warning.type === "depleted" ? "default" : "outline"}>
                {usage.warning.type === "depleted" ? "Upgrade Now" : "View Plans"}
              </Button>
            </Link>
          </div>
        )}

        {/* Query Input */}
        <Card className="mb-8 shadow-lg">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="relative">
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={placeholderQueries[placeholderIndex]}
                  className="w-full min-h-[120px] p-4 pr-16 rounded-lg border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-lg"
                  disabled={isLoading || (usage?.warning?.type === "depleted")}
                />
                <Button
                  type="submit"
                  size="lg"
                  className="absolute bottom-4 right-4"
                  disabled={!query.trim() || isLoading || (usage?.warning?.type === "depleted")}
                >
                  {isLoading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <>
                      <span className="mr-2">Analyze</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
            {error && (
              <p className="mt-3 text-sm text-destructive">{error}</p>
            )}
          </CardContent>
        </Card>

        {/* Query Used Toast */}
        {queryUsedToast && (
          <div className="fixed top-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg animate-in fade-in slide-in-from-top-2 z-50">
            {queryUsedToast}
          </div>
        )}

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            {/* Header */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{analysis.matchup}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {analysis.analysisType === "live" ? "Live" : "Pre-game"} analysis · Confidence: {analysis.confidence}%
                    </p>
                  </div>
                  <Badge variant="outline">{analysis.sport}</Badge>
                </div>
              </CardHeader>
            </Card>

            {/* Quick Summary */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Quick Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{analysis.quickSummary}</p>
              </CardContent>
            </Card>

            {/* Key Factors */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Key Factors That Matter</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.keyFactors.map((factor, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Noise to Ignore */}
            <Card className="border-muted">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-muted-foreground">Noise to Ignore</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground">
                  {analysis.noiseToIgnore.map((noise, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-1">×</span>
                      <span>{noise}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Potential Edge */}
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" />
                  Where the Potential Edge Is
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{analysis.potentialEdge}</p>
              </CardContent>
            </Card>

            {/* Confidence Bar */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Confidence Level</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Progress value={analysis.confidence} className="h-3" />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Confidence in analysis, not outcome</span>
                    <span className="font-bold">{analysis.confidence}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Follow-up */}
            <Card className="bg-muted/50">
              <CardContent className="py-4">
                <p className="text-sm text-muted-foreground mb-3">
                  Ask a follow-up about this matchup (free)
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Follow-up question..."
                    className="flex-1 px-3 py-2 rounded-md border bg-background text-sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setQuery((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = "";
                      }
                    }}
                  />
                  <Button size="sm" variant="outline">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Upgrade Modal */}
        {showUpgradeModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full">
              <CardHeader>
                <CardTitle>You&apos;ve used all your queries</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Upgrade to keep getting AI-powered game intelligence — no hype, no picks, just real edges.
                </p>
                <div className="flex gap-3">
                  <Link href="/betintel/upgrade" className="flex-1">
                    <Button className="w-full">Upgrade Now</Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowUpgradeModal(false)}
                  >
                    Wait for Reset
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}

