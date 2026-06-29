/**
 * Script de migration pour le Système de Statistiques (Analytics)
 * 
 * Ce script se connecte directement à la base de données PostgreSQL de Supabase
 * et exécute les requêtes de création de tables, d'index et de RLS.
 * 
 * Usage: npx tsx scripts/migrate-analytics.ts
 */

import postgres from "postgres";
import fs from "fs";
import path from "path";

// Load .env.local manually
try {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    envContent.split("\n").forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || "";
        value = value.trim();
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        } else if (value.startsWith("'") && value.endsWith("'")) {
          value = value.substring(1, value.length - 1);
        }
        process.env[key] = value;
      }
    });
  }
} catch (e) {
  console.warn("⚠️ Impossible de charger .env.local :", e);
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("❌ DATABASE_URL non définie.");
  process.exit(1);
}

const sql = postgres(connectionString, { prepare: false });

async function migrate() {
  console.log("🔄 Démarrage de la migration Analytics...\n");

  try {
    // 1. Table des vues de pages
    console.log("📦 Création de la table 'page_views'...");
    await sql`
      CREATE TABLE IF NOT EXISTS "page_views" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "session_id" varchar(64) NOT NULL,
        "path" text NOT NULL,
        "referrer" text,
        "user_agent" text,
        "ip_anonymized" varchar(32),
        "country" varchar(8),
        "created_at" timestamptz NOT NULL DEFAULT now()
      )
    `;

    // 2. Table des événements de clics
    console.log("📦 Création de la table 'click_events'...");
    await sql`
      CREATE TABLE IF NOT EXISTS "click_events" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "session_id" varchar(64) NOT NULL,
        "path" text NOT NULL,
        "element_id" varchar(128),
        "element_text" text,
        "element_type" varchar(32),
        "created_at" timestamptz NOT NULL DEFAULT now()
      )
    `;

    // 3. Table des stats quotidiennes
    console.log("📦 Création de la table 'daily_stats'...");
    await sql`
      CREATE TABLE IF NOT EXISTS "daily_stats" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "date" varchar(10) NOT NULL UNIQUE,
        "total_page_views" integer NOT NULL DEFAULT 0,
        "unique_visitors" integer NOT NULL DEFAULT 0,
        "total_clicks" integer NOT NULL DEFAULT 0,
        "updated_at" timestamptz NOT NULL DEFAULT now()
      )
    `;

    // 4. Index
    console.log("⚡ Création des index...");
    await sql`CREATE INDEX IF NOT EXISTS "page_views_path_idx" ON "page_views" ("path")`;
    await sql`CREATE INDEX IF NOT EXISTS "page_views_session_idx" ON "page_views" ("session_id")`;
    await sql`CREATE INDEX IF NOT EXISTS "page_views_created_at_idx" ON "page_views" ("created_at")`;
    await sql`CREATE INDEX IF NOT EXISTS "click_events_path_idx" ON "click_events" ("path")`;
    await sql`CREATE INDEX IF NOT EXISTS "click_events_session_idx" ON "click_events" ("session_id")`;
    await sql`CREATE INDEX IF NOT EXISTS "click_events_created_at_idx" ON "click_events" ("created_at")`;
    await sql`CREATE INDEX IF NOT EXISTS "daily_stats_date_idx" ON "daily_stats" ("date")`;

    // 5. RLS (Row Level Security)
    console.log("🛡️ Configuration de la Row Level Security (RLS)...");
    await sql`ALTER TABLE "page_views" ENABLE ROW LEVEL SECURITY`;
    await sql`ALTER TABLE "click_events" ENABLE ROW LEVEL SECURITY`;
    await sql`ALTER TABLE "daily_stats" ENABLE ROW LEVEL SECURITY`;

    // Drop existing policies if they exist to avoid duplication errors
    await sql`DROP POLICY IF EXISTS "super_admin_read_page_views" ON "page_views"`;
    await sql`DROP POLICY IF EXISTS "super_admin_read_click_events" ON "click_events"`;
    await sql`DROP POLICY IF EXISTS "super_admin_read_daily_stats" ON "daily_stats"`;

    // Create selection policies for super_admin
    await sql`
      CREATE POLICY "super_admin_read_page_views" ON "page_views" FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE auth.users.id = auth.uid()
          AND (auth.users.raw_user_meta_data->>'role' = 'super_admin' 
               OR auth.users.raw_app_meta_data->>'role' = 'super_admin')
        )
      )
    `;

    await sql`
      CREATE POLICY "super_admin_read_click_events" ON "click_events" FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE auth.users.id = auth.uid()
          AND (auth.users.raw_user_meta_data->>'role' = 'super_admin' 
               OR auth.users.raw_app_meta_data->>'role' = 'super_admin')
        )
      )
    `;

    await sql`
      CREATE POLICY "super_admin_read_daily_stats" ON "daily_stats" FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE auth.users.id = auth.uid()
          AND (auth.users.raw_user_meta_data->>'role' = 'super_admin' 
               OR auth.users.raw_app_meta_data->>'role' = 'super_admin')
        )
      )
    `;

    console.log("\n🎉 Migration Analytics appliquée avec succès !");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Erreur durant la migration :", error);
    process.exit(1);
  }
}

migrate();
