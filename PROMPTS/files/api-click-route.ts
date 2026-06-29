// ============================================================
// app/api/analytics/click/route.ts
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db"; // ← votre instance Drizzle
import { clickEvents, dailyStats } from "@/db/schema"; // ← adaptez le chemin
import { sql } from "drizzle-orm";

function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, path, elementId, elementText, elementType } = body;

    if (!sessionId || !path) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const today = getTodayString();

    // 1. Insère l'événement de clic
    await db.insert(clickEvents).values({
      sessionId,
      path,
      elementId: elementId || null,
      elementText: elementText?.slice(0, 100) || null,
      elementType: elementType || "other",
    });

    // 2. Met à jour les stats quotidiennes
    await db
      .insert(dailyStats)
      .values({
        date: today,
        totalPageViews: 0,
        uniqueVisitors: 0,
        totalClicks: 1,
      })
      .onConflictDoUpdate({
        target: dailyStats.date,
        set: {
          totalClicks: sql`${dailyStats.totalClicks} + 1`,
          updatedAt: new Date(),
        },
      });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("[Analytics/click]", error);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
