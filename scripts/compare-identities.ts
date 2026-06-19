import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, { prepare: false });

async function compare() {
  console.log("Comparing auth.identities records:");
  const autoIdentity = await sql`
    SELECT * FROM auth.identities WHERE user_id = '839d90f2-7606-46b0-9bfd-287440d1cccf'
  `;
  const manualIdentity = await sql`
    SELECT * FROM auth.identities WHERE user_id = '9ac79b17-065b-4079-8931-738e10fa63ec'
  `;

  console.log("--- AUTO IDENTITY ---");
  console.log(JSON.stringify(autoIdentity[0], null, 2));

  console.log("\n--- MANUAL IDENTITY ---");
  console.log(JSON.stringify(manualIdentity[0], null, 2));

  process.exit(0);
}

compare().catch(err => {
  console.error(err);
  process.exit(1);
});
