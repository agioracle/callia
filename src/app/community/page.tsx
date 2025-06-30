"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Clock,
  TrendingUp,
  Users,
  Search,
  Filter,
  Star,
  Globe,
  PlusCircle
} from "lucide-react";
import { useState } from "react";

// Mock data for popular news sources
const popularSources = [
  {
    id: 1,
    name: "TechCrunch",
    description: "Startup and technology news",
    language: "English",
    subscribers: 15200,
    lastUpdate: "2 hours ago",
    category: "Technology",
    tags: ["Startups", "VC", "Mobile"],
    isSubscribed: true,
  },
  {
    id: 2,
    name: "The Verge",
    description: "Technology, science, art, and culture",
    language: "English",
    subscribers: 12800,
    lastUpdate: "45 minutes ago",
    category: "Technology",
    tags: ["Gadgets", "Reviews", "Sci-Fi"],
    isSubscribed: false,
  },
  {
    id: 3,
    name: "MIT Technology Review",
    description: "Authoritative, influential, and trustworthy journalism.",
    language: "English",
    subscribers: 8900,
    lastUpdate: "5 hours ago",
    category: "Science",
    tags: ["AI", "Biotech", "Climate"],
    isSubscribed: false,
  },
  {
    id: 4,
    name: "Hacker News",
    description: "A social news website focusing on computer science and entrepreneurship.",
    language: "English",
    subscribers: 25000,
    lastUpdate: "1 minute ago",
    category: "Technology",
    tags: ["Programming", "Startups", "Security"],
    isSubscribed: true,
  },
  {
    id: 5,
    name: "Wired",
    description: "How emerging technologies affect culture, the economy, and politics.",
    language: "English",
    subscribers: 11400,
    lastUpdate: "1 hour ago",
    category: "Technology",
    tags: ["Culture", "Business", "Design"],
    isSubscribed: false,
  }
];

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState("official");
  const [searchQuery, setSearchQuery] = useState("");
  const [sources, setSources] = useState(popularSources);

  const handleSubscribe = (sourceId: number) => {
    setSources(sources.map(source =>
      source.id === sourceId ? { ...source, isSubscribed: !source.isSubscribed } : source
    ));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-newsreader text-3xl md:text-4xl font-bold mb-2">
            Discover News Sources
          </h1>
          <p className="text-muted-foreground text-lg">
            Follow official, community-recommended, and new sources to build your perfect brief.
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
           <Button className="flex items-center">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Source
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="official" className="flex items-center">
              <Star className="h-4 w-4 mr-2" />
              Official
            </TabsTrigger>
            <TabsTrigger value="community" className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Community
            </TabsTrigger>
            <TabsTrigger value="new" className="flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Newly Added
            </TabsTrigger>
          </TabsList>

          <TabsContent value="official" className="mt-8">
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sources.filter(s => s.category === 'Technology').map(source => (
                  <Card key={source.id} className="flex flex-col">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-lg">{source.name}</h3>
                        <Badge variant="outline">{source.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground pt-2">{source.description}</p>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-4">
                        <div className="flex items-center text-sm text-muted-foreground">
                            <Globe className="h-4 w-4 mr-2"/>
                            <span>{source.language}</span>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                            <Users className="h-4 w-4 mr-2"/>
                            <span>{source.subscribers.toLocaleString()} subscribers</span>
                        </div>
                         <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 mr-2"/>
                            <span>Updated {source.lastUpdate}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {source.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                        </div>
                    </CardContent>
                    <div className="p-6 pt-0">
                      <Button
                        className="w-full"
                        variant={source.isSubscribed ? "secondary" : "default"}
                        onClick={() => handleSubscribe(source.id)}
                      >
                        {source.isSubscribed ? "Unsubscribe" : "Subscribe"}
                      </Button>
                    </div>
                  </Card>
                ))}
             </div>
          </TabsContent>

          <TabsContent value="community" className="mt-8">
            <p className="text-muted-foreground text-center">Community sources coming soon.</p>
          </TabsContent>

          <TabsContent value="new" className="mt-8">
             <p className="text-muted-foreground text-center">Newly added sources coming soon.</p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
