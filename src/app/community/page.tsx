"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import Footer from "@/components/Footer";
import {
  Clock,
  TrendingUp,
  Users,
  Search,
  Filter,
  Star,
  Globe,
  PlusCircle,
  Plus,
  Loader2
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
// Session type no longer needed as we use AuthContext directly
import {
  detectRSSFeed,
  extractSiteInfo
} from "@/lib/auth";

// TypeScript interface for news source data
interface NewsSource {
  id: string;
  title: string;
  description: string | null;
  language: string | null;
  category: string | null;
  link: string | null;
  rss: string | null;
  tags: string[] | null;
  user_id: string | null;
  is_public: boolean;
  subscribers_num: number;
  status: string | null;
  latest_crawled_num: number | null;
  latest_crawled_at: string | null;
  created_at: string;
  isSubscribed?: boolean;
}

// TypeScript interface for new source form
interface NewSourceForm {
  url: string;
  link: string;
  rss: string;
  title: string;
  description: string;
  category: string;
  language: string;
  isPublic: boolean;
}



// All API functions are now inline to use getValidSession directly from AuthContext

// CreateNewsSourceData interface removed - using inline types

// createNewsSourceAPI function removed - now inline

const categories = [
  "Technology", "Business", "Science", "Politics", "Sports",
  "Health", "Entertainment", "Travel", "Finance", "Climate",
  "Games", "Arts", "General"
];

const languages = [
  { code: "English", name: "English" },
  { code: "Chinese", name: "Chinese" },
];

export default function CommunityPage() {
  const { user, loading: authLoading, getValidSession } = useAuth();
  const [activeTab, setActiveTab] = useState("official");
  const [searchQuery, setSearchQuery] = useState("");
  const [officialSources, setOfficialSources] = useState<NewsSource[]>([]);
  const [communitySources, setCommunitySources] = useState<NewsSource[]>([]);
  const [newlySources, setNewlySources] = useState<NewsSource[]>([]);
  const [loading, setLoading] = useState(false); // Change initial state to false
  const [error, setError] = useState<string | null>(null);
  const [showLoadingTimeout, setShowLoadingTimeout] = useState(false);

  // Add source dialog state
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

    // Performance optimization states
  const [isPageVisible, setIsPageVisible] = useState<boolean>(true);
  const [dataLoaded, setDataLoaded] = useState<boolean>(false);
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

  // Use useRef to track cache time to avoid triggering re-renders
  const lastFetchTimeRef = useRef<number>(0);

  // Handle URL change with auto-extraction
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

  // Handle add source submission
  const handleAddSource = async () => {
    if (!user?.id || !newSourceForm.url.trim()) return;

    setIsSubmitting(true);
    try {
      // Detect if URL is RSS feed
      const isRSS = await detectRSSFeed(newSourceForm.url);

      const newsSourceData = {
        title: newSourceForm.title || 'Untitled Source',
        description: newSourceForm.description,
        language: newSourceForm.language,
        category: newSourceForm.category,
        link: isRSS ? "" : newSourceForm.url,
        rss: isRSS ? newSourceForm.url : "",
        is_public: newSourceForm.isPublic
      };

      // Use getValidSession for creating news source
      const validSession = await getValidSession();
      if (!validSession?.access_token) {
        throw new Error('No access token available');
      }

      const response = await fetch('/api/profile/sources', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${validSession.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create',
          newsSourceData
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create news source');
      }

      await response.json();

      // Reset form and close dialog
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

      // Refresh data to show the new source
      window.location.reload();
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

  // Optimized fetch news sources from API with caching and better error handling
  useEffect(() => {
    async function loadNewsSources() {
      // Wait for auth to complete first
      if (authLoading) {
        return;
      }

      if (!user) {
        setLoading(false);
        setDataLoaded(true);
        return;
      }

      const now = Date.now();
      const hasData = officialSources.length > 0 || communitySources.length > 0 || newlySources.length > 0;
      const shouldSkipFetch = hasData &&
                             now - lastFetchTimeRef.current < CACHE_DURATION;

      // Skip fetching if we have cached data and it's still fresh
      if (shouldSkipFetch) {
        console.log('Using cached news sources data');
        setDataLoaded(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Use getValidSession to get cached session
        const validSession = await getValidSession();
        if (!validSession?.access_token) {
          throw new Error('No access token available');
        }

        const response = await fetch('/api/community/sources', {
          headers: {
            'Authorization': `Bearer ${validSession.access_token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch news sources');
        }

        const data = await response.json();

        setOfficialSources(data.official || []);
        setCommunitySources(data.community || []);
        setNewlySources(data.newly || []);
        lastFetchTimeRef.current = now;
        setDataLoaded(true);

        console.log('Fetched fresh news sources data');
      } catch (err) {
        console.error('Error fetching news sources:', err);
        if (err instanceof Error && err.message.includes('authentication')) {
          setError('Please log in to view news sources');
        } else {
          setError('Failed to load news sources');
        }
      } finally {
        setLoading(false);
      }
    }

    // Only load if page is visible and we haven't loaded data yet, or if we need to refresh
    if (!authLoading && (isPageVisible || !dataLoaded)) {
      loadNewsSources();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, isPageVisible]); // Intentionally excluding other deps to prevent infinite loops

  const handleSubscribe = async (sourceId: string) => {
    if (!user) {
      alert('Please log in to subscribe to sources');
      return;
    }

    try {
      // Find current subscription status
      const currentSource = [...officialSources, ...communitySources, ...newlySources]
        .find(source => source.id === sourceId);

      if (!currentSource) return;

      const action = currentSource.isSubscribed ? 'unsubscribe' : 'subscribe';

      // Use getValidSession for subscription call
      const validSession = await getValidSession();
      if (!validSession?.access_token) {
        throw new Error('No access token available');
      }

      const response = await fetch('/api/community/subscribe', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${validSession.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sourceId, action }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to ${action} source`);
      }

      const result = await response.json();

      if (result.error) {
        if (result.error === 'Subscription limit reached') {
          alert(`You have reached your subscription limit. Your ${result.pricingPlan} plan allows up to ${result.limit} subscriptions. You currently have ${result.currentCount} subscriptions. Please upgrade your plan to subscribe to more sources.`);
        } else {
          alert(result.error);
        }
        return;
      }

      // Update local state
      const updateSources = (sources: NewsSource[]) =>
        sources.map(source =>
          source.id === sourceId ? {
            ...source,
            isSubscribed: result.isSubscribed,
            subscribers_num: result.newSubscriberCount
          } : source
        );

      setOfficialSources(updateSources);
      setCommunitySources(updateSources);
      setNewlySources(updateSources);

    } catch (err) {
      console.error('Error updating subscription:', err);
      alert('Failed to update subscription. Please try again.');
    }
  };

  // Manual refresh function
  // const handleManualRefresh = async () => {
  //   if (!user) return;

  //   try {
  //     setLoading(true);
  //     setError(null);

  //     const data = await fetchNewsSources();

  //     setOfficialSources(data.official || []);
  //     setCommunitySources(data.community || []);
  //     setNewlySources(data.newly || []);
  //     lastFetchTimeRef.current = Date.now();

  //     console.log('Manual refresh completed');
  //   } catch (err) {
  //     console.error('Error during manual refresh:', err);
  //     if (err instanceof Error && err.message.includes('authentication')) {
  //       setError('Please log in to view news sources');
  //     } else {
  //       setError('Failed to refresh news sources');
  //     }
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const formatLastUpdate = (dateString: string | null) => {
    if (!dateString) return 'Never';

    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Less than an hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return '1 day ago';
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  const formatDateAdded = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just added';
    if (diffInHours < 24) return `Added ${diffInHours} hours ago`;
    if (diffInHours < 48) return 'Added 1 day ago';
    return `Added ${Math.floor(diffInHours / 24)} days ago`;
  };

  const filterSources = (sources: NewsSource[]) =>
    sources.filter(source =>
      source.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      source.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const renderSourceCard = (source: NewsSource, showDateAdded = false) => (
    <Card key={source.id} className="flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-lg">{source.title}</h3>
          {source.category && (
            <Badge variant="outline">{source.category}</Badge>
          )}
        </div>
        {source.description && (
          <p className="text-sm text-muted-foreground pt-2">{source.description}</p>
        )}
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        {source.language && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Globe className="h-4 w-4 mr-2"/>
            <span>{source.language}</span>
          </div>
        )}
        <div className="flex items-center text-sm text-muted-foreground">
          <Users className="h-4 w-4 mr-2"/>
          <span>{source.subscribers_num.toLocaleString()} subscribers</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="h-4 w-4 mr-2"/>
          <span>
            {showDateAdded
              ? formatDateAdded(source.created_at)
              : `Updated ${formatLastUpdate(source.latest_crawled_at)}`
            }
          </span>
        </div>
        {source.tags && source.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {source.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
          </div>
        )}
      </CardContent>
      <div className="p-6 pt-0">
        <Button
          className="w-full"
          variant={source.isSubscribed ? "secondary" : "default"}
          onClick={() => handleSubscribe(source.id)}
          disabled={!user}
        >
          {source.isSubscribed ? "Unsubscribe" : "Subscribe"}
        </Button>
      </div>
    </Card>
  );

  // Show loading state only if timeout has been reached
  if (showLoadingTimeout) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p>Loading news sources...</p>
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
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <div className="text-center">
            <h1 className="font-newsreader text-3xl md:text-4xl font-bold mb-4">
              Discover News Sources
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              Please log in to view and subscribe to news sources.
            </p>
            <Button onClick={() => window.location.href = '/login'}>
              Log In
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <div className="text-center text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-newsreader text-3xl md:text-4xl font-bold mb-2">
            Discover News Sources
          </h1>
          <p className="text-muted-foreground text-lg">
            Follow official and community-recommended news sources to build your perfect briefings.
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

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for news sources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          {/* <Button
            variant="outline"
            onClick={handleManualRefresh}
            disabled={loading || !user}
            className="flex items-center"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button> */}

          {/* Add Source Dialog */}
          <Dialog open={showAddSource} onOpenChange={setShowAddSource}>
            <DialogTrigger asChild>
              <Button className="flex items-center">
                <PlusCircle className="h-4 w-4 mr-2" />
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
                    disabled={isSubmitting || !newSourceForm.url.trim() || !newSourceForm.title.trim() || !user}
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

                {!user && (
                  <p className="text-sm text-muted-foreground text-center">
                    Please log in to add a new source
                  </p>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="official" className="flex items-center">
              <Star className="h-3 w-3 mr-1" />
              Official ({officialSources.length})
            </TabsTrigger>
            <TabsTrigger value="community" className="flex items-center">
              <Users className="h-3 w-3 mr-1" />
              Community ({communitySources.length})
            </TabsTrigger>
            <TabsTrigger value="new" className="flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              New ({newlySources.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="official" className="mt-8">
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                Curated sources added by our editorial team for reliable, high-quality news coverage.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterSources(officialSources).map(source => renderSourceCard(source))}
            </div>
            {filterSources(officialSources).length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                {searchQuery ? "No official sources found matching your search." : "No official sources available."}
              </div>
            )}
          </TabsContent>

          <TabsContent value="community" className="mt-8">
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                Sources recommended and added by community members. Help us grow the collection!
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterSources(communitySources).map(source => renderSourceCard(source))}
            </div>
            {filterSources(communitySources).length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                {searchQuery ? "No community sources found matching your search." : "No community sources available yet."}
              </div>
            )}
          </TabsContent>

          <TabsContent value="new" className="mt-8">
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                The latest sources added to our platform. Be among the first to discover new content!
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterSources(newlySources).map(source => renderSourceCard(source, true))}
            </div>
            {filterSources(newlySources).length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                {searchQuery ? "No newly added sources found matching your search." : "No newly added sources available."}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
}
