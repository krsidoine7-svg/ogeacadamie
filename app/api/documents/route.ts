import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/lib/db";
import { profiles, paiements, documents, accesDocuments, concoursInscrits } from "@/drizzle/schema";
import { eq, and, or } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const documentId = searchParams.get("documentId");

    if (!documentId) {
      return NextResponse.json(
        { error: "Identifiant du document manquant." },
        { status: 400 }
      );
    }

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

    // 2. Fetch candidate profile
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.id, user.id),
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Profil utilisateur introuvable." },
        { status: 404 }
      );
    }

    // Check if account is active
    if (!profile.isActive) {
      return NextResponse.json(
        { error: "Votre compte est inactif. Veuillez contacter le support." },
        { status: 403 }
      );
    }

    // 3. Verify payment status
    const payment = await db.query.paiements.findFirst({
      where: eq(paiements.userId, user.id),
    });

    if (!payment || payment.statut !== "valide") {
      return NextResponse.json(
        { error: "Accès restreint. Vos frais d'inscription ne sont pas encore validés." },
        { status: 403 }
      );
    }

    // 4. Fetch the requested document
    const document = await db.query.documents.findFirst({
      where: and(
        eq(documents.id, documentId),
        eq(documents.isActive, true)
      ),
    });

    if (!document || !document.fichierUrl) {
      return NextResponse.json(
        { error: "Document introuvable ou indisponible." },
        { status: 404 }
      );
    }

    // 5. Verify candidate's concours access
    if (document.concours && document.concours !== "tous") {
      const userRegistrations = await db.query.concoursInscrits.findMany({
        where: eq(concoursInscrits.userId, user.id),
      });

      const registeredConcoursList = userRegistrations.map((r) => r.concours as string);
      const isRegistered = registeredConcoursList.includes(document.concours);

      if (!isRegistered) {
        return NextResponse.json(
          { error: "Vous n'êtes pas inscrit à la préparation de ce concours." },
          { status: 403 }
        );
      }
    }

    // 6. Generate signed URL for Supabase Storage (bucket: 'documents')
    const { data: signData, error: signError } = await supabase.storage
      .from("documents")
      .createSignedUrl(document.fichierUrl, 3600); // 1 hour validity

    if (signError || !signData?.signedUrl) {
      console.error("Storage signed url generation error:", signError);
      return NextResponse.json(
        { error: "Erreur lors de la génération de l'accès au fichier." },
        { status: 500 }
      );
    }

    // 7. Log document access
    await db.insert(accesDocuments).values({
      userId: user.id,
      documentId: document.id,
    });

    return NextResponse.json({ signedUrl: signData.signedUrl });
  } catch (err: any) {
    console.error("Unhandled error in documents API:", err);
    return NextResponse.json(
      { error: "Une erreur interne est survenue lors du traitement." },
      { status: 500 }
    );
  }
}
