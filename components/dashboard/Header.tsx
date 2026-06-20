"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { GraduationCap, LogOut, User, MapPin, Loader2 } from "lucide-react";

interface HeaderProps {
  profile: {
    nom: string;
    prenom: string;
    email: string;
    zone: string | null;
  };
}

export default function Header({ profile }: HeaderProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.success("Déconnexion réussie");
      router.push("/connexion");
      router.refresh();
    } catch {
      toast.error("Erreur lors de la déconnexion");
      setIsLoggingOut(false);
    }
  };

  const formatZoneName = (name: string | null) => {
    if (!name) return "Zone non définie";
    return name.charAt(0).toUpperCase() + name.slice(1).replace("-", " ");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-[#D4A017] to-amber-600 flex items-center justify-center shadow-md shadow-gold/10">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-[#0F172A] tracking-tight text-base sm:text-lg block leading-none">
              OGE ACADÉMIE
            </span>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mt-0.5">
              Espace Candidat
            </span>
          </div>
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Zone Badge */}
          {profile.zone && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
              <MapPin className="w-3.5 h-3.5 text-[#D4A017]" />
              <span>{formatZoneName(profile.zone)}</span>
            </div>
          )}

          {/* User Name & Details */}
          <div className="flex items-center gap-2 border-l border-slate-200 pl-3 sm:pl-4">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#0F172A] border border-slate-200 flex-shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-slate-800 leading-tight">
                {profile.prenom} {profile.nom}
              </p>
              <p className="text-[10px] text-slate-400 font-medium truncate max-w-[150px]">
                {profile.email}
              </p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all duration-200 flex items-center justify-center disabled:opacity-50"
            title="Se déconnecter"
          >
            {isLoggingOut ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
            ) : (
              <LogOut className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
