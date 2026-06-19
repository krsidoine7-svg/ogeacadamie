/**
 * Script de seed — Renseigne les numéros Wave/MoMo de test pour chaque zone
 * Usage: npx tsx scripts/seed-zones.ts
 */
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, { prepare: false });

async function seed() {
  console.log("🌱 Insertion des données de test pour zone_config...\n");

  const zoneData = [
    { zone: "yamoussoukro", wave: "07 07 07 07 07", momo: "05 05 05 05 05", tel: "+225 07 07 07 07 07", adresse: "Quartier Habitat, Yamoussoukro" },
    { zone: "yopougon",     wave: "07 08 08 08 08", momo: "05 06 06 06 06", tel: "+225 07 08 08 08 08", adresse: "Yopougon Maroc, Abidjan" },
    { zone: "abobo",        wave: "07 09 09 09 09", momo: "05 07 07 07 07", tel: "+225 07 09 09 09 09", adresse: "Abobo Gare, Abidjan" },
    { zone: "cocody",       wave: "07 10 10 10 10", momo: "05 08 08 08 08", tel: "+225 07 10 10 10 10", adresse: "Cocody Riviera, Abidjan" },
    { zone: "port-bouet",   wave: "07 11 11 11 11", momo: "05 09 09 09 09", tel: "+225 07 11 11 11 11", adresse: "Port-Bouët Gonzagueville, Abidjan" },
    { zone: "bouake",       wave: "07 12 12 12 12", momo: "05 10 10 10 10", tel: "+225 07 12 12 12 12", adresse: "Commerce, Bouaké" },
  ];

  for (const z of zoneData) {
    await sql`
      UPDATE zone_config 
      SET 
        lien_wave = ${z.wave},
        lien_momo = ${z.momo},
        telephone = ${z.tel},
        adresse   = ${z.adresse},
        updated_at = now()
      WHERE zone = ${z.zone}::zone_name
    `;
    console.log(`  ✅ ${z.zone} → Wave: ${z.wave} | MoMo: ${z.momo}`);
  }

  console.log("\n🎉 Données de test insérées avec succès !");

  // Vérification
  const zones = await sql`SELECT zone, lien_wave, lien_momo, telephone FROM zone_config ORDER BY zone`;
  console.log("\n📍 État final :\n");
  console.table(zones);

  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Erreur :", err.message);
  process.exit(1);
});
