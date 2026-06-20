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
  console.log("🔄 Configuration du bucket de stockage 'documents' dans Supabase...\n");

  try {
    // 1. Créer le bucket 'documents' s'il n'existe pas
    console.log("📦 Vérification de l'existence du bucket 'documents'...");
    const bucketExists = await sql`
      SELECT id FROM storage.buckets WHERE id = 'documents'
    `;

    if (bucketExists.length > 0) {
      console.log("✅ Le bucket 'documents' existe déjà.");
    } else {
      console.log("📦 Création du bucket 'documents'...");
      await sql`
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES ('documents', 'documents', false, 15728640, '{"application/pdf"}')
        ON CONFLICT (id) DO NOTHING;
      `;
      console.log("✅ Le bucket 'documents' a été créé.");
    }

    // 2. Nettoyer les anciennes politiques sur storage.objects pour le bucket 'documents'
    console.log("\n🧹 Suppression des anciennes politiques storage pour 'documents'...");
    await sql`DROP POLICY IF EXISTS "Allow admins and managers to insert documents" ON storage.objects;`;
    await sql`DROP POLICY IF EXISTS "Allow authenticated users to read documents" ON storage.objects;`;
    await sql`DROP POLICY IF EXISTS "Allow admins and managers to delete documents" ON storage.objects;`;
    console.log("✓ Politiques obsolètes nettoyées.");

    // 3. Créer la politique d'insertion pour les admins et managers
    console.log("\n🔒 Création de la politique d'upload (INSERT)...");
    await sql`
      CREATE POLICY "Allow admins and managers to insert documents" 
      ON storage.objects 
      FOR INSERT 
      TO authenticated 
      WITH CHECK (
        bucket_id = 'documents'
        AND (
          (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'super_admin', 'manager_zone')
        )
      );
    `;
    console.log("✅ Politique d'upload créée.");

    // 4. Créer la politique de lecture pour tous les utilisateurs authentifiés
    console.log("\n🔓 Création de la politique de lecture (SELECT)...");
    await sql`
      CREATE POLICY "Allow authenticated users to read documents" 
      ON storage.objects 
      FOR SELECT 
      TO authenticated 
      USING (
        bucket_id = 'documents'
      );
    `;
    console.log("✅ Politique de lecture créée.");

    // 5. Créer la politique de suppression pour les admins et managers
    console.log("\n🗑️ Création de la politique de suppression (DELETE)...");
    await sql`
      CREATE POLICY "Allow admins and managers to delete documents" 
      ON storage.objects 
      FOR DELETE 
      TO authenticated 
      USING (
        bucket_id = 'documents'
        AND (
          (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'super_admin', 'manager_zone')
        )
      );
    `;
    console.log("✅ Politique de suppression créée.");

    console.log("\n🎉 Bucket 'documents' configuré avec succès avec ses politiques de sécurité !");
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Erreur lors de la configuration du bucket :", error.message);
    process.exit(1);
  }
}

run();
