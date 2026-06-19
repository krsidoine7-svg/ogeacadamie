/**
 * Script de correction v2 — Supprime TOUTES les politiques RLS du bucket et les recrée avec une syntaxe simple
 * Usage: npx tsx scripts/fix-storage-v2.ts
 */
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, { prepare: false });

async function fix() {
  console.log("🔧 Correction v2 du Storage Supabase...\n");

  // 1. Lister et supprimer TOUTES les politiques sur storage.objects
  const allPolicies = await sql`
    SELECT policyname FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects'
  `;
  
  console.log(`📋 ${allPolicies.length} politique(s) trouvée(s) sur storage.objects`);
  
  for (const p of allPolicies) {
    console.log(`  🗑️  Suppression: '${p.policyname}'`);
    await sql.unsafe(`DROP POLICY IF EXISTS "${p.policyname}" ON storage.objects`);
  }

  // 2. Recréer des politiques SIMPLES sans storage.foldername()
  console.log("\n📦 Création de politiques simplifiées...");

  // INSERT : tout utilisateur authentifié peut insérer dans captures-paiements si le chemin commence par son uid
  await sql.unsafe(`
    CREATE POLICY "storage_insert_own" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
      bucket_id = 'captures-paiements'
      AND name LIKE (auth.uid()::text || '/%')
    )
  `);
  console.log("  ✅ Politique INSERT créée (LIKE uid/%).");

  // SELECT : tout utilisateur authentifié peut lire ses propres fichiers
  await sql.unsafe(`
    CREATE POLICY "storage_select_own" ON storage.objects
    FOR SELECT TO authenticated
    USING (
      bucket_id = 'captures-paiements'
      AND name LIKE (auth.uid()::text || '/%')
    )
  `);
  console.log("  ✅ Politique SELECT créée (LIKE uid/%).");

  // UPDATE : pour upsert, on a besoin d'une politique UPDATE aussi
  await sql.unsafe(`
    CREATE POLICY "storage_update_own" ON storage.objects
    FOR UPDATE TO authenticated
    USING (
      bucket_id = 'captures-paiements'
      AND name LIKE (auth.uid()::text || '/%')
    )
    WITH CHECK (
      bucket_id = 'captures-paiements'
      AND name LIKE (auth.uid()::text || '/%')
    )
  `);
  console.log("  ✅ Politique UPDATE créée (pour upsert).");

  // SELECT admin : les managers/admins peuvent lire tout le bucket
  await sql.unsafe(`
    CREATE POLICY "storage_admin_select" ON storage.objects
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

  // 3. Vérifier que RLS est activé sur storage.objects
  const rlsStatus = await sql`
    SELECT relrowsecurity FROM pg_class 
    WHERE oid = 'storage.objects'::regclass
  `;
  console.log(`\n🔒 RLS activé sur storage.objects: ${rlsStatus[0]?.relrowsecurity}`);

  // 4. Vérification finale
  const finalPolicies = await sql`
    SELECT policyname, cmd FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects'
  `;
  console.log("\n📋 Politiques finales :");
  console.table(finalPolicies);

  console.log("\n🎉 Correction v2 terminée !");
  process.exit(0);
}

fix().catch((err) => {
  console.error("❌ Erreur :", err.message);
  process.exit(1);
});
