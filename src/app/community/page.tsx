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
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import {
  createNewsSource,
  detectRSSFeed,
  extractSiteInfo,
  checkSubscriptionLimit
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

const OFFICIAL_USER_ID = 'fb8e9571-9d4d-401b-893c-c67891a2d99e';

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
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("official");
  const [searchQuery, setSearchQuery] = useState("");
  const [officialSources, setOfficialSources] = useState<NewsSource[]>([]);
  const [communitySources, setCommunitySources] = useState<NewsSource[]>([]);
  const [newlySources, setNewlySources] = useState<NewsSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      // Check subscription limits before creating new source
      // (User automatically subscribes to sources they create)
      const limitCheck = await checkSubscriptionLimit(user.id);

      if (limitCheck.error) {
        console.error('Error checking subscription limit:', limitCheck.error);
        setError('Failed to check subscription limit. Please try again.');
        return;
      }

      if (!limitCheck.canSubscribe) {
        const pricingPlan = limitCheck.pricingPlan;
        const limit = limitCheck.limit;
        const currentCount = limitCheck.currentCount;

        setError(`You have reached your subscription limit. Your ${pricingPlan} plan allows up to ${limit} subscriptions. You currently have ${currentCount} subscriptions. Please upgrade your plan to add more sources.`);
        return;
      }

      // Detect if URL is RSS feed
      const isRSS = await detectRSSFeed(newSourceForm.url);

      const newsSourceData = {
        title: newSourceForm.title || 'Untitled Source',
        description: newSourceForm.description,
        language: newSourceForm.language,
        category: newSourceForm.category,
        link: isRSS ? "" : newSourceForm.url,
        rss: isRSS ? newSourceForm.url : "",
        is_public: newSourceForm.isPublic,
        user_id: user.id
      };

      const { data, error } = await createNewsSource(user.id, newsSourceData);

      if (error) {
        setError(error.message);
      } else if (data) {
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
      }
    } catch (err) {
      setError('Failed to add source');
      console.error('Error adding source:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch user subscriptions for the current user
  const fetchUserSubscriptions = async (sourceIds: string[]): Promise<Map<string, boolean>> => {
    if (!user || sourceIds.length === 0) {
      return new Map();
    }

    try {
      const { data, error } = await supabase
        .from('user_subscription')
        .select('news_source_id, status')
        .eq('user_id', user.id)
        .in('news_source_id', sourceIds);

      if (error) throw error;

      const subscriptionMap = new Map<string, boolean>();
      data?.forEach(sub => {
        subscriptionMap.set(sub.news_source_id, sub.status === 'Subscribed');
      });

      return subscriptionMap;
    } catch (err) {
      console.error('Error fetching user subscriptions:', err);
      return new Map();
    }
  };

  // Add subscription status to sources
  const addSubscriptionStatus = async (sources: Omit<NewsSource, 'isSubscribed'>[]): Promise<NewsSource[]> => {
    const sourceIds = sources.map(s => s.id);
    const subscriptionMap = await fetchUserSubscriptions(sourceIds);

    return sources.map(source => ({
      ...source,
      isSubscribed: subscriptionMap.get(source.id) || false
    }));
  };

  // Fetch news sources from Supabase
  useEffect(() => {
    async function fetchNewsSources() {
      try {
        setLoading(true);

        // Fetch official sources (added by specific user)
        const { data: officialData, error: officialError } = await supabase
          .from('news_source')
          .select('*')
          .eq('is_public', true)
          .eq('status', 'Activated')
          .eq('user_id', OFFICIAL_USER_ID)
          .order('subscribers_num', { ascending: false });

        if (officialError) throw officialError;

        // Fetch community sources (added by other users)
        const { data: communityData, error: communityError } = await supabase
          .from('news_source')
          .select('*')
          .eq('is_public', true)
          .eq('status', 'Activated')
          .neq('user_id', OFFICIAL_USER_ID)
          .order('subscribers_num', { ascending: false });

        if (communityError) throw communityError;

        // Fetch newly added sources (latest 9, regardless of who added them)
        const { data: newlyData, error: newlyError } = await supabase
          .from('news_source')
          .select('*')
          .eq('is_public', true)
          .eq('status', 'Activated')
          .order('created_at', { ascending: false })
          .limit(9);

        if (newlyError) throw newlyError;

        // Add subscription status to each category
        const [officialWithSubs, communityWithSubs, newlyWithSubs] = await Promise.all([
          addSubscriptionStatus(officialData || []),
          addSubscriptionStatus(communityData || []),
          addSubscriptionStatus(newlyData || [])
        ]);

        setOfficialSources(officialWithSubs);
        setCommunitySources(communityWithSubs);
        setNewlySources(newlyWithSubs);
      } catch (err) {
        console.error('Error fetching news sources:', err);
        setError('Failed to load news sources');
      } finally {
        setLoading(false);
      }
    }

    fetchNewsSources();
  }, [user]);

    const handleSubscribe = async (sourceId: string) => {
    if (!user) {
      // TODO: Redirect to login or show login modal
      alert('Please log in to subscribe to sources');
      return;
    }

    try {
      // Find current subscription status
      const currentSource = [...officialSources, ...communitySources, ...newlySources]
        .find(source => source.id === sourceId);

      if (!currentSource) return;

      const newSubscriptionStatus = !currentSource.isSubscribed;
      const status = newSubscriptionStatus ? 'Subscribed' : 'Unsubscribed';

      // Check subscription limits when trying to subscribe
      if (newSubscriptionStatus) {
        const limitCheck = await checkSubscriptionLimit(user.id);

        if (limitCheck.error) {
          console.error('Error checking subscription limit:', limitCheck.error);
          alert('Failed to check subscription limit. Please try again.');
          return;
        }

        if (!limitCheck.canSubscribe) {
          const pricingPlan = limitCheck.pricingPlan;
          const limit = limitCheck.limit;
          const currentCount = limitCheck.currentCount;

          alert(`You have reached your subscription limit. Your ${pricingPlan} plan allows up to ${limit} subscriptions. You currently have ${currentCount} subscriptions. Please upgrade your plan to subscribe to more sources.`);
          return;
        }
      }

      // Check if subscription record exists
      const { data: existingSubscription } = await supabase
        .from('user_subscription')
        .select('*')
        .eq('user_id', user.id)
        .eq('news_source_id', sourceId)
        .single();

      if (existingSubscription) {
        // Update existing subscription
        const { error } = await supabase
          .from('user_subscription')
          .update({ status })
          .eq('user_id', user.id)
          .eq('news_source_id', sourceId);

        if (error) throw error;
      } else {
        // Create new subscription record
        const { error } = await supabase
          .from('user_subscription')
          .insert({
            user_id: user.id,
            news_source_id: sourceId,
            status
          });

        if (error) throw error;
      }

      // Update subscribers_num in news_source table
      const subscriberChange = newSubscriptionStatus ? 1 : -1;
      const { error: updateError } = await supabase
        .from('news_source')
        .update({
          subscribers_num: currentSource.subscribers_num + subscriberChange
        })
        .eq('id', sourceId);

      if (updateError) throw updateError;

      // Update local state
      const updateSources = (sources: NewsSource[]) =>
        sources.map(source =>
          source.id === sourceId ? {
            ...source,
            isSubscribed: newSubscriptionStatus,
            subscribers_num: source.subscribers_num + subscriberChange
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <div className="text-center">Loading news sources...</div>
        </div>
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
