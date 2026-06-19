/**
 * Script de correction — Configure le bucket et les politiques RLS de storage
 * Usage: npx tsx scripts/fix-storage.ts
 */
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, { prepare: false });

async function fix() {
  console.log("🔧 Correction du Storage Supabase...\n");

  // 1. Vérifier si le bucket existe
  const buckets = await sql`SELECT id, name, public FROM storage.buckets WHERE id = 'captures-paiements'`;
  if (buckets.length === 0) {
    console.log("📦 Création du bucket 'captures-paiements'...");
    await sql`
      INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
      VALUES (
        'captures-paiements',
        'captures-paiements',
        false,
        5242880,
        ARRAY['image/jpeg', 'image/png', 'image/webp']
      )
    `;
    console.log("✅ Bucket créé.");
  } else {
    console.log(`✅ Bucket 'captures-paiements' existe (public: ${buckets[0].public}).`);
  }

  // 2. Nettoyer les anciennes politiques de storage (si corrompues)
  console.log("\n🧹 Suppression des anciennes politiques de storage...");
  const existingPolicies = await sql`
    SELECT policyname FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname LIKE '%captures%'
  `;
  
  for (const p of existingPolicies) {
    console.log(`  🗑️  Suppression de '${p.policyname}'...`);
    await sql.unsafe(`DROP POLICY IF EXISTS "${p.policyname}" ON storage.objects`);
  }

  // 3. Recréer les politiques proprement
  console.log("\n📦 Création des nouvelles politiques de storage...");

  // Politique INSERT : les utilisateurs authentifiés peuvent insérer dans leur dossier
  await sql.unsafe(`
    CREATE POLICY "candidat_insert_own_files" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
      bucket_id = 'captures-paiements'
      AND (storage.foldername(name))[1] = auth.uid()::text
    )
  `);
  console.log("  ✅ Politique INSERT créée.");

  // Politique SELECT : les utilisateurs authentifiés peuvent lire leurs fichiers
  await sql.unsafe(`
    CREATE POLICY "candidat_select_own_files" ON storage.objects
    FOR SELECT TO authenticated
    USING (
      bucket_id = 'captures-paiements'
      AND (storage.foldername(name))[1] = auth.uid()::text
    )
  `);
  console.log("  ✅ Politique SELECT créée.");

  // Politique SELECT globale : managers/admins peuvent lire tous les fichiers
  await sql.unsafe(`
    CREATE POLICY "admin_select_all_files" ON storage.objects
    FOR SELECT TO authenticated
    USING (
      bucket_id = 'captures-paiements'
      AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('manager_zone', 'admin', 'super_admin')
        AND deleted_at IS NULL
      )
    )
  `);
  console.log("  ✅ Politique SELECT admin créée.");

  // 4. Vérification finale
  const policies = await sql`
    SELECT policyname, cmd FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname LIKE '%captures%' OR policyname LIKE '%candidat%' OR policyname LIKE '%admin_select%'
  `;
  console.log("\n📋 Politiques actives :");
  console.table(policies);

  console.log("\n🎉 Correction terminée !");
  process.exit(0);
}

fix().catch((err) => {
  console.error("❌ Erreur :", err.message);
  process.exit(1);
});
