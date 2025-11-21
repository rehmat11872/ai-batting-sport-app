"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function LoginContent() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      const errorMessages: Record<string, string> = {
        missing_code: "Authorization code is missing. Please try again.",
        missing_state: "State parameter is missing. Please try again.",
        invalid_state: "Invalid state parameter. Please try again.",
        code_exchange_failed: "Failed to exchange authorization code. Please try again.",
        user_fetch_failed: "Failed to fetch user information. Please try again.",
        user_save_failed: "Failed to save user data. Please contact support.",
        missing_config: "OAuth configuration is missing. Please contact support.",
      };
      setError(errorMessages[errorParam] || "An error occurred during login. Please try again.");
    }
  }, [searchParams]);

  return (
    <main className="flex min-h-[calc(100vh-56px)] items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl">Sign in with Whop</CardTitle>
          <CardDescription>
            Connect your Whop account to access AI-powered predictions, live scores, and weather insights.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button asChild size="lg" className="w-full">
            <a href={`/api/oauth/init?redirect=${encodeURIComponent(redirectTo)}`}>Continue with Whop</a>
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            By continuing, you agree to our terms of service and privacy policy.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="flex min-h-[calc(100vh-56px)] items-center justify-center px-4 py-16">
        <Card className="w-full max-w-md">
          <CardContent className="py-8 text-center">Loading...</CardContent>
        </Card>
      </main>
    }>
      <LoginContent />
    </Suspense>
  );
}
