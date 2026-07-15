import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/lib/db";
import { profiles, paiements, documents, accesDocuments, concoursInscrits } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";
import { decryptDocument } from "@/lib/crypto";
import { logSystemError } from "@/lib/errorAlertService";

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

    // 4. Fetch the requested document (admins and managers can view inactive/draft documents)
    const document = await db.query.documents.findFirst({
      where: and(
        eq(documents.id, documentId),
        isAdminOrManager ? undefined : eq(documents.isActive, true)
      ),
    });

    if (!document || !document.fichierUrl) {
      return NextResponse.json(
        { error: "Document introuvable ou indisponible." },
        { status: 404 }
      );
    }

    // 5. Verify candidate's concours access (skip for admin/manager)
    if (!isAdminOrManager) {
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

      // Verify modeFormation access
      if (document.modeFormation && document.modeFormation !== "tous") {
        if (profile.modeFormation !== document.modeFormation) {
          return NextResponse.json(
            { error: "Ce document n'est pas disponible pour votre mode de préparation." },
            { status: 403 }
          );
        }
      }

      // Verify zone access
      if (document.zone && document.zone !== "tous") {
        if (profile.zone !== document.zone) {
          return NextResponse.json(
            { error: "Ce document n'est pas disponible pour votre zone géographique." },
            { status: 403 }
          );
        }
      }
    }

    // 5.5 If it's an external link (Google Drive / Cloud), log access and return url or redirect
    if (document.isExternalLink || document.fichierUrl?.startsWith("http://") || document.fichierUrl?.startsWith("https://")) {
      if (profile.role === "user") {
        try {
          await db.insert(accesDocuments).values({
            userId: user.id,
            documentId: document.id,
          });
        } catch (insertErr) {
          console.error("Erreur log acces document externe:", insertErr);
        }
      }

      const urlObj = new URL(req.url);
      if (urlObj.searchParams.get("redirect") === "true") {
        return NextResponse.redirect(document.fichierUrl!);
      }

      return NextResponse.json({
        isExternal: true,
        url: document.fichierUrl,
      });
    }

    // 6. Download file from private Supabase Storage
    const { data: storageBlob, error: downloadError } = await supabase.storage
      .from("documents")
      .download(document.fichierUrl);

    if (downloadError || !storageBlob) {
      console.error("Storage secure document download error:", downloadError);
      const isNotFound = 
        downloadError && 
        ((downloadError as any).status === 404 || 
         (downloadError as any).statusCode === "404" || 
         (downloadError as any).message?.includes("Object not found"));

      return NextResponse.json(
        { error: isNotFound ? "Ce fichier de cours n'existe pas ou a été retiré du serveur de stockage." : "Erreur lors du téléchargement du fichier sécurisé." },
        { status: isNotFound ? 404 : 500 }
      );
    }

    // 7. Decrypt the file buffer
    const arrayBuffer = await storageBlob.arrayBuffer();
    let decryptedBuffer: Buffer;
    try {
      decryptedBuffer = decryptDocument(Buffer.from(arrayBuffer));
    } catch (decryptErr: any) {
      console.error("Decryption error:", decryptErr);
      await logSystemError({
        errorMessage: `Erreur déchiffrement PDF : ${decryptErr.message || decryptErr}`,
        level: "critical",
        source: "api",
        stackTrace: decryptErr.stack,
        userId: user?.id,
      });
      return NextResponse.json(
        { error: "Erreur lors du décodage sécurisé du fichier." },
        { status: 500 }
      );
    }

    // 8. Log document access (only for standard candidate user role)
    if (profile.role === "user") {
      try {
        await db.insert(accesDocuments).values({
          userId: user.id,
          documentId: document.id,
        });
      } catch (insertErr: any) {
        // Ignore unique constraint violations (meaning the user has already accessed this document)
        const isUniqueViolation =
          insertErr.code === "23505" ||
          insertErr.cause?.code === "23505" ||
          insertErr.message?.includes("unique constraint") ||
          insertErr.cause?.message?.includes("unique constraint");

        if (!isUniqueViolation) {
          console.error("Erreur lors de l'enregistrement de l'accès document :", insertErr);
        }
      }
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
    await logSystemError({
      errorMessage: `Erreur inattendue consultation PDF : ${err.message || err}`,
      level: "critical",
      source: "api",
      stackTrace: err.stack,
    });
    return NextResponse.json(
      { error: "Une erreur interne est survenue lors du traitement." },
      { status: 500 }
    );
  }
}
