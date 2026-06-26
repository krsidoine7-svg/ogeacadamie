import { db } from "@/lib/db";
import { pageSections, temoignages, blogArticles } from "@/drizzle/schema";
import { asc, desc, isNull } from "drizzle-orm";
import CMSClient from "./CMSClient";

export default async function CMSPage() {
  let sections = await db.query.pageSections.findMany({
    orderBy: [asc(pageSections.ordre)],
  });

  // Ensure "affiches" section is seeded
  const hasAffiches = sections.some((s) => s.cle === "affiches");
  if (!hasAffiches) {
    try {
      await db.insert(pageSections).values({
        cle: "affiches",
        titre: "Affiches & Annonces",
        contenu: {
          title: "Actualités & Affiches",
          subtitle: "Consultez nos dernières affiches de campagne et informations officielles.",
          images: []
        },
        ordre: 2,
        isActive: true
      });
      // Re-fetch
      sections = await db.query.pageSections.findMany({
        orderBy: [asc(pageSections.ordre)],
      });
    } catch (err: any) {
      if (err.code !== "23505") {
        console.error("Error auto-seeding affiches section in CMSPage:", err);
      }
    }
  }

  const testimonials = await db.query.temoignages.findMany({
    where: isNull(temoignages.deletedAt),
  });

  const articles = await db.query.blogArticles.findMany({
    where: isNull(blogArticles.deletedAt),
    orderBy: [desc(blogArticles.createdAt)],
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Gestionnaire de Contenu (CMS)</h1>
        <p className="text-sm text-slate-500 mt-1">
          Activez/désactivez les sections de la page d'accueil, modifiez leurs textes, gérez les fiches écoles et écrivez des actualités.
        </p>
      </div>

      <CMSClient 
        initialSections={sections} 
        initialTestimonials={testimonials} 
        initialArticles={articles}
      />
    </div>
  );
}
