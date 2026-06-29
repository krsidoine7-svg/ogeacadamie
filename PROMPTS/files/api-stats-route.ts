// ============================================================
// app/api/analytics/stats/route.ts
// Endpoint sécurisé : renvoie les métriques au dashboard admin
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server"; // ← votre client Supabase SSR
import { db } from "@/db";
import { pageViews, clickEvents, dailyStats } from "@/db/schema";
import { desc, sql, gte, lte, and, count, countDistinct } from "drizzle-orm";

// Vérifie que l'utilisateur connecté est bien super_admin
async function assertSuperAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("UNAUTHENTICATED");

  const role =
    user.user_metadata?.role || user.app_metadata?.role || null;

  if (role !== "super_admin") throw new Error("FORBIDDEN");
  return user;
}

export async function GET(request: NextRequest) {
  try {
    await assertSuperAdmin();

    const { searchParams } = new URL(request.url);
    // Période : "7d" | "30d" | "90d" (défaut 30d)
    const period = searchParams.get("period") ?? "30d";

    const days = period === "7d" ? 7 : period === "90d" ? 90 : 30;
    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceStr = since.toISOString();

    // ---- 1. Totaux globaux sur la période ----
    const [totals] = await db
      .select({
        totalPageViews: count(pageViews.id),
        uniqueVisitors: countDistinct(pageViews.sessionId),
      })
      .from(pageViews)
      .where(gte(pageViews.createdAt, new Date(sinceStr)));

    const [clickTotals] = await db
      .select({ totalClicks: count(clickEvents.id) })
      .from(clickEvents)
      .where(gte(clickEvents.createdAt, new Date(sinceStr)));

    // ---- 2. Top pages visitées ----
    const topPages = await db
      .select({
        path: pageViews.path,
        views: count(pageViews.id),
        uniqueSessions: countDistinct(pageViews.sessionId),
      })
      .from(pageViews)
      .where(gte(pageViews.createdAt, new Date(sinceStr)))
      .groupBy(pageViews.path)
      .orderBy(desc(count(pageViews.id)))
      .limit(10);

    // ---- 3. Top éléments cliqués ----
    const topClicks = await db
      .select({
        path: clickEvents.path,
        elementId: clickEvents.elementId,
        elementText: clickEvents.elementText,
        elementType: clickEvents.elementType,
        clicks: count(clickEvents.id),
      })
      .from(clickEvents)
      .where(gte(clickEvents.createdAt, new Date(sinceStr)))
      .groupBy(
        clickEvents.path,
        clickEvents.elementId,
        clickEvents.elementText,
        clickEvents.elementType
      )
      .orderBy(desc(count(clickEvents.id)))
      .limit(10);

    // ---- 4. Évolution journalière (sparkline) ----
    const dailyEvolution = await db
      .select({
        date: dailyStats.date,
        pageViews: dailyStats.totalPageViews,
        uniqueVisitors: dailyStats.uniqueVisitors,
        clicks: dailyStats.totalClicks,
      })
      .from(dailyStats)
      .where(gte(dailyStats.date, since.toISOString().split("T")[0]))
      .orderBy(dailyStats.date);

    // ---- 5. Pages visitées par session (profondeur de visite) ----
    const sessionDepth = await db
      .select({
        sessionId: pageViews.sessionId,
        pagesVisited: count(pageViews.id),
      })
      .from(pageViews)
      .where(gte(pageViews.createdAt, new Date(sinceStr)))
      .groupBy(pageViews.sessionId)
      .orderBy(desc(count(pageViews.id)))
      .limit(100);

    const avgPagesPerSession =
      sessionDepth.length > 0
        ? (
            sessionDepth.reduce((acc, s) => acc + Number(s.pagesVisited), 0) /
            sessionDepth.length
          ).toFixed(2)
        : "0";

    return NextResponse.json({
      period,
      totals: {
        pageViews: Number(totals.totalPageViews),
        uniqueVisitors: Number(totals.uniqueVisitors),
        totalClicks: Number(clickTotals.totalClicks),
        avgPagesPerSession: Number(avgPagesPerSession),
      },
      topPages,
      topClicks,
      dailyEvolution,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHENTICATED")
        return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
      if (error.message === "FORBIDDEN")
        return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
    console.error("[Analytics/stats]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
