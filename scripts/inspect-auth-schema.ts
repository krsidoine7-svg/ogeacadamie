import postgres from "postgres";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres.ydaqlbwnxqmkfbuapbhv:cJ2YgZtMUdELIhUG@aws-0-eu-west-1.pooler.supabase.com:6543/postgres";

async function main() {
  const sqlClient = postgres(connectionString, { prepare: false });
  try {
    console.log("Inspecting columns of auth.identities...");
    const identityColumns = await sqlClient`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'auth' AND table_name = 'identities';
    `;
    console.log("auth.identities columns:");
    console.log(identityColumns);

    console.log("Inspecting columns of auth.users...");
    const userColumns = await sqlClient`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'auth' AND table_name = 'users';
    `;
    console.log("auth.users columns:");
    console.log(userColumns);

    console.log("Checking target user identity in auth.identities...");
    const targetUser = await sqlClient`
      SELECT id, user_id, provider, identity_data 
      FROM auth.identities 
      WHERE user_id = '8e100695-e1b8-40be-8212-c995c3ed304c'::uuid;
    `;
    console.log("Target user identity row:", targetUser);
  } catch (error: any) {
    console.error("Error inspecting auth schema:", error.message);
  } finally {
    await sqlClient.end();
  }
}

main();
