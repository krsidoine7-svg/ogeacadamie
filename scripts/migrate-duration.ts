/**
 * Script de migration pour ajouter le champ 'duration' à la table 'page_views'
 * 
 * Usage: npx tsx scripts/migrate-duration.ts
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
  console.log("🔄 Ajout de la colonne 'duration' à 'page_views'...\n");

  try {
    const columnExists = await sql`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'page_views' AND column_name = 'duration'
    `;
    
    if (columnExists.length > 0) {
      console.log("✅ La colonne 'duration' existe déjà sur la table 'page_views'.");
    } else {
      console.log("📦 Ajout de la colonne 'duration' (integer) sur 'page_views'...");
      await sql`ALTER TABLE "page_views" ADD COLUMN "duration" integer DEFAULT 0`;
      console.log("✅ Colonne 'duration' ajoutée.");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur durant la migration :", error);
    process.exit(1);
  }
}

migrate();
