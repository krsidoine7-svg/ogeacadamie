import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/lib/db";
import { profiles, paiements } from "@/drizzle/schema";
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

    // Get the user's access token for storage operations
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

    // Validate mime-type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Format invalide. Seuls les formats JPG, PNG et WEBP sont acceptés." },
        { status: 400 }
      );
    }

    // Validate file size (5 MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Fichier trop volumineux. La taille maximale est de 5 Mo." },
        { status: 400 }
      );
    }

    // 3. Fetch candidate profile to retrieve zone
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.id, user.id),
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Profil utilisateur introuvable." },
        { status: 404 }
      );
    }

    if (!profile.zone) {
      return NextResponse.json(
        { error: "Zone non configurée dans votre profil. Veuillez contacter l'administrateur." },
        { status: 400 }
      );
    }

    // 4. Upload file to private Supabase Storage via REST API
    const arrayBuffer = await file.arrayBuffer();

    // Extract file extension securely
    const extension = file.name.split(".").pop()?.toLowerCase() || "png";
    const safeExtension = ["jpg", "jpeg", "png", "webp"].includes(extension) ? extension : "png";
    const fileName = `${user.id}/${user.id}_${Date.now()}.${safeExtension}`;

    // Direct REST API upload — bypasses SDK schema validation issues
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const uploadUrl = `${supabaseUrl}/storage/v1/object/captures-paiements/${fileName}`;
    
    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": file.type,
        "x-upsert": "true",
      },
      body: arrayBuffer,
    });

    if (!uploadResponse.ok) {
      const errorBody = await uploadResponse.text();
      console.error("Supabase Storage upload error:", uploadResponse.status, errorBody);
      return NextResponse.json(
        { error: "Erreur lors de l'enregistrement de l'image sur l'espace de stockage." },
        { status: 500 }
      );
    }

    // 5. Update/Insert payment record in database
    const existingPaiement = await db.query.paiements.findFirst({
      where: eq(paiements.userId, user.id),
    });

    if (existingPaiement) {
      await db
        .update(paiements)
        .set({
          captureUrl: fileName,
          statut: "en_cours",
          zone: profile.zone,
          notes: null, // Reset rejection notes on re-upload
          updatedAt: new Date(),
        })
        .where(eq(paiements.userId, user.id));
    } else {
      await db.insert(paiements).values({
        userId: user.id,
        zone: profile.zone,
        statut: "en_cours",
        captureUrl: fileName,
        montant: 15000,
      });
    }

    return NextResponse.json({ success: true, filePath: fileName });
  } catch (err) {
    console.error("Unhandled error in payment upload endpoint:", err);
    return NextResponse.json(
      { error: "Une erreur interne est survenue lors du traitement." },
      { status: 500 }
    );
  }
}
