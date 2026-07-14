"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function RootGlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    try {
      fetch("/api/logs/error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `[Root GlobalError] ${error.message || "Erreur critique dans le layout racine"}`,
          level: "critical",
          source: "client",
          stack: error.stack,
          context: { digest: error.digest, url: window.location?.href },
        }),
      }).catch(() => {});
    } catch (_) {}
  }, [error]);

  return (
    <html lang="fr">
      <body className="min-h-screen flex items-center justify-center p-6 bg-slate-900 font-sans text-white">
        <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-3xl shadow-2xl p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-2xl flex items-center justify-center mx-auto border border-red-500/20">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">Erreur système critique</h2>
          <p className="text-sm text-slate-300 font-medium">
            Une erreur fondamentale a été détectée. Le journal technique a été transmis au Super Administrateur.
          </p>
          <button
            onClick={() => reset()}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm hover:bg-amber-400 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Recharger l'application
          </button>
        </div>
      </body>
    </html>
  );
}
