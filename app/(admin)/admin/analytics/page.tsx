// ============================================================
// app/(admin)/admin/analytics/page.tsx
// Dashboard super admin — statistiques du site (Optimisé Shadcn/Tailwind)
// ============================================================
"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { 
  Eye, 
  Users, 
  MousePointerClick, 
  Clock, 
  RefreshCw, 
  Calendar, 
  TrendingUp,
  FileText,
  MousePointer
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ---- Types ----
interface Totals {
  pageViews: number;
  uniqueVisitors: number;
  totalClicks: number;
  avgPagesPerSession: number;
}

interface TopPage {
  path: string;
  views: number;
  uniqueSessions: number;
  avgDuration: number;
}

interface TopClick {
  path: string;
  elementId: string | null;
  elementText: string | null;
  elementType: string | null;
  clicks: number;
}

interface DailyPoint {
  date: string;
  pageViews: number;
  uniqueVisitors: number;
  clicks: number;
}

interface StatsData {
  period: string;
  totals: Totals;
  topPages: TopPage[];
  topClicks: TopClick[];
  dailyEvolution: DailyPoint[];
  recentLogs: RecentLog[];
}

interface RecentLog {
  id: string;
  type: "pageview" | "click";
  sessionId: string;
  path: string;
  detail: string | null;
  userAgent: string | null;
  ipAnonymized: string | null;
  country: string | null;
  duration: number | null;
  createdAt: string;
}

// ---- Parseur User Agent Simple ----
function getBrowserAndOS(ua: string | null): string {
  if (!ua) return "Direct / Inconnu";
  let browser = "Autre";
  let os = "Autre";

  if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Chrome")) browser = "Chrome";
  else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
  else if (ua.includes("Edge")) browser = "Edge";

  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Macintosh") || ua.includes("Mac OS")) os = "macOS";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
  else if (ua.includes("Linux")) os = "Linux";

  return `${browser} (${os})`;
}

// ---- Formateur Temps Relatif ----
function formatRelativeTime(dateStr: string): string {
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  const sec = Math.floor(diff / 1000);
  
  if (sec < 60) return "À l'instant";
  const min = Math.floor(sec / 60);
  if (min < 60) return `Il y a ${min} min`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `Il y a ${hr} h`;
  
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}


type Period = "7d" | "30d" | "90d";
const REFRESH_INTERVAL = 30; // secondes

