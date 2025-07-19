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
  ChevronUp
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

// Types for brief data
interface UserBrief {
  id: string;
  date: string;
  audio: string;
  audioScript: string;
  textContent: string;
  sources: number;
  isDemo?: boolean;
}

// Function to fetch user briefs from API
const fetchUserBriefs = async (authToken: string): Promise<UserBrief[]> => {
  try {
    const response = await fetch('/api/briefs', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching user briefs:', error)
    return []
  }
};

export default function BriefsPage() {
  const { user, loading: authLoading, getValidSession } = useAuth();
  const [briefs, setBriefs] = useState<UserBrief[]>([]);
  const [selectedBrief, setSelectedBrief] = useState<UserBrief | null>(null);
  const [loading, setLoading] = useState(false); // Change initial state to false
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingBriefId, setPlayingBriefId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isScriptExpanded, setIsScriptExpanded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

    // Performance optimization states
  const [isPageVisible, setIsPageVisible] = useState<boolean>(true);
  const [dataLoaded, setDataLoaded] = useState<boolean>(false);
  const [showLoadingTimeout, setShowLoadingTimeout] = useState(false);
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

  // Use useRef to track cache time to avoid triggering re-renders
  const lastFetchTimeRef = useRef<number>(0);

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

  // Optimized fetch briefs with caching and better error handling
  useEffect(() => {
    const loadBriefs = async () => {
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
      const hasData = briefs.length > 0;
      const shouldSkipFetch = hasData &&
                             now - lastFetchTimeRef.current < CACHE_DURATION;

      // Skip fetching if we have cached data and it's still fresh
      if (shouldSkipFetch) {
        console.log('Using cached briefs data');
        setDataLoaded(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // 使用AuthContext的缓存session而不是重新获取
        const validSession = await getValidSession();

        if (!validSession?.access_token) {
          throw new Error('No access token available');
        }

        const userBriefs = await fetchUserBriefs(validSession.access_token);
        setBriefs(userBriefs);
        if (userBriefs.length > 0) {
          setSelectedBrief(userBriefs[0]);
        }
        lastFetchTimeRef.current = now;
        setDataLoaded(true);

        console.log('Fetched fresh briefs data');
      } catch (err) {
        setError('Failed to load briefs');
        console.error('Error loading briefs:', err);
      } finally {
        setLoading(false);
      }
    };

    // Only load if page is visible and we haven't loaded data yet, or if we need to refresh
    if (!authLoading && (isPageVisible || !dataLoaded)) {
      loadBriefs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, isPageVisible, getValidSession]);

  // Manual refresh function
  // const handleManualRefresh = async () => {
  //   if (!user) return;

  //   try {
  //     setLoading(true);
  //     setError(null);

  //     // Get the current session to extract the access token
  //     const { supabase } = await import('@/lib/supabase');
  //     const { data: { session } } = await supabase.auth.getSession();

  //     if (!session?.access_token) {
  //       throw new Error('No access token available');
  //     }

  //     const userBriefs = await fetchUserBriefs(session.access_token);
  //     setBriefs(userBriefs);
  //     if (userBriefs.length > 0) {
  //       setSelectedBrief(userBriefs[0]);
  //     }
  //     lastFetchTimeRef.current = Date.now();

  //     console.log('Manual refresh completed');
  //   } catch (err) {
  //     console.error('Error during manual refresh:', err);
  //     setError('Failed to refresh briefs');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

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
  if (showLoadingTimeout) {
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
              <h1 className="font-newsreader text-3xl md:text-4xl font-bold mb-4">
                Your News Briefings
              </h1>
              <p className="text-muted-foreground text-lg mb-8">
                Please log in to view your news briefings.
              </p>
              <Button onClick={() => window.location.href = '/login'}>
                Sign In
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Show empty state if no briefs
  if (briefs.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <div className="mb-8">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="font-newsreader text-3xl md:text-4xl font-bold mb-2">
                  Your News Briefings
                </h1>
                <p className="text-muted-foreground text-lg">
                  Access your personalized daily news briefings
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
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-4">No briefs found</h2>
              <p className="text-muted-foreground mb-4">
                Try to subscribe to some news sources and your daily briefs will appear here once they&apos;re generated.
              </p>
              {/* <Button
                variant="outline"
                onClick={handleManualRefresh}
                disabled={loading}
                className="flex items-center"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Check Again
              </Button> */}
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
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-newsreader text-3xl md:text-4xl font-bold mb-2">
                Your News Briefings
              </h1>
              <p className="text-muted-foreground text-lg">
                Access your personalized daily news briefings
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
                      {brief.isDemo && (
                        <Badge variant="secondary" className="text-xs">
                          Demo
                        </Badge>
                      )}
                    </div>
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-lg">
                    {brief.isDemo ? "Demo Brief" : `Morning Brief - ${new Date(brief.date).toLocaleDateString('en-US', { weekday: 'long' })}`}
                  </CardTitle>
                  <CardDescription>
                    {brief.isDemo ? "Sample brief to get you started" : "Your personalized daily briefs"}
                  </CardDescription>
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
                      {selectedBrief.isDemo ? "Demo Brief" : `Morning Brief - ${new Date(selectedBrief.date).toLocaleDateString('en-US', { weekday: 'long' })}`}
                    </CardTitle>
                    <CardDescription className="flex items-center space-x-4 mt-2">
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(selectedBrief.date).toLocaleDateString()}
                      </span>
                      <span>{selectedBrief.sources} sources</span>
                      {selectedBrief.isDemo && (
                        <Badge variant="secondary" className="text-xs">
                          Demo
                        </Badge>
                      )}
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
