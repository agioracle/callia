"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Footer from "@/components/Footer";
import { plansData } from "@/components/PricingPlans";
import {
  User,
  Globe,
  Trash2,
  Eye,
  EyeOff,
  Rss,
  Link as LinkIcon,
  Plus,
  Settings,
  Loader2,
  Check
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

import { useAuth } from "@/contexts/AuthContext";
import {
  detectRSSFeed,
  extractSiteInfo
} from "@/lib/auth";
import { Session } from '@supabase/supabase-js';

// Define types for the data structure
type NewsSource = {
  id: string;
  title: string;
  description: string;
  language: string;
  category: string;
  link: string;
  rss: string | null;
  tags: string;
  user_id: string;
  is_public: boolean;
  subscribers_num: number;
  status: string;
  latest_crawled_num: number;
  latest_crawled_at: string;
  created_at?: string;
};

type UserSubscription = {
  user_id: string;
  news_source_id: string;
  status: string;
  news_source: NewsSource;
};

interface UserProfile {
  user_id: string;
  email: string;
  enable_email_delivery: boolean;
  brief_language: string;
  join_date: string;
  pricing_plan: string;
}

type NewSourceForm = {
  url: string;
  link: string;
  rss: string;
  title: string;
  description: string;
  category: string;
  language: string;
  isPublic: boolean;
};

// Mock user data - this could also come from Supabase user metadata
const userData = {
  name: "John Doe",
  email: "john.doe@example.com",
  avatar: "/placeholder-avatar.jpg",
  joinDate: "2025-01-01",
  emailDelivery: true,
  language: "English",
};

const categories = [
  "Technology", "Business", "Science", "Politics", "Sports",
  "Health", "Entertainment", "Travel", "Finance", "Climate",
  "Games", "Arts", "Life", "General"
];

const languages = [
  { code: "English", name: "English" },
  { code: "Chinese", name: "Chinese" },
];

// API helper functions
const getAuthToken = async (getValidSession: () => Promise<Session | null>) => {
  const validSession = await getValidSession();
  return validSession?.access_token;
};

const fetchUserSubscriptions = async (getValidSession: () => Promise<Session | null>) => {
  const token = await getAuthToken(getValidSession);
  if (!token) throw new Error('No authentication token available');

  const response = await fetch('/api/profile/subscriptions', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to fetch subscriptions');
  return response.json();
};

const fetchManagedSources = async (getValidSession: () => Promise<Session | null>) => {
  const token = await getAuthToken(getValidSession);
  if (!token) throw new Error('No authentication token available');

  const response = await fetch('/api/profile/sources', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to fetch managed sources');
  return response.json();
};

const fetchUserProfile = async (getValidSession: () => Promise<Session | null>) => {
  const token = await getAuthToken(getValidSession);
  if (!token) throw new Error('No authentication token available');

  const response = await fetch('/api/profile/user', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to fetch user profile');
  return response.json();
};

const updateSubscription = async (newsSourceId: string, action: 'toggle' | 'remove', getValidSession: () => Promise<Session | null>) => {
  const token = await getAuthToken(getValidSession);
  if (!token) throw new Error('No authentication token available');

  const response = await fetch('/api/profile/subscriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ newsSourceId, action })
  });
  if (!response.ok) throw new Error('Failed to update subscription');
  return response.json();
};

interface SourceUpdates {
  status?: string;
  is_public?: boolean;
}

interface CreateSourceData {
  title: string;
  description: string;
  language: string;
  category: string;
  link: string;
  rss: string;
  is_public: boolean;
}

interface ProfileUpdates {
  enable_email_delivery?: boolean;
  brief_language?: string;
}

const updateManagedSource = async (sourceId: string, updates: SourceUpdates, getValidSession: () => Promise<Session | null>) => {
  const token = await getAuthToken(getValidSession);
  if (!token) throw new Error('No authentication token available');

  const response = await fetch('/api/profile/sources', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ action: 'update', sourceId, updates })
  });
  if (!response.ok) throw new Error('Failed to update source');
  return response.json();
};

const deleteManagedSource = async (sourceId: string, getValidSession: () => Promise<Session | null>) => {
  const token = await getAuthToken(getValidSession);
  if (!token) throw new Error('No authentication token available');

  const response = await fetch('/api/profile/sources', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ action: 'delete', sourceId })
  });
  if (!response.ok) throw new Error('Failed to delete source');
  return response.json();
};

