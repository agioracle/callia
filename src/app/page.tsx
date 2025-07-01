"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Footer from "@/components/Footer";
import PricingPlans from "@/components/PricingPlans";
import {
  Globe,
  Headphones,
  Users,
  Star,
  ArrowRight,
  Clock,
  Shield,
  Sparkles
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-8">
            <Badge variant="secondary" className="text-sm px-4 py-2">
              Callia: Your Personalized Morning Briefings
            </Badge>

            <h1 className="font-newsreader text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Your Personalized Daily Morning Briefs Powered by AI
            </h1>

            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Access your personalized daily morning briefs and keep up with the latest news.
            </p>

            <div className="flex flex-row gap-4 justify-center items-center">
              <Button size="lg" className="px-8 py-6 text-lg" onClick={() => router.push('/briefs')}>
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-6 text-lg" onClick={() => router.push('/community')}>
                View Sources
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <h2 className="font-newsreader text-3xl md:text-4xl font-bold mb-4">
              Everything You Need for Perfect Morning Briefs
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From news crawling to audio generation, we&apos;ve got your morning briefs covered.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-sm hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>News Crawling</CardTitle>
                <CardDescription>
                  Automatically crawl and aggregate news from your preferred sources and RSS feeds with intelligent filtering.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>AI-Powered Summaries</CardTitle>
                <CardDescription>
                  Get concise, relevant summaries of the day&apos;s top stories tailored to your interests and preferences.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Headphones className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Audio Briefings</CardTitle>
                <CardDescription>
                  Listen to your morning briefings with high-quality AI-generated audio while commuting or exercising.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Daily History</CardTitle>
                <CardDescription>
                  Access your past 15 days of morning briefings with full search and filtering capabilities.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Community Sharing</CardTitle>
                <CardDescription>
                  Share and discover your favorite news sources with the community.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Source Management</CardTitle>
                <CardDescription>
                  Easily manage your news sources and subscriptions.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <h2 className="font-newsreader text-3xl md:text-4xl font-bold mb-4">
              Loved by News Enthusiasts
            </h2>
            <p className="text-lg text-muted-foreground">
              See what our users say about their morning briefing experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center space-x-4 mb-4">
                  <Avatar>
                    <AvatarImage src="/placeholder-avatar-1.jpg" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold">John Doe</h4>
                    <p className="text-sm text-muted-foreground">Tech Executive</p>
                  </div>
                </div>
                <div className="flex space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  &quot;Callia has transformed my morning routine. I get perfectly curated news briefings that save me hours of reading while keeping me informed.&quot;
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center space-x-4 mb-4">
                  <Avatar>
                    <AvatarImage src="/placeholder-avatar-2.jpg" />
                    <AvatarFallback>SM</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold">Sarah Miller</h4>
                    <p className="text-sm text-muted-foreground">Journalist</p>
                  </div>
                </div>
                <div className="flex space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  &quot;The audio briefings are a game-changer. I listen during my commute and arrive at work fully briefed on the day&apos;s important news.&quot;
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center space-x-4 mb-4">
                  <Avatar>
                    <AvatarImage src="/placeholder-avatar-3.jpg" />
                    <AvatarFallback>MJ</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold">Mike Johnson</h4>
                    <p className="text-sm text-muted-foreground">Business Analyst</p>
                  </div>
                </div>
                <div className="flex space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  &quot;Love the community feature! I&apos;ve discovered amazing news sources shared by other users and improved my daily briefings significantly.&quot;
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto max-w-4xl px-4">
          <PricingPlans />
        </div>
      </section>

      <Footer />
    </div>
  );
}
