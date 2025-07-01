"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Footer from "@/components/Footer";
import {
  Play,
  Pause,
  Calendar,
  Volume2,
  FileText,
  Lock,
  Download,
  Loader2,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

// Types for brief data
interface UserBrief {
  id: string;
  date: string;
  audioUrl: string;
  textContent: string;
  sources: number;
}

// Function to fetch user briefs from Supabase
const fetchUserBriefs = async (userId: string): Promise<UserBrief[]> => {
  const { data, error } = await supabase
    .from('user_brief')
    .select('user_id, brief_date, brief_content, news_source_ids')
    .eq('user_id', userId)
    .order('brief_date', { ascending: false })
    .limit(7);

  if (error) {
    console.error('Error fetching user briefs:', error);
    return [];
  }

  // Transform the data from Supabase to match our UI structure
  return data.map((brief) => {
    let parsedContent;
    try {
      // Try to parse brief_content as JSON if it contains structured data
      parsedContent = typeof brief.brief_content === 'string'
        ? JSON.parse(brief.brief_content)
        : brief.brief_content;
    } catch {
      // If not JSON, treat as plain text
      parsedContent = { textContent: brief.brief_content };
    }

    // Calculate sources count from news_source_ids length
    let sourcesCount = 0;
    if (brief.news_source_ids) {
      if (Array.isArray(brief.news_source_ids)) {
        sourcesCount = brief.news_source_ids.length;
      } else if (typeof brief.news_source_ids === 'string') {
        try {
          const parsedIds = JSON.parse(brief.news_source_ids);
          sourcesCount = Array.isArray(parsedIds) ? parsedIds.length : 0;
        } catch {
          // If it's a comma-separated string, split and count
          sourcesCount = brief.news_source_ids.split(',').filter(id => id.trim()).length;
        }
      }
    }

    return {
      id: brief.user_id + '-' + brief.brief_date, // Create unique ID
      date: brief.brief_date,
      audioUrl: parsedContent.audioUrl || "/audio/brief-placeholder.mp3",
      textContent: parsedContent.textContent || brief.brief_content,
      sources: sourcesCount,
    };
  });
};

export default function BriefsPage() {
  const { user, loading: authLoading } = useAuth();
  const [briefs, setBriefs] = useState<UserBrief[]>([]);
  const [selectedBrief, setSelectedBrief] = useState<UserBrief | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingBriefId, setPlayingBriefId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch briefs when user is available
  useEffect(() => {
    const loadBriefs = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const userBriefs = await fetchUserBriefs(user.id);
        setBriefs(userBriefs);
        if (userBriefs.length > 0) {
          setSelectedBrief(userBriefs[0]);
        }
      } catch (err) {
        setError('Failed to load briefs');
        console.error('Error loading briefs:', err);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      loadBriefs();
    }
  }, [user, authLoading]);



  const handlePlayPause = (brief: UserBrief) => {
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

  // Show loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <p>Loading your briefs...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show login prompt if no user
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Please sign in to view your briefs</h2>
              <Button onClick={() => window.location.href = '/login'}>
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state if no briefs
  if (briefs.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <div className="mb-8">
            <h1 className="font-newsreader text-3xl md:text-4xl font-bold mb-2">
              Your Morning Briefs
            </h1>
            <p className="text-muted-foreground text-lg">
              Access your personalized daily briefs from the past 7 days
            </p>
          </div>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-4">No briefs found</h2>
              <p className="text-muted-foreground">
                Your daily briefs will appear here once they&apos;re generated.
              </p>
            </div>
          </div>
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
            Your Morning Briefs
          </h1>
          <p className="text-muted-foreground text-lg">
            Access your personalized daily briefs from the past 7 days
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Brief List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Recent Briefs</h2>
              <Badge variant="secondary">
                {briefs.length} briefs
              </Badge>
            </div>

            {briefs.map((brief) => (
              <Card
                key={brief.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedBrief?.id === brief.id ? 'ring-2 ring-primary' : ''
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
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-lg">
                    Morning Brief - {new Date(brief.date).toLocaleDateString('en-US', { weekday: 'long' })}
                  </CardTitle>
                  <CardDescription>Your personalized daily briefs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-4">
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
            {!selectedBrief ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">Select a brief to view its content</p>
                </CardContent>
              </Card>
            ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-newsreader text-2xl">
                      Morning Brief - {new Date(selectedBrief.date).toLocaleDateString('en-US', { weekday: 'long' })}
                    </CardTitle>
                    <CardDescription className="flex items-center space-x-4 mt-2">
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(selectedBrief.date).toLocaleDateString()}
                      </span>
                      <span>{selectedBrief.sources} sources</span>
                    </CardDescription>
                  </div>

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
                    <div className="prose max-w-none dark:prose-invert text-foreground leading-relaxed">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({...props}) => <h1 className="text-2xl font-bold mb-4" {...props} />,
                          h2: ({...props}) => <h2 className="text-xl font-semibold mb-3" {...props} />,
                          h3: ({...props}) => <h3 className="text-lg font-medium mb-2" {...props} />,
                          p: ({...props}) => <p className="mb-4" {...props} />,
                          ul: ({...props}) => <ul className="list-disc pl-6 mb-4" {...props} />,
                          ol: ({...props}) => <ol className="list-decimal pl-6 mb-4" {...props} />,
                          li: ({...props}) => <li className="mb-1" {...props} />,
                          blockquote: ({...props}) => <blockquote className="border-l-4 border-primary pl-4 italic mb-4" {...props} />,
                          code: ({...props}) => <code className="bg-muted px-1 py-0.5 rounded text-sm" {...props} />,
                          pre: ({...props}) => <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-4" {...props} />,
                          strong: ({...props}) => <strong className="font-semibold" {...props} />,
                          em: ({...props}) => <em className="italic" {...props} />,
                          a: ({...props}) => <a className="text-primary hover:underline" {...props} />,
                        }}
                      >
                        {selectedBrief.textContent}
                      </ReactMarkdown>
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
                                  3 min • High quality AI voice
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
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
