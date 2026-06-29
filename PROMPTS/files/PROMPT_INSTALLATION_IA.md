# PROMPT D'INSTALLATION — Système de statistiques Next.js 15 / Supabase / Drizzle

Installe dans mon projet Next.js 15 (React 19, Supabase, Drizzle ORM) un système complet de statistiques de site.
Voici tous les fichiers à créer. Suis scrupuleusement la structure indiquée.

---

## FICHIER 1 : db/schema.analytics.ts
*(Ajouter les exports dans ton db/schema.ts existant)*

```ts
import {
  pgTable, uuid, text, integer, timestamp, varchar, index,
} from "drizzle-orm/pg-core";

export const pageViews = pgTable("page_views", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: varchar("session_id", { length: 64 }).notNull(),
  path: text("path").notNull(),
  referrer: text("referrer"),
  userAgent: text("user_agent"),
  ipAnonymized: varchar("ip_anonymized", { length: 32 }),
  country: varchar("country", { length: 8 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  pathIdx: index("page_views_path_idx").on(table.path),
  sessionIdx: index("page_views_session_idx").on(table.sessionId),
  createdAtIdx: index("page_views_created_at_idx").on(table.createdAt),
}));

export const clickEvents = pgTable("click_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: varchar("session_id", { length: 64 }).notNull(),
  path: text("path").notNull(),
  elementId: varchar("element_id", { length: 128 }),
  elementText: text("element_text"),
  elementType: varchar("element_type", { length: 32 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  pathIdx: index("click_events_path_idx").on(table.path),
  sessionIdx: index("click_events_session_idx").on(table.sessionId),
  createdAtIdx: index("click_events_created_at_idx").on(table.createdAt),
}));

export const dailyStats = pgTable("daily_stats", {
  id: uuid("id").defaultRandom().primaryKey(),
  date: varchar("date", { length: 10 }).notNull().unique(),
  totalPageViews: integer("total_page_views").default(0).notNull(),
  uniqueVisitors: integer("unique_visitors").default(0).notNull(),
  totalClicks: integer("total_clicks").default(0).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  dateIdx: index("daily_stats_date_idx").on(table.date),
}));

export type PageView = typeof pageViews.$inferSelect;
export type NewPageView = typeof pageViews.$inferInsert;
export type ClickEvent = typeof clickEvents.$inferSelect;
export type NewClickEvent = typeof clickEvents.$inferInsert;
export type DailyStat = typeof dailyStats.$inferSelect;
```

---

## FICHIER 2 : hooks/use-analytics.ts

```ts
"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

function getOrCreateSessionId(): string {
  const COOKIE_NAME = "_sid";
  const existing = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${COOKIE_NAME}=`))
    ?.split("=")[1];
  if (existing) return existing;
  const newId = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const expires = new Date();
  expires.setDate(expires.getDate() + 30);
  document.cookie = `${COOKIE_NAME}=${newId}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;
  return newId;
}

async function trackPageView(path: string) {
  try {
    const sessionId = getOrCreateSessionId();
    await fetch("/api/analytics/pageview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, path, referrer: document.referrer || null, userAgent: navigator.userAgent }),
      keepalive: true,
    });
  } catch {}
}

async function trackClick(path: string, elementId: string | null, elementText: string | null, elementType: string) {
  try {
    const sessionId = getOrCreateSessionId();
    await fetch("/api/analytics/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, path, elementId, elementText: elementText?.slice(0, 100) ?? null, elementType }),
      keepalive: true,
    });
  } catch {}
}

export function useAnalytics() {
  const pathname = usePathname();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    if (pathname && pathname !== lastTrackedPath.current) {
      lastTrackedPath.current = pathname;
      trackPageView(pathname);
    }
  }, [pathname]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const clickable = target.closest("a, button, [data-analytics-id]");
      if (!clickable) return;
      const tag = clickable.tagName.toLowerCase();
      const elementType = tag === "a" ? "link" : tag === "button" ? "button" : "other";
      const elementId = clickable.getAttribute("data-analytics-id") || clickable.getAttribute("id") || null;
      const elementText = clickable.textContent?.trim() || null;
      trackClick(pathname ?? "/", elementId, elementText, elementType);
    };
    document.addEventListener("click", handleClick, { passive: true });
    return () => document.removeEventListener("click", handleClick);
  }, [pathname]);
}
```

