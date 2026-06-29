// ============================================================
// app/admin/analytics/page.tsx
// Dashboard super admin — statistiques du site
// ============================================================
"use client";

import { useEffect, useState, useCallback, useRef } from "react";

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
  const w = 120;
  const h = 36;
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`)
    .join(" ");
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={w}
      height={h}
      style={{ display: "block" }}
    >
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

// ---- Carte métrique ----
function MetricCard({
  label,
  value,
  sub,
  sparkData,
  sparkColor,
  icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  sparkData?: number[];
  sparkColor?: string;
  icon: string;
}) {
  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <span style={styles.cardIcon}>{icon}</span>
        <span style={styles.cardLabel}>{label}</span>
      </div>
      <div style={styles.cardValue}>{value.toLocaleString()}</div>
      {sub && <div style={styles.cardSub}>{sub}</div>}
      {sparkData && sparkData.length > 1 && (
        <div style={{ marginTop: 8 }}>
          <Sparkline data={sparkData} color={sparkColor} />
        </div>
      )}
    </div>
  );
}

// ---- Barre de progression ----
function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={styles.barTrack}>
      <div style={{ ...styles.barFill, width: `${pct}%` }} />
    </div>
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
    fetchStats();
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
      <div style={styles.page}>
        <div style={styles.center}>
          <div style={styles.spinner} />
          <p style={{ color: "#94a3b8", marginTop: 16 }}>
            Chargement des statistiques…
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.center}>
          <div style={styles.errorBox}>
            <span style={{ fontSize: 24 }}>⚠️</span>
            <p style={{ color: "#f87171", margin: "8px 0 0" }}>{error}</p>
            <button style={styles.retryBtn} onClick={() => fetchStats()}>
              Réessayer
            </button>
          </div>
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
    <div style={styles.page}>
      {/* ---- En-tête ---- */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            <span style={{ marginRight: 10 }}>📊</span>
            Statistiques du site
          </h1>
          <p style={styles.subtitle}>
            Métriques réservées au super administrateur
          </p>
        </div>
        <div style={styles.headerRight}>
          {/* Sélecteur de période */}
          <div style={styles.periodGroup}>
            {(["7d", "30d", "90d"] as Period[]).map((p) => (
              <button
                key={p}
                style={{
                  ...styles.periodBtn,
                  ...(period === p ? styles.periodBtnActive : {}),
                }}
                onClick={() => setPeriod(p)}
              >
                {p === "7d" ? "7 jours" : p === "30d" ? "30 jours" : "90 jours"}
              </button>
            ))}
          </div>
          {/* Refresh + countdown */}
          <div style={styles.refreshArea}>
            <button
              style={styles.refreshBtn}
              onClick={() => fetchStats()}
              disabled={loading}
              title="Actualiser maintenant"
            >
              {loading ? "⏳" : "🔄"}
            </button>
            <span style={styles.refreshLabel}>
              Actualisation dans {countdown}s
            </span>
          </div>
        </div>
      </div>

      {lastUpdated && (
        <p style={styles.updatedAt}>
          Dernière mise à jour : {lastUpdated.toLocaleTimeString("fr-FR")}
        </p>
      )}

      {/* ---- Cartes métriques ---- */}
      <div style={styles.metricsGrid}>
        <MetricCard
          icon="👁️"
          label="Pages vues"
          value={data.totals.pageViews}
          sub={`sur les derniers ${period === "7d" ? "7" : period === "30d" ? "30" : "90"} jours`}
          sparkData={sparkViews}
          sparkColor="#6366f1"
        />
        <MetricCard
          icon="👤"
          label="Visiteurs uniques"
          value={data.totals.uniqueVisitors}
          sub="sessions distinctes"
          sparkData={sparkVisitors}
          sparkColor="#10b981"
        />
        <MetricCard
          icon="🖱️"
          label="Clics totaux"
          value={data.totals.totalClicks}
          sub="boutons & liens"
          sparkData={sparkClicks}
          sparkColor="#f59e0b"
        />
        <MetricCard
          icon="📄"
          label="Pages / visite"
          value={data.totals.avgPagesPerSession}
          sub="pages vues en moyenne"
        />
      </div>

      {/* ---- Tableaux ---- */}
      <div style={styles.tablesGrid}>
        {/* Top pages */}
        <div style={styles.tableCard}>
          <h2 style={styles.tableTitle}>🏆 Pages les plus visitées</h2>
          {data.topPages.length === 0 ? (
            <p style={styles.empty}>Aucune donnée disponible</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Page</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>Vues</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>
                    Visiteurs
                  </th>
                  <th style={{ ...styles.th, width: 100 }}>Popularité</th>
                </tr>
              </thead>
              <tbody>
                {data.topPages.map((page, i) => (
                  <tr key={page.path} style={i % 2 === 0 ? styles.rowEven : {}}>
                    <td style={styles.td}>
                      <span style={styles.pathBadge} title={page.path}>
                        {page.path.length > 35
                          ? "…" + page.path.slice(-32)
                          : page.path}
                      </span>
                    </td>
                    <td style={{ ...styles.td, textAlign: "right" }}>
                      <strong>{page.views.toLocaleString()}</strong>
                    </td>
                    <td style={{ ...styles.td, textAlign: "right" }}>
                      {page.uniqueSessions.toLocaleString()}
                    </td>
                    <td style={styles.td}>
                      <ProgressBar value={page.views} max={maxPageViews} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Top clics */}
        <div style={styles.tableCard}>
          <h2 style={styles.tableTitle}>🖱️ Éléments les plus cliqués</h2>
          {data.topClicks.length === 0 ? (
            <p style={styles.empty}>Aucune donnée disponible</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Élément</th>
                  <th style={styles.th}>Type</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>Clics</th>
                  <th style={{ ...styles.th, width: 100 }}>Part</th>
                </tr>
              </thead>
              <tbody>
                {data.topClicks.map((click, i) => (
                  <tr
                    key={`${click.path}-${click.elementId}-${i}`}
                    style={i % 2 === 0 ? styles.rowEven : {}}
                  >
                    <td style={styles.td}>
                      <div
                        style={styles.pathBadge}
                        title={click.elementText ?? ""}
                      >
                        {click.elementText
                          ? click.elementText.slice(0, 28)
                          : click.elementId ?? "—"}
                      </div>
                      <div style={styles.clickPath}>
                        {click.path.length > 28
                          ? "…" + click.path.slice(-25)
                          : click.path}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.typeBadge,
                          background:
                            click.elementType === "button"
                              ? "#312e81"
                              : click.elementType === "link"
                              ? "#064e3b"
                              : "#44403c",
                        }}
                      >
                        {click.elementType ?? "autre"}
                      </span>
                    </td>
                    <td style={{ ...styles.td, textAlign: "right" }}>
                      <strong>{click.clicks.toLocaleString()}</strong>
                    </td>
                    <td style={styles.td}>
                      <ProgressBar value={click.clicks} max={maxClicks} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Styles inline (pas de dépendance CSS externe)
// ============================================================
const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#0f172a",
    color: "#e2e8f0",
    fontFamily:
      "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
    padding: "32px 24px",
    boxSizing: "border-box",
  },
  center: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
  },
  spinner: {
    width: 40,
    height: 40,
    border: "3px solid #1e293b",
    borderTop: "3px solid #6366f1",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  errorBox: {
    background: "#1e293b",
    border: "1px solid #ef4444",
    borderRadius: 12,
    padding: "24px 32px",
    textAlign: "center",
  },
  retryBtn: {
    marginTop: 12,
    padding: "8px 20px",
    background: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 14,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: 700,
    margin: 0,
    color: "#f1f5f9",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    fontSize: 13,
    color: "#64748b",
    margin: "4px 0 0",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  periodGroup: {
    display: "flex",
    background: "#1e293b",
    borderRadius: 10,
    padding: 3,
    gap: 2,
  },
  periodBtn: {
    padding: "6px 14px",
    border: "none",
    borderRadius: 8,
    background: "transparent",
    color: "#94a3b8",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500,
    transition: "all 0.15s",
  },
  periodBtnActive: {
    background: "#6366f1",
    color: "#fff",
  },
  refreshArea: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  refreshBtn: {
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: 8,
    padding: "6px 10px",
    color: "#94a3b8",
    cursor: "pointer",
    fontSize: 16,
    lineHeight: 1,
  },
  refreshLabel: {
    fontSize: 12,
    color: "#475569",
  },
  updatedAt: {
    fontSize: 11,
    color: "#334155",
    margin: "0 0 24px",
  },
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 16,
    marginBottom: 24,
  },
  card: {
    background: "#1e293b",
    borderRadius: 14,
    padding: "20px 22px",
    border: "1px solid #1e3a5f22",
    transition: "transform 0.15s",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  cardIcon: {
    fontSize: 18,
  },
  cardLabel: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  cardValue: {
    fontSize: 32,
    fontWeight: 700,
    color: "#f1f5f9",
    lineHeight: 1,
    fontVariantNumeric: "tabular-nums",
  },
  cardSub: {
    fontSize: 11,
    color: "#475569",
    marginTop: 4,
  },
  tablesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
    gap: 20,
  },
  tableCard: {
    background: "#1e293b",
    borderRadius: 14,
    padding: "20px",
    border: "1px solid #1e3a5f22",
    overflowX: "auto",
  },
  tableTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: "#cbd5e1",
    margin: "0 0 16px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 13,
  },
  th: {
    textAlign: "left",
    color: "#475569",
    fontWeight: 600,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    padding: "0 8px 10px",
    borderBottom: "1px solid #334155",
  },
  td: {
    padding: "10px 8px",
    color: "#cbd5e1",
    verticalAlign: "middle",
  },
  rowEven: {
    background: "#0f172a44",
  },
  pathBadge: {
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    fontSize: 12,
    color: "#818cf8",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: 200,
    display: "block",
  },
  clickPath: {
    fontSize: 11,
    color: "#475569",
    marginTop: 2,
    fontFamily: "monospace",
  },
  typeBadge: {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: 4,
    fontSize: 11,
    color: "#e2e8f0",
    fontWeight: 500,
  },
  barTrack: {
    height: 6,
    background: "#0f172a",
    borderRadius: 3,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
    borderRadius: 3,
    transition: "width 0.4s ease",
  },
  empty: {
    color: "#475569",
    fontSize: 13,
    textAlign: "center",
    padding: "24px 0",
  },
};
