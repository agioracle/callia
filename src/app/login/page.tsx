import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Chrome } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex items-center min-h-screen bg-background">
      <div className="container mx-auto max-w-sm">
        <Card>
          <CardHeader className="text-center">
            <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center mx-auto mb-4">
              <span className="text-primary-foreground font-bold text-2xl">C</span>
            </div>
            <CardTitle className="font-newsreader text-2xl">Welcome Back to Callia</CardTitle>
            <CardDescription>
              Log in to access your personalized morning briefs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email">Email</label>
                <Input id="email" type="email" placeholder="name@example.com" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="password">Password</label>
                <Input id="password" type="password" required />
              </div>
              <Button type="submit" className="w-full">
                Log In
              </Button>
            </form>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              <Chrome className="mr-2 h-4 w-4" />
              Log in with Google
            </Button>
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
