/**
 * Diagnostic complet du schéma storage Supabase
 */
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, { prepare: false });

async function diagnose() {
  console.log("🔍 Diagnostic du schéma Storage Supabase\n");

  // 1. Vérifier le schéma storage existe
  const schemas = await sql`SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'storage'`;
  console.log(`1. Schéma 'storage' existe: ${schemas.length > 0 ? '✅' : '❌'}`);

  // 2. Vérifier les tables du schéma storage
  const tables = await sql`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'storage' ORDER BY table_name
  `;
  console.log(`\n2. Tables dans le schéma storage:`);
  tables.forEach(t => console.log(`   - ${t.table_name}`));

  // 3. Colonnes de storage.objects
  const columns = await sql`
    SELECT column_name, data_type, is_nullable 
    FROM information_schema.columns 
    WHERE table_schema = 'storage' AND table_name = 'objects'
    ORDER BY ordinal_position
  `;
  console.log(`\n3. Colonnes de storage.objects:`);
  console.table(columns);

  // 4. Colonnes de storage.buckets
  const bucketCols = await sql`
    SELECT column_name, data_type, is_nullable 
    FROM information_schema.columns 
    WHERE table_schema = 'storage' AND table_name = 'buckets'
    ORDER BY ordinal_position
  `;
  console.log(`\n4. Colonnes de storage.buckets:`);
  console.table(bucketCols);

  // 5. Détails du bucket
  const bucket = await sql`SELECT * FROM storage.buckets WHERE id = 'captures-paiements'`;
  console.log(`\n5. Détails du bucket 'captures-paiements':`);
  console.log(JSON.stringify(bucket[0], null, 2));

  // 6. Fonctions storage disponibles
  const funcs = await sql`
    SELECT routine_name, specific_schema 
    FROM information_schema.routines
    WHERE specific_schema = 'storage'
    ORDER BY routine_name
  `;
  console.log(`\n6. Fonctions dans le schéma storage:`);
  funcs.forEach(f => console.log(`   - storage.${f.routine_name}()`));

  // 7. Extensions activées
  const extensions = await sql`SELECT extname, extversion FROM pg_extension ORDER BY extname`;
  console.log(`\n7. Extensions PostgreSQL activées:`);
  extensions.forEach(e => console.log(`   - ${e.extname} v${e.extversion}`));

  process.exit(0);
}

diagnose().catch((err) => {
  console.error("❌ Erreur :", err.message);
  process.exit(1);
});
