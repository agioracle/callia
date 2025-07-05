"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Footer from "@/components/Footer";
import PricingPlans, { plansData } from "@/components/PricingPlans";
import { useAuth } from "@/contexts/AuthContext";
import { getUserProfile } from "@/lib/auth";
import { useState, useEffect } from "react";

interface UserProfile {
  user_id: string;
  email: string;
  enable_email_delivery: boolean;
  brief_language: string;
  join_date: string;
  pricing_plan: string;
}

export default function BillingPage() {
  const { user, loading: authLoading } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile when user is available
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) {
        setProfileLoading(false);
        return;
      }

      try {
        setProfileLoading(true);
        const { data, error } = await getUserProfile(user.id);

        if (error) {
          setError(error.message);
          console.error('Error fetching user profile:', error);
        } else {
          setUserProfile(data);
        }
      } catch (err) {
        setError('Failed to fetch user profile');
        console.error('Error fetching user profile:', err);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  // Map database pricing_plan to actual plan names
  const getPlanName = (pricingPlan: string) => {
    const planMapping: { [key: string]: string } = {
      'Free': '7-day Free Trial',
      'Pro': 'Pro',
      'Max': 'Max'
    };
    return planMapping[pricingPlan] || '7-day Free Trial';
  };

  // Find current plan based on user's pricing_plan from database
  const currentPlan = userProfile?.pricing_plan
    ? plansData.find(p => p.name === getPlanName(userProfile.pricing_plan))
    : plansData.find(p => p.name === "7-day Free Trial"); // fallback

  const isLoading = authLoading || profileLoading;

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
                  {isLoading ? (
                    <div className="space-y-3">
                      <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ) : error ? (
                    <div className="text-red-500">
                      Error loading plan information: {error}
                    </div>
                  ) : currentPlan ? (
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
                  ) : (
                    <div className="text-muted-foreground">
                      No plan information available
                    </div>
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
