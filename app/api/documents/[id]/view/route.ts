import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/lib/db";
import { profiles, paiements, documents, accesDocuments, concoursInscrits } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";
import { decryptDocument } from "@/lib/crypto";

export async function GET(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const documentId = params.id;

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

    // 3. Verify payment status (unless they are admin, super_admin or manager)
    const isAdminOrManager = 
      profile.role === "admin" || 
      profile.role === "super_admin" || 
      profile.role === "manager_zone";
    
    if (!isAdminOrManager) {
      const payment = await db.query.paiements.findFirst({
        where: eq(paiements.userId, user.id),
      });

      if (!payment || payment.statut !== "valide") {
        return NextResponse.json(
          { error: "Accès restreint. Vos frais d'inscription ne sont pas encore validés." },
          { status: 403 }
        );
      }
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

    // 5. Verify candidate's concours access (skip for admin/manager)
    if (!isAdminOrManager && document.concours && document.concours !== "tous") {
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

    // 6. Download file from private Supabase Storage
    const { data: storageBlob, error: downloadError } = await supabase.storage
      .from("documents")
      .download(document.fichierUrl);

    if (downloadError || !storageBlob) {
      console.error("Storage secure document download error:", downloadError);
      return NextResponse.json(
        { error: "Erreur lors du téléchargement du fichier sécurisé." },
        { status: 500 }
      );
    }

    // 7. Decrypt the file buffer
    const arrayBuffer = await storageBlob.arrayBuffer();
    let decryptedBuffer: Buffer;
    try {
      decryptedBuffer = decryptDocument(Buffer.from(arrayBuffer));
    } catch (decryptErr) {
      console.error("Decryption error:", decryptErr);
      return NextResponse.json(
        { error: "Erreur lors du décodage sécurisé du fichier." },
        { status: 500 }
      );
    }

    // 8. Log document access (only for standard candidate user role)
    if (profile.role === "user") {
      await db.insert(accesDocuments).values({
        userId: user.id,
        documentId: document.id,
      });
    }

    // 9. Stream/Return decrypted PDF with anti-caching security headers
    return new NextResponse(new Uint8Array(decryptedBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline; filename=\"document.pdf\"",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err: any) {
    console.error("Unhandled error in secure download view endpoint:", err);
    return NextResponse.json(
      { error: "Une erreur interne est survenue lors du traitement." },
      { status: 500 }
    );
  }
}
