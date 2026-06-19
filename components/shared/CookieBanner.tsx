"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, Shield, X } from "lucide-react";

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check local storage for existing consent
    const consent = localStorage.getItem("oge_cookie_consent");
    if (!consent) {
      // Delay presentation slightly for optimal UX entry transition
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleConsent = (status: "accepted" | "rejected") => {
    localStorage.setItem("oge_cookie_consent", status);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 sm:right-auto sm:max-w-sm z-[9999] bg-[#0A0E17]/95 border border-white/10 backdrop-blur-md rounded-3xl p-5 shadow-2xl text-white animate-fade-in space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-2.5 items-center">
          <div className="w-9 h-9 rounded-xl bg-[#F04438]/20 flex items-center justify-center text-[#F04438] flex-shrink-0">
            <Cookie className="w-5 h-5" />
          </div>
          <h4 className="font-extrabold text-sm tracking-tight">Respect de votre vie privée</h4>
        </div>
        <button
          onClick={() => handleConsent("rejected")}
          className="text-slate-400 hover:text-white transition-colors"
          title="Fermer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        <p className="text-xs text-slate-350 leading-relaxed font-light">
          OGE Académie utilise des cookies pour améliorer votre navigation, sécuriser vos connexions et analyser la fréquentation de la plateforme. En savoir plus sur la{" "}
          <Link
            href="/politique-de-confidentialite"
            className="text-[#F04438] hover:underline font-semibold"
          >
            politique de confidentialité
          </Link>.
        </p>

        <div className="flex gap-2.5 pt-1 text-xs font-bold">
          <button
            onClick={() => handleConsent("accepted")}
            className="flex-1 py-2 px-3 bg-[#F04438] hover:bg-[#d9382e] text-white rounded-xl shadow-md transition-all duration-200 cursor-pointer"
          >
            Tout accepter
          </button>
          <button
            onClick={() => handleConsent("rejected")}
            className="flex-1 py-2 px-3 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 rounded-xl transition-all duration-200 cursor-pointer"
          >
            Refuser
          </button>
        </div>
      </div>
    </div>
  );
}
