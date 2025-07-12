"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Chrome } from "lucide-react";
import { signIn, signInWithGoogle, ensureCurrentUserProfile } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";
import { Turnstile } from "@/components/ui/turnstile";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const router = useRouter();
  const { user, loading } = useAuth();

  // Handle OAuth callback and ensure user profile
  useEffect(() => {
    const handleOAuthCallback = async () => {
      if (user && !loading) {
        try {
          // Ensure user profile exists after OAuth
          await ensureCurrentUserProfile();
          // Redirect to home page
          router.push("/");
        } catch (error) {
          console.error("Error ensuring user profile:", error);
        }
      }
    };

    handleOAuthCallback();
  }, [user, loading, router]);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      router.push("/");
    }
  }, [user, loading, router]);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Check if Turnstile token is available
    if (!turnstileToken) {
      setError("Please complete the verification challenge.");
      setIsLoading(false);
      return;
    }

    try {
      // Verify Turnstile token with our API
      const verifyResponse = await fetch("/api/verify-turnstile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: turnstileToken }),
      });

      const verifyResult = await verifyResponse.json();

      if (!verifyResult.success) {
        setError("Verification failed. Please complete the verification again.");
        setTurnstileToken(null);
        setIsLoading(false);
        return;
      }

      // Proceed with login after successful verification
      const { error } = await signIn(email, password);

      if (error) {
        setError(error.message);
      } else {
        // Redirect to home page on successful login
        router.push("/");
      }
    } catch (verifyError) {
      console.error("Verification error:", verifyError);
      setError("An error occurred during verification. Please try again.");
    }

    setIsLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    const { error } = await signInWithGoogle();

    if (error) {
      setError(error.message);
      setIsLoading(false);
    }
    // Note: Google OAuth will redirect, so no need to set loading to false
    // The useEffect will handle the callback and profile creation
  };

  // Don't render the form if user is already logged in
  if (user && !loading) {
    return null;
  }

  return (
    <div className="flex items-center min-h-screen bg-background">
      <div className="container mx-auto max-w-sm">
        <Card>
          <CardHeader className="text-center">
            <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center mx-auto mb-4">
              <span className="text-primary-foreground font-bold text-2xl">C</span>
            </div>
            <CardTitle className="font-newsreader text-2xl">Welcome Back to Briefily</CardTitle>
            <CardDescription>
              Log in to access your personalized morning news briefings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            <Button
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={isLoading || loading}
            >
              <Chrome className="mr-2 h-4 w-4" />
              {isLoading ? "Signing in..." : "Log in with Google"}
            </Button>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>
            <form className="space-y-4" onSubmit={handleEmailSignIn}>
              <div className="space-y-2">
                <label htmlFor="email">Email</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading || loading}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password">Password</label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading || loading}
                />
              </div>
              <div className="space-y-4">
                <Turnstile
                  key={turnstileToken ? "verified" : "pending"}
                  sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""}
                  onSuccess={(token) => {
                    setTurnstileToken(token);
                    setError(null); // Clear any previous errors
                  }}
                  onError={(errorMessage) => {
                    setTurnstileToken(null);
                    setError(errorMessage || "Verification failed. Please try again.");
                  }}
                  onExpired={() => {
                    setTurnstileToken(null);
                    setError("Verification expired. Please try again.");
                  }}
                  disabled={isLoading || loading}
                />
                <Button type="submit" className="w-full" disabled={isLoading || loading || !turnstileToken}>
                  {isLoading ? "Logging in..." : "Log In"}
                </Button>
              </div>
            </form>
            <div className="mt-6 text-center text-sm">
              <p className="text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="text-primary hover:underline font-medium">
                  Sign Up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
