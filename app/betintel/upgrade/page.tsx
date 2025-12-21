"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Check, ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";

const WHOP_CHECKOUT_URL = process.env.NEXT_PUBLIC_WHOP_CHECKOUT_URL || "https://whop.com";

interface Plan {
  type: string;
  name: string;
  queries: number;
  price: number;
  features: string[];
  popular?: boolean;
  whopUrl?: string;
}

const plans: Plan[] = [
  {
    type: "starter",
    name: "Starter",
    queries: 50,
    price: 29,
    features: ["50 queries/month", "Pre-game analysis only"],
  },
  {
    type: "sharp",
    name: "Sharp",
    queries: 200,
    price: 99,
    features: [
      "200 queries/month",
      "Full game & market analysis",
      "Slate filtering",
      "Light live intel",
    ],
    popular: true,
  },
  {
    type: "pro",
    name: "Pro",
    queries: 750,
    price: 179,
    features: [
      "750 queries/month",
      "Live game analysis",
      "Market movement insights",
      "Priority processing",
    ],
  },
];

export default function UpgradePage() {
  const router = useRouter();
  const [currentPlan, setCurrentPlan] = useState<string>("free");

  useEffect(() => {
    // Fetch current plan
    fetch("/api/betintel/usage")
      .then((res) => res.json())
      .then((data) => {
        if (data.plan) {
          setCurrentPlan(data.plan.type);
        }
      })
      .catch(console.error);
  }, []);

  const handleUpgrade = (plan: Plan) => {
    // Redirect to Whop checkout
    window.open(WHOP_CHECKOUT_URL, "_blank");
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/betintel">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to BetIntel
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-primary/10">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Upgrade Your Plan</h1>
              <p className="text-muted-foreground">Get more AI-powered game intelligence</p>
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan) => (
            <Card 
              key={plan.type}
              className={`relative ${
                plan.popular 
                  ? "border-primary shadow-lg scale-105" 
                  : "border-muted"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary">Most Popular</Badge>
                </div>
              )}
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>
                  {plan.queries} Queries / Month
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground"> / month</span>
                </div>
                
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  disabled={currentPlan === plan.type}
                  onClick={() => handleUpgrade(plan)}
                >
                  {currentPlan === plan.type ? "Current Plan" : "Upgrade"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Line */}
        <div className="text-center mb-12">
          <p className="text-muted-foreground text-sm flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4" />
            No picks. No guarantees. Just intelligence.
            <Sparkles className="h-4 w-4" />
          </p>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <Card>
              <CardContent className="py-4">
                <h3 className="font-medium mb-2">What counts as a query?</h3>
                <p className="text-sm text-muted-foreground">
                  A new game, matchup, slate scan, or comparison counts as 1 query. 
                  Follow-up questions about the same game are free.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4">
                <h3 className="font-medium mb-2">When do queries reset?</h3>
                <p className="text-sm text-muted-foreground">
                  Queries reset on the 1st of each month at midnight UTC.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4">
                <h3 className="font-medium mb-2">Can I upgrade mid-month?</h3>
                <p className="text-sm text-muted-foreground">
                  Yes! Your new query limit takes effect immediately. 
                  Unused queries don&apos;t roll over.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4">
                <h3 className="font-medium mb-2">Can I cancel anytime?</h3>
                <p className="text-sm text-muted-foreground">
                  Yes, you can cancel your subscription anytime. 
                  You&apos;ll keep access until the end of your billing period.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}

