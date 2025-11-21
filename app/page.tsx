"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Cloud, Activity, Target, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserSession {
  userId: string;
  isSubscribed: boolean;
  email?: string;
  name?: string;
  avatarUrl?: string;
}

export default function Home() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check auth status on mount and when route changes
  useEffect(() => {
    // Initial check
    checkAuthStatus();
    
    // Check again after a short delay (handles OAuth redirects)
    const timeoutId = setTimeout(() => {
      checkAuthStatus();
    }, 500);
    
    // Listen for storage events (logout from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "session_updated" || e.key === null) {
        checkAuthStatus();
      }
    };
    window.addEventListener("storage", handleStorageChange);
    
    // Listen for focus events (user returns to tab)
    const handleFocus = () => {
      checkAuthStatus();
    };
    window.addEventListener("focus", handleFocus);

    // Listen for visibility changes (tab becomes visible)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkAuthStatus();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Listen for custom auth events (login/logout from same tab)
    const handleAuthChange = () => {
      checkAuthStatus();
    };
    window.addEventListener("auth-changed", handleAuthChange);

    // Check auth when route changes (e.g., after login redirect)
    const handleRouteChange = () => {
      setTimeout(() => {
        checkAuthStatus();
      }, 100);
    };
    window.addEventListener("popstate", handleRouteChange);

    // Check URL params for login success indicators
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("_t") || urlParams.has("logged_in")) {
      // Likely redirected from OAuth - check auth after a delay
      setTimeout(() => {
        checkAuthStatus();
      }, 300);
    }

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("auth-changed", handleAuthChange);
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, []);

  // Also check auth status periodically (every 30 seconds) to catch expired tokens
  useEffect(() => {
    if (!session) return; // Only check if user is logged in
    
    const interval = setInterval(() => {
      checkAuthStatus();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [session]);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("/api/auth/session", {
        method: "GET",
        credentials: "include", // Include cookies
        cache: "no-store", // Don't cache auth checks
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
        },
      });

      if (!response.ok) {
        // Network error or server error - treat as not logged in
        if (response.status === 401 || response.status === 403) {
          // Explicitly unauthorized - definitely not logged in
          setSession(null);
          setLoading(false);
          return;
        }
        throw new Error("Failed to check authentication");
      }

      const data = await response.json();
      
      // Handle expired or invalid session
      if (!data.session) {
        setSession(null);
        setLoading(false);
        return;
      }

      // Validate session data structure
      if (data.session && typeof data.session === "object" && data.session.userId) {
        // Valid session
        setSession(data.session);
      } else {
        // Invalid session format - treat as logged out
        setSession(null);
      }
    } catch (err) {
      // Network failure or other error - treat as not logged in
      console.error("Auth check failed:", err);
      setError(null); // Don't show error to user, just treat as logged out
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { 
        method: "POST",
        credentials: "include",
      });
      setSession(null);
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Logout failed:", err);
      // Still clear local state even if request fails
      setSession(null);
    }
  };

  const getUserInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return "U";
  };

  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 flex flex-col items-center justify-center text-center">
        <div className="max-w-3xl space-y-6">
          <h1 className="text-6xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            AI Sports Betting
          </h1>
          <p className="text-2xl text-muted-foreground">
            Smart, Predictive, Real-time.
          </p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get AI-powered predictions, live sports scores, and weather insights to make smarter betting decisions. 
            Our advanced algorithms analyze data in real-time to give you the edge.
          </p>
          
          {/* Auth Status Based Buttons */}
          <div className="flex gap-4 justify-center pt-4">
            {loading ? (
              // Loading state - don't show buttons while checking
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Checking authentication...</span>
              </div>
            ) : session ? (
              // Logged in - show dashboard and profile
              <div className="flex gap-4 items-center">
                <Button asChild size="lg">
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="lg" className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={session.avatarUrl || ""} alt={session.name || session.email || "User"} />
                        <AvatarFallback className="text-xs">
                          {getUserInitials(session.name, session.email)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{session.name || "Profile"}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={session.avatarUrl || ""} alt={session.name || session.email || "User"} />
                          <AvatarFallback>{getUserInitials(session.name, session.email)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {session.name || "User"}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {session.email}
                          </p>
                          {session.isSubscribed ? (
                            <span className="text-xs text-green-600 font-medium">Premium Active</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">Free Tier</span>
                          )}
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile">Profile Settings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              // Not logged in - show login buttons
              <>
                <Link href="/login">
                  <Button size="lg">Get Started</Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline">Login</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">What We Offer</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <TrendingUp className="h-10 w-10 text-primary mb-4" />
              <CardTitle>AI Predictions</CardTitle>
              <CardDescription>
                Get AI-powered betting predictions with win probability scores and confidence ratings. 
                Our machine learning models analyze thousands of data points including team performance, 
                player stats, and historical trends to provide accurate predictions.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Activity className="h-10 w-10 text-primary mb-4" />
              <CardTitle>Live ESPN Scores</CardTitle>
              <CardDescription>
                Stay updated with real-time scores from NBA, NFL, and Soccer leagues. 
                Track your favorite teams and matches with live updates, game status, 
                and venue information all in one place.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Cloud className="h-10 w-10 text-primary mb-4" />
              <CardTitle>Weather Insights</CardTitle>
              <CardDescription>
                Weather conditions can significantly impact outdoor sports. Get real-time 
                weather data including temperature, humidity, wind speed, and conditions 
                to factor into your betting decisions.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Detailed Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-6 w-6 text-primary" />
                AI Predictions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Our AI prediction system provides:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Win probability percentages for each match</li>
                <li>Confidence scores based on data analysis</li>
                <li>Live odds from multiple bookmakers</li>
                <li>Historical performance tracking</li>
                <li>Premium predictions for subscribers</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-6 w-6 text-primary" />
                ESPN Live Scores
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Access live scores from:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li><strong>NBA</strong> - All current games and scores</li>
                <li><strong>NFL</strong> - Live football scores and updates</li>
                <li><strong>Soccer</strong> - Premier League, MLS, La Liga, Serie A, and more</li>
                <li>Real-time game status and venue information</li>
                <li>Up-to-date team statistics</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="h-6 w-6 text-primary" />
                Weather Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Weather conditions play a crucial role in outdoor sports. Our weather integration provides:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Current temperature and &quot;feels like&quot; temperature</li>
                <li>Humidity and wind speed measurements</li>
                <li>Weather conditions (sunny, cloudy, rainy, etc.)</li>
                <li>Real-time updates for accurate decision-making</li>
                <li>Location-based weather data</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">
              {session ? "Welcome Back!" : "Ready to Get Started?"}
            </CardTitle>
            <CardDescription className="text-lg">
              {session 
                ? "Access your dashboard to view AI predictions, live scores, and weather insights"
                : "Sign in with Whop to access AI predictions, live scores, and weather insights"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            {loading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : session ? (
              <Button asChild size="lg">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <Link href="/login">
                <Button size="lg">Sign In with Whop</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
