import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export interface Plan {
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  quantity: number;
  productId: string;
  monthlyPriceId: string;
  annualPriceId: string;
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
    quantity: 1,
    productId: "",
    monthlyPriceId: "",
    annualPriceId: "",
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
    monthlyPrice: 0,
    annualPrice: 0,
    quantity: 1,
    productId: "pro_01k0gb6n288kvzw0xegt72j2jw",
    monthlyPriceId: "pri_01k0gbjv037hw7ffykj79qb1g6",
    annualPriceId: "pri_01k0gbr6rfsavbyz4kq655hevp",
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
    monthlyPrice: 0,
    annualPrice: 0,
    quantity: 1,
    productId: "pro_01k0gcfa1wwg29qhvbvxpsb5ne",
    monthlyPriceId: "pri_01k0gcx1353r0hda9jd888nae4",
    annualPriceId: "pri_01k0gd22t9sxt8gc707szae0c1",
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

// Declare Paddle type for TypeScript
declare global {
  interface Window {
    Paddle: {
      PricePreview: (options: { items: { priceId: string; quantity: number }[] }) => Promise<PaddlePrice>;
      Status: {
        libraryVersion: string;
      };
    };
  }
}

interface PaddlePrice {
  data: {
    details?: {
      lineItems?: Array<{
        formattedTotals?: {
          total?: string;
        };
      }>;
      totals?: {
        total?: string;
      };
    };
    price?: {
      formatted: string;
      value: string;
    };
  };
}

export default function PricingPlans({
  showTitle = true,
  title = "Choose Your Plan",
  subtitle = "Start free and upgrade as your news consumption grows",
  className = "",
  showBillingToggle = true,
}: PricingPlansProps) {
  const router = useRouter();
  const [isAnnual, setIsAnnual] = useState(false);
  const [paddlePrices, setPaddlePrices] = useState<Record<string, {
    monthlyPrice: number;
    annualPrice: number;
    monthlyFormatted: string;
    annualFormatted: string;
  }>>({});
  const [pricesLoading, setPricesLoading] = useState(true);

  useEffect(() => {
                const waitForPaddle = () => {
      return new Promise<void>((resolve) => {
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds max wait

        const checkPaddle = () => {
          attempts++;

          if (typeof window !== 'undefined' &&
              window.Paddle &&
              window.Paddle.Status) {
            resolve();
          } else if (attempts >= maxAttempts) {
            console.error('Paddle failed to initialize after 5 seconds');
            resolve(); // Resolve anyway to avoid hanging
          } else {
            setTimeout(checkPaddle, 100);
          }
        };
        checkPaddle();
      });
    };

    const fetchPaddlePrices = async () => {
      try {
        // Wait for Paddle to be fully initialized
        await waitForPaddle();

                const plansWithPriceIds = plansData.filter(plan => plan.monthlyPriceId && plan.annualPriceId);

        const pricePromises = plansWithPriceIds
          .map(async (plan) => {
            try {
               const [monthlyResult, annualResult] = await Promise.all([
                 window.Paddle.PricePreview({
                   items: [{ priceId: plan.monthlyPriceId, quantity: 1 }]
                 }),
                 window.Paddle.PricePreview({
                   items: [{ priceId: plan.annualPriceId, quantity: 1 }]
                 })
               ]);

                                             // Extract price from response using correct property names
               const getFormattedPrice = (result: PaddlePrice) => {
                 // Try the correct camelCase property name
                 if (result?.data?.details?.lineItems?.[0]?.formattedTotals?.total) {
                   return result.data.details.lineItems[0].formattedTotals.total;
                 }

                 // Fallback to other possible formats
                 if (result?.data?.details?.totals?.total) {
                   return result.data.details.totals.total;
                 }

                 return null;
               };

               const monthlyPrice = getFormattedPrice(monthlyResult as PaddlePrice);
               const annualPrice = getFormattedPrice(annualResult as PaddlePrice);

               if (!monthlyPrice || !annualPrice) {
                 console.warn(`Could not extract prices for ${plan.name}`);
                 return null;
               }

               // Extract numeric values for calculations
               const extractPrice = (priceString: string): number => {
                 const match = priceString.match(/[\d,]+\.?\d*/);
                 return match ? parseFloat(match[0].replace(/,/g, '')) : 0;
               };

               return {
                 planName: plan.name,
                 monthlyPrice: extractPrice(monthlyPrice),
                 annualPrice: extractPrice(annualPrice),
                 monthlyFormatted: monthlyPrice,
                 annualFormatted: annualPrice
               };
             } catch (error) {
               console.error(`Failed to fetch price for ${plan.name}:`, error);
               return null;
             }
          });

        const results = await Promise.all(pricePromises);
        const pricesMap = results
          .filter(result => result !== null)
          .reduce((acc, result) => {
            if (result) {
              acc[result.planName] = {
                monthlyPrice: result.monthlyPrice,
                annualPrice: result.annualPrice,
                monthlyFormatted: result.monthlyFormatted,
                annualFormatted: result.annualFormatted
              };
            }
            return acc;
          }, {} as Record<string, { monthlyPrice: number; annualPrice: number; monthlyFormatted: string; annualFormatted: string }>);

        setPaddlePrices(pricesMap);
      } catch (error) {
        console.error('Failed to fetch Paddle prices:', error);
      } finally {
        setPricesLoading(false);
      }
    };

    fetchPaddlePrices();
  }, []);

  const handleCTAClick = (plan: Plan, isAnnual: boolean) => {
    if (plan.cta === "Get Started") {
      router.push("/briefs");
    }
    if (plan.cta === "Choose Plan") {
      window.Paddle.Checkout.open({
        items: [{
          priceId: isAnnual ? plan.annualPriceId : plan.monthlyPriceId,
          quantity: plan.quantity,
        }],
      });
    }
  };

  const formatPrice = (plan: Plan) => {
    // Check if this is the free trial plan (no price IDs)
    if (!plan.monthlyPriceId && !plan.annualPriceId) {
      return "$0";
    }

    // Show loading state while fetching Paddle prices
    if (pricesLoading && plan.monthlyPriceId && plan.annualPriceId) {
      return <span className="text-3xl font-bold">Loading...</span>;
    }

    // Use Paddle prices if available, otherwise fallback to hardcoded prices
    const paddlePrice = paddlePrices[plan.name];
    let displayPrice: string;
    let period: string;

    if (paddlePrice) {
      displayPrice = isAnnual ? paddlePrice.annualFormatted : paddlePrice.monthlyFormatted;
      period = ""; // Paddle formatted prices already include currency and may include period
    } else {
      const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
      period = isAnnual ? "/year" : "/month";
      displayPrice = `$${price}${period}`;
    }

    if (isAnnual && plan.monthlyPriceId && paddlePrice) {
      return (
        <div className="flex flex-col items-center">
          <span className="text-3xl font-bold">{displayPrice}</span>
          <span className="text-sm text-muted-foreground line-through">
             ${(paddlePrice.monthlyPrice * 12).toFixed(2)}/year
          </span>
        </div>
      );
    }

    return <span className="text-3xl font-bold">{displayPrice}</span>;
  };

  const calculateSavings = (plan: Plan) => {
    // Only calculate savings for paid plans with price IDs
    if (!plan.monthlyPriceId || !plan.annualPriceId) return 0;

        // Use real Paddle prices if available
    const paddlePrice = paddlePrices[plan.name];
    if (paddlePrice) {
      const monthlyPrice = paddlePrice.monthlyPrice;
      const annualPrice = paddlePrice.annualPrice;

      if (monthlyPrice > 0 && annualPrice > 0) {
        const monthlyTotal = monthlyPrice * 12;
        const savings = monthlyTotal - annualPrice;
        const percentage = Math.round((savings / monthlyTotal) * 100);
        return percentage > 0 ? percentage : 0;
      }
    }

    // Fallback to hardcoded prices if Paddle prices not available
    const monthlyTotal = plan.monthlyPrice * 12;
    const savings = monthlyTotal - plan.annualPrice;
    const percentage = Math.round((savings / monthlyTotal) * 100);
    return percentage > 0 ? percentage : 0;
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
            {true && (
              <Badge variant="secondary" className="text-xs">
                Save up to 16%
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
              {isAnnual && plan.monthlyPriceId && calculateSavings(plan) > 0 && (
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
                onClick={() => handleCTAClick(plan, isAnnual)}
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
