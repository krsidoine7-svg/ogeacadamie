const postgres = require("postgres");
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is not defined.");
  process.exit(1);
}

const sql = postgres(connectionString, { prepare: false });

async function run() {
  try {
    console.log("Dropping existing policy if it exists...");
    await sql`
      DROP POLICY IF EXISTS "Allow admins and zone managers to read receipts" ON storage.objects;
    `;
    
    console.log("Creating new storage policy...");
    await sql`
      CREATE POLICY "Allow admins and zone managers to read receipts" 
      ON storage.objects 
      FOR SELECT 
      TO authenticated 
      USING (
        bucket_id = 'captures-paiements' 
        AND (
          (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'super_admin')
          OR 
          (
            (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'manager_zone'
            AND 
            EXISTS (SELECT 1 FROM public.paiements WHERE user_id::text = (storage.foldername(name))[1])
          )
        )
      );
    `;
    
    console.log("Policy created successfully!");
  } catch (err) {
    console.error("Error creating policy:", err);
  } finally {
    await sql.end();
  }
}

run();
