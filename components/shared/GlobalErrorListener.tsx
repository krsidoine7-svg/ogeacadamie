"use client";

import { useEffect } from "react";

/**
 * GlobalErrorListener
 * Écoute activement les erreurs non interceptées et les promesses rejetées
 * sur le navigateur et les transmet à l'API centrale /api/logs/error
 */
export default function GlobalErrorListener() {
  useEffect(() => {
    // Écouteur pour les erreurs de script et de rendu globales
    const handleError = (event: ErrorEvent) => {
      // Éviter de boucler si l'erreur vient d'un appel réseau vers /api/logs/error
      if (event.filename && event.filename.includes("/api/logs/error")) return;

      // Ignorer les fausses erreurs cross-origin et scripts injectés par des navigateurs tiers ("Script error." à la ligne 0)
      if (
        event.message === "Script error." ||
        (!event.filename && event.lineno === 0 && event.colno === 0)
      ) {
        return;
      }

      try {
        fetch("/api/logs/error", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: event.message || "Erreur de script globale non interceptée",
            level: "error",
            source: "client",
            stack: event.error?.stack || `${event.filename}:${event.lineno}:${event.colno}`,
            context: {
              url: window.location.href,
              userAgent: navigator.userAgent,
            },
          }),
        }).catch(() => {
          // Si l'envoi du log échoue (ex: perte de réseau), on ignore pour ne pas bloquer
        });
      } catch (_) {}
    };

    // Écouteur pour les promesses rejetées non interceptées (ex: fetch échoué)
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message =
        typeof reason === "string"
          ? reason
          : reason?.message || "Promesse rejetée non interceptée";

      if (typeof message === "string" && message.includes("/api/logs/error")) return;

      try {
        fetch("/api/logs/error", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: `[UnhandledRejection] ${message}`,
            level: "error",
            source: "client",
            stack: reason?.stack || JSON.stringify(reason),
            context: {
              url: window.location.href,
              userAgent: navigator.userAgent,
            },
          }),
        }).catch(() => {});
      } catch (_) {}
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  return null;
}
