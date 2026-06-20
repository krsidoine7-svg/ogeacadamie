import React from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/lib/db";
import { profiles, paiements, concoursInscrits, adminPendingActions } from "@/drizzle/schema";
import { eq, and, isNull, desc } from "drizzle-orm";
import { Users, Banknote, ShieldAlert, Award, MapPin, Calendar, Clock, ChevronRight, PieChart } from "lucide-react";
import Link from "next/link";

/**
 * Pure SVG Donut Chart component (no external dependency)
 */
function DonutChart({
  segments,
  size = 140,
  strokeWidth = 24,
  centerLabel,
  centerValue,
}: {
  segments: { value: number; color: string; label: string }[];
  size?: number;
  strokeWidth?: number;
  centerLabel?: string;
  centerValue?: string | number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((sum, s) => sum + s.value, 0);

  let accumulatedOffset = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#f1f5f9"
        strokeWidth={strokeWidth}
      />
      {total > 0 &&
        segments.map((seg, i) => {
          const segLength = (seg.value / total) * circumference;
          const offset = accumulatedOffset;
          accumulatedOffset += segLength;
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${segLength} ${circumference - segLength}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          );
        })}
      {/* Center text */}
      <text
        x={size / 2}
        y={size / 2 - 5}
        textAnchor="middle"
        dominantBaseline="middle"
        className="transform rotate-90 origin-center"
        fill="#0f172a"
        fontSize="20"
        fontWeight="950"
      >
        {centerValue ?? total}
      </text>
      <text
        x={size / 2}
        y={size / 2 + 12}
        textAnchor="middle"
        dominantBaseline="middle"
        className="transform rotate-90 origin-center"
        fill="#94a3b8"
        fontSize="9"
        fontWeight="700"
      >
        {centerLabel ?? "TOTAL"}
      </text>
    </svg>
  );
}

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 1. Authenticate user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  // 2. Fetch admin profile
  const adminProfile = await db.query.profiles.findFirst({
    where: eq(profiles.id, user.id),
  });

  if (!adminProfile || (adminProfile.role !== "admin" && adminProfile.role !== "super_admin")) {
    redirect("/connexion");
  }

  // 3. Fetch data for metrics
  const candidates = await db.query.profiles.findMany({
    where: and(
      eq(profiles.role, "user"),
      isNull(profiles.deletedAt)
    ),
  });

  const totalCandidates = candidates.length;
  const activeCandidates = candidates.filter((c) => c.isActive).length;
  const inactiveCandidates = totalCandidates - activeCandidates;

  const payments = await db.query.paiements.findMany({
    where: isNull(paiements.deletedAt),
  });

  const totalValidatedAmount = payments
    .filter((p) => p.statut === "valide")
    .reduce((sum, p) => sum + (p.montant || 15000), 0);

  const totalPendingAmount = payments
    .filter((p) => p.statut === "en_cours" || p.statut === "en_attente")
    .reduce((sum, p) => sum + (p.montant || 15000), 0);

  const pendingPaymentsCount = payments.filter((p) => p.statut === "en_cours" || p.statut === "en_attente").length;

  // Payment counts for donut chart
  const validatedPaymentsCount = payments.filter((p) => p.statut === "valide").length;
  const rejectedPaymentsCount = payments.filter((p) => p.statut === "rejete").length;

  // Payment methods segmentation
  const wavePaymentsCount = payments.filter((p) => p.moyenPaiement === "wave").length;
  const momoPaymentsCount = payments.filter((p) => p.moyenPaiement === "momo").length;
  const orangePaymentsCount = payments.filter((p) => p.moyenPaiement === "orange").length;
  const otherPaymentsCount = payments.length - (wavePaymentsCount + momoPaymentsCount + orangePaymentsCount);

  const registrations = await db.query.concoursInscrits.findMany({
    where: isNull(concoursInscrits.deletedAt),
  });

  // Group by concours
  const concoursCounts = { inphb: 0, esatic: 0, cme: 0 };
  registrations.forEach((r) => {
    if (r.concours in concoursCounts) {
      concoursCounts[r.concours as keyof typeof concoursCounts]++;
    }
  });

  // Group by zone
  const zoneCounts: Record<string, number> = {
    yamoussoukro: 0,
    yopougon: 0,
    abobo: 0,
    cocody: 0,
    "port-bouet": 0,
    bouake: 0,
  };
  candidates.forEach((c) => {
    if (c.zone && c.zone in zoneCounts) {
      zoneCounts[c.zone]++;
    }
  });

  const getZoneLabel = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1).replace("-", " ");
  };

  // Recent 5 candidates
  const recentCandidates = [...candidates]
    .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
    .slice(0, 5);

  // Fetch pending manager action requests for dual confirmation alert
  const pendingManagerActions = await db.query.adminPendingActions.findMany({
    where: eq(adminPendingActions.statut, "en_attente"),
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 0. Dual Confirmation Alert Banner */}
      {pendingManagerActions.length > 0 && (
        <div className="bg-amber-50 border border-amber-250/50 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-amber-850 animate-pulse-subtle">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100/80 text-amber-700 flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-600">Double Contrôle Requis</p>
              <p className="text-sm font-semibold text-slate-800">
                Il y a <span className="font-extrabold">{pendingManagerActions.length}</span> action{pendingManagerActions.length > 1 ? "s" : ""} sur les managers en attente de confirmation.
              </p>
            </div>
          </div>
          <Link
            href="/admin/managers"
            className="w-full sm:w-auto px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs transition-all text-center flex items-center justify-center gap-1"
          >
            <span>Voir les demandes</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Header banner */}
      <div className="relative bg-[#0F172A] rounded-3xl p-6 sm:p-8 text-white overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-gold/15 to-transparent rounded-full -mr-16 -mt-16 blur-2xl" />
        <div className="relative z-10 space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Console d'Administration
          </h1>
          <p className="text-xs sm:text-sm text-slate-350 max-w-xl">
            Bienvenue {adminProfile.prenom}. Suivez en temps réel les inscriptions, vérifiez les transactions comptables et configurez les modalités locales.
          </p>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Inscriptions */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Candidats</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-800 leading-none">{totalCandidates}</h3>
            <div className="flex gap-2 text-xs text-slate-400 font-semibold mt-2.5">
              <span className="text-emerald-600">{activeCandidates} actifs</span>
              <span>•</span>
              <span>{inactiveCandidates} inactifs</span>
            </div>
          </div>
        </div>

        {/* Validated Revenue */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recettes Validées</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-250 text-emerald-600 flex items-center justify-center">
              <Banknote className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-800 leading-none">
              {totalValidatedAmount.toLocaleString("fr-FR")} FCFA
            </h3>
            <p className="text-xs text-slate-400 font-semibold mt-2.5">
              Frais d'inscriptions soldés
            </p>
          </div>
        </div>

        {/* Pending Revenue */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Montant En Attente</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-250 text-[#D4A017] flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-800 leading-none">
              {totalPendingAmount.toLocaleString("fr-FR")} FCFA
            </h3>
            <p className="text-xs text-slate-400 font-semibold mt-2.5">
              {pendingPaymentsCount} reçu(s) en attente de vérification
            </p>
          </div>
        </div>

        {/* Pending validations badge */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Action Requise</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-800 leading-none">{pendingPaymentsCount}</h3>
            <div className="mt-2.5">
              {pendingPaymentsCount > 0 ? (
                <Link
                  href="/admin/paiements"
                  className="text-xs font-bold text-[#D4A017] hover:underline"
                >
                  Inspecter les reçus maintenant
                </Link>
              ) : (
                <span className="text-xs text-slate-400 font-semibold">Tout est à jour</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Donut Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payment Distribution Donut */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-gold/10 text-gold flex items-center justify-center flex-shrink-0">
              <PieChart className="w-4.5 h-4.5 text-[#D4A017]" />
            </div>
            <h3 className="font-bold text-slate-800 text-xs sm:text-sm">Statut des Paiements</h3>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-2">
            <DonutChart
              segments={[
                { value: validatedPaymentsCount, color: "#10b981", label: "Validés" },
                { value: pendingPaymentsCount, color: "#f59e0b", label: "En attente" },
                { value: rejectedPaymentsCount, color: "#ef4444", label: "Rejetés" },
              ]}
              centerValue={payments.length}
              centerLabel="REÇUS"
            />
            <div className="space-y-1.5 text-xs font-semibold w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
                <span className="text-slate-500 font-medium">Validés</span>
                <span className="font-bold text-slate-800 ml-auto pl-4">{validatedPaymentsCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 flex-shrink-0" />
                <span className="text-slate-500 font-medium">En attente</span>
                <span className="font-bold text-slate-800 ml-auto pl-4">{pendingPaymentsCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0" />
                <span className="text-slate-500 font-medium">Rejetés</span>
                <span className="font-bold text-slate-800 ml-auto pl-4">{rejectedPaymentsCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Active/Inactive Candidates Donut */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-gold/10 text-gold flex items-center justify-center flex-shrink-0">
              <Users className="w-4.5 h-4.5 text-[#D4A017]" />
            </div>
            <h3 className="font-bold text-slate-800 text-xs sm:text-sm">Statut des Candidats</h3>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-2">
            <DonutChart
              segments={[
                { value: activeCandidates, color: "#10b981", label: "Actifs" },
                { value: inactiveCandidates, color: "#94a3b8", label: "Inactifs" },
              ]}
              centerValue={totalCandidates}
              centerLabel="CANDIDATS"
            />
            <div className="space-y-1.5 text-xs font-semibold w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
                <span className="text-slate-500 font-medium">Actifs</span>
                <span className="font-bold text-slate-800 ml-auto pl-4">{activeCandidates}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-450 flex-shrink-0" />
                <span className="text-slate-500 font-medium">Inactifs</span>
                <span className="font-bold text-slate-800 ml-auto pl-4">{inactiveCandidates}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts & Recent registrations grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Columns (Concours & Zones Stats) - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Contest Stats card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gold/10 text-gold flex items-center justify-center flex-shrink-0">
                  <Award className="w-4.5 h-4.5 text-[#D4A017]" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">Candidats par Concours</h3>
              </div>

              <div className="space-y-4 text-sm font-semibold text-slate-700">
                {/* INP-HB */}
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span>INP-HB</span>
                    <span className="font-bold">{concoursCounts.inphb}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#D4A017] h-full"
                      style={{
                        width: `${totalCandidates > 0 ? (concoursCounts.inphb / totalCandidates) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                {/* ESATIC */}
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span>ESATIC</span>
                    <span className="font-bold">{concoursCounts.esatic}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full"
                      style={{
                        width: `${totalCandidates > 0 ? (concoursCounts.esatic / totalCandidates) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                {/* CME */}
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span>CME</span>
                    <span className="font-bold">{concoursCounts.cme}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full"
                      style={{
                        width: `${totalCandidates > 0 ? (concoursCounts.cme / totalCandidates) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Inscriptions by Zone card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gold/10 text-gold flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4.5 h-4.5 text-[#D4A017]" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">Candidats par Zone</h3>
              </div>

              <div className="space-y-3 text-sm max-h-[170px] overflow-y-auto pr-1">
                {Object.entries(zoneCounts).map(([zoneName, count]) => (
                  <div key={zoneName} className="flex justify-between items-center py-0.5 border-b border-slate-50">
                    <span className="font-medium text-slate-600">{getZoneLabel(zoneName)}</span>
                    <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-full text-xs">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Registrations - 1/3 width */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm">Inscriptions Récentes</h3>
            <Link
              href="/admin/candidats"
              className="text-xs font-bold text-slate-400 hover:text-gold flex items-center gap-0.5"
            >
              <span>Voir tout</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {recentCandidates.map((candidate) => (
              <div key={candidate.id} className="flex items-start justify-between gap-3 text-xs">
                <div className="space-y-0.5 max-w-[150px]">
                  <p className="font-bold text-slate-800 truncate">
                    {candidate.prenom} {candidate.nom}
                  </p>
                  <p className="text-xs text-slate-400 truncate">{candidate.email}</p>
                </div>
                <div className="text-right space-y-0.5 flex-shrink-0">
                  <span className={`inline-block px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    candidate.isActive 
                      ? "bg-emerald-50 text-emerald-700" 
                      : "bg-amber-50 text-[#D4A017]"
                  }`}>
                    {candidate.isActive ? "Actif" : "Inactif"}
                  </span>
                  <div className="flex items-center gap-0.5 justify-end text-[10px] text-slate-400 mt-1 font-semibold">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {candidate.createdAt
                        ? new Date(candidate.createdAt).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                          })
                        : ""}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {recentCandidates.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-4">Aucune inscription enregistrée.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
