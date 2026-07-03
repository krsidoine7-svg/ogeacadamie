import postgres from "postgres";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres.ydaqlbwnxqmkfbuapbhv:cJ2YgZtMUdELIhUG@aws-0-eu-west-1.pooler.supabase.com:6543/postgres";

async function main() {
  const sqlClient = postgres(connectionString, { prepare: false });
  try {
    const userId = "8e100695-e1b8-40be-8212-c995c3ed304c";
    const targetEmail = "samuel.koffi23@inphb.ci";

    console.log(`Fixing credentials for manager ${userId} to email ${targetEmail}...`);

    // Run our public helper function which synchronizes auth.users and auth.identities
    await sqlClient`
      SELECT public.admin_update_auth_user_email(${userId}::uuid, ${targetEmail})
    `;
    console.log("Helper function executed successfully.");

    // Inspect rows again to verify synchronization
    const usersRow = await sqlClient`
      SELECT id, email, email_confirmed_at, confirmed_at, raw_user_meta_data
      FROM auth.users
      WHERE id = ${userId}::uuid;
    `;
    console.log("Updated auth.users row:", usersRow);

    const identitiesRow = await sqlClient`
      SELECT id, user_id, provider, provider_id, email, identity_data
      FROM auth.identities
      WHERE user_id = ${userId}::uuid;
    `;
    console.log("Updated auth.identities row:", identitiesRow);

  } catch (error: any) {
    console.error("Error executing fix:", error.message);
  } finally {
    await sqlClient.end();
  }
}

main();
