import postgres from "postgres";
import fs from "fs";
import path from "path";

// Load .env.local manually
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
  console.error("❌ DATABASE_URL non définie.");
  process.exit(1);
}

const sql = postgres(databaseUrl, { prepare: false });

async function run() {
  console.log("🔧 Correction de la configuration du bucket 'documents'...\n");

  try {
    // 1. Mettre à jour les propriétés du bucket documents
    console.log("📦 Mise à jour du bucket 'documents' (public: true, max size: 100MB, mime-types autorisés)...");
    await sql`
      UPDATE storage.buckets
      SET 
        public = true,
        file_size_limit = 104857600,
        allowed_mime_types = ARRAY[
          'application/pdf', 
          'image/jpeg', 
          'image/png', 
          'image/webp', 
          'image/gif', 
          'video/mp4', 
          'video/webm', 
          'video/ogg', 
          'video/quicktime'
        ]
      WHERE id = 'documents'
    `;
    console.log("✅ Bucket 'documents' mis à jour.");

    // 2. Nettoyer les anciennes politiques de lecture publique si existantes
    console.log("\n🧹 Suppression des anciennes politiques de lecture publique...");
    await sql`DROP POLICY IF EXISTS "Allow public read access to public assets" ON storage.objects;`;
    await sql`DROP POLICY IF EXISTS "Allow admins and managers to update documents" ON storage.objects;`;
    console.log("✓ Politiques obsolètes nettoyées.");

    // 3. Créer la politique de lecture publique spécifique pour les assets publics
    console.log("\n🔓 Création de la politique de lecture publique (SELECT)...");
    await sql`
      CREATE POLICY "Allow public read access to public assets" 
      ON storage.objects 
      FOR SELECT 
      TO public 
      USING (
        bucket_id = 'documents'
        AND (name LIKE 'public-assets/%' OR name = 'presentation.mp4')
      );
    `;
    console.log("✅ Politique de lecture publique créée.");

    // 4. Créer la politique de mise à jour (UPDATE) pour les admins et managers
    console.log("\n📝 Création de la politique de mise à jour (UPDATE)...");
    await sql`
      CREATE POLICY "Allow admins and managers to update documents" 
      ON storage.objects 
      FOR UPDATE 
      TO authenticated 
      USING (
        bucket_id = 'documents'
        AND (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'super_admin', 'manager_zone')
      )
      WITH CHECK (
        bucket_id = 'documents'
        AND (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'super_admin', 'manager_zone')
      );
    `;
    console.log("✅ Politique UPDATE créée.");

    console.log("\n🎉 Configuration du stockage terminée avec succès !");
    process.exit(0);
  } catch (err: any) {
    console.error("❌ Erreur :", err.message);
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("❌ Erreur générale :", err.message);
  process.exit(1);
});
