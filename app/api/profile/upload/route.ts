import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/lib/db";
import { profiles } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
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

    // Get session for access token (storage operations require user session credentials)
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Session expirée. Veuillez vous reconnecter." },
        { status: 401 }
      );
    }

    // 2. Parse and validate file upload
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier n'a été fourni." },
        { status: 400 }
      );
    }

    // Determine type (only images allowed for avatars)
    const mimeType = file.type;
    const isImage = mimeType.startsWith("image/");

    if (!isImage) {
      return NextResponse.json(
        { error: "Seules les images sont autorisées pour la photo de profil." },
        { status: 400 }
      );
    }

    // Strict extension verification
    const originalName = file.name || "";
    const fileExt = originalName.split(".").pop()?.toLowerCase() || "";
    const allowedImageExts = ["jpg", "jpeg", "png", "webp", "gif"];

    if (!allowedImageExts.includes(fileExt)) {
      return NextResponse.json(
        { error: `Extension d'image invalide. Extensions autorisées : ${allowedImageExts.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate size limit (5MB max for profile picture)
    const maxImageSize = 5 * 1024 * 1024;
    if (file.size > maxImageSize) {
      return NextResponse.json(
        { error: "Fichier trop volumineux. La limite pour la photo de profil est de 5 Mo." },
        { status: 400 }
      );
    }

    // 3. Generate unique name and path
    // Generate UUID to prevent collision and path traversal
    const uniqueId = crypto.randomUUID();
    const fileName = `${user.id}-${uniqueId}.${fileExt}`;
    const filePath = `public-assets/avatars/${fileName}`;

    // Direct REST API upload to the storage bucket "documents"
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const uploadUrl = `${supabaseUrl}/storage/v1/object/documents/${filePath}`;

    const arrayBuffer = await file.arrayBuffer();

    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": file.type,
        "x-upsert": "true",
      },
      body: new Uint8Array(arrayBuffer),
    });

    if (!uploadResponse.ok) {
      const errorBody = await uploadResponse.text();
      console.error("Supabase Storage upload error:", uploadResponse.status, errorBody);
      return NextResponse.json(
        { error: "Erreur lors du téléversement du fichier sur l'espace de stockage." },
        { status: 500 }
      );
    }

    // Construct the public URL
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/documents/${filePath}`;

    // Update profile in DB immediately
    await db.update(profiles)
      .set({
        avatarUrl: publicUrl,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, user.id));

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (err: any) {
    console.error("Unhandled error in profile upload API route:", err);
    await logSystemError({
      errorMessage: `Erreur upload avatar profil : ${err.message || err}`,
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
