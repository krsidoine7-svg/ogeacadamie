import postgres from "postgres";
import fs from "fs";
import path from "path";

// Load .env.local
if (!process.env.DATABASE_URL) {
  const envPath = path.join(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    envContent.split("\n").forEach((line) => {
      const match = line.match(/^\s*([^#=]+)\s*=\s*(.*)\s*$/);
      if (match) {
        const key = match[1].trim();
        let val = match[2].trim();
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
  console.error("DATABASE_URL is not defined.");
  process.exit(1);
}

const sql = postgres(databaseUrl);

async function run() {
  console.log("Démarrage de la migration pour ajouter mode_formation et zone aux documents...");
  try {
    // 1. Check columns exist
    const modeExists = await sql`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'documents' AND column_name = 'mode_formation'
    `;
    const zoneExists = await sql`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'documents' AND column_name = 'zone'
    `;

    if (modeExists.length === 0) {
      console.log("📦 Ajout de la colonne 'mode_formation'...");
      await sql`ALTER TABLE documents ADD COLUMN mode_formation text DEFAULT 'tous';`;
      console.log("✓ Colonne 'mode_formation' ajoutée.");
    } else {
      console.log("✅ La colonne 'mode_formation' existe déjà.");
    }

    if (zoneExists.length === 0) {
      console.log("📦 Ajout de la colonne 'zone'...");
      await sql`ALTER TABLE documents ADD COLUMN zone text DEFAULT 'tous';`;
      console.log("✓ Colonne 'zone' ajoutée.");
    } else {
      console.log("✅ La colonne 'zone' existe déjà.");
    }

    console.log("🎉 Migration des filtres de documents terminée avec succès !");
  } catch (error) {
    console.error("❌ Erreur durant la migration :", error);
  } finally {
    await sql.end();
  }
}

run();
