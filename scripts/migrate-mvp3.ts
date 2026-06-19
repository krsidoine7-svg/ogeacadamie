/**
 * Script de migration MVP 3 — Création des tables paiements et zone_config
 * 
 * Ce script vérifie l'existence des tables et enums requis et les crée si nécessaire.
 * Usage: npx tsx scripts/migrate-mvp3.ts
 */

import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("❌ DATABASE_URL non définie.");
  process.exit(1);
}

const sql = postgres(connectionString, { prepare: false });

async function migrate() {
  console.log("🔄 Démarrage de la migration MVP 3...\n");

  // 1. Créer l'enum paiement_statut s'il n'existe pas
  try {
    await sql`SELECT 'en_attente'::paiement_statut`;
    console.log("✅ Enum 'paiement_statut' existe déjà.");
  } catch {
    console.log("📦 Création de l'enum 'paiement_statut'...");
    await sql`CREATE TYPE paiement_statut AS ENUM ('en_attente', 'en_cours', 'valide', 'rejete')`;
    console.log("✅ Enum 'paiement_statut' créé.");
  }

  // 2. Créer la table paiements si elle n'existe pas
  const paiementsExists = await sql`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'paiements'
    )
  `;
  if (paiementsExists[0].exists) {
    console.log("✅ Table 'paiements' existe déjà.");
  } else {
    console.log("📦 Création de la table 'paiements'...");
    await sql`
      CREATE TABLE paiements (
        id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id       uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        zone          zone_name NOT NULL,
        montant       integer DEFAULT 15000,
        statut        paiement_statut DEFAULT 'en_attente',
        capture_url   text,
        valide_par    uuid REFERENCES profiles(id),
        valide_at     timestamptz,
        notes         text,
        created_at    timestamptz DEFAULT now(),
        updated_at    timestamptz DEFAULT now(),
        deleted_at    timestamptz
      )
    `;
    await sql`CREATE INDEX idx_paiements_statut ON paiements(statut) WHERE deleted_at IS NULL`;
    await sql`CREATE INDEX idx_paiements_zone   ON paiements(zone)   WHERE deleted_at IS NULL`;
    await sql`CREATE INDEX idx_paiements_user   ON paiements(user_id) WHERE deleted_at IS NULL`;
    console.log("✅ Table 'paiements' et index créés.");

    // Trigger updated_at
    await sql`
      CREATE TRIGGER trg_paiements_updated_at
        BEFORE UPDATE ON paiements
        FOR EACH ROW EXECUTE FUNCTION update_updated_at()
    `;
    console.log("✅ Trigger 'updated_at' ajouté sur paiements.");
  }

  // 3. Activer RLS sur paiements
  try {
    await sql`ALTER TABLE paiements ENABLE ROW LEVEL SECURITY`;
    console.log("✅ RLS activé sur 'paiements'.");
  } catch {
    console.log("ℹ️  RLS déjà activé sur 'paiements'.");
  }

  // 4. Créer les politiques RLS pour paiements
  try {
    await sql`
      CREATE POLICY "user_own_paiement" ON paiements
        FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL)
    `;
    console.log("✅ Politique 'user_own_paiement' créée.");
  } catch {
    console.log("ℹ️  Politique 'user_own_paiement' existe déjà.");
  }

  try {
    await sql`
      CREATE POLICY "manager_zone_paiements" ON paiements
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM profiles p
            JOIN zone_config zc ON zc.manager_id = p.id
            WHERE p.id = auth.uid()
            AND zc.zone = paiements.zone
          )
        )
    `;
    console.log("✅ Politique 'manager_zone_paiements' créée.");
  } catch {
    console.log("ℹ️  Politique 'manager_zone_paiements' existe déjà (ou zone_config manquante).");
  }

  // 5. Créer la table zone_config si elle n'existe pas
  const zoneConfigExists = await sql`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'zone_config'
    )
  `;
  if (zoneConfigExists[0].exists) {
    console.log("✅ Table 'zone_config' existe déjà.");
  } else {
    console.log("📦 Création de la table 'zone_config'...");
    await sql`
      CREATE TABLE zone_config (
        id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        zone        zone_name UNIQUE NOT NULL,
        manager_id  uuid REFERENCES profiles(id),
        lien_wave   text,
        lien_momo   text,
        adresse     text,
        telephone   text,
        updated_at  timestamptz DEFAULT now()
      )
    `;
    console.log("✅ Table 'zone_config' créée.");

    // Insertion des zones initiales
    await sql`
      INSERT INTO zone_config (zone) VALUES
        ('yamoussoukro'),
        ('yopougon'),
        ('abobo'),
        ('cocody'),
        ('port-bouet'),
        ('bouake')
    `;
    console.log("✅ 6 zones initiales insérées dans 'zone_config'.");
  }

  console.log("\n🎉 Migration MVP 3 terminée avec succès !");
  process.exit(0);
}

migrate().catch((err) => {
  console.error("❌ Erreur durant la migration :", err.message);
  process.exit(1);
});