---

## FICHIER 3 : components/analytics-provider.tsx

```tsx
"use client";
import { useAnalytics } from "@/hooks/use-analytics";
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useAnalytics();
  return <>{children}</>;
}
```

---

## FICHIER 4 : app/api/analytics/pageview/route.ts

```ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { pageViews, dailyStats } from "@/db/schema";
import { sql } from "drizzle-orm";

function anonymizeIp(ip: string): string {
  if (ip.includes(":")) return ip.split(":").slice(0, 3).join(":") + ":****";
  const parts = ip.split(".");
  if (parts.length === 4) return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
  return "unknown";
}

function getTodayString(): string { return new Date().toISOString().split("T")[0]; }

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, path, referrer, userAgent } = body;
    if (!sessionId || !path) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    const rawIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
    const ipAnonymized = anonymizeIp(rawIp);
    const country = request.headers.get("cf-ipcountry") || null;
    const today = getTodayString();
    await db.insert(pageViews).values({ sessionId, path, referrer: referrer || null, userAgent: userAgent || null, ipAnonymized, country });
    await db.insert(dailyStats).values({ date: today, totalPageViews: 1, uniqueVisitors: 1, totalClicks: 0 })
      .onConflictDoUpdate({ target: dailyStats.date, set: { totalPageViews: sql`${dailyStats.totalPageViews} + 1`, updatedAt: new Date() } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Analytics/pageview]", error);
    return NextResponse.json({ ok: false });
  }
}
```

---

## FICHIER 5 : app/api/analytics/click/route.ts

```ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { clickEvents, dailyStats } from "@/db/schema";
import { sql } from "drizzle-orm";

function getTodayString(): string { return new Date().toISOString().split("T")[0]; }

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, path, elementId, elementText, elementType } = body;
    if (!sessionId || !path) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    const today = getTodayString();
    await db.insert(clickEvents).values({ sessionId, path, elementId: elementId || null, elementText: elementText?.slice(0, 100) || null, elementType: elementType || "other" });
    await db.insert(dailyStats).values({ date: today, totalPageViews: 0, uniqueVisitors: 0, totalClicks: 1 })
      .onConflictDoUpdate({ target: dailyStats.date, set: { totalClicks: sql`${dailyStats.totalClicks} + 1`, updatedAt: new Date() } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Analytics/click]", error);
    return NextResponse.json({ ok: false });
  }
}
```

---

## FICHIER 6 : app/api/analytics/stats/route.ts

```ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { pageViews, clickEvents, dailyStats } from "@/db/schema";
import { desc, gte, count, countDistinct } from "drizzle-orm";

async function assertSuperAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  const role = user.user_metadata?.role || user.app_metadata?.role || null;
  if (role !== "super_admin") throw new Error("FORBIDDEN");
  return user;
}

export async function GET(request: NextRequest) {
  try {
    await assertSuperAdmin();
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") ?? "30d";
    const days = period === "7d" ? 7 : period === "90d" ? 90 : 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [totals] = await db.select({ totalPageViews: count(pageViews.id), uniqueVisitors: countDistinct(pageViews.sessionId) })
      .from(pageViews).where(gte(pageViews.createdAt, since));
    const [clickTotals] = await db.select({ totalClicks: count(clickEvents.id) })
      .from(clickEvents).where(gte(clickEvents.createdAt, since));
    const topPages = await db.select({ path: pageViews.path, views: count(pageViews.id), uniqueSessions: countDistinct(pageViews.sessionId) })
      .from(pageViews).where(gte(pageViews.createdAt, since)).groupBy(pageViews.path).orderBy(desc(count(pageViews.id))).limit(10);
    const topClicks = await db.select({ path: clickEvents.path, elementId: clickEvents.elementId, elementText: clickEvents.elementText, elementType: clickEvents.elementType, clicks: count(clickEvents.id) })
      .from(clickEvents).where(gte(clickEvents.createdAt, since)).groupBy(clickEvents.path, clickEvents.elementId, clickEvents.elementText, clickEvents.elementType).orderBy(desc(count(clickEvents.id))).limit(10);
    const dailyEvolution = await db.select({ date: dailyStats.date, pageViews: dailyStats.totalPageViews, uniqueVisitors: dailyStats.uniqueVisitors, clicks: dailyStats.totalClicks })
      .from(dailyStats).where(gte(dailyStats.date, since.toISOString().split("T")[0])).orderBy(dailyStats.date);
    const sessionDepth = await db.select({ sessionId: pageViews.sessionId, pagesVisited: count(pageViews.id) })
      .from(pageViews).where(gte(pageViews.createdAt, since)).groupBy(pageViews.sessionId).orderBy(desc(count(pageViews.id))).limit(100);
    const avgPagesPerSession = sessionDepth.length > 0
      ? (sessionDepth.reduce((acc, s) => acc + Number(s.pagesVisited), 0) / sessionDepth.length).toFixed(2) : "0";

    return NextResponse.json({ period, totals: { pageViews: Number(totals.totalPageViews), uniqueVisitors: Number(totals.uniqueVisitors), totalClicks: Number(clickTotals.totalClicks), avgPagesPerSession: Number(avgPagesPerSession) }, topPages, topClicks, dailyEvolution });
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHENTICATED") return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
      if (error.message === "FORBIDDEN") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
    console.error("[Analytics/stats]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
```

