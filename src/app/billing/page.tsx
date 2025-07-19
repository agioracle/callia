"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Footer from "@/components/Footer";
import PricingPlans from "@/components/PricingPlans";

export default function BillingPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="font-newsreader text-3xl md:text-4xl font-bold mb-2">
            Pricing & Plans
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Choose the plan that best fits your news consumption needs. Get started with our free trial or upgrade for more features.
          </p>
        </div>

        {/* Pricing Plans */}
        <div className="space-y-8">
          <Card className="bg-muted/30">
            <CardHeader className="text-center">
              <CardTitle>Choose Your Plan</CardTitle>
              <CardDescription>
                All plans include daily brief summaries and access to community sources.
                Upgrade anytime to get more sources and features.
              </CardDescription>
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
      <Footer />
    </div>
  );
}
