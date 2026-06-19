/**
 * Script de vérification — Affiche les données actuelles de zone_config
 * Usage: npx tsx scripts/check-zones.ts
 */
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, { prepare: false });

async function check() {
  const zones = await sql`SELECT zone, lien_wave, lien_momo, telephone, adresse FROM zone_config ORDER BY zone`;
  console.log("📍 Configuration des zones :\n");
  console.table(zones);

  const paiements = await sql`SELECT id, user_id, zone, statut, capture_url FROM paiements LIMIT 10`;
  console.log("\n💳 Paiements existants :\n");
  if (paiements.length === 0) {
    console.log("  (aucun paiement enregistré)");
  } else {
    console.table(paiements);
  }

  process.exit(0);
}

check().catch((err) => {
  console.error("❌ Erreur :", err.message);
  process.exit(1);
});
