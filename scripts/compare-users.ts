import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, { prepare: false });

async function compare() {
  console.log("Comparing auth.users records:");
  const autoUser = await sql`
    SELECT * FROM auth.users WHERE email = 'krsidoine7@gmail.com'
  `;
  const manualUser = await sql`
    SELECT * FROM auth.users WHERE email = 'manager.yamoussoukro@oge-academie.ci'
  `;

  console.log("--- AUTO USER (krsidoine7@gmail.com) ---");
  console.log(JSON.stringify(autoUser[0], null, 2));

  console.log("\n--- MANUAL USER (manager.yamoussoukro@oge-academie.ci) ---");
  console.log(JSON.stringify(manualUser[0], null, 2));

  process.exit(0);
}

compare().catch(err => {
  console.error(err);
  process.exit(1);
});
