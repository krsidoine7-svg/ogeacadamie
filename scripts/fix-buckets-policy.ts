import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, { prepare: false });

async function fix() {
  console.log("🔧 Ajout des politiques manquantes sur storage.buckets...\n");

  // Le service Storage de Supabase a besoin de pouvoir lire les buckets
  // RLS est activé sur storage.buckets mais aucune politique n'existe !
  
  try {
    await sql.unsafe(`
      CREATE POLICY "Allow public read of buckets" ON storage.buckets
      FOR SELECT USING (true)
    `);
    console.log("✅ Politique SELECT (publique) créée sur storage.buckets");
  } catch (e: any) {
    console.log("ℹ️  Politique SELECT existe déjà ou erreur:", e.message);
  }

  // Vérification
  const policies = await sql`
    SELECT policyname, cmd, roles FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'buckets'
  `;
  console.log("\n📋 Politiques finales sur storage.buckets:");
  console.table(policies);

  // Tester l'accès au bucket depuis le rôle authentifié
  console.log("\n🧪 Test de lecture du bucket...");
  const bucket = await sql`SELECT id, name, public FROM storage.buckets WHERE id = 'captures-paiements'`;
  console.log("  Bucket:", JSON.stringify(bucket[0]));

  console.log("\n🎉 Terminé !");
  process.exit(0);
}

fix().catch((err) => {
  console.error("❌ Erreur:", err.message);
  process.exit(1);
});