---

## FICHIER 7 : app/admin/analytics/page.tsx
*(Copier intégralement le fichier admin-analytics-page.tsx fourni)*

---

## FICHIER 8 : middleware.ts
*(Fusionner avec votre middleware existant si besoin)*

```ts
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/admin")) return NextResponse.next();
  const response = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url));
  const role = user.user_metadata?.role || user.app_metadata?.role || null;
  if (role !== "super_admin") return NextResponse.redirect(new URL("/403", request.url));
  return response;
}

export const config = { matcher: ["/admin/:path*"] };
```

---

## MODIFICATION app/layout.tsx

Ajouter `<AnalyticsProvider>` autour des enfants :

```tsx
import { AnalyticsProvider } from "@/components/analytics-provider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <AnalyticsProvider>
          {children}
        </AnalyticsProvider>
      </body>
    </html>
  );
}
```

---

## SQL à exécuter dans Supabase SQL Editor

```sql
CREATE TABLE IF NOT EXISTS "page_views" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "session_id" varchar(64) NOT NULL,
  "path" text NOT NULL,
  "referrer" text,
  "user_agent" text,
  "ip_anonymized" varchar(32),
  "country" varchar(8),
  "created_at" timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS "click_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "session_id" varchar(64) NOT NULL,
  "path" text NOT NULL,
  "element_id" varchar(128),
  "element_text" text,
  "element_type" varchar(32),
  "created_at" timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS "daily_stats" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "date" varchar(10) NOT NULL UNIQUE,
  "total_page_views" integer NOT NULL DEFAULT 0,
  "unique_visitors" integer NOT NULL DEFAULT 0,
  "total_clicks" integer NOT NULL DEFAULT 0,
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "page_views_path_idx" ON "page_views" ("path");
CREATE INDEX IF NOT EXISTS "page_views_session_idx" ON "page_views" ("session_id");
CREATE INDEX IF NOT EXISTS "page_views_created_at_idx" ON "page_views" ("created_at");
CREATE INDEX IF NOT EXISTS "click_events_path_idx" ON "click_events" ("path");
CREATE INDEX IF NOT EXISTS "click_events_session_idx" ON "click_events" ("session_id");
CREATE INDEX IF NOT EXISTS "click_events_created_at_idx" ON "click_events" ("created_at");
CREATE INDEX IF NOT EXISTS "daily_stats_date_idx" ON "daily_stats" ("date");

ALTER TABLE "page_views" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "click_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "daily_stats" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "super_admin_read_page_views" ON "page_views" FOR SELECT
  USING (EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid()
    AND (auth.users.raw_user_meta_data->>'role' = 'super_admin' OR auth.users.raw_app_meta_data->>'role' = 'super_admin')));
CREATE POLICY "super_admin_read_click_events" ON "click_events" FOR SELECT
  USING (EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid()
    AND (auth.users.raw_user_meta_data->>'role' = 'super_admin' OR auth.users.raw_app_meta_data->>'role' = 'super_admin')));
CREATE POLICY "super_admin_read_daily_stats" ON "daily_stats" FOR SELECT
  USING (EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid()
    AND (auth.users.raw_user_meta_data->>'role' = 'super_admin' OR auth.users.raw_app_meta_data->>'role' = 'super_admin')));
```
