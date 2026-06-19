import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, { prepare: false });

async function getHashes() {
  console.log("Password hashes comparison:");
  const users = await sql`
    SELECT email, encrypted_password
    FROM auth.users
  `;
  console.log(users);
  process.exit(0);
}

getHashes().catch(err => {
  console.error(err);
  process.exit(1);
});
