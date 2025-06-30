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
import {
  User,
  Globe,
  Trash2,
  Eye,
  EyeOff,
  Rss,
  Link as LinkIcon,
  Plus,
  CreditCard,
  Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  getUserSubscriptionsAlternative,
  toggleSubscriptionStatus,
  removeUserSubscription,
  getUserManagedNewsSources,
  createNewsSource,
  updateNewsSource,
  deleteNewsSource,
  detectRSSFeed,
  extractSiteInfo
} from "@/lib/auth";

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

type NewSourceForm = {
  url: string;
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
  joinDate: "2024-01-01",
  bio: "Tech enthusiast and startup founder interested in AI, climate change, and space exploration.",
  isVerified: false,
  publicProfile: true,
  publicSources: false,
  notificationsEnabled: true,
  autoGenerate: true,
  emailDelivery: true,
  communitySharing: true,
  language: "en-US",
};

const categories = [
  "Technology", "Business", "Science", "Politics", "Sports",
  "Health", "Entertainment", "General", "Finance", "World News"
];

const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" }
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [managedSources, setManagedSources] = useState<NewsSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddSource, setShowAddSource] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newSourceForm, setNewSourceForm] = useState<NewSourceForm>({
    url: "",
    title: "",
    description: "",
    category: "General",
    language: "en",
    isPublic: false
  });
  const { user } = useAuth();

  // Fetch user subscriptions and managed sources on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        // Fetch subscriptions and managed sources in parallel
        const [subscriptionsResult, managedSourcesResult] = await Promise.all([
          getUserSubscriptionsAlternative(user.id),
          getUserManagedNewsSources(user.id)
        ]);

        if (subscriptionsResult.error) {
          setError(subscriptionsResult.error.message);
        } else {
          setSubscriptions(subscriptionsResult.data || []);
        }

        if (managedSourcesResult.error) {
          setError(managedSourcesResult.error.message);
        } else {
          setManagedSources(managedSourcesResult.data || []);
        }
      } catch (err) {
        setError('Failed to fetch data');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

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
      const subscription = subscriptions.find(s => s.news_source_id === newsSourceId);
      const newStatus = subscription?.status === 'Subscribed' ? 'Unsubscribed' : 'Subscribed';

      await toggleSubscriptionStatus(user.id, newsSourceId, newStatus);

      setSubscriptions(subs =>
        subs.map(sub =>
          sub.news_source_id === newsSourceId
            ? { ...sub, status: newStatus }
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
      await removeUserSubscription(user.id, newsSourceId);
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

        await updateNewsSource(sourceId, user.id, { status: newStatus });

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

        await updateNewsSource(sourceId, user.id, { is_public: newIsPublic });

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
      await deleteNewsSource(sourceId, user.id);
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

      const newsSourceData = {
        title: newSourceForm.title || 'Untitled Source',
        description: newSourceForm.description,
        language: newSourceForm.language,
        category: newSourceForm.category,
        link: newSourceForm.url,
        rss: isRSS ? newSourceForm.url : undefined,
        is_public: newSourceForm.isPublic
      };

      const { data, error } = await createNewsSource(user.id, newsSourceData);

      if (error) {
        setError(error.message);
      } else if (data) {
        setManagedSources(sources => [data, ...sources]);
        setNewSourceForm({
          url: "",
          title: "",
          description: "",
          category: "General",
          language: "en",
          isPublic: false
        });
        setShowAddSource(false);
      }
    } catch (err) {
      setError('Failed to add source');
      console.error('Error adding source:', err);
    } finally {
      setIsSubmitting(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-newsreader text-3xl md:text-4xl font-bold mb-2">
            Profile & Settings
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage your account, news sources, and privacy preferences
          </p>
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
            <TabsTrigger value="billing" className="flex items-center" asChild>
              <Link href="/billing"><CreditCard className="h-4 w-4 mr-2" />Billing</Link>
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
                        {userData.isVerified && (
                          <Badge variant="secondary">Verified</Badge>
                        )}
                      </h3>
                      <p className="text-muted-foreground">{user?.email || userData.email}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Member since {new Date(user?.created_at || userData.joinDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
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
                          <Badge variant="outline">{source.articlesCount} articles</Badge>
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
                        <label className="text-sm font-medium">URL *</label>
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
                        <label className="text-sm font-medium">Description</label>
                        <Textarea
                          placeholder="Brief description of the news source"
                          value={newSourceForm.description}
                          onChange={(e) => setNewSourceForm(prev => ({ ...prev, description: e.target.value }))}
                          className="min-h-[80px]"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Category</label>
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
                          <label className="text-sm font-medium">Language</label>
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
                          {/* <Badge variant={source.status === 'Activated' ? "default" : "secondary"}>
                            {source.status === 'Activated' ? "Active" : "Inactive"}
                          </Badge> */}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                          <span>{source.latest_crawled_num} articles</span>
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


        </Tabs>
      </div>
    </div>
  );
}
