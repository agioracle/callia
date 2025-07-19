import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export interface Plan {
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  description: string;
  features: string[];
  cta: string;
  isPopular?: boolean;
  variant?: "outline" | "default";
}

export const plansData: Plan[] = [
  {
    name: "7-day Free Trial",
    monthlyPrice: 0,
    annualPrice: 0,
    description: "Perfect for getting started",
    features: [
      "Subscribe to up to 5 news sources",
      "Daily text briefings",
      "7-day free trial",
    ],
    cta: "Get Started",
    isPopular: false,
    variant: "outline",
  },
  {
    name: "Pro",
    monthlyPrice: 8,
    annualPrice: 80,
    description: "For serious news consumers",
    features: [
      "Subscribe to up to 30 news sources",
      "Daily text briefings",
      "15-day history briefings",
    ],
    cta: "Choose Plan",
    isPopular: false,
    variant: "outline",
  },
  {
    name: "Max",
    monthlyPrice: 12,
    annualPrice: 120,
    description: "For power users and professionals",
    features: [
      "Everything in Pro",
      "Extra 20 news sources (total up to 50)",
      "Audio format briefings",
      "Email delivery"
    ],
    cta: "Choose Plan",
    isPopular: true,
    variant: "default",
  },
];

interface PricingPlansProps {
  showTitle?: boolean;
  title?: string;
  subtitle?: string;
  className?: string;
  showBillingToggle?: boolean;
}

export default function PricingPlans({
  showTitle = true,
  title = "Choose Your Plan",
  subtitle = "Start free and upgrade as your news consumption grows",
  className = "",
  showBillingToggle = true,
}: PricingPlansProps) {
  const router = useRouter();
  const [isAnnual, setIsAnnual] = useState(true);

  const handleCTAClick = (cta: string) => {
    if (cta === "Get Started") {
      router.push("/briefs");
    }
  };

  const formatPrice = (plan: Plan) => {
    if (plan.monthlyPrice === 0) return "$0";

    const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
    const period = isAnnual ? "/year" : "/month";

    if (isAnnual && plan.monthlyPrice > 0) {
      return (
        <div className="flex flex-col items-center">
          <span className="text-3xl font-bold">${price}{period}</span>
          <span className="text-sm text-muted-foreground line-through">
            ${(plan.monthlyPrice * 12).toFixed(2)}/year
          </span>
        </div>
      );
    }

    return <span className="text-3xl font-bold">${price}{period}</span>;
  };

  const calculateSavings = (plan: Plan) => {
    if (plan.monthlyPrice === 0) return 0;
    const monthlyTotal = plan.monthlyPrice * 12;
    const savings = monthlyTotal - plan.annualPrice;
    const percentage = Math.round((savings / monthlyTotal) * 100);
    return percentage;
  };

  return (
    <div className={className}>
      {showTitle && (
        <div className="text-center mb-8">
          <h2 className="font-newsreader text-3xl md:text-4xl font-bold mb-4">
            {title}
          </h2>
          <p className="text-lg text-muted-foreground">
            {subtitle}
          </p>
        </div>
      )}

      {/* Billing Period Toggle - separate from title */}
      {showBillingToggle && (
        <div className="flex items-center justify-center gap-4 mb-8">
          <span className={`text-sm font-medium ${!isAnnual ? 'text-primary' : 'text-muted-foreground'}`}>
            Monthly
          </span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
              isAnnual ? 'bg-primary' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isAnnual ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${isAnnual ? 'text-primary' : 'text-muted-foreground'}`}>
              Annually
            </span>
            {isAnnual && (
              <Badge variant="secondary" className="text-xs">
                Save up to 17%
              </Badge>
            )}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        {plansData.map((plan) => (
          <Card
            key={plan.name}
            className={`relative ${
              plan.isPopular
                ? "border-2 border-primary shadow-lg"
                : "border-0 shadow-sm"
            }`}
          >
            <CardHeader className="text-center">
              {plan.isPopular && (
                <Badge className="w-fit mx-auto mb-2">Most Popular</Badge>
              )}
              {isAnnual && plan.monthlyPrice > 0 && calculateSavings(plan) > 0 && (
                <Badge variant="secondary" className="w-fit mx-auto mb-2">
                  Save {calculateSavings(plan)}%
                </Badge>
              )}
              <CardTitle className="text-lg">{plan.name}</CardTitle>
              <div className="my-4">
                {formatPrice(plan)}
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className={`text-sm ${
                      feature.includes("Extra 20 news sources") || feature.includes("Audio format briefings") || feature.includes("Email delivery")
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
                onClick={() => handleCTAClick(plan.cta)}
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
