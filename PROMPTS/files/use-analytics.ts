// ============================================================
// hooks/use-analytics.ts
// Hook client : track les page views et les clics automatiquement
// ============================================================
"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Génère ou récupère un sessionId anonyme (cookie 30 jours)
function getOrCreateSessionId(): string {
  const COOKIE_NAME = "_sid";
  const existing = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${COOKIE_NAME}=`))
    ?.split("=")[1];

  if (existing) return existing;

  // Génère un ID aléatoire de 32 hex chars
  const newId = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const expires = new Date();
  expires.setDate(expires.getDate() + 30);
  document.cookie = `${COOKIE_NAME}=${newId}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;

  return newId;
}

// ---- Track une page view ----
async function trackPageView(path: string) {
  try {
    const sessionId = getOrCreateSessionId();
    await fetch("/api/analytics/pageview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        path,
        referrer: document.referrer || null,
        userAgent: navigator.userAgent,
      }),
      // keepalive pour ne pas bloquer la navigation
      keepalive: true,
    });
  } catch {
    // Analytics ne doit jamais crasher l'app
  }
}

// ---- Track un clic ----
async function trackClick(
  path: string,
  elementId: string | null,
  elementText: string | null,
  elementType: string
) {
  try {
    const sessionId = getOrCreateSessionId();
    await fetch("/api/analytics/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        path,
        elementId,
        elementText: elementText?.slice(0, 100) ?? null,
        elementType,
      }),
      keepalive: true,
    });
  } catch {
    // silencieux
  }
}

// ============================================================
// Hook principal : à placer dans votre layout racine
// ============================================================
export function useAnalytics() {
  const pathname = usePathname();
  const lastTrackedPath = useRef<string | null>(null);

  // ---- Track page view à chaque changement de route ----
  useEffect(() => {
    if (pathname && pathname !== lastTrackedPath.current) {
      lastTrackedPath.current = pathname;
      trackPageView(pathname);
    }
  }, [pathname]);

  // ---- Track tous les clics via délégation d'événement ----
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const clickable = target.closest("a, button, [data-analytics-id]");
      if (!clickable) return;

      const tag = clickable.tagName.toLowerCase();
      const elementType =
        tag === "a" ? "link" : tag === "button" ? "button" : "other";
      const elementId =
        clickable.getAttribute("data-analytics-id") ||
        clickable.getAttribute("id") ||
        null;
      const elementText = clickable.textContent?.trim() || null;

      trackClick(pathname ?? "/", elementId, elementText, elementType);
    };

    document.addEventListener("click", handleClick, { passive: true });
    return () => document.removeEventListener("click", handleClick);
  }, [pathname]);
}
