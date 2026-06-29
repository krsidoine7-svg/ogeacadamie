// ============================================================
// app/api/analytics/pageview/route.ts
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db"; // ← votre instance Drizzle
import { pageViews, dailyStats } from "@/db/schema"; // ← adaptez le chemin
import { eq, sql } from "drizzle-orm";

// Anonymise une IP : garde seulement les 3 premiers octets IPv4
// ou les 3 premiers groupes IPv6
function anonymizeIp(ip: string): string {
  if (ip.includes(":")) {
    // IPv6 : garde les 3 premiers groupes
    return ip.split(":").slice(0, 3).join(":") + ":****";
  }
  const parts = ip.split(".");
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
  }
  return "unknown";
}

function getTodayString(): string {
  return new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, path, referrer, userAgent } = body;

    if (!sessionId || !path) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Récupère l'IP depuis les headers (Vercel, Cloudflare, etc.)
    const rawIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const ipAnonymized = anonymizeIp(rawIp);
    const country = request.headers.get("cf-ipcountry") || null;
    const today = getTodayString();

    // 1. Insère la page view
    await db.insert(pageViews).values({
      sessionId,
      path,
      referrer: referrer || null,
      userAgent: userAgent || null,
      ipAnonymized,
      country,
    });

    // 2. Met à jour les stats quotidiennes (upsert)
    await db
      .insert(dailyStats)
      .values({
        date: today,
        totalPageViews: 1,
        uniqueVisitors: 1,
        totalClicks: 0,
      })
      .onConflictDoUpdate({
        target: dailyStats.date,
        set: {
          totalPageViews: sql`${dailyStats.totalPageViews} + 1`,
          updatedAt: new Date(),
        },
      });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("[Analytics/pageview]", error);
    // Retourne 200 quand même pour ne pas alerter côté client
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
