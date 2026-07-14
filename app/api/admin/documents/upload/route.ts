import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/lib/db";
import { profiles } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { encryptDocument } from "@/lib/crypto";
import { logSystemError } from "@/lib/errorAlertService";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // 1. Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Non autorisé. Veuillez vous connecter." },
        { status: 401 }
      );
    }

    // 2. Fetch candidate profile and verify role (admin, super_admin, or manager_zone)
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.id, user.id),
    });

    const isAuthorized =
      profile &&
      (profile.role === "admin" ||
        profile.role === "super_admin" ||
        profile.role === "manager_zone");

    if (!profile || !isAuthorized) {
      return NextResponse.json(
        { error: "Accès refusé. Privilèges insuffisants." },
        { status: 403 }
      );
    }

    // Get session for access token (storage operations require user session credentials)
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Session expirée. Veuillez vous reconnecter." },
        { status: 401 }
      );
    }

    // 3. Parse and validate file upload
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier n'a été fourni." },
        { status: 400 }
      );
    }

    // Validate mime-type (only PDF)
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Format invalide. Seuls les fichiers PDF sont autorisés." },
        { status: 400 }
      );
    }

    // Validate file size (15 MB max)
    const maxSize = 15 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Fichier trop volumineux. La taille maximale est de 15 Mo." },
        { status: 400 }
      );
    }

    // 4. Encrypt file buffer
    const arrayBuffer = await file.arrayBuffer();
    const encryptedBuffer = encryptDocument(Buffer.from(arrayBuffer));

    // Generate unique name
    const fileExt = file.name.split(".").pop() || "pdf";
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `supports/${fileName}`;

    // Direct REST API upload to the private storage bucket
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const uploadUrl = `${supabaseUrl}/storage/v1/object/documents/${filePath}`;

    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": file.type,
        "x-upsert": "false",
      },
      body: new Uint8Array(encryptedBuffer),
    });

    if (!uploadResponse.ok) {
      const errorBody = await uploadResponse.text();
      console.error("Supabase Storage secure document upload error:", uploadResponse.status, errorBody);
      return NextResponse.json(
        { error: "Erreur lors du téléversement du document sur le serveur de stockage." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, filePath });
  } catch (err: any) {
    await logSystemError({
      errorMessage: `Erreur upload document PDF sécurisé : ${err.message || err}`,
      level: "critical",
      source: "upload",
      stackTrace: err.stack,
    });
    return NextResponse.json(
      { error: "Une erreur interne est survenue lors du traitement." },
      { status: 500 }
    );
  }
}
