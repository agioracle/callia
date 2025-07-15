"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { ensureCurrentUserProfile } from '@/lib/auth';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // Get initial session with timeout
    const getSession = async () => {
      try {
        // Add timeout to prevent indefinite loading
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Session timeout')), 10000)
        );

        const sessionPromise = supabase.auth.getSession();

                        const result = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]);

        if (!isMounted) return;

        // Type guard to ensure we have the correct result
        if (result && typeof result === 'object' && 'data' in result) {
          const { data: { session } } = result as { data: { session: any } };
          setUser(session?.user ?? null);

          // Ensure user profile exists if user is logged in
          if (session?.user) {
            try {
              await ensureCurrentUserProfile();
            } catch (error) {
              console.error('Error ensuring user profile in AuthContext:', error);
            }
          }
        } else {
          setUser(null);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error getting session:', error);
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        console.log('Auth state changed:', event);
        setUser(session?.user ?? null);

        // Ensure user profile exists when user signs in
        if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          try {
            await ensureCurrentUserProfile();
          } catch (error) {
            console.error('Error ensuring user profile on auth change:', error);
          }
        }

        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    loading,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
