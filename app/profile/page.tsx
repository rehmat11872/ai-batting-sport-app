import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Crown, Check, X } from "lucide-react";

const WHOP_CHECKOUT_URL = process.env.WHOP_CHECKOUT_URL ?? "https://whop.com";

export default async function ProfilePage() {
  const session = await getSession();

  if (!session) {
    redirect("/login?redirect=/profile");
  }

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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>

      {/* Profile Info Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Your account details and subscription status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={session.avatarUrl || ""} alt={session.name || session.email || "User"} />
              <AvatarFallback className="text-2xl">
                {getUserInitials(session.name, session.email)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold mb-2">{session.name || "User"}</h2>
              <p className="text-muted-foreground mb-4">{session.email || "No email"}</p>
              <Badge variant={session.isSubscribed ? "default" : "secondary"} className="text-sm">
                {session.isSubscribed ? (
                  <>
                    <Crown className="h-3 w-3 mr-1" />
                    Premium Active
                  </>
                ) : (
                  "Free Tier"
                )}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Subscription Plan
          </CardTitle>
          <CardDescription>Manage your subscription and access</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {session.isSubscribed ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-900 dark:text-green-100">Premium Active</p>
                    <p className="text-sm text-green-700 dark:text-green-300">You have full access to all features</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Premium Features:</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    Unlimited AI Predictions
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    All NBA, NFL, and Soccer games
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    Weather insights
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    Advanced analytics
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg border">
                <div>
                  <p className="font-semibold">Free Tier</p>
                  <p className="text-sm text-muted-foreground">Limited access to features</p>
                </div>
                <Badge variant="secondary">Free</Badge>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Current Access:</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    2-3 predictions per section
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    Limited game scores
                  </li>
                  <li className="flex items-center gap-2">
                    <X className="h-4 w-4 text-red-600" />
                    Premium predictions locked
                  </li>
                  <li className="flex items-center gap-2">
                    <X className="h-4 w-4 text-red-600" />
                    Advanced features unavailable
                  </li>
                </ul>
              </div>
              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-3">Upgrade to Premium:</h3>
                <ul className="space-y-2 text-sm mb-4">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <strong>Unlimited</strong> AI predictions
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <strong>All</strong> NBA, NFL, and Soccer games
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <strong>Full</strong> weather insights
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <strong>Advanced</strong> analytics and tracking
                  </li>
                </ul>
                <Button asChild size="lg" className="w-full">
                  <Link href={WHOP_CHECKOUT_URL} target="_blank" rel="noreferrer">
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade to Premium on Whop
                  </Link>
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  After payment, your account will be upgraded automatically
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button asChild variant="outline" className="w-full justify-start">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

