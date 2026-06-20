import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/lib/db";
import { notifications } from "@/drizzle/schema";
import { eq, and, desc, isNull } from "drizzle-orm";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const unreadList = await db.query.notifications.findMany({
      where: and(
        eq(notifications.destinataireId, user.id),
        eq(notifications.lu, false),
        isNull(notifications.deletedAt)
      ),
      orderBy: [desc(notifications.createdAt)],
    });

    return NextResponse.json({ success: true, notifications: unreadList });
  } catch (error: any) {
    console.error("Error fetching unread notifications:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
