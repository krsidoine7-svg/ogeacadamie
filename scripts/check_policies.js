const postgres = require("postgres");
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is not defined.");
  process.exit(1);
}

const sql = postgres(connectionString, { prepare: false });

async function run() {
  try {
    const rlsStatus = await sql`
      SELECT c.relname, c.relrowsecurity, c.relforcerowsecurity 
      FROM pg_class c 
      JOIN pg_namespace n ON n.oid = c.relnamespace 
      WHERE n.nspname = 'public' AND c.relname IN ('profiles', 'paiements', 'zone_config');
    `;
    console.log("RLS Status:", rlsStatus);
  } catch (err) {
    console.error("Error fetching policies:", err);
  } finally {
    await sql.end();
  }
}

run();
