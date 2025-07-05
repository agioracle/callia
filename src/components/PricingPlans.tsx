import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";

export interface Plan {
  name: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
  isPopular?: boolean;
  variant?: "outline" | "default";
}

export const plansData: Plan[] = [
  {
    name: "7-day Free Trial",
    price: "$0",
    description: "Perfect for getting started",
    features: [
      "Up to 5 news sources",
      "Daily text briefings",
      "7-day free trial",
    ],
    cta: "Get Started",
    isPopular: false,
    variant: "outline",
  },
  {
    name: "Pro",
    price: "$7.99",
    description: "For serious news consumers",
    features: [
      "Subscribe to up to 30 news sources",
      "Daily text briefings",
      "7-day history briefings",
    ],
    cta: "Choose Plan",
    isPopular: true,
    variant: "default",
  },
  {
    name: "Max",
    price: "$9.99",
    description: "For serious news consumers",
    features: [
      "Everything in Pro",
      "Audio format briefings",
      "Email delivery",
      "15-day history briefings",
      "Priority support",
    ],
    cta: "Coming Soon",
    isPopular: false,
    variant: "outline",
  },
];

interface PricingPlansProps {
  showTitle?: boolean;
  title?: string;
  subtitle?: string;
  className?: string;
}

export default function PricingPlans({
  showTitle = true,
  title = "Choose Your Plan",
  subtitle = "Start free and upgrade as your news consumption grows",
  className = "",
}: PricingPlansProps) {
  return (
    <div className={className}>
      {showTitle && (
        <div className="text-center mb-16">
          <h2 className="font-newsreader text-3xl md:text-4xl font-bold mb-4">
            {title}
          </h2>
          <p className="text-lg text-muted-foreground">
            {subtitle}
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        {plansData.map((plan) => (
          <Card
            key={plan.name}
            className={`${
              plan.isPopular
                ? "border-2 border-primary shadow-lg"
                : "border-0 shadow-sm"
            }`}
          >
            <CardHeader className="text-center">
              {plan.isPopular && (
                <Badge className="w-fit mx-auto mb-2">Most Popular</Badge>
              )}
              <CardTitle className="text-lg">{plan.name}</CardTitle>
              <div className="text-3xl font-bold">{plan.price}</div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className={`text-sm ${
                      feature.includes("Audio format briefings") || feature.includes("Email delivery")
                        ? "font-bold text-primary"
                        : ""
                    }`}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
              <Button
                className="w-full"
                variant={plan.variant}
              >
                {plan.cta}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
