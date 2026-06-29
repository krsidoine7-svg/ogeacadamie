-- ============================================================
-- migration: 0001_analytics_tables.sql
-- Coller dans Supabase SQL Editor OU utiliser drizzle-kit
-- ============================================================

-- Table des vues de pages
CREATE TABLE IF NOT EXISTS "page_views" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "session_id" varchar(64) NOT NULL,
  "path" text NOT NULL,
  "referrer" text,
  "user_agent" text,
  "ip_anonymized" varchar(32),
  "country" varchar(8),
  "created_at" timestamptz NOT NULL DEFAULT now()
);

-- Table des événements de clics
CREATE TABLE IF NOT EXISTS "click_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "session_id" varchar(64) NOT NULL,
  "path" text NOT NULL,
  "element_id" varchar(128),
  "element_text" text,
  "element_type" varchar(32),
  "created_at" timestamptz NOT NULL DEFAULT now()
);

-- Table des stats quotidiennes agrégées
CREATE TABLE IF NOT EXISTS "daily_stats" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "date" varchar(10) NOT NULL UNIQUE,
  "total_page_views" integer NOT NULL DEFAULT 0,
  "unique_visitors" integer NOT NULL DEFAULT 0,
  "total_clicks" integer NOT NULL DEFAULT 0,
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- Index pour les performances de requête
CREATE INDEX IF NOT EXISTS "page_views_path_idx" ON "page_views" ("path");
CREATE INDEX IF NOT EXISTS "page_views_session_idx" ON "page_views" ("session_id");
CREATE INDEX IF NOT EXISTS "page_views_created_at_idx" ON "page_views" ("created_at");
CREATE INDEX IF NOT EXISTS "click_events_path_idx" ON "click_events" ("path");
CREATE INDEX IF NOT EXISTS "click_events_session_idx" ON "click_events" ("session_id");
CREATE INDEX IF NOT EXISTS "click_events_created_at_idx" ON "click_events" ("created_at");
CREATE INDEX IF NOT EXISTS "daily_stats_date_idx" ON "daily_stats" ("date");

-- ============================================================
-- Row Level Security (RLS) - IMPORTANT pour Supabase
-- Seul le super admin peut LIRE ces tables via le dashboard
-- L'écriture se fait via les API Routes (service role key)
-- ============================================================

ALTER TABLE "page_views" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "click_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "daily_stats" ENABLE ROW LEVEL SECURITY;

-- Politique : lecture uniquement pour les super admins
-- Adaptez 'super_admin' au nom exact de votre rôle
CREATE POLICY "super_admin_read_page_views"
  ON "page_views" FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'role' = 'super_admin'
           OR auth.users.raw_app_meta_data->>'role' = 'super_admin')
    )
  );

CREATE POLICY "super_admin_read_click_events"
  ON "click_events" FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'role' = 'super_admin'
           OR auth.users.raw_app_meta_data->>'role' = 'super_admin')
    )
  );

CREATE POLICY "super_admin_read_daily_stats"
  ON "daily_stats" FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'role' = 'super_admin'
           OR auth.users.raw_app_meta_data->>'role' = 'super_admin')
    )
  );

-- Les insertions sont faites par le serveur (service_role),
-- donc aucune policy INSERT nécessaire côté client.
