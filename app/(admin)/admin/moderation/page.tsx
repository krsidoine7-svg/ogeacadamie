import React from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/lib/db";
import { profiles, documents, temoignages, blogArticles, pageSections } from "@/drizzle/schema";
import { eq, desc } from "drizzle-orm";
import ModerationClient from "./ModerationClient";
import { ShieldAlert } from "lucide-react";

export default async function AdminModerationPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 1. Authenticate user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  // 2. Fetch admin profile and check for super_admin access
  const adminProfile = await db.query.profiles.findFirst({
    where: eq(profiles.id, user.id),
  });

  if (!adminProfile || adminProfile.role !== "super_admin") {
    redirect("/connexion");
  }

  // 3. Fetch all content pieces for audit
  const docsList = await db.query.documents.findMany({
    orderBy: [desc(documents.createdAt)],
  });

  const testimonialsList = await db.query.temoignages.findMany({
    orderBy: [desc(temoignages.createdAt)],
  });

  const blogList = await db.query.blogArticles.findMany({
    orderBy: [desc(blogArticles.createdAt)],
  });

  // Fetch campaign posters / actualités from pageSections
  const affichesSection = await db.query.pageSections.findFirst({
    where: eq(pageSections.cle, "affiches"),
  });
  const affichesList = (affichesSection?.contenu as any)?.images || [];

  // 4. Fetch all user accounts
  const allUsers = await db.query.profiles.findMany({
    orderBy: [desc(profiles.createdAt)],
  });

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {/* Page Header */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
            <ShieldAlert className="w-4.5 h-4.5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">
            Centre d'Audit & Modération
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Gérez l'éthique de la plateforme : auditez les contenus publiés par les managers et contrôlez les privilèges de sécurité des comptes.
        </p>
      </div>

      <ModerationClient
        documents={docsList.map((d) => ({
          id: d.id,
          titre: d.titre,
          type: d.type || "cours",
          isActive: d.isActive ?? true,
          createdAt: d.createdAt,
          auteurId: d.createdBy,
        }))}
        testimonials={testimonialsList.map((t) => ({
          id: t.id,
          nom: t.nom,
          prenom: t.prenom || "",
          message: t.message,
          isActive: t.isActive ?? true,
          createdAt: t.createdAt,
        }))}
        blogArticles={blogList.map((b) => ({
          id: b.id,
          titre: b.titre,
          extrait: b.extrait || "",
          isPublished: b.isPublished ?? false,
          createdAt: b.createdAt,
        }))}
        affiches={affichesList.map((img: any) => ({
          id: img.id,
          url: img.url,
          title: img.title || "Média",
          type: img.type || "image",
          startDate: img.startDate || "",
          endDate: img.endDate || "",
          isActive: img.isActive !== false,
        }))}
        users={allUsers.map((u) => ({
          id: u.id,
          nom: u.nom,
          prenom: u.prenom,
          email: u.email,
          whatsapp: u.whatsapp || "",
          role: u.role || "user",
          isActive: u.isActive ?? false,
          createdAt: u.createdAt,
          zone: u.zone || "",
        }))}
      />
    </div>
  );
}
