"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { ensureCurrentUserProfile } from '@/lib/auth';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  getValidSession: () => Promise<Session | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Session缓存相关状态
  const [sessionCache, setSessionCache] = useState<{
    session: Session | null;
    lastFetchTime: number;
    isValid: boolean;
  }>({
    session: null,
    lastFetchTime: 0,
    isValid: false
  });

  // 检查session是否仍然有效（距离过期还有至少5分钟）
  const isSessionValid = useCallback((session: Session | null): boolean => {
    if (!session?.access_token) return false;

    try {
      // 解析JWT payload获取过期时间
      const tokenParts = session.access_token.split('.');
      if (tokenParts.length !== 3) return false;

      const payload = JSON.parse(atob(tokenParts[1]));
      const expirationTime = payload.exp * 1000; // 转换为毫秒
      const currentTime = Date.now();
      const timeUntilExpiry = expirationTime - currentTime;

      // 如果距离过期还有5分钟以上，认为是有效的
      return timeUntilExpiry > 5 * 60 * 1000;
    } catch (error) {
      console.error('Error parsing JWT token:', error);
      return false;
    }
  }, []);

  // 获取有效的session，使用缓存避免频繁请求
  const getValidSession = useCallback(async (): Promise<Session | null> => {
    const now = Date.now();
    const cacheAge = now - sessionCache.lastFetchTime;

    // 如果缓存的session仍然有效且获取时间不超过2分钟，直接返回缓存
    if (
      sessionCache.session &&
      sessionCache.isValid &&
      cacheAge < 2 * 60 * 1000 &&
      isSessionValid(sessionCache.session)
    ) {
      console.log('Using cached session');
      return sessionCache.session;
    }

    try {
      console.log('Fetching fresh session');
      // 添加超时机制，但增加到30秒
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Session timeout')), 30000)
      );

      const sessionPromise = supabase.auth.getSession();
      const result = await Promise.race([sessionPromise, timeoutPromise]);

      if (result && typeof result === 'object' && 'data' in result) {
        const { data: { session: freshSession } } = result as { data: { session: Session | null } };
        const isValid = isSessionValid(freshSession);

        // 更新缓存
        setSessionCache({
          session: freshSession,
          lastFetchTime: now,
          isValid
        });

        return freshSession;
      }

      return null;
    } catch (error) {
      console.error('Error getting session:', error);

      // 如果获取失败，但缓存中有session且还没完全过期，返回缓存的session
      if (sessionCache.session && isSessionValid(sessionCache.session)) {
        console.log('Using cached session as fallback');
        return sessionCache.session;
      }

      return null;
    }
  }, [sessionCache, isSessionValid]);

  useEffect(() => {
    let isMounted = true;

    // 改进的获取初始session逻辑
    const getSession = async (retryCount = 0) => {
      try {
        const freshSession = await getValidSession();

        if (!isMounted) return;

        setSession(freshSession);
        setUser(freshSession?.user ?? null);

        // Ensure user profile exists if user is logged in
        if (freshSession?.user) {
          try {
            await ensureCurrentUserProfile();
          } catch (error) {
            console.error('Error ensuring user profile in AuthContext:', error);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Error getting session:', error);

        // Retry logic: retry up to 2 times with exponential backoff
        if (retryCount < 2 && isMounted) {
          console.log(`Retrying session fetch (attempt ${retryCount + 1})...`);
          setTimeout(() => {
            if (isMounted) {
              getSession(retryCount + 1);
            }
          }, Math.pow(2, retryCount) * 1000); // Exponential backoff: 1s, 2s
          return;
        }

        // If all retries failed, set user to null and stop loading
        if (isMounted) {
          setUser(null);
          setSession(null);
          setLoading(false);
        }
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!isMounted) return;

        console.log('Auth state changed:', event);

        // 更新session和user状态
        setSession(newSession);
        setUser(newSession?.user ?? null);

        // 更新session缓存
        const isValid = isSessionValid(newSession);
        setSessionCache({
          session: newSession,
          lastFetchTime: Date.now(),
          isValid
        });

        // Ensure user profile exists when user signs in
        if (newSession?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
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
  }, [isSessionValid]); // 移除 getValidSession 依赖，避免循环

  const signOut = async () => {
    // 清除缓存
    setSessionCache({
      session: null,
      lastFetchTime: 0,
      isValid: false
    });
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    signOut,
    getValidSession,
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