// ---- Sparkline SVG simple ----
function Sparkline({
  data,
  color = "#6366f1",
}: {
  data: number[];
  color?: string;
}) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const w = 150;
  const h = 40;
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`)
    .join(" ");
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width="100%"
      height={h}
      className="overflow-visible"
    >
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

// ============================================================
// Page principale
// ============================================================
export default function AnalyticsDashboard() {
  const [data, setData] = useState<StatsData | null>(null);
  const [period, setPeriod] = useState<Period>("30d");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const fetchStats = useCallback(
    async (silent = false) => {
      await Promise.resolve();
      if (!silent) setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/analytics/stats?period=${period}`);
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Erreur réseau");
        }
        const json: StatsData = await res.json();
        setData(json);
        setLastUpdated(new Date());
        setCountdown(REFRESH_INTERVAL);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    },
    [period]
  );

  // Chargement initial + rechargement quand la période change
  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) fetchStats();
    });
    return () => {
      active = false;
    };
  }, [fetchStats]);

  // Auto-refresh toutes les X secondes
  useEffect(() => {
    timerRef.current = setInterval(() => fetchStats(true), REFRESH_INTERVAL * 1000);
    countdownRef.current = setInterval(
      () => setCountdown((c) => (c > 0 ? c - 1 : REFRESH_INTERVAL)),
      1000
    );
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [fetchStats]);

  // ---- États de chargement / erreur ----
  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-slate-500 font-medium text-sm animate-pulse">
          Chargement des statistiques…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] max-w-md mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center shadow-sm">
          <span className="text-3xl">⚠️</span>
          <h3 className="text-red-800 font-bold mt-2">Échec du chargement</h3>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <Button 
            className="mt-4 bg-red-600 hover:bg-red-700 text-white"
            onClick={() => fetchStats()}
          >
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const maxPageViews = data.topPages[0]?.views ?? 1;
  const maxClicks = data.topClicks[0]?.clicks ?? 1;
  const sparkViews = data.dailyEvolution.map((d) => d.pageViews);
  const sparkVisitors = data.dailyEvolution.map((d) => d.uniqueVisitors);
  const sparkClicks = data.dailyEvolution.map((d) => d.clicks);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ---- En-tête de page ---- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Statistiques & Trafic</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Suivi en temps réel de l'activité, des pages lues et de l'engagement utilisateurs.
          </p>
        </div>

        {/* Filtres de période & rafraîchissement */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <Badge variant="outline" className="px-2.5 py-1 text-slate-500 font-semibold border-slate-200 bg-white">
            <RefreshCw className={`w-3 h-3 mr-1 text-indigo-500 ${loading ? 'animate-spin' : ''}`} />
            MàJ dans {countdown}s
          </Badge>
          
          <div className="flex bg-slate-200/80 p-0.5 rounded-xl border border-slate-200">
            {(["7d", "30d", "90d"] as Period[]).map((p) => (
              <Button
                key={p}
                variant={period === p ? "default" : "ghost"}
                size="sm"
                className={`text-xs py-1 px-3 rounded-lg font-semibold h-8 transition-all ${
                  period === p 
                    ? "bg-white text-slate-900 shadow-sm border border-slate-200/50 hover:bg-white" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-300/40"
                }`}
                onClick={() => setPeriod(p)}
              >
                {p === "7d" ? "7 Jours" : p === "30d" ? "30 Jours" : "90 Jours"}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* ---- Section Grille de Cartes Métric ---- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Pages Vues */}
        <Card className="border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pages Vues</span>
            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
              <Eye className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-2xl font-bold text-slate-900">{data.totals.pageViews.toLocaleString()}</div>
              <p className="text-[11px] text-slate-400 font-medium">Sur la période sélectionnée</p>
            </div>
            {sparkViews.length > 1 && (
              <div className="pt-1">
                <Sparkline data={sparkViews} color="#4f46e5" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Visiteurs Uniques */}
        <Card className="border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Visiteurs Uniques</span>
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
              <Users className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-2xl font-bold text-slate-900">{data.totals.uniqueVisitors.toLocaleString()}</div>
              <p className="text-[11px] text-slate-400 font-medium">Identifiés par session anonyme</p>
            </div>
            {sparkVisitors.length > 1 && (
              <div className="pt-1">
                <Sparkline data={sparkVisitors} color="#10b981" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Total Clics */}
        <Card className="border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Clics Totaux</span>
            <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
              <MousePointerClick className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-2xl font-bold text-slate-900">{data.totals.totalClicks.toLocaleString()}</div>
              <p className="text-[11px] text-slate-400 font-medium">Boutons, liens et formulaires</p>
            </div>
            {sparkClicks.length > 1 && (
              <div className="pt-1">
                <Sparkline data={sparkClicks} color="#f59e0b" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pages / Session */}
        <Card className="border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pages / Visite</span>
            <div className="p-2 bg-violet-50 rounded-xl text-violet-600">
              <Clock className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-2xl font-bold text-slate-900">{data.totals.avgPagesPerSession}</div>
              <p className="text-[11px] text-slate-400 font-medium">Profondeur moyenne des sessions</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50/50 p-2 rounded-xl border border-emerald-100/50 mt-4">
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="font-semibold">Engagement actif validé</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ---- Section Tableaux Détaillés ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Pages Populaires */}
        <Card className="border border-slate-100 bg-white shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-500" />
              <CardTitle className="text-base font-bold text-slate-800">Pages les plus visitées</CardTitle>
            </div>
            <CardDescription className="text-xs text-slate-400">
              Classement des URL selon leur fréquence d'affichage en session.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left font-bold text-slate-400 text-xs uppercase tracking-wider pb-3">Chemin d'accès</th>
                    <th className="text-right font-bold text-slate-400 text-xs uppercase tracking-wider pb-3 px-3">Vues</th>
                    <th className="text-right font-bold text-slate-400 text-xs uppercase tracking-wider pb-3 px-3">U.V.</th>
                    <th className="text-right font-bold text-slate-400 text-xs uppercase tracking-wider pb-3 px-3">Durée Moy.</th>
                    <th className="w-20 pb-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.topPages.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-slate-400 text-xs italic">
                        Aucune vue enregistrée sur cette période.
                      </td>
                    </tr>
                  ) : (
                    data.topPages.map((page, idx) => {
                      const percentage = Math.round((page.views / maxPageViews) * 100);
                      return (
                        <tr key={page.path} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 pr-4">
                            <span className="font-mono text-xs font-semibold text-indigo-600 bg-indigo-50/40 border border-indigo-100/30 px-2.5 py-1 rounded-lg inline-block truncate max-w-[280px]" title={page.path}>
                              {page.path}
                            </span>
                          </td>
                          <td className="py-3.5 text-right font-bold text-slate-800 px-3">
                            {page.views.toLocaleString()}
                          </td>
                          <td className="py-3.5 text-right text-slate-500 font-semibold px-3">
                            {page.uniqueSessions.toLocaleString()}
                          </td>
                          <td className="py-3.5 text-right text-slate-600 font-semibold px-3 text-xs">
                            {page.avgDuration && page.avgDuration > 0 ? (
                              page.avgDuration < 60 ? `${page.avgDuration}s` : `${Math.floor(page.avgDuration / 60)}m ${page.avgDuration % 60}s`
                            ) : "--"}
                          </td>
                          <td className="py-3.5 pl-2">
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${percentage}%` }} />
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Clics & CTA */}
        <Card className="border border-slate-100 bg-white shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <MousePointer className="w-4 h-4 text-indigo-500" />
              <CardTitle className="text-base font-bold text-slate-800">CTA & Boutons les plus cliqués</CardTitle>
            </div>
            <CardDescription className="text-xs text-slate-400">
              Suivi des clics sur les formulaires, boutons de paiement et liens importants.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left font-bold text-slate-400 text-xs uppercase tracking-wider pb-3">Intitulé / Cible</th>
                    <th className="text-center font-bold text-slate-400 text-xs uppercase tracking-wider pb-3">Type</th>
                    <th className="text-right font-bold text-slate-400 text-xs uppercase tracking-wider pb-3 px-3">Clics</th>
                    <th className="w-24 pb-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.topClicks.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-slate-400 text-xs italic">
                        Aucun événement de clic enregistré.
                      </td>
                    </tr>
                  ) : (
                    data.topClicks.map((click, idx) => {
                      const elementLabel = click.elementId || click.elementText || "Inconnu";
                      const isLink = click.elementType === "link";
                      const percentage = Math.round((click.clicks / maxClicks) * 100);

                      return (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 pr-4">
                            <div className="font-semibold text-slate-800 truncate max-w-[200px]" title={elementLabel}>
                              {elementLabel}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              page : {click.path}
                            </div>
                          </td>
                          <td className="py-3.5 text-center">
                            <Badge 
                              variant={isLink ? "outline" : "secondary"}
                              className={`text-[10px] font-bold uppercase tracking-wider py-0.5 px-2 rounded-md ${
                                isLink 
                                  ? "border-slate-200 text-slate-500 bg-white" 
                                  : "bg-indigo-50 border border-indigo-100 text-indigo-600"
                              }`}
                            >
                              {isLink ? "Lien" : "Bouton"}
                            </Badge>
                          </td>
                          <td className="py-3.5 text-right font-bold text-slate-800 px-3">
                            {click.clicks.toLocaleString()}
                          </td>
                          <td className="py-3.5 pl-3">
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${percentage}%` }} />
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ---- Section Flux d'activité en temps réel ---- */}
      <Card className="border border-slate-100 bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-bold text-slate-800">Flux d'activité en temps réel</CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Les 50 derniers événements enregistrés sur la plateforme.
            </CardDescription>
          </div>
          <Badge className="bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold text-[10px] uppercase">
            Live Feed
          </Badge>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto pr-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 sticky top-0 bg-white z-10">
                  <th className="text-left font-bold text-slate-400 text-xs uppercase tracking-wider pb-3">Date</th>
                  <th className="text-left font-bold text-slate-400 text-xs uppercase tracking-wider pb-3">Action</th>
                  <th className="text-left font-bold text-slate-400 text-xs uppercase tracking-wider pb-3">Cible / Détail</th>
                  <th className="text-left font-bold text-slate-400 text-xs uppercase tracking-wider pb-3">Session</th>
                  <th className="text-left font-bold text-slate-400 text-xs uppercase tracking-wider pb-3">Appareil</th>
                  <th className="text-center font-bold text-slate-400 text-xs uppercase tracking-wider pb-3">Pays</th>
                  <th className="text-right font-bold text-slate-400 text-xs uppercase tracking-wider pb-3">Durée</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.recentLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400 text-xs italic">
                      Aucune activité récente détectée.
                    </td>
                  </tr>
                ) : (
                  data.recentLogs.map((log, idx) => {
                    const isView = log.type === 'pageview';
                    return (
                      <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 text-slate-500 font-semibold text-xs whitespace-nowrap">
                          {formatRelativeTime(log.createdAt)}
                        </td>
                        <td className="py-3">
                          <Badge 
                            variant={isView ? "secondary" : "default"}
                            className={`text-[10px] font-bold uppercase tracking-wider py-0.5 px-2 rounded-md ${
                              isView 
                                ? "bg-indigo-50 border border-indigo-100 text-indigo-600" 
                                : "bg-amber-50 border border-amber-100 text-amber-700"
                            }`}
                          >
                            {isView ? "Page Vue" : "Clic"}
                          </Badge>
                        </td>
                        <td className="py-3 max-w-[240px] truncate">
                          {isView ? (
                            <span className="font-mono text-[11px] font-semibold text-indigo-600 bg-indigo-50/40 border border-indigo-100/30 px-2 py-0.5 rounded-md inline-block">
                              {log.path}
                            </span>
                          ) : (
                            <div>
                              <span className="font-semibold text-slate-800">{log.detail}</span>
                              <span className="text-[10px] text-slate-400 font-mono block">page : {log.path}</span>
                            </div>
                          )}
                        </td>
                        <td className="py-3 font-mono text-[11px] text-slate-400">
                          {log.sessionId.slice(0, 8)}...
                        </td>
                        <td className="py-3 text-slate-600 text-xs">
                          {isView ? getBrowserAndOS(log.userAgent) : "--"}
                        </td>
                        <td className="py-3 text-center text-slate-500 font-bold text-xs">
                          {log.country || "--"}
                        </td>
                        <td className="py-3 text-right text-slate-700 font-semibold text-xs">
                          {isView && log.duration && log.duration > 0 ? `${log.duration}s` : "--"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ---- Footer ---- */}
      <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-400 font-medium">
        <span>Système d'Analytics OGE Académie</span>
        <span>
          Dernière mise à jour : {lastUpdated ? lastUpdated.toLocaleTimeString() : "--:--:--"}
        </span>
      </div>
    </div>
  );
}
