// ============================================================
// schema.analytics.ts
// Ajouter dans votre fichier de schéma Drizzle (db/schema.ts)
// ou importer depuis ce fichier
// ============================================================

import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  varchar,
  index,
} from "drizzle-orm/pg-core";

// Table principale : chaque visite de page
export const pageViews = pgTable(
  "page_views",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    // Identifiant anonyme de session (cookie côté client)
    sessionId: varchar("session_id", { length: 64 }).notNull(),
    // Chemin de la page visitée (ex: "/blog/mon-article")
    path: text("path").notNull(),
    // Référent HTTP (d'où vient le visiteur)
    referrer: text("referrer"),
    // User-Agent pour détecter appareil / navigateur
    userAgent: text("user_agent"),
    // IP anonymisée (3 premiers octets seulement)
    ipAnonymized: varchar("ip_anonymized", { length: 32 }),
    // Pays détecté (optionnel, via header CF-IPCountry ou similaire)
    country: varchar("country", { length: 8 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    pathIdx: index("page_views_path_idx").on(table.path),
    sessionIdx: index("page_views_session_idx").on(table.sessionId),
    createdAtIdx: index("page_views_created_at_idx").on(table.createdAt),
  })
);

// Table des clics (boutons, liens, CTAs)
export const clickEvents = pgTable(
  "click_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sessionId: varchar("session_id", { length: 64 }).notNull(),
    // Page sur laquelle le clic a eu lieu
    path: text("path").notNull(),
    // Élément cliqué (data-analytics-id ou texte du bouton)
    elementId: varchar("element_id", { length: 128 }),
    elementText: text("element_text"),
    // Type d'élément : "button" | "link" | "cta" | "nav" | "other"
    elementType: varchar("element_type", { length: 32 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    pathIdx: index("click_events_path_idx").on(table.path),
    sessionIdx: index("click_events_session_idx").on(table.sessionId),
    createdAtIdx: index("click_events_created_at_idx").on(table.createdAt),
  })
);

// Vue agrégée quotidienne (performances)
export const dailyStats = pgTable(
  "daily_stats",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    date: varchar("date", { length: 10 }).notNull().unique(), // "YYYY-MM-DD"
    totalPageViews: integer("total_page_views").default(0).notNull(),
    uniqueVisitors: integer("unique_visitors").default(0).notNull(),
    totalClicks: integer("total_clicks").default(0).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    dateIdx: index("daily_stats_date_idx").on(table.date),
  })
);

export type PageView = typeof pageViews.$inferSelect;
export type NewPageView = typeof pageViews.$inferInsert;
export type ClickEvent = typeof clickEvents.$inferSelect;
export type NewClickEvent = typeof clickEvents.$inferInsert;
export type DailyStat = typeof dailyStats.$inferSelect;
