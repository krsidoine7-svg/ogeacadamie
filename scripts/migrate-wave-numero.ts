/**
 * Script de migration pour ajouter le numéro Wave distinct par zone
 * 
 * Usage: npx tsx scripts/migrate-wave-numero.ts
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
  console.log("🔄 Démarrage de la migration du numéro Wave par zone...\n");

  try {
    const numeroWaveExists = await sql`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'zone_config' AND column_name = 'numero_wave'
    `;
    if (numeroWaveExists.length > 0) {
      console.log("✅ Colonne 'numero_wave' existe déjà sur la table 'zone_config'.");
    } else {
      console.log("📦 Ajout de la colonne 'numero_wave' sur la table 'zone_config'...");
      await sql`ALTER TABLE zone_config ADD COLUMN numero_wave text`;
      console.log("✅ Colonne 'numero_wave' ajoutée.");
    }
  } catch (err: any) {
    console.error("❌ Erreur lors de l'ajout de numero_wave :", err.message);
    process.exit(1);
  }

  console.log("\n🎉 Migration du numéro Wave terminée avec succès !");
  process.exit(0);
}

migrate().catch((err) => {
  console.error("❌ Erreur générale durant la migration :", err.message);
  process.exit(1);
});