const createManagedSource = async (newsSourceData: CreateSourceData, getValidSession: () => Promise<Session | null>) => {
  const token = await getAuthToken(getValidSession);
  if (!token) throw new Error('No authentication token available');

  const response = await fetch('/api/profile/sources', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ action: 'create', newsSourceData })
  });
  if (!response.ok) throw new Error('Failed to create source');
  return response.json();
};

const saveUserProfile = async (updates: ProfileUpdates, getValidSession: () => Promise<Session | null>) => {
  const token = await getAuthToken(getValidSession);
  if (!token) throw new Error('No authentication token available');

  const response = await fetch('/api/profile/user', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updates)
  });
  if (!response.ok) throw new Error('Failed to save profile');
  return response.json();
};

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [managedSources, setManagedSources] = useState<NewsSource[]>([]);
  const [loading, setLoading] = useState(false); // Change initial state to false
  const [error, setError] = useState<string | null>(null);
  const [showAddSource, setShowAddSource] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newSourceForm, setNewSourceForm] = useState<NewSourceForm>({
    url: "",
    link: "",
    rss: "",
    title: "",
    description: "",
    category: "General",
    language: "English",
    isPublic: true
  });
  const [preferences, setPreferences] = useState({
    emailDelivery: userData.emailDelivery,
    briefLanguage: userData.language
  });
  const [preferencesSaving, setPreferencesSaving] = useState(false);
  const [showLoadingTimeout, setShowLoadingTimeout] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { user, loading: authLoading, getValidSession } = useAuth();

    // Performance optimization states
  const [isPageVisible, setIsPageVisible] = useState<boolean>(true);
  const [dataLoaded, setDataLoaded] = useState<boolean>(false);
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

  // Use useRef to track cache time to avoid triggering re-renders
  const lastFetchTimeRef = useRef<number>(0);

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

  // Page visibility detection for performance optimization
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPageVisible(document.visibilityState === 'visible');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Show loading indicator only after a delay to avoid flashing
  useEffect(() => {
    if (loading || authLoading) {
      const timer = setTimeout(() => {
        setShowLoadingTimeout(true);
      }, 800); // Show loading indicator only if loading takes more than 800ms

      return () => clearTimeout(timer);
    } else {
      setShowLoadingTimeout(false);
    }
  }, [loading, authLoading]);

  // Optimized fetch user data with caching and better error handling
  useEffect(() => {
    const fetchData = async () => {
      // Wait for auth to complete first
      if (authLoading) {
        return;
      }

      if (!user?.id) {
        setLoading(false);
        setDataLoaded(true);
        return;
      }

      const now = Date.now();
      const hasData = subscriptions.length > 0 || managedSources.length > 0;
      const shouldSkipFetch = hasData &&
                             now - lastFetchTimeRef.current < CACHE_DURATION;

      // Skip fetching if we have cached data and it's still fresh
      if (shouldSkipFetch) {
        console.log('Using cached profile data');
        setDataLoaded(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch subscriptions, managed sources, and user profile in parallel
        const [subscriptionsData, managedSourcesData, profileData] = await Promise.all([
          fetchUserSubscriptions(getValidSession),
          fetchManagedSources(getValidSession),
          fetchUserProfile(getValidSession)
        ]);

        setSubscriptions(subscriptionsData || []);
        setManagedSources(managedSourcesData || []);
        setUserProfile(profileData);

        if (profileData) {
          setPreferences({
            emailDelivery: profileData.enable_email_delivery,
            briefLanguage: profileData.brief_language
          });
        }

        lastFetchTimeRef.current = now;
        setDataLoaded(true);

        console.log('Fetched fresh profile data');
      } catch (err) {
        setError('Failed to fetch data');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    // Only load if page is visible and we haven't loaded data yet, or if we need to refresh
    if (!authLoading && (isPageVisible || !dataLoaded)) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, authLoading, isPageVisible, getValidSession]); // Intentionally excluding other deps to prevent infinite loops

  // Manual refresh function
  // const handleManualRefresh = async () => {
  //   if (!user?.id) return;

  //   try {
  //     setLoading(true);
  //     setError(null);

  //     // Fetch subscriptions, managed sources, and user profile in parallel
  //     const [subscriptionsData, managedSourcesData, profileData] = await Promise.all([
  //       fetchUserSubscriptions(),
  //       fetchManagedSources(),
  //       fetchUserProfile()
  //     ]);

  //     setSubscriptions(subscriptionsData || []);
  //     setManagedSources(managedSourcesData || []);

  //     if (profileData) {
  //       setPreferences({
  //         emailDelivery: profileData.enable_email_delivery,
  //         briefLanguage: profileData.brief_language
  //       });
  //     }

  //     lastFetchTimeRef.current = Date.now();

  //     console.log('Manual refresh completed');
  //   } catch (err) {
  //     console.error('Error during manual refresh:', err);
  //     setError('Failed to refresh data');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleUrlChange = async (url: string) => {
    setNewSourceForm(prev => ({ ...prev, url }));

    if (url.trim() && url.startsWith('http')) {
      try {
        // Auto-extract site info
        const siteInfo = await extractSiteInfo(url);

        setNewSourceForm(prev => ({
          ...prev,
          title: siteInfo.title || prev.title,
          description: siteInfo.description || prev.description,
          category: siteInfo.category || prev.category
        }));
      } catch (err) {
        console.error('Error extracting site info:', err);
      }
    }
  };

  // Handle subscription toggle/removal (for subscribed sources in Profile tab)
  const handleSubscriptionToggle = async (newsSourceId: string) => {
    if (!user?.id) return;

    try {
      const result = await updateSubscription(newsSourceId, 'toggle', getValidSession);

      setSubscriptions(subs =>
        subs.map(sub =>
          sub.news_source_id === newsSourceId
            ? { ...sub, status: result.newStatus }
            : sub
        )
      );
    } catch {
      setError('Failed to update subscription');
    }
  };

  const handleSubscriptionRemove = async (newsSourceId: string) => {
    if (!user?.id) return;

    try {
      await updateSubscription(newsSourceId, 'remove', getValidSession);
      setSubscriptions(subs => subs.filter(sub => sub.news_source_id !== newsSourceId));
    } catch {
      setError('Failed to remove subscription');
    }
  };

  // Handle managed source toggle/update (for owned sources in Sources tab)
  const handleManagedSourceToggle = async (sourceId: string, field: "status" | "is_public") => {
    if (!user?.id) return;

    try {
      if (field === "status") {
        const source = managedSources.find(s => s.id === sourceId);
        const newStatus = source?.status === 'Activated' ? 'Deactivated' : 'Activated';

        await updateManagedSource(sourceId, { status: newStatus }, getValidSession);

        setManagedSources(sources =>
          sources.map(source =>
            source.id === sourceId
              ? { ...source, status: newStatus }
              : source
          )
        );
      } else if (field === "is_public") {
        const source = managedSources.find(s => s.id === sourceId);
        const newIsPublic = !source?.is_public;

        await updateManagedSource(sourceId, { is_public: newIsPublic }, getValidSession);

        setManagedSources(sources =>
          sources.map(source =>
            source.id === sourceId
              ? { ...source, is_public: newIsPublic }
              : source
          )
        );
      }
    } catch {
      setError('Failed to update source');
    }
  };

  const handleDeleteSource = async (sourceId: string) => {
    if (!user?.id) return;

    try {
      await deleteManagedSource(sourceId, getValidSession);
      setManagedSources(sources => sources.filter(source => source.id !== sourceId));
    } catch {
      setError('Failed to delete source');
    }
  };

  const handleAddSource = async () => {
    if (!user?.id || !newSourceForm.url.trim()) return;

    setIsSubmitting(true);
    try {
      // Detect if URL is RSS feed
      const isRSS = await detectRSSFeed(newSourceForm.url);

      const newsSourceData: CreateSourceData = {
        title: newSourceForm.title || 'Untitled Source',
        description: newSourceForm.description,
        language: newSourceForm.language,
        category: newSourceForm.category,
        link: isRSS ? "" : newSourceForm.url,
        rss: isRSS ? newSourceForm.url : "",
        is_public: newSourceForm.isPublic
      };

      const data = await createManagedSource(newsSourceData, getValidSession);

      setManagedSources(sources => [data, ...sources]);
      setNewSourceForm({
        url: "",
        link: "",
        rss: "",
        title: "",
        description: "",
        category: "General",
        language: "English",
        isPublic: true
      });
      setShowAddSource(false);
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('Subscription limit reached')) {
          setError('You have reached your subscription limit. Please upgrade your plan to add more sources.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to add source');
      }
      console.error('Error adding source:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSavePreferences = async () => {
    if (!user?.id) return;

    setPreferencesSaving(true);
    try {
      const updates: ProfileUpdates = {
        enable_email_delivery: preferences.emailDelivery,
        brief_language: preferences.briefLanguage
      };

      const data = await saveUserProfile(updates, getValidSession);

      // Update local state with saved data
      setPreferences({
        emailDelivery: data.enable_email_delivery,
        briefLanguage: data.brief_language
      });
      // Show success message (you could add a toast notification here)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to save preferences');
      }
      console.error('Error saving preferences:', err);
    } finally {
      setPreferencesSaving(false);
    }
  };

  // Convert subscriptions to the format expected by the existing UI
  const subscribedSources = subscriptions.map(sub => ({
    id: sub.news_source_id,
    name: sub.news_source.title,
    url: sub.news_source.link,
    type: sub.news_source.rss ? "RSS" : "Website",
    category: sub.news_source.category,
    isActive: sub.status === 'Subscribed',
    isPublic: sub.news_source.is_public,
    articlesCount: sub.news_source.latest_crawled_num || 0,
    lastUpdated: sub.news_source.latest_crawled_at,
    description: sub.news_source.description
  }));

  // Show loading state only if timeout has been reached
  if (showLoadingTimeout) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <p>Loading profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show login prompt if no user (and auth is not loading)
  if (!user && !authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Please sign in to view your profile</h2>
              <Button onClick={() => window.location.href = '/login'}>
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-red-500 mb-4">Error: {error}</p>
              <Button onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-newsreader text-3xl md:text-4xl font-bold mb-2">
                Profile & Settings
              </h1>
              <p className="text-muted-foreground text-lg">
                Manage your account, news sources, and preferences
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
              disabled={loading || !user}
              className="flex items-center"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button> */}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="sources" className="flex items-center">
              <Rss className="h-4 w-4 mr-2" />
              My Sources
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              Preferences
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-8">
            <Card>
              <CardContent className="space-y-6">
                {/* Avatar and Basic Info */}
                <div className="flex items-center space-x-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={user?.user_metadata?.avatar_url || userData.avatar} />
                    <AvatarFallback className="text-lg">
                      {(user?.user_metadata?.full_name || userData.name).split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div>
                      <h3 className="text-xl font-semibold flex items-center space-x-2">
                        <span>{user?.user_metadata?.full_name || userData.name}</span>
                      </h3>
                      <p className="text-muted-foreground">{user?.email || userData.email}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Member since {new Date(user?.created_at || userData.joinDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>


                <Separator />

                {/* Current Plan */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Current Plan</h4>
                    <p className="text-sm text-muted-foreground">
                      Your current subscription plan and benefits
                    </p>
                  </div>
                  {loading ? (
                    <div className="space-y-3 p-4 border rounded-lg">
                      <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ) : error ? (
                    <div className="text-red-500 p-4 border rounded-lg">
                      Error loading plan information: {error}
                    </div>
                  ) : currentPlan ? (
                    <div className="p-4 border rounded-lg space-y-4">
                      <div className="space-y-1">
                        <p className="text-xl font-bold">{currentPlan.name}</p>
                        <p className="text-muted-foreground">{currentPlan.price}/month</p>
                      </div>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {currentPlan.features.map(feature => (
                          <li key={feature} className="flex items-center">
                            <Check className="h-4 w-4 mr-2 text-primary"/>
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <div className="pt-2">
                        <Button variant="outline" size="sm" onClick={() => window.location.href = '/billing'}>
                          Manage Billing
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-muted-foreground p-4 border rounded-lg">
                      No plan information available
                    </div>
                  )}
                </div>

                <Separator />

                {/* user subscribed news sources */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Your Subscribed News Sources</h4>
                    <p className="text-sm text-muted-foreground">
                      News sources you follow (created by other users or the community)
                    </p>
                  </div>
                  <div className="space-y-3">
                    {subscribedSources.filter(source => source.isActive).map((source) => (
                      <div key={source.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                            {source.type === "RSS" ? (
                              <Rss className="h-4 w-4 text-primary" />
                            ) : (
                              <Globe className="h-4 w-4 text-primary" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{source.name}</p>
                            <p className="text-sm text-muted-foreground">{source.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">Recently Added {source.articlesCount} Articles</Badge>
                          {source.isPublic && (
                            <Eye className="h-4 w-4 text-green-600" />
                          )}
                          <div className="flex items-center space-x-1">
                            <Switch
                              checked={source.isActive}
                              onCheckedChange={() => handleSubscriptionToggle(source.id)}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSubscriptionRemove(source.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {subscribedSources.filter(source => source.isActive).length === 0 && (
                      <p className="text-muted-foreground text-center py-4">
                        No active subscriptions. Visit the community page to discover and subscribe to news sources created by other users.
                      </p>
                    )}
                  </div>
                </div>

              </CardContent>
            </Card>
          </TabsContent>

          {/* user managed news sources */}
          <TabsContent value="sources" className="mt-8">
            <div className="space-y-6">
              {/* Header with Add Button */}
              <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <div>
                  <h2 className="font-semibold text-lg">Your Managed News Sources</h2>
                  <p className="text-muted-foreground">
                    News sources you created and own - other users can subscribe to these
                  </p>
                </div>
                <Dialog open={showAddSource} onOpenChange={setShowAddSource}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Source
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add News Source</DialogTitle>
                      <DialogDescription>
                        Add a news website URL or RSS feed to create a new source
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">RSS or Link URL *</label>
                        <Input
                          placeholder="https://example.com/feed or https://example.com"
                          value={newSourceForm.url}
                          onChange={(e) => handleUrlChange(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium">Title *</label>
                        <Input
                          placeholder="Source title"
                          value={newSourceForm.title}
                          onChange={(e) => setNewSourceForm(prev => ({ ...prev, title: e.target.value }))}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium">Description *</label>
                        <Textarea
                          placeholder="Brief description of the news source"
                          value={newSourceForm.description}
                          onChange={(e) => setNewSourceForm(prev => ({ ...prev, description: e.target.value }))}
                          className="min-h-[80px]"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Category *</label>
                          <Select
                            value={newSourceForm.category}
                            onValueChange={(value) => setNewSourceForm(prev => ({ ...prev, category: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-sm font-medium">Language *</label>
                          <Select
                            value={newSourceForm.language}
                            onValueChange={(value) => setNewSourceForm(prev => ({ ...prev, language: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {languages.map((lang) => (
                                <SelectItem key={lang.code} value={lang.code}>
                                  {lang.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={newSourceForm.isPublic}
                          onCheckedChange={(checked) => setNewSourceForm(prev => ({ ...prev, isPublic: checked }))}
                        />
                        <label className="text-sm">Make this source public</label>
                      </div>

                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
                        <Button
                          onClick={handleAddSource}
                          className="flex-1"
                          disabled={isSubmitting || !newSourceForm.url.trim() || !newSourceForm.title.trim()}
                        >
                          {isSubmitting ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Plus className="h-4 w-4 mr-2" />
                          )}
                          Add Source
                        </Button>
                        <Button variant="outline" onClick={() => setShowAddSource(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Sources List */}
              <div className="space-y-4">
                {managedSources.map((source) => (
                  <Card key={source.id}>
                    <CardHeader>
                      <div className="flex flex-col space-y-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            {source.rss ? (
                              <Rss className="h-5 w-5 text-primary" />
                            ) : (
                              <Globe className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <CardTitle className="text-lg truncate">{source.title}</CardTitle>
                            <CardDescription className="flex items-center space-x-2">
                              <LinkIcon className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{source.link}</span>
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <Badge variant="outline">{source.category}</Badge>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                          {/* <span>{source.latest_crawled_num} articles</span> */}
                          <span>
                            Updated {new Date(source.latest_crawled_at).toLocaleDateString()}
                          </span>
                          <span>{source.subscribers_num} subscribers</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={source.status === 'Activated'}
                              onCheckedChange={() => handleManagedSourceToggle(source.id, "status")}
                            />
                            <span className="text-sm">Active</span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={source.is_public}
                              onCheckedChange={() => handleManagedSourceToggle(source.id, "is_public")}
                            />
                            <span className="text-sm">Public</span>
                            {source.is_public ? (
                              <Eye className="h-4 w-4 text-green-600" />
                            ) : (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSource(source.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {managedSources.length === 0 && (
                  <div className="text-center py-8">
                    <Rss className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No managed sources yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first news source by adding a website URL or RSS feed. Once created, other users can discover and subscribe to your sources.
                    </p>
                    <Button onClick={() => setShowAddSource(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Source
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preferences" className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>
                  Manage your notification and language preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Email Delivery Toggle */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Email Delivery</label>
                    <p className="text-sm text-muted-foreground">
                      Receive daily brief summaries via email
                    </p>
                  </div>
                  <Switch
                    checked={preferences.emailDelivery}
                    onCheckedChange={(checked) =>
                      setPreferences(prev => ({ ...prev, emailDelivery: checked }))
                    }
                  />
                </div>

                <Separator />

                {/* Brief Language Selection */}
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Brief Language</label>
                    <p className="text-sm text-muted-foreground">
                      Choose the language for your personalized brief summaries
                    </p>
                  </div>
                  <Select
                    value={preferences.briefLanguage}
                    onValueChange={(value) =>
                      setPreferences(prev => ({ ...prev, briefLanguage: value }))
                    }
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Save Button */}
                <div className="flex justify-end">
                  <Button onClick={handleSavePreferences} disabled={preferencesSaving}>
                    {preferencesSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Preferences'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
      <Footer />
    </div>
  );
}
