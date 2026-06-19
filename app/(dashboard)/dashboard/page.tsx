import React from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/lib/db";
import { profiles, concoursInscrits } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { BookOpen, Award, FileText, CheckCircle2, ChevronRight, MessageSquare, MapPin, Calendar } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 1. Authenticate user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  // 2. Fetch candidate profile
  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, user.id),
  });

  if (!profile) {
    redirect("/connexion");
  }

  // 3. Fetch registered concours
  const registeredConcours = await db.query.concoursInscrits.findMany({
    where: eq(concoursInscrits.userId, user.id),
  });

  const getConcoursLabel = (type: string) => {
    switch (type) {
      case "inphb":
        return "Concours INPHB";
      case "esatic":
        return "Concours ESATIC";
      case "cme":
        return "Concours CME";
      default:
        return type.toUpperCase();
    }
  };

  const getConcoursDescription = (type: string) => {
    switch (type) {
      case "inphb":
        return "Préparation d'excellence pour l'Institut National Polytechnique Félix Houphouët-Boigny.";
      case "esatic":
        return "Préparation spécialisée pour l'École Supérieure Africaine des TIC.";
      case "cme":
        return "Préparation intensive pour le Concours Militaire d'Entrée.";
      default:
        return "Accédez aux ressources de préparation dédiées.";
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative bg-[#0F172A] rounded-3xl p-6 sm:p-8 md:p-10 text-white overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-gold/15 to-transparent rounded-full -mr-16 -mt-16 blur-2xl" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Compte Actif & Inscription Validée</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Bonjour, {profile.prenom} !
          </h1>
          <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
            Bienvenue sur votre espace de préparation OGE Académie. Tous vos cours, exercices et corrigés sont désormais accessibles. Commencez votre apprentissage dès maintenant.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Registered Concours & Classes (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#0F172A] tracking-tight">
              Vos Programmes de Préparation
            </h2>
            <span className="text-xs text-slate-400 font-semibold uppercase">
              {registeredConcours.length} Programme(s)
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {registeredConcours.map((item) => (
              <div
                key={item.id}
                className="group relative bg-white border border-slate-200 rounded-2xl p-5 hover:border-gold/30 hover:shadow-lg hover:shadow-slate-100 transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gold/10 text-gold flex items-center justify-center">
                        <Award className="w-4 h-4 text-[#D4A017]" />
                      </div>
                      <h3 className="font-bold text-slate-800 text-base">
                        {getConcoursLabel(item.concours)}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 max-w-md">
                      {getConcoursDescription(item.concours)}
                    </p>
                  </div>
                  <Link
                    href={`/dashboard/documents?concours=${item.concours}`}
                    className="inline-flex items-center justify-center gap-1 text-xs font-bold text-[#0F172A] group-hover:text-gold transition-colors"
                  >
                    <span>Accéder aux ressources</span>
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            ))}

            {registeredConcours.length === 0 && (
              <div className="text-center p-8 bg-white border border-slate-200 rounded-2xl space-y-2">
                <p className="text-sm text-slate-500 font-medium">
                  Aucun concours enregistré dans votre profil.
                </p>
                <Link
                  href="/dashboard/profil"
                  className="text-xs text-gold font-bold hover:underline"
                >
                  Mettre à jour mon profil
                </Link>
              </div>
            )}
          </div>

          {/* Quick Shortcuts */}
          <div className="space-y-4 pt-4">
            <h3 className="text-sm font-bold text-slate-400 tracking-wide uppercase">
              Ressources Générales
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                href="/dashboard/cours"
                className="flex items-center gap-4 bg-white border border-slate-200 p-4 rounded-xl hover:border-slate-300 transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-lg bg-[#0F172A]/5 text-[#0F172A] flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800">Cours & Fiches</h4>
                  <p className="text-xs text-slate-400">Supports de cours complets</p>
                </div>
              </Link>

              <Link
                href="/dashboard/exercices"
                className="flex items-center gap-4 bg-white border border-slate-200 p-4 rounded-xl hover:border-slate-300 transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-lg bg-[#0F172A]/5 text-[#0F172A] flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800">Sujets & Exercices</h4>
                  <p className="text-xs text-slate-400">Entraînez-vous avec les annales</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Side: Local Center Info & Quick Stats (1/3 width) */}
        <div className="space-y-6">
          {/* Info Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
            <h2 className="text-base font-bold text-[#0F172A]">Votre Centre OGE</h2>
            
            <div className="space-y-3.5 text-xs">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800">Zone de Formation</p>
                  <p className="text-slate-500 mt-0.5">
                    {profile.zone 
                      ? profile.zone.charAt(0).toUpperCase() + profile.zone.slice(1).replace("-", " ") 
                      : "Non renseignée"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800">Mode de Préparation</p>
                  <p className="text-slate-500 mt-0.5">
                    {profile.modeFormation === "presentiel" ? "Présentiel" : "En Ligne"}
                  </p>
                </div>
              </div>
            </div>

            {/* WhatsApp Integration Shortcut */}
            <div className="pt-4 border-t border-slate-100 text-center">
              <a
                href={profile.whatsapp ? `https://wa.me/${profile.whatsapp}` : "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-500/10 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Rejoindre le groupe WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Quick Payment Link */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-3">
            <h3 className="font-bold text-[#0F172A] text-sm">Facture & Inscription</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Consultez les détails de vos règlements de frais d'inscription et téléchargez vos reçus officiels.
            </p>
            <Link
              href="/dashboard/paiement"
              className="text-xs font-bold text-gold hover:underline inline-flex items-center gap-1"
            >
              <span>Voir mes reçus</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
