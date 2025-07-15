"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Footer from "@/components/Footer";
import PricingPlans, { plansData } from "@/components/PricingPlans";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect, useRef } from "react";

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

    // Performance optimization states
  const [isPageVisible, setIsPageVisible] = useState<boolean>(true);
  const [dataLoaded, setDataLoaded] = useState<boolean>(false);
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

  // Use useRef to track cache time to avoid triggering re-renders
  const lastFetchTimeRef = useRef<number>(0);

    // Page visibility detection for performance optimization
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPageVisible(document.visibilityState === 'visible');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

    // Optimized fetch user profile with caching
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) {
        setProfileLoading(false);
        return;
      }

      const now = Date.now();
      const hasData = userProfile !== null;
      const shouldSkipFetch = hasData &&
                             now - lastFetchTimeRef.current < CACHE_DURATION;

      // Skip fetching if we have cached data and it's still fresh
      if (shouldSkipFetch) {
        console.log('Using cached user profile data');
        setDataLoaded(true);
        return;
      }

      // API helper functions inside useEffect to avoid dependency issues
      const getAuthToken = async () => {
        const { supabase } = await import('@/lib/supabase');
        const { data: { session } } = await supabase.auth.getSession();
        return session?.access_token;
      };

      const fetchUserProfileFromAPI = async () => {
        const token = await getAuthToken();
        if (!token) throw new Error('No authentication token available');

        const response = await fetch('/api/profile/user', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch user profile');
        return response.json();
      };

      try {
        setProfileLoading(true);
        setError(null);
        const data = await fetchUserProfileFromAPI();
        setUserProfile(data);
        lastFetchTimeRef.current = now;
        setDataLoaded(true);

        console.log('Fetched fresh user profile data');
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to fetch user profile');
        }
        console.error('Error fetching user profile:', err);
      } finally {
        setProfileLoading(false);
      }
    };

    // Only load if page is visible and we haven't loaded data yet, or if we need to refresh
    if (user && (isPageVisible || !dataLoaded)) {
      fetchUserProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isPageVisible]); // Intentionally excluding other deps to prevent infinite loops

  // Manual refresh function
  // const handleManualRefresh = async () => {
  //   if (!user) return;

  //   try {
  //     setProfileLoading(true);
  //     setError(null);

  //     // API helper functions for manual refresh
  //     const getAuthToken = async () => {
  //       const { supabase } = await import('@/lib/supabase');
  //       const { data: { session } } = await supabase.auth.getSession();
  //       return session?.access_token;
  //     };

  //     const fetchUserProfileFromAPI = async () => {
  //       const token = await getAuthToken();
  //       if (!token) throw new Error('No authentication token available');

  //       const response = await fetch('/api/profile/user', {
  //         headers: { 'Authorization': `Bearer ${token}` }
  //       });
  //       if (!response.ok) throw new Error('Failed to fetch user profile');
  //       return response.json();
  //     };

  //     const data = await fetchUserProfileFromAPI();
  //     setUserProfile(data);
  //     lastFetchTimeRef.current = Date.now();

  //     console.log('Manual refresh completed');
  //   } catch (err) {
  //     console.error('Error during manual refresh:', err);
  //     if (err instanceof Error) {
  //       setError(err.message);
  //     } else {
  //       setError('Failed to refresh user profile');
  //     }
  //   } finally {
  //     setProfileLoading(false);
  //   }
  // };

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
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-newsreader text-3xl md:text-4xl font-bold mb-2">
                Billing & Subscription
              </h1>
              <p className="text-muted-foreground text-lg">
                Manage your subscription plan and payment details.
              </p>
              {/* Cache status indicator */}
              {/* {user && lastUpdateTime > 0 && (
                <div className="mt-2 text-sm text-muted-foreground">
                  Data last updated: {new Date(lastUpdateTime).toLocaleTimeString()}
                  {Date.now() - lastUpdateTime < CACHE_DURATION && (
                    <span className="ml-2 text-green-600">(Using cached data)</span>
                  )}
                </div>
              )} */}
            </div>
            {/* <Button
              variant="outline"
              onClick={handleManualRefresh}
              disabled={isLoading || !user}
              className="flex items-center"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button> */}
          </div>
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
