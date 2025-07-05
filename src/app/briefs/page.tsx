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
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

// Types for brief data
interface UserBrief {
  id: string;
  date: string;
  audio: string;
  audioScript: string;
  textContent: string;
  sources: number;
}

// Function to fetch user briefs from Supabase
const fetchUserBriefs = async (userId: string): Promise<UserBrief[]> => {
  const { data, error } = await supabase
    .from('user_brief')
    .select('user_id, brief_date, brief_content, news_source_ids, brief_audio_url, brief_audio_script')
    .eq('user_id', userId)
    .order('brief_date', { ascending: false })
    .limit(15);

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
      audio: brief.brief_audio_url || "",
      audioScript: brief.brief_audio_script || "",
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
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isScriptExpanded, setIsScriptExpanded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Helper function to format time in MM:SS format
  const formatTime = (timeInSeconds: number): string => {
    if (isNaN(timeInSeconds) || timeInSeconds < 0) return '0:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Handle seeking in audio
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current && duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const seekTime = (clickX / rect.width) * duration;
      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  // Handle audio download
  const handleDownload = (brief: UserBrief) => {
    if (!brief.audio) {
      console.error('No audio URL available for download');
      return;
    }

    try {
      // Create download link directly from URL
      const link = document.createElement('a');
      link.href = brief.audio;
      link.download = `morning-brief-${new Date(brief.date).toISOString().split('T')[0]}.mp3`;
      link.target = '_blank'; // Open in new tab to handle cross-origin issues

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading audio:', error);
    }
  };

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

      // Reset progress when switching to different audio
      setCurrentTime(0);
      setDuration(0);

      // Handle audio URL
      if (brief.audio) {
        // Create Audio object directly from URL
        const newAudio = new Audio(brief.audio);

        // Add event listeners for progress tracking
        newAudio.onloadedmetadata = () => {
          setDuration(newAudio.duration);
        };

        newAudio.ontimeupdate = () => {
          setCurrentTime(newAudio.currentTime);
        };

        newAudio.oncanplay = () => {
          newAudio.play();
          setIsPlaying(true);
          setPlayingBriefId(brief.id);
        };

        newAudio.onended = () => {
          setIsPlaying(false);
          setPlayingBriefId(null);
          setCurrentTime(0);
        };

        newAudio.onerror = () => {
          console.error('Audio playback error');
          setIsPlaying(false);
          setPlayingBriefId(null);
          setCurrentTime(0);
        };

        audioRef.current = newAudio;
      }
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
              <h2 className="text-2xl font-bold mb-4">Please sign in to begin your morning brief journey</h2>
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
              Access your personalized daily briefs
            </p>
          </div>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-4">No briefs found</h2>
              <p className="text-muted-foreground">
                Try to subscribe to some news sources and your daily briefs will appear here once they&apos;re generated.
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
            Access your personalized daily briefs
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
                      {brief.audio && (
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
                      )}
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
                  <TabsList className={`grid w-full ${selectedBrief.audio ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    <TabsTrigger value="text" className="flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      Text Format
                    </TabsTrigger>
                    {selectedBrief.audio && (
                      <TabsTrigger value="audio" className="flex items-center">
                        <Volume2 className="h-4 w-4 mr-2" />
                        Audio Format
                      </TabsTrigger>
                    )}
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

                  {selectedBrief.audio && (
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
                                    {duration > 0 ? `${Math.ceil(duration / 60)} min` : '~3 min'} • High quality AI voice
                                  </p>
                                </div>
                              </div>
                                                          <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(selectedBrief);
                              }}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                            </div>

                                                        {/* Audio Progress Bar */}
                            <div className="mt-4">
                              <div
                                className="w-full bg-muted rounded-full h-2 cursor-pointer"
                                onClick={handleSeek}
                              >
                                <div
                                  className="bg-primary h-2 rounded-full transition-all duration-200"
                                  style={{ width: `${progressPercentage}%` }}
                                ></div>
                              </div>
                              <div className="flex justify-between text-sm text-muted-foreground mt-1">
                                <span>{formatTime(currentTime)}</span>
                                <span>{formatTime(duration)}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <div className="text-center">
                          <p className="text-muted-foreground mb-4">
                            Listen to your brief while commuting, exercising, or multitasking
                          </p>
                          {/* <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
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
                          </div> */}

                           {/* Audio Script Section */}
                           {selectedBrief.audioScript && (
                             <div className="mt-6">
                               <div className="flex items-center">
                                 <div className="flex-1 h-px bg-border"></div>
                                 <Button
                                   variant="ghost"
                                   size="sm"
                                   onClick={() => setIsScriptExpanded(!isScriptExpanded)}
                                   className="mx-3 h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                                 >
                                   {isScriptExpanded ? (
                                     <ChevronUp className="h-3 w-3 mr-1" />
                                   ) : (
                                     <ChevronDown className="h-3 w-3 mr-1" />
                                   )}
                                   Audio Script
                                 </Button>
                                 <div className="flex-1 h-px bg-border"></div>
                               </div>

                               {isScriptExpanded && (
                                 <div className="mt-4">
                                   <div className="prose max-w-none dark:prose-invert text-sm text-left">
                                     <ReactMarkdown
                                       remarkPlugins={[remarkGfm]}
                                       components={{
                                         p: ({...props}) => <p className="mb-2 text-muted-foreground text-left" {...props} />,
                                         strong: ({...props}) => <strong className="font-medium text-foreground" {...props} />,
                                       }}
                                     >
                                       {selectedBrief.audioScript}
                                     </ReactMarkdown>
                                   </div>
                                 </div>
                               )}
                             </div>
                           )}
                          </div>
                      </div>
                    </TabsContent>
                  )}
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
