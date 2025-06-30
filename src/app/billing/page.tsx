"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const plans = [
  {
    name: "Free",
    price: "$0",
    priceDescription: "per month",
    features: [
      "5 news sources",
      "Daily morning brief",
      "Community access",
    ],
    cta: "Your Current Plan",
    isCurrent: true,
  },
  {
    name: "Pro",
    price: "$15",
    priceDescription: "per month",
    features: [
      "Unlimited news sources",
      "AI-powered summaries",
      "Audio briefings",
      "Priority support",
    ],
    cta: "Upgrade to Pro",
    isCurrent: false,
    isPopular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    priceDescription: "for your team",
    features: [
      "Everything in Pro",
      "Team management",
      "Advanced analytics",
      "Dedicated account manager",
    ],
    cta: "Contact Sales",
    isCurrent: false,
  },
];

export default function BillingPage() {
  const currentPlan = plans.find(p => p.isCurrent);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <h1 className="font-newsreader text-3xl md:text-4xl font-bold mb-2">
            Billing & Subscription
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage your subscription plan and payment details.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Current Plan */}
          <div className="md:col-span-1">
             <Card>
                <CardHeader>
                  <CardTitle>Current Plan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentPlan && (
                    <>
                      <div className="space-y-1">
                        <p className="text-2xl font-bold">{currentPlan.name}</p>
                        <p className="text-muted-foreground">{currentPlan.price}/month</p>
                      </div>
                      <Separator/>
                       <ul className="space-y-2 text-sm text-muted-foreground">
                        {currentPlan.features.map(feature => (
                          <li key={feature} className="flex items-center">
                            <Check className="h-4 w-4 mr-2 text-primary"/>
                            {feature}
                          </li>
                        ))}
                      </ul>
                       <Button variant="outline" className="w-full">Cancel Subscription</Button>
                       <p className="text-xs text-muted-foreground text-center">
                         Payments are securely processed by Stripe.
                       </p>
                    </>
                  )}
                </CardContent>
              </Card>
          </div>

          {/* Plan Options */}
          <div className="md:col-span-2">
            <Card className="bg-muted/30">
                <CardHeader>
                  <CardTitle>Available Plans</CardTitle>
                  <CardDescription>Choose a plan that fits your needs.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {plans.filter(p => !p.isCurrent).map(plan => (
                     <Card key={plan.name} className="relative">
                       {plan.isPopular && <Badge className="absolute -top-3 left-4">Popular</Badge>}
                       <CardHeader>
                          <div className="flex justify-between items-center">
                            <p className="text-xl font-bold">{plan.name}</p>
                            <Button>{plan.cta}</Button>
                          </div>
                          <div className="flex items-baseline space-x-1">
                            <p className="text-3xl font-bold">{plan.price}</p>
                            <p className="text-sm text-muted-foreground">{plan.priceDescription}</p>
                          </div>
                       </CardHeader>
                       <CardContent>
                         <ul className="space-y-2 text-sm text-muted-foreground">
                          {plan.features.map(feature => (
                            <li key={feature} className="flex items-center">
                              <Check className="h-4 w-4 mr-2 text-primary"/>
                              {feature}
                            </li>
                          ))}
                        </ul>
                       </CardContent>
                     </Card>
                  ))}
                </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
