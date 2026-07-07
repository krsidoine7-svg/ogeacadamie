import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/lib/db";
import { profiles } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

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

    // Determine type (image or video)
    const mimeType = file.type;
    const isImage = mimeType.startsWith("image/");
    const isVideo = mimeType.startsWith("video/");

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: "Type de fichier non supporté. Seuls les images et les vidéos sont autorisés." },
        { status: 400 }
      );
    }

    // Strict extension verification
    const originalName = file.name || "";
    const fileExt = originalName.split(".").pop()?.toLowerCase() || "";
    
    const allowedImageExts = ["jpg", "jpeg", "png", "webp", "gif"];
    const allowedVideoExts = ["mp4", "webm", "ogg", "mov"];

    if (isImage && !allowedImageExts.includes(fileExt)) {
      return NextResponse.json(
        { error: `Extension d'image invalide. Extensions autorisées : ${allowedImageExts.join(", ")}` },
        { status: 400 }
      );
    }

    if (isVideo && !allowedVideoExts.includes(fileExt)) {
      return NextResponse.json(
        { error: `Extension de vidéo invalide. Extensions autorisées : ${allowedVideoExts.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate size limit (Images: 50MB, Videos: 200MB)
    const maxImageSize = 50 * 1024 * 1024;
    const maxVideoSize = 200 * 1024 * 1024;
    const sizeLimit = isImage ? maxImageSize : maxVideoSize;

    if (file.size > sizeLimit) {
      const displayLimit = isImage ? "50 Mo" : "200 Mo";
      return NextResponse.json(
        { error: `Fichier trop volumineux. La limite pour ce type est de ${displayLimit}.` },
        { status: 400 }
      );
    }

    // 4. Generate unique name and path
    // Generate UUID to prevent collision and path traversal
    const uniqueId = crypto.randomUUID();
    const fileName = `${uniqueId}.${fileExt}`;
    const filePath = `public-assets/${fileName}`;

    // Direct REST API upload to the storage bucket "documents"
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const uploadUrl = `${supabaseUrl}/storage/v1/object/documents/${filePath}`;

    const arrayBuffer = await file.arrayBuffer();

    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": file.type,
        "x-upsert": "false",
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

    return NextResponse.json({ success: true, url: publicUrl, path: filePath });
  } catch (err: any) {
    console.error("Unhandled error in upload API route:", err);
    return NextResponse.json(
      { error: "Une erreur interne est survenue lors du traitement." },
      { status: 500 }
    );
  }
}
