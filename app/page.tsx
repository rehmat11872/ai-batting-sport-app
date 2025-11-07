import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Zap, Shield, BarChart3 } from "lucide-react";

export default function Home() {
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
            Get AI-powered predictions to make smarter betting decisions. Our
            advanced algorithms analyze data in real-time to give you the edge.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Link href="/auth/register">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline">View Dashboard</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us?</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <TrendingUp className="h-10 w-10 text-primary mb-4" />
              <CardTitle>AI Predictions</CardTitle>
              <CardDescription>
                Advanced machine learning models analyze thousands of data points
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Zap className="h-10 w-10 text-primary mb-4" />
              <CardTitle>Real-Time Odds</CardTitle>
              <CardDescription>
                Live match tracking with up-to-the-minute odds updates
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-primary mb-4" />
              <CardTitle>Secure Wallet</CardTitle>
              <CardDescription>
                Safe and secure payment system with instant deposits and withdrawals
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <BarChart3 className="h-10 w-10 text-primary mb-4" />
              <CardTitle>Analytics</CardTitle>
              <CardDescription>
                Track your betting history and performance with detailed analytics
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Ready to Start?</CardTitle>
            <CardDescription className="text-lg">
              Join thousands of users making smarter betting decisions
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Link href="/auth/register">
              <Button size="lg">Create Free Account</Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
