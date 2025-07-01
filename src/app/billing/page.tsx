"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Footer from "@/components/Footer";
import PricingPlans, { plansData } from "@/components/PricingPlans";

export default function BillingPage() {
  // Find current plan (Free Trial is the current plan)
  const currentPlan = plansData.find(p => p.name === "Free Trial");

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

        <div className="grid grid-cols-1 gap-8">
          {/* Current Plan */}
          <div>
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
          <div>
            <Card className="bg-muted/30">
                <CardHeader>
                  <CardTitle>Available Plans</CardTitle>
                  <CardDescription>Choose a plan that fits your needs.</CardDescription>
                </CardHeader>
                <CardContent>
                  <PricingPlans
                    showTitle={false}
                    className="space-y-4"
                  />
                </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
