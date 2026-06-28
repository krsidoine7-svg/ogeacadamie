import { cache } from "react";
import { unstable_cache } from "next/cache";
import { db } from "./db";
import { eq, and, isNull, asc, desc } from "drizzle-orm";
import { profiles, pageSections, temoignages, blogArticles, zoneConfig, documents } from "../drizzle/schema";

/**
 * 1. User Profile Cache (Request-memoized)
 * Memoized within a single request context to prevent layout + page duplicate queries.
 */
export const getCachedUserProfile = cache(async (userId: string) => {
  return await db.query.profiles.findFirst({
    where: eq(profiles.id, userId),
  });
});

/**
 * 2. Page Sections Cache (Data Cache)
 * Cached across requests and users, revalidated when CMS sections change.
 */
export const getCachedPageSections = unstable_cache(
  async () => {
    return await db.query.pageSections.findMany({
      orderBy: [asc(pageSections.ordre)],
    });
  },
  ["page-sections"],
  { tags: ["page-sections"] }
);

/**
 * 3. Testimonials Cache (Data Cache)
 * Cached across requests, revalidated on CMS updates.
 */
export const getCachedTestimonials = unstable_cache(
  async () => {
    return await db.query.temoignages.findMany({
      where: and(
        eq(temoignages.isActive, true),
        isNull(temoignages.deletedAt)
      ),
    });
  },
  ["testimonials"],
  { tags: ["testimonials"] }
);

/**
 * 4. Blog Articles Cache (Data Cache)
 * Cached across requests, revalidated on CMS updates.
 */
export const getCachedBlogArticles = unstable_cache(
  async () => {
    return await db.query.blogArticles.findMany({
      where: and(
        eq(blogArticles.isPublished, true),
        isNull(blogArticles.deletedAt)
      ),
      orderBy: [desc(blogArticles.publishedAt)],
    });
  },
  ["blog-articles"],
  { tags: ["blog-articles"] }
);

/**
 * 5. Zone Config Cache (Data Cache)
 * Cached per zone. Wrapped in React cache to avoid duplicate unstable_cache calls.
 */
export const getCachedZoneConfig = cache((zone: string) => {
  return unstable_cache(
    async () => {
      return await db.query.zoneConfig.findFirst({
        where: eq(zoneConfig.zone, zone as any),
      });
    },
    [`zone-config-${zone}`],
    { tags: [`zone-config-${zone}`, "zone-configs"] }
  )();
});

/**
 * 6. All Active Documents Cache (Data Cache)
 * Cached globally and filtered in-memory. Revalidated on zone/admin document changes.
 */
export const getCachedAllActiveDocuments = unstable_cache(
  async () => {
    return await db
      .select({
        id: documents.id,
        titre: documents.titre,
        description: documents.description,
        fichierUrl: documents.fichierUrl,
        concours: documents.concours,
        type: documents.type,
        modeFormation: documents.modeFormation,
        zone: documents.zone,
        ordre: documents.ordre,
        createdAt: documents.createdAt,
      })
      .from(documents)
      .where(
        and(
          eq(documents.isActive, true),
          isNull(documents.deletedAt)
        )
      )
      .orderBy(asc(documents.ordre), desc(documents.createdAt));
  },
  ["all-active-documents"],
  { tags: ["all-active-documents", "documents"] }
);
