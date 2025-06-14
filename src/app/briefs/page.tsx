"use client";

import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Play,
  Pause,
  Share2,
  Calendar,
  Clock,
  Volume2,
  FileText,
  Globe,
  Lock,
  Download,
  Twitter,
  Linkedin,
  Copy,
} from "lucide-react";
import { useState, useRef } from "react";

// Mock data for demonstration
const mockBriefs = [
  {
    id: 1,
    date: "2024-01-15",
    title: "Friday Morning Brief",
    summary: "Top stories from tech, finance, and world news",
    isPublic: false,
    audioUrl: "/audio/brief-1.mp3",
    textContent: `**Tech News**
• Apple announces new MacBook Pro with M4 chip, featuring improved performance and battery life
• OpenAI releases GPT-5 with enhanced reasoning capabilities
• Meta reports strong Q4 earnings driven by AI advertising

**Finance**
• Federal Reserve holds interest rates steady at 5.25-5.5%
• Tesla stock surges 12% after beating delivery expectations
• Bitcoin reaches new all-time high above $45,000

**World News**
• Climate summit in Dubai reaches historic agreement on fossil fuel transition
• Japan announces plans for lunar base construction by 2030
• European Union implements new AI regulation framework`,
    topics: ["Technology", "Finance", "World News"],
    sources: 12,
    readTime: "3 min"
  },
  {
    id: 2,
    date: "2024-01-14",
    title: "Thursday Morning Brief",
    summary: "Breaking developments in AI and global markets",
    isPublic: true,
    audioUrl: "/audio/brief-2.mp3",
    textContent: `**AI & Technology**
• Google's Gemini Pro now available for enterprise customers
• Microsoft integrates advanced AI into Office suite
• Nvidia announces new data center chips for AI workloads

**Global Markets**
• Asian markets rally on positive economic data from China
• Oil prices stabilize after Middle East tensions ease
• Gold hits 6-month high amid inflation concerns

**Health & Science**
• New Alzheimer's drug shows promising trial results
• Scientists develop breakthrough in quantum computing error correction
• WHO declares end to latest Ebola outbreak in West Africa`,
    topics: ["AI", "Global Markets", "Health"],
    sources: 15,
    readTime: "4 min"
  },
  {
    id: 3,
    date: "2024-01-13",
    title: "Wednesday Morning Brief",
    summary: "Space exploration and renewable energy advances",
    isPublic: false,
    audioUrl: "/audio/brief-3.mp3",
    textContent: `**Space & Science**
• SpaceX successfully launches Mars supply mission
• NASA's James Webb telescope discovers potentially habitable exoplanet
• China announces crewed mission to Mars for 2030

**Energy & Environment**
• Solar panel efficiency breakthrough reaches 30% conversion rate
• Major oil companies pledge carbon neutrality by 2040
• Wind energy capacity doubles in offshore installations

**Business**
• Amazon reports record holiday sales driven by AI recommendations
• Stripe valued at $95 billion in latest funding round
• EV charging network expansion accelerates across US highways`,
    topics: ["Space", "Energy", "Business"],
    sources: 18,
    readTime: "5 min"
  }
];

