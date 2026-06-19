/**
 * Diagnostic et réparation complète du Storage Supabase
 * Vérifie les migrations, les politiques système et tente une réparation
 */
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, { prepare: false });

async function fix() {
  console.log("🔍 DIAGNOSTIC COMPLET DU STORAGE\n");

  // 1. Vérifier les migrations storage
  console.log("=== 1. Migrations Storage ===");
  try {
    const migrations = await sql`SELECT * FROM storage.migrations ORDER BY id`;
    console.table(migrations);
  } catch (e: any) {
    console.log("  ❌ Impossible de lire storage.migrations:", e.message);
  }

  // 2. Lister TOUTES les politiques sur storage.objects
  console.log("\n=== 2. Politiques actuelles sur storage.objects ===");
  const policies = await sql`
    SELECT policyname, cmd, permissive, roles, qual, with_check 
    FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects'
  `;
  if (policies.length === 0) {
    console.log("  ⚠️  AUCUNE politique !");
  } else {
    for (const p of policies) {
      console.log(`  - [${p.cmd}] ${p.policyname} (${p.permissive}) roles:${p.roles}`);
    }
  }

  // 3. Lister les politiques sur storage.buckets
  console.log("\n=== 3. Politiques sur storage.buckets ===");
  const bucketPolicies = await sql`
    SELECT policyname, cmd, permissive, roles 
    FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'buckets'
  `;
  if (bucketPolicies.length === 0) {
    console.log("  ⚠️  AUCUNE politique !");
  } else {
    for (const p of bucketPolicies) {
      console.log(`  - [${p.cmd}] ${p.policyname} (${p.permissive}) roles:${p.roles}`);
    }
  }

  // 4. Vérifier RLS sur les tables storage
  console.log("\n=== 4. État RLS ===");
  const rlsInfo = await sql`
    SELECT c.relname, c.relrowsecurity, c.relforcerowsecurity
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'storage' AND c.relkind = 'r'
    ORDER BY c.relname
  `;
  console.table(rlsInfo);

  // 5. Vérifier les triggers sur storage.objects
  console.log("\n=== 5. Triggers sur storage.objects ===");
  const triggers = await sql`
    SELECT trigger_name, event_manipulation, action_statement
    FROM information_schema.triggers
    WHERE event_object_schema = 'storage' AND event_object_table = 'objects'
  `;
  if (triggers.length === 0) {
    console.log("  Aucun trigger.");
  } else {
    for (const t of triggers) {
      console.log(`  - ${t.trigger_name} (${t.event_manipulation}): ${t.action_statement}`);
    }
  }

  // 6. RÉPARATION : Supprimer les politiques cassées et tout recréer proprement
  console.log("\n\n🔧 === RÉPARATION ===\n");

  // Supprimer toutes les politiques custom sur storage.objects
  console.log("Suppression de toutes les politiques sur storage.objects...");
  for (const p of policies) {
    await sql.unsafe(`DROP POLICY IF EXISTS "${p.policyname}" ON storage.objects`);
    console.log(`  🗑️  Supprimé: ${p.policyname}`);
  }

  // Recréer les politiques que Supabase attend par défaut
  // Politique basique : permettre tout pour les utilisateurs authentifiés sur ce bucket
  console.log("\nCréation de politiques simples...");
  
  await sql.unsafe(`
    CREATE POLICY "Give users access to own folder - INSERT" ON storage.objects 
    FOR INSERT TO authenticated 
    WITH CHECK (bucket_id = 'captures-paiements' AND (select auth.uid()::text) = (storage.foldername(name))[1])
  `);
  console.log("  ✅ INSERT policy");

  await sql.unsafe(`
    CREATE POLICY "Give users access to own folder - SELECT" ON storage.objects 
    FOR SELECT TO authenticated 
    USING (bucket_id = 'captures-paiements' AND (select auth.uid()::text) = (storage.foldername(name))[1])
  `);
  console.log("  ✅ SELECT policy");

  await sql.unsafe(`
    CREATE POLICY "Give users access to own folder - UPDATE" ON storage.objects 
    FOR UPDATE TO authenticated 
    USING (bucket_id = 'captures-paiements' AND (select auth.uid()::text) = (storage.foldername(name))[1])
    WITH CHECK (bucket_id = 'captures-paiements' AND (select auth.uid()::text) = (storage.foldername(name))[1])
  `);
  console.log("  ✅ UPDATE policy");

  await sql.unsafe(`
    CREATE POLICY "Give users access to own folder - DELETE" ON storage.objects 
    FOR DELETE TO authenticated 
    USING (bucket_id = 'captures-paiements' AND (select auth.uid()::text) = (storage.foldername(name))[1])
  `);
  console.log("  ✅ DELETE policy");

  // 7. Tester l'insertion directe dans storage.objects
  console.log("\n=== Test d'insertion directe ===");
  try {
    // On ne va pas vraiment insérer, juste vérifier qu'on peut accéder à la table
    const count = await sql`SELECT count(*) FROM storage.objects WHERE bucket_id = 'captures-paiements'`;
    console.log(`  ✅ Accès OK. ${count[0].count} fichier(s) dans le bucket.`);
  } catch (e: any) {
    console.log(`  ❌ Erreur d'accès:`, e.message);
  }

  console.log("\n🎉 Réparation terminée !");
  process.exit(0);
}

fix().catch((err) => {
  console.error("❌ Erreur :", err.message);
  process.exit(1);
});
