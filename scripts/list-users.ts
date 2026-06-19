import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, { prepare: false });

async function check() {
  console.log("👥 Comptes existants :\n");
  
  const users = await sql`
    SELECT id, nom, prenom, email, role, zone, is_active 
    FROM profiles 
    WHERE deleted_at IS NULL 
    ORDER BY role, created_at
  `;
  console.table(users);

  process.exit(0);
}

check().catch((err) => {
  console.error("❌ Erreur:", err.message);
  process.exit(1);
});
