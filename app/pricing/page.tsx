import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Pricing Plans</h1>
        <p className="text-xl text-muted-foreground">
          Choose the plan that works for you
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
        {/* Free Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Free Plan</CardTitle>
            <CardDescription>Perfect for getting started</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>5 predictions per day</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>Basic AI insights</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>Community support</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" variant="outline">
              Current Plan
            </Button>
          </CardFooter>
        </Card>

        {/* Premium Plan */}
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Premium Plan</CardTitle>
            <CardDescription>For serious bettors</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">$29</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>Unlimited predictions</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>Advanced AI insights</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>Real-time updates</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>Priority support</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>Custom analytics</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Upgrade with Stripe</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

