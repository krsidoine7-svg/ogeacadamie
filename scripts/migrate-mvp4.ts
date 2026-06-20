/**
 * Script de migration MVP 4 — Double confirmation, parametres de paiement et Orange Money
 * 
 * Ce script applique les modifications de schema sur la base de donnees.
 * Usage: npx tsx scripts/migrate-mvp4.ts
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
  console.log("🔄 Démarrage de la migration MVP 4...\n");

  // 1. Ajouter le champ moyen_paiement sur la table paiements
  try {
    const moyenPaiementExists = await sql`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'paiements' AND column_name = 'moyen_paiement'
    `;
    if (moyenPaiementExists.length > 0) {
      console.log("✅ Colonne 'moyen_paiement' existe déjà sur la table 'paiements'.");
    } else {
      console.log("📦 Ajout de la colonne 'moyen_paiement' sur la table 'paiements'...");
      await sql`ALTER TABLE paiements ADD COLUMN moyen_paiement text`;
      console.log("✅ Colonne 'moyen_paiement' ajoutée.");
    }
  } catch (err: any) {
    console.error("❌ Erreur lors de l'ajout de moyen_paiement :", err.message);
  }

  // 2. Ajouter le champ lien_orange sur la table zone_config
  try {
    const lienOrangeExists = await sql`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'zone_config' AND column_name = 'lien_orange'
    `;
    if (lienOrangeExists.length > 0) {
      console.log("✅ Colonne 'lien_orange' existe déjà sur la table 'zone_config'.");
    } else {
      console.log("📦 Ajout de la colonne 'lien_orange' sur la table 'zone_config'...");
      await sql`ALTER TABLE zone_config ADD COLUMN lien_orange text`;
      console.log("✅ Colonne 'lien_orange' ajoutée.");
    }
  } catch (err: any) {
    console.error("❌ Erreur lors de l'ajout de lien_orange :", err.message);
  }

  // 3. Créer la table admin_pending_actions si elle n'existe pas
  try {
    const adminPendingActionsExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'admin_pending_actions'
      )
    `;
    if (adminPendingActionsExists[0].exists) {
      console.log("✅ Table 'admin_pending_actions' existe déjà.");
    } else {
      console.log("📦 Création de la table 'admin_pending_actions'...");
      await sql`
        CREATE TABLE admin_pending_actions (
          id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
          type          text NOT NULL,
          target_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
          initiated_by  uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
          details       jsonb NOT NULL DEFAULT '{}',
          statut        text NOT NULL DEFAULT 'en_attente',
          traite_par    uuid REFERENCES profiles(id) ON DELETE SET NULL,
          traite_at     timestamptz,
          created_at    timestamptz DEFAULT now(),
          updated_at    timestamptz DEFAULT now()
        )
      `;
      await sql`CREATE INDEX idx_pending_actions_statut ON admin_pending_actions(statut)`;
      console.log("✅ Table 'admin_pending_actions' et index créés.");

      // Trigger updated_at
      await sql`
        CREATE TRIGGER trg_pending_actions_updated_at
          BEFORE UPDATE ON admin_pending_actions
          FOR EACH ROW EXECUTE FUNCTION update_updated_at()
      `;
      console.log("✅ Trigger 'updated_at' ajouté sur admin_pending_actions.");
    }
  } catch (err: any) {
    console.error("❌ Erreur lors de la création de admin_pending_actions :", err.message);
  }

  // 4. Activer RLS sur la table admin_pending_actions
  try {
    await sql`ALTER TABLE admin_pending_actions ENABLE ROW LEVEL SECURITY`;
    console.log("✅ RLS activé sur 'admin_pending_actions'.");
  } catch (err: any) {
    console.log("ℹ️  RLS déjà activé ou erreur sur 'admin_pending_actions' :", err.message);
  }

  // 5. Politique RLS pour admin_pending_actions (visible uniquement par les admins)
  try {
    await sql`
      CREATE POLICY "admin_all_pending_actions" ON admin_pending_actions
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND (p.role = 'admin' OR p.role = 'super_admin')
          )
        )
    `;
    console.log("✅ Politique RLS 'admin_all_pending_actions' créée.");
  } catch {
    console.log("ℹ️  Politique RLS 'admin_all_pending_actions' existe déjà.");
  }

  // 6. Insérer la configuration système initiale dans page_sections
  try {
    const configExists = await sql`
      SELECT 1 FROM page_sections WHERE cle = 'system_config'
    `;
    if (configExists.length > 0) {
      console.log("✅ Rangée de configuration 'system_config' existe déjà dans 'page_sections'.");
    } else {
      console.log("📦 Insertion de la configuration 'system_config' par défaut...");
      const defaultContent = JSON.stringify({
        allow_manager_edit: true,
        enable_wave: true,
        enable_momo: true,
        enable_orange: true
      });
      await sql`
        INSERT INTO page_sections (cle, titre, contenu, ordre, is_active)
        VALUES ('system_config', 'Configuration Système', ${defaultContent}, 99, true)
      `;
      console.log("✅ Configuration 'system_config' insérée.");
    }
  } catch (err: any) {
    console.error("❌ Erreur lors de l'insertion de la configuration par défaut :", err.message);
  }

  console.log("\n🎉 Migration MVP 4 terminée avec succès !");
  process.exit(0);
}

migrate().catch((err) => {
  console.error("❌ Erreur générale durant la migration :", err.message);
  process.exit(1);
});
