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

  useEffect(() => {
    if (!containerRef.current || disabled) return;

    const loadTurnstile = () => {
      if (!window.turnstile) return;

      if (widgetIdRef.current) {
        window.turnstile.remove(widgetIdRef.current);
      }

      widgetIdRef.current = window.turnstile.render(containerRef.current!, {
        sitekey,
        callback: onSuccess,
        "error-callback": onError,
        "expired-callback": onExpired,
        theme: "auto",
        size: "normal",
      });
    };

    if (window.turnstile) {
      loadTurnstile();
    } else {
      const checkTurnstile = () => {
        if (window.turnstile) {
          window.turnstile.ready(loadTurnstile);
        } else {
          setTimeout(checkTurnstile, 100);
        }
      };
      checkTurnstile();
    }

    return () => {
      if (widgetIdRef.current) {
        window.turnstile?.remove(widgetIdRef.current);
      }
    };
  }, [sitekey, onSuccess, onError, onExpired, disabled]);

  // Reset widget when disabled state changes
  useEffect(() => {
    if (disabled && widgetIdRef.current) {
      window.turnstile?.reset(widgetIdRef.current);
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
