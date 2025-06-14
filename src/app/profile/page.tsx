"use client";

import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Settings,
  Globe,
  Trash2,
  Edit,
  Save,
  Eye,
  EyeOff,
  Rss,
  Link as LinkIcon,
  Plus,
  CreditCard
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

// Mock user data
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

// Mock news sources data
const newsSources = [
  {
    id: 1,
    name: "TechCrunch",
    url: "https://techcrunch.com/feed/",
    type: "RSS",
    category: "Technology",
    isActive: true,
    isPublic: true,
    articlesCount: 156,
    lastUpdated: "2024-01-15T10:30:00Z"
  },
  {
    id: 2,
    name: "The Verge",
    url: "https://www.theverge.com/rss/index.xml",
    type: "RSS",
    category: "Technology",
    isActive: true,
    isPublic: true,
    articlesCount: 89,
    lastUpdated: "2024-01-15T09:45:00Z"
  },
  {
    id: 3,
    name: "MIT Technology Review",
    url: "https://www.technologyreview.com/feed/",
    type: "RSS",
    category: "Science",
    isActive: true,
    isPublic: false,
    articlesCount: 42,
    lastUpdated: "2024-01-15T08:20:00Z"
  },
  {
    id: 4,
    name: "Hacker News",
    url: "https://news.ycombinator.com",
    type: "Website",
    category: "Technology",
    isActive: false,
    isPublic: false,
    articlesCount: 203,
    lastUpdated: "2024-01-14T16:30:00Z"
  }
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(userData);
  const [sources, setSources] = useState(newsSources);
  const [newSourceUrl, setNewSourceUrl] = useState("");
  const [showAddSource, setShowAddSource] = useState(false);

  const handleSaveProfile = () => {
    // In a real app, this would make an API call
    console.log("Saving profile:", editedData);
    setIsEditing(false);
  };

  const handleToggleSource = (sourceId: number, field: "isActive" | "isPublic") => {
    setSources(sources.map(source =>
      source.id === sourceId
        ? { ...source, [field]: !source[field] }
        : source
    ));
  };

  const handleDeleteSource = (sourceId: number) => {
    setSources(sources.filter(source => source.id !== sourceId));
  };

  const handleAddSource = () => {
    if (newSourceUrl.trim()) {
      const newSource = {
        id: Date.now(),
        name: "New Source",
        url: newSourceUrl,
        type: newSourceUrl.includes("/feed") || newSourceUrl.includes(".xml") ? "RSS" : "Website",
        category: "General",
        isActive: true,
        isPublic: false,
        articlesCount: 0,
        lastUpdated: new Date().toISOString()
      };
      setSources([...sources, newSource]);
      setNewSourceUrl("");
      setShowAddSource(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="sources" className="flex items-center">
              <Rss className="h-4 w-4 mr-2" />
              News Sources
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center" asChild>
              <Link href="/billing"><CreditCard className="h-4 w-4 mr-2" />Billing</Link>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-8">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Update your personal information and profile settings
                    </CardDescription>
                  </div>
                  <Button
                    variant={isEditing ? "default" : "outline"}
                    onClick={isEditing ? handleSaveProfile : () => setIsEditing(true)}
                  >
                    {isEditing ? (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    ) : (
                      <>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Avatar and Basic Info */}
                <div className="flex items-center space-x-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={userData.avatar} />
                    <AvatarFallback className="text-lg">
                      {userData.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    {isEditing ? (
                      <div className="space-y-3">
                        <Input
                          value={editedData.name}
                          onChange={(e) => setEditedData({...editedData, name: e.target.value})}
                          placeholder="Full Name"
                        />
                        <Input
                          value={editedData.email}
                          onChange={(e) => setEditedData({...editedData, email: e.target.value})}
                          placeholder="Email"
                          type="email"
                        />
                      </div>
                    ) : (
                      <div>
                        <h3 className="text-xl font-semibold flex items-center space-x-2">
                          <span>{userData.name}</span>
                          {userData.isVerified && (
                            <Badge variant="secondary">Verified</Badge>
                          )}
                        </h3>
                        <p className="text-muted-foreground">{userData.email}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Member since {new Date(userData.joinDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Bio */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Bio</label>
                  {isEditing ? (
                    <Textarea
                      value={editedData.bio}
                      onChange={(e) => setEditedData({...editedData, bio: e.target.value})}
                      placeholder="Tell us about yourself..."
                      rows={3}
                    />
                  ) : (
                    <p className="text-muted-foreground">
                      {userData.bio || "No bio provided"}
                    </p>
                  )}
                </div>

                <Separator />

                {/* Public Profile Settings */}
                <div className="space-y-4">
                  <h4 className="font-medium">Profile Visibility</h4>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">Public Profile</p>
                      <p className="text-sm text-muted-foreground">
                        Allow others to see your profile in the community
                      </p>
                    </div>
                    <Switch
                      checked={editedData.publicProfile}
                      onCheckedChange={(checked) =>
                        setEditedData({...editedData, publicProfile: checked})
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">Public News Sources</p>
                      <p className="text-sm text-muted-foreground">
                        Share your news sources with the community
                      </p>
                    </div>
                    <Switch
                      checked={editedData.publicSources}
                      onCheckedChange={(checked) =>
                        setEditedData({...editedData, publicSources: checked})
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sources" className="mt-8">
            <div className="space-y-6">
              {/* Header with Add Button */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-lg">Your News Sources</h2>
                  <p className="text-muted-foreground">
                    Manage your news sources and RSS feeds
                  </p>
                </div>
                <Dialog open={showAddSource} onOpenChange={setShowAddSource}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Source
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add News Source</DialogTitle>
                      <DialogDescription>
                        Add a news website URL or RSS feed to your sources
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        placeholder="https://example.com/feed or https://example.com"
                        value={newSourceUrl}
                        onChange={(e) => setNewSourceUrl(e.target.value)}
                      />
                      <div className="flex space-x-2">
                        <Button onClick={handleAddSource} className="flex-1">
                          <Plus className="h-4 w-4 mr-2" />
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
                {sources.map((source) => (
                  <Card key={source.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            {source.type === "RSS" ? (
                              <Rss className="h-5 w-5 text-primary" />
                            ) : (
                              <Globe className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{source.name}</CardTitle>
                            <CardDescription className="flex items-center space-x-2">
                              <LinkIcon className="h-3 w-3" />
                              <span className="truncate max-w-md">{source.url}</span>
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{source.category}</Badge>
                          <Badge variant={source.isActive ? "default" : "secondary"}>
                            {source.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                          <span>{source.articlesCount} articles</span>
                          <span>
                            Updated {new Date(source.lastUpdated).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={source.isActive}
                              onCheckedChange={() => handleToggleSource(source.id, "isActive")}
                            />
                            <span className="text-sm">Active</span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={source.isPublic}
                              onCheckedChange={() => handleToggleSource(source.id, "isPublic")}
                            />
                            <span className="text-sm">Public</span>
                            {source.isPublic ? (
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
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preferences" className="mt-8">
            <Card>
                <CardHeader>
                    <CardTitle>Preferences</CardTitle>
                    <CardDescription>
                        Manage your application settings and notification preferences.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    {/* Language Settings */}
                    <div className="space-y-4">
                        <h4 className="font-medium">Language</h4>
                        <div className="space-y-2">
                           <label htmlFor="language-select" className="text-sm text-muted-foreground">
                                Choose your preferred language for the interface and content.
                           </label>
                           <select
                                id="language-select"
                                value={editedData.language}
                                onChange={(e) => setEditedData({...editedData, language: e.target.value})}
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                               <option value="en-US">English (United States)</option>
                               <option value="en-GB">English (United Kingdom)</option>
                               <option value="es-ES">Español (España)</option>
                               <option value="fr-FR">Français</option>
                               <option value="de-DE">Deutsch</option>
                               <option value="ja-JP">日本語</option>
                               <option value="zh-CN">中文 (简体)</option>
                           </select>
                        </div>
                    </div>

                    <Separator/>

                    {/* Privacy Settings */}
                     <div className="space-y-4">
                        <h4 className="font-medium">Privacy</h4>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Public Profile</p>
                                <p className="text-sm text-muted-foreground">
                                    Allow other users to see your profile and shared briefs.
                                </p>
                            </div>
                            <Switch
                                checked={editedData.publicProfile}
                                onCheckedChange={(checked) => setEditedData({...editedData, publicProfile: checked})}
                            />
                        </div>
                         <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Share My Sources</p>
                                <p className="text-sm text-muted-foreground">
                                    Allow the community to see the custom sources you add.
                                </p>
                            </div>
                            <Switch
                                checked={editedData.publicSources}
                                onCheckedChange={(checked) => setEditedData({...editedData, publicSources: checked})}
                            />
                        </div>
                    </div>

                    <Separator />

                    {/* Notification Settings */}
                    <div className="space-y-4">
                        <h4 className="font-medium">Notifications & Briefs</h4>
                         <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Email Delivery</p>
                                <p className="text-sm text-muted-foreground">
                                    Receive your daily morning brief in your inbox.
                                </p>
                            </div>
                            <Switch
                                checked={editedData.emailDelivery}
                                onCheckedChange={(checked) => setEditedData({...editedData, emailDelivery: checked})}
                            />
                        </div>
                         <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Community Sharing</p>
                                <p className="text-sm text-muted-foreground">
                                    Get notified when someone shares a brief with you.
                                </p>
                            </div>
                            <Switch
                                checked={editedData.communitySharing}
                                onCheckedChange={(checked) => setEditedData({...editedData, communitySharing: checked})}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