export default function BriefsPage() {
  const [selectedBrief, setSelectedBrief] = useState(mockBriefs[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingBriefId, setPlayingBriefId] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePublic = (briefId: number) => {
    // In a real app, this would make an API call
    console.log(`Toggling public status for brief ${briefId}`);
    // This is a mock implementation to update the UI state
    setSelectedBrief(prev => ({...prev, isPublic: !prev.isPublic}));
  };

  const handlePlayPause = (brief: typeof mockBriefs[0]) => {
    if (audioRef.current && playingBriefId === brief.id) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const newAudio = new Audio(brief.audioUrl);
      newAudio.oncanplay = () => {
        newAudio.play();
        setIsPlaying(true);
        setPlayingBriefId(brief.id);
      };
      newAudio.onended = () => {
        setIsPlaying(false);
        setPlayingBriefId(null);
      };
      audioRef.current = newAudio;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-newsreader text-3xl md:text-4xl font-bold mb-2">
            Your Morning Briefs
          </h1>
          <p className="text-muted-foreground text-lg">
            Access your personalized daily news from the past 30 days
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Brief List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Recent Briefs</h2>
              <Badge variant="secondary">
                {mockBriefs.length} briefs
              </Badge>
            </div>

            {mockBriefs.map((brief) => (
              <Card
                key={brief.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedBrief.id === brief.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedBrief(brief)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {new Date(brief.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    {brief.isPublic ? (
                      <Globe className="h-4 w-4 text-green-600" />
                    ) : (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <CardTitle className="text-lg">{brief.title}</CardTitle>
                  <CardDescription>{brief.summary}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <FileText className="h-3 w-3 mr-1" />
                        {brief.readTime}
                      </span>
                      <span>{brief.sources} sources</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayPause(brief);
                        }}
                      >
                        {playingBriefId === brief.id && isPlaying ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Brief Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-newsreader text-2xl">
                      {selectedBrief.title}
                    </CardTitle>
                    <CardDescription className="flex items-center space-x-4 mt-2">
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(selectedBrief.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {selectedBrief.readTime} read
                      </span>
                      <span>{selectedBrief.sources} sources</span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Share Your Morning Brief</DialogTitle>
                          <DialogDescription>
                            Make this brief public to get a shareable link and post it to social media.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex items-center justify-between py-4 border-b">
                          <div className="space-y-1">
                            <p className="font-medium">Make Public</p>
                            <p className="text-sm text-muted-foreground">
                              Share this brief with the Callia community.
                            </p>
                          </div>
                          <Switch
                            checked={selectedBrief.isPublic}
                            onCheckedChange={() => togglePublic(selectedBrief.id)}
                          />
                        </div>
                        <div className="pt-4 space-y-4">
                            <label className="text-sm font-medium">Shareable Link</label>
                            <div className="flex items-center space-x-2">
                                <input
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    disabled={!selectedBrief.isPublic}
                                    value={selectedBrief.isPublic ? `https://callia.com/briefs/${selectedBrief.id}` : ''}
                                    readOnly
                                />
                                <Button variant="outline" size="sm" disabled={!selectedBrief.isPublic}>
                                    <Copy className="h-4 w-4"/>
                                </Button>
                            </div>
                        </div>
                        <div className="pt-4 flex items-center space-x-2">
                            <Button variant="outline" size="sm" disabled={!selectedBrief.isPublic}>
                                <Twitter className="h-4 w-4 mr-2"/>
                                Twitter
                            </Button>
                             <Button variant="outline" size="sm" disabled={!selectedBrief.isPublic}>
                                <Linkedin className="h-4 w-4 mr-2"/>
                                LinkedIn
                            </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                {/* Topics */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {selectedBrief.topics.map((topic) => (
                    <Badge key={topic} variant="secondary">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </CardHeader>

              <CardContent>
                <Tabs defaultValue="text" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="text" className="flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      Text Format
                    </TabsTrigger>
                    <TabsTrigger value="audio" className="flex items-center">
                      <Volume2 className="h-4 w-4 mr-2" />
                      Audio Format
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="text" className="mt-6">
                    <div className="prose max-w-none">
                      <div className="whitespace-pre-line text-foreground leading-relaxed">
                        {selectedBrief.textContent}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="audio" className="mt-6">
                    <div className="space-y-6">
                      <Card className="bg-muted/50">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <Button
                                size="lg"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePlayPause(selectedBrief);
                                }}
                              >
                                {playingBriefId === selectedBrief.id && isPlaying ? (
                                  <Pause className="h-5 w-5" />
                                ) : (
                                  <Play className="h-5 w-5" />
                                )}
                              </Button>
                              <div>
                                <p className="font-medium">Audio Brief</p>
                                <p className="text-sm text-muted-foreground">
                                  {selectedBrief.readTime} • High quality AI voice
                                </p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>

                          {/* Audio Progress Bar */}
                          <div className="mt-4">
                            <div className="w-full bg-muted rounded-full h-2">
                              <div className="bg-primary h-2 rounded-full" style={{ width: '45%' }}></div>
                            </div>
                            <div className="flex justify-between text-sm text-muted-foreground mt-1">
                              <span>1:23</span>
                              <span>3:05</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <div className="text-center">
                        <p className="text-muted-foreground mb-4">
                          Listen to your brief while commuting, exercising, or multitasking
                        </p>
                        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                          <div className="text-center">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                              <Volume2 className="h-6 w-6 text-primary" />
                            </div>
                            <p className="text-sm font-medium">High Quality</p>
                            <p className="text-xs text-muted-foreground">AI Voice</p>
                          </div>
                          <div className="text-center">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                              <Download className="h-6 w-6 text-primary" />
                            </div>
                            <p className="text-sm font-medium">Offline</p>
                            <p className="text-xs text-muted-foreground">Download</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
