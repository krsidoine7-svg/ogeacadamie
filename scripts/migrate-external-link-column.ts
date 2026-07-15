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
  console.log("Démarrage de la migration pour ajouter is_external_link...");
  try {
    await sql`
      ALTER TABLE documents 
      ADD COLUMN IF NOT EXISTS is_external_link boolean DEFAULT false;
    `;
    console.log("✓ Colonne 'is_external_link' ajoutée avec succès à la table 'documents'.");
    console.log("Migration terminée avec succès !");
  } catch (error) {
    console.error("Erreur durant la migration :", error);
  } finally {
    await sql.end();
  }
}

run();
