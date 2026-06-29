import React from "react";
import { db } from "@/lib/db";
import { documents } from "@/drizzle/schema";
import { isNull, desc } from "drizzle-orm";
import DocumentsManagerClient from "./DocumentsManagerClient";

export const dynamic = "force-dynamic";

export default async function AdminDocumentsPage() {
  const dbDocs = await db.query.documents.findMany({
    where: isNull(documents.deletedAt),
    orderBy: [desc(documents.createdAt)],
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Supports de Cours & Sessions Directs</h1>
        <p className="text-sm text-slate-500 mt-1">
          Publiez des supports PDF (cours, exercices, corrigés) ou planifiez des cours en ligne synchronisés sur Google Agenda.
        </p>
      </div>

      <DocumentsManagerClient initialDocuments={dbDocs} />
    </div>
  );
}
