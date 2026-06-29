// ============================================================
// hooks/use-analytics.ts
// Hook client : track les page views, la durée de visite et les clics
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

// ---- Track une page view (retourne l'id créé) ----
async function trackPageView(path: string): Promise<string | null> {
  try {
    const sessionId = getOrCreateSessionId();
    const res = await fetch("/api/analytics/pageview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        path,
        referrer: document.referrer || null,
        userAgent: navigator.userAgent,
      }),
      keepalive: true,
    });
    if (res.ok) {
      const data = await res.json();
      return data.id || null;
    }
  } catch {
    // Silencieux
  }
  return null;
}

// ---- Met à jour la durée d'une page view ----
async function updatePageDuration(id: string, duration: number) {
  try {
    await fetch("/api/analytics/pageview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, duration }),
      keepalive: true,
    });
  } catch {
    // Silencieux
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
    // Silencieux
  }
}

// ============================================================
// Hook principal : à placer dans votre layout racine
// ============================================================
export function useAnalytics() {
  const pathname = usePathname();
  const lastTrackedPath = useRef<string | null>(null);
  const currentPageViewIdRef = useRef<string | null>(null);
  const startTimeRef = useRef<number>(0);

  // ---- Suivi du changement de page et de la durée ----
  useEffect(() => {
    if (pathname && pathname !== lastTrackedPath.current) {
      // 1. Envoyer la durée de la page précédente
      if (currentPageViewIdRef.current && startTimeRef.current > 0) {
        const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
        if (duration > 0) {
          updatePageDuration(currentPageViewIdRef.current, duration);
        }
      }

      // 2. Lancer la nouvelle page view
      lastTrackedPath.current = pathname;
      startTimeRef.current = Date.now();
      currentPageViewIdRef.current = null; // Reset temporaire

      trackPageView(pathname).then((id) => {
        if (id) {
          currentPageViewIdRef.current = id;
        }
      });
    }
  }, [pathname]);

  // ---- Envoi de la durée lors du départ du site (fermeture onglet, masquer) ----
  useEffect(() => {
    const handleUnloadOrHide = () => {
      if (currentPageViewIdRef.current && startTimeRef.current > 0) {
        const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
        if (duration > 0) {
          updatePageDuration(currentPageViewIdRef.current, duration);
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        handleUnloadOrHide();
      } else {
        // Retour sur l'onglet, on remet à zéro le début du compteur
        startTimeRef.current = Date.now();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handleUnloadOrHide);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handleUnloadOrHide);
    };
  }, []);

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
