import { pgTable, text, boolean, timestamp, pgEnum, uuid, integer, jsonb } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["user", "manager_zone", "admin", "super_admin"]);
export const zoneNameEnum = pgEnum("zone_name", ["yamoussoukro", "yopougon", "abobo", "cocody", "port-bouet", "bouake"]);
export const modeFormationEnum = pgEnum("mode_formation", ["presentiel", "en_ligne"]);
export const concoursTypeEnum = pgEnum("concours_type", ["inphb", "esatic", "cme"]);
export const paiementStatutEnum = pgEnum("paiement_statut", ["en_attente", "en_cours", "valide", "rejete"]);
export const documentTypeEnum = pgEnum("document_type", ["cours", "exercice", "corrige"]);
export const notifTypeEnum = pgEnum("notif_type", ["info", "alerte", "cours"]);

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  nom: text("nom").notNull(),
  prenom: text("prenom").notNull(),
  email: text("email").unique().notNull(),
  whatsapp: text("whatsapp"),
  serieBac: text("serie_bac"),
  zone: zoneNameEnum("zone"),
  modeFormation: modeFormationEnum("mode_formation"),
  role: userRoleEnum("role").default("user"),
  isActive: boolean("is_active").default(false),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const concoursInscrits = pgTable("concours_inscrits", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  concours: concoursTypeEnum("concours").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const paiements = pgTable("paiements", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  zone: zoneNameEnum("zone").notNull(),
  montant: integer("montant").default(15000),
  statut: paiementStatutEnum("statut").default("en_attente"),
  captureUrl: text("capture_url"),
  moyenPaiement: text("moyen_paiement"),
  validePar: uuid("valide_par").references(() => profiles.id),
  valideAt: timestamp("valide_at", { withTimezone: true }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const zoneConfig = pgTable("zone_config", {
  id: uuid("id").primaryKey().defaultRandom(),
  zone: zoneNameEnum("zone").unique().notNull(),
  managerId: uuid("manager_id").references(() => profiles.id),
  lienWave: text("lien_wave"),
  numeroWave: text("numero_wave"),
  lienMomo: text("lien_momo"),
  lienOrange: text("lien_orange"),
  adresse: text("adresse"),
  telephone: text("telephone"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  titre: text("titre").notNull(),
  description: text("description"),
  fichierUrl: text("fichier_url"),
  concours: text("concours").default("tous"), // inphb, esatic, cme, tous
  type: documentTypeEnum("type").default("cours"),
  modeFormation: text("mode_formation").default("tous"), // presentiel, en_ligne, tous
  zone: text("zone").default("tous"), // yamoussoukro, yopougon, abobo, cocody, port-bouet, bouake, tous
  ordre: integer("ordre").default(0),
  isActive: boolean("is_active").default(true),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
  meetingUrl: text("meeting_url"),
  calendarEventId: text("calendar_event_id"),
  createdBy: uuid("created_by").references(() => profiles.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const accesDocuments = pgTable("acces_documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  documentId: uuid("document_id").notNull().references(() => documents.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  destinataireId: uuid("destinataire_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  titre: text("titre").notNull(),
  message: text("message").notNull(),
  type: notifTypeEnum("type").default("info"),
  lu: boolean("lu").default(false),
  lien: text("lien"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const blogArticles = pgTable("blog_articles", {
  id: uuid("id").primaryKey().defaultRandom(),
  titre: text("titre").notNull(),
  slug: text("slug").unique().notNull(),
  contenu: text("contenu"),
  extrait: text("extrait"),
  imageUrl: text("image_url"),
  concours: text("concours").default("general"),
  auteurId: uuid("auteur_id").references(() => profiles.id),
  isPublished: boolean("is_published").default(false),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const pageSections = pgTable("page_sections", {
  id: uuid("id").primaryKey().defaultRandom(),
  cle: text("cle").unique().notNull(), // hero, historique, formation, resultats, temoignages, inscription, footer
  titre: text("titre"),
  contenu: jsonb("contenu").default({}),
  ordre: integer("ordre").default(0),
  isActive: boolean("is_active").default(true),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const temoignages = pgTable("temoignages", {
  id: uuid("id").primaryKey().defaultRandom(),
  nom: text("nom").notNull(),
  prenom: text("prenom"),
  zone: zoneNameEnum("zone"),
  concours: concoursTypeEnum("concours"),
  message: text("message").notNull(),
  note: integer("note").default(5),
  photoUrl: text("photo_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const adminPendingActions = pgTable("admin_pending_actions", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: text("type").notNull(), // edit_manager, block_manager, activate_manager
  targetId: uuid("target_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  initiatedBy: uuid("initiated_by").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  details: jsonb("details").default({}).notNull(), // { nom, prenom, email, whatsapp, zone, is_active }
  statut: text("statut").default("en_attente").notNull(), // en_attente, approuve, rejete
  traitePar: uuid("traite_par").references(() => profiles.id),
  traiteAt: timestamp("traite_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});



