import React from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/lib/db";
import { profiles, paiements, documents, accesDocuments, concoursInscrits } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";
import SecureViewerClient from "./SecureViewerClient";
import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react";

interface ViewerPageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function ViewerPage({ searchParams }: ViewerPageProps) {
  const params = await searchParams;
  const documentId = params.id;

  if (!documentId) {
    redirect("/dashboard/documents");
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 1. Authenticate user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/connexion");
  }

  // 2. Fetch candidate profile
  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, user.id),
  });

  if (!profile) {
    redirect("/connexion");
  }

  // Check if account is active
  if (!profile.isActive) {
    redirect("/dashboard");
  }

  // 3. Verify payment status
  const payment = await db.query.paiements.findFirst({
    where: eq(paiements.userId, user.id),
  });

  if (!payment || payment.statut !== "valide") {
    redirect("/dashboard");
  }

  // 4. Fetch the requested document
  const document = await db.query.documents.findFirst({
    where: and(
      eq(documents.id, documentId),
      eq(documents.isActive, true)
    ),
  });

  if (!document || !document.fichierUrl) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md bg-slate-800 border border-slate-700 p-8 rounded-2xl shadow-xl">
          <div className="w-12 h-12 bg-red-500/10 rounded-xl border border-red-500/20 flex items-center justify-center mx-auto text-red-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold">Document Non Disponible</h2>
          <p className="text-sm text-slate-400">
            Ce document est introuvable ou a été désactivé par l'administration.
          </p>
          <Link
            href="/dashboard/documents"
            className="inline-flex items-center gap-2 text-xs font-bold bg-white text-slate-900 hover:bg-slate-100 px-4 py-2.5 rounded-xl transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Retourner aux documents
          </Link>
        </div>
      </div>
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
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
          <div className="text-center space-y-4 max-w-md bg-slate-800 border border-slate-700 p-8 rounded-2xl shadow-xl">
            <div className="w-12 h-12 bg-amber-500/10 rounded-xl border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold">Accès Non Autorisé</h2>
            <p className="text-sm text-slate-400">
              Vous n'êtes pas inscrit à la préparation pour ce concours ({document.concours.toUpperCase()}).
            </p>
            <Link
              href="/dashboard/documents"
              className="inline-flex items-center gap-2 text-xs font-bold bg-white text-slate-900 hover:bg-slate-100 px-4 py-2.5 rounded-xl transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Retourner aux documents
            </Link>
          </div>
        </div>
      );
    }
  }

  // Note: The document is stored encrypted on Supabase Storage.
  // We point the viewer to our server-side decryption endpoint /api/documents/[id]/view
  // which will decrypt the PDF in memory and stream it securely.
  const securePdfUrl = `/api/documents/${document.id}/view#toolbar=0&navpanes=0&scrollbar=1`;

  return (
    <SecureViewerClient
      pdfUrl={securePdfUrl}
      documentTitle={document.titre}
      candidateEmail={profile.email}
    />
  );
}
