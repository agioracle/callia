"use client";

import { useEffect, useRef } from "react";

interface TurnstileProps {
  sitekey: string;
  onSuccess: (token: string) => void;
  onError?: (error: string) => void;
  onExpired?: () => void;
  disabled?: boolean;
  className?: string;
}

declare global {
  interface Window {
    turnstile: {
      ready: (callback: () => void) => void;
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback"?: (error: string) => void;
          "expired-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "compact";
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

export function Turnstile({
  sitekey,
  onSuccess,
  onError,
  onExpired,
  disabled = false,
  className = "",
}: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const isInitializedRef = useRef(false);

  // We use refs to store the latest callback functions to avoid re-rendering
  // the Turnstile widget when callbacks change

  // Handle callback updates without re-initializing the widget
  const callbacksRef = useRef({
    onSuccess,
    onError: onError || (() => {}),
    onExpired: onExpired || (() => {}),
  });

  // Update callback refs when props change
  useEffect(() => {
    callbacksRef.current = {
      onSuccess,
      onError: onError || (() => {}),
      onExpired: onExpired || (() => {}),
    };
  }, [onSuccess, onError, onExpired]);

  useEffect(() => {
    if (!containerRef.current || disabled || isInitializedRef.current) return;

    const loadTurnstile = () => {
      if (!window.turnstile || !containerRef.current) return;

      try {
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey,
          callback: (token: string) => callbacksRef.current.onSuccess(token),
          "error-callback": (error: string) => callbacksRef.current.onError(error),
          "expired-callback": () => callbacksRef.current.onExpired(),
          theme: "auto",
          size: "normal",
        });
        isInitializedRef.current = true;
      } catch (error) {
        console.error('Failed to render Turnstile widget:', error);
        callbacksRef.current.onError('Failed to load verification widget');
      }
    };

    const checkTurnstile = () => {
      if (window.turnstile && typeof window.turnstile.render === 'function') {
        // Turnstile is fully loaded, render directly without using .ready()
        loadTurnstile();
      } else {
        // Keep checking until turnstile is available
        setTimeout(checkTurnstile, 100);
      }
    };

    checkTurnstile();

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (error) {
          console.warn('Failed to remove Turnstile widget:', error);
        }
        widgetIdRef.current = null;
        isInitializedRef.current = false;
      }
    };
  }, [sitekey, disabled]); // Only depend on sitekey and disabled

  // Reset widget when disabled state changes
  useEffect(() => {
    if (disabled && widgetIdRef.current && window.turnstile) {
      try {
        window.turnstile.reset(widgetIdRef.current);
      } catch (error) {
        console.warn('Failed to reset Turnstile widget:', error);
      }
    }
  }, [disabled]);

  return (
    <div
      ref={containerRef}
      className={`cf-turnstile ${className}`}
      style={{ opacity: disabled ? 0.5 : 1 }}
    />
  );
}
