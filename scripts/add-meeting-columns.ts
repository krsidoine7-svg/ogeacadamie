import postgres from "postgres";
import fs from "fs";
import path from "path";

// Manually load .env.local if process.env.DATABASE_URL is missing
if (!process.env.DATABASE_URL) {
  const envPath = path.join(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    envContent.split("\n").forEach((line) => {
      const match = line.match(/^\s*([^#=]+)\s*=\s*(.*)\s*$/);
      if (match) {
        const key = match[1].trim();
        let val = match[2].trim();
        // Remove quotes if present
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[key] = val;
      }
    });
  }
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is not defined in environment or .env.local.");
  process.exit(1);
}

const sql = postgres(databaseUrl);

async function run() {
  console.log("Démarrage de la migration pour ajouter les colonnes Google Agenda/Meet...");
  try {
    // 1. Ajouter les colonnes à la table documents
    await sql`
      ALTER TABLE documents 
      ADD COLUMN IF NOT EXISTS scheduled_at timestamptz,
      ADD COLUMN IF NOT EXISTS meeting_url text,
      ADD COLUMN IF NOT EXISTS calendar_event_id text;
    `;
    console.log("✓ Colonnes ajoutées avec succès à la table 'documents'.");

    // 2. Insérer les paramètres système par défaut dans page_sections
    await sql`
      INSERT INTO page_sections (cle, titre, contenu, ordre, is_active)
      VALUES (
        'parametres',
        'Paramètres Plateforme',
        '{"webhook_secret": "secret123", "make_webhook_url": "", "n8n_webhook_url": "", "google_calendar_id": ""}'::jsonb,
        99,
        false
      )
      ON CONFLICT (cle) DO NOTHING;
    `;
    console.log("✓ Ligne de configuration 'parametres' insérée par défaut dans 'page_sections'.");
    
    console.log("Migration terminée avec succès !");
  } catch (error) {
    console.error("Erreur durant la migration :", error);
  } finally {
    await sql.end();
  }
}

run();
