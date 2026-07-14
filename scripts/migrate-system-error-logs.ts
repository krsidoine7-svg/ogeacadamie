/**
 * Script de migration pour la table du Journal des Erreurs (system_error_logs)
 * 
 * Usage: npx tsx scripts/migrate-system-error-logs.ts
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
  console.log("🔄 Démarrage de la migration de la table system_error_logs...\n");

  try {
    console.log("📝 1. Création de la table system_error_logs...");
    await sql`
      CREATE TABLE IF NOT EXISTS system_error_logs (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        level text NOT NULL DEFAULT 'error',
        source text NOT NULL DEFAULT 'client',
        endpoint text,
        error_message text NOT NULL,
        stack_trace text,
        user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
        metadata jsonb DEFAULT '{}'::jsonb,
        status text NOT NULL DEFAULT 'nouveau',
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        deleted_at timestamptz
      );
    `;
    console.log("✅ Table system_error_logs créée ou vérifiée.");

    console.log("📊 2. Création des index...");
    await sql`CREATE INDEX IF NOT EXISTS system_error_logs_level_idx ON system_error_logs (level);`;
    await sql`CREATE INDEX IF NOT EXISTS system_error_logs_status_idx ON system_error_logs (status);`;
    await sql`CREATE INDEX IF NOT EXISTS system_error_logs_created_at_idx ON system_error_logs (created_at);`;
    console.log("✅ Index créés.");

    console.log("🔒 3. Configuration RLS (Row Level Security)...");
    await sql`ALTER TABLE system_error_logs ENABLE ROW LEVEL SECURITY;`;
    
    // Supprimer la politique si elle existe déjà pour la recréer cleanly
    await sql`DROP POLICY IF EXISTS super_admin_read_error_logs ON system_error_logs;`;
    await sql`DROP POLICY IF EXISTS super_admin_write_error_logs ON system_error_logs;`;

    await sql`
      CREATE POLICY super_admin_read_error_logs ON system_error_logs
        FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'super_admin'
          )
        );
    `;

    await sql`
      CREATE POLICY super_admin_write_error_logs ON system_error_logs
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'super_admin'
          )
        );
    `;
    console.log("✅ Politiques RLS actives.");

    console.log("\n🎉 Migration system_error_logs terminée avec succès !");
  } catch (error) {
    console.error("❌ Erreur lors de la migration :", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

migrate();
