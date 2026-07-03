import postgres from "postgres";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres.ydaqlbwnxqmkfbuapbhv:cJ2YgZtMUdELIhUG@aws-0-eu-west-1.pooler.supabase.com:6543/postgres";

async function main() {
  const sqlClient = postgres(connectionString, { prepare: false });
  try {
    const userId = "8e100695-e1b8-40be-8212-c995c3ed304c";
    console.log(`Checking user details for ID: ${userId}...`);

    const usersRow = await sqlClient`
      SELECT id, email, email_confirmed_at, confirmed_at, raw_user_meta_data
      FROM auth.users
      WHERE id = ${userId}::uuid;
    `;
    console.log("auth.users row:", usersRow);

    const identitiesRow = await sqlClient`
      SELECT id, user_id, provider, provider_id, email, identity_data
      FROM auth.identities
      WHERE user_id = ${userId}::uuid;
    `;
    console.log("auth.identities row:", identitiesRow);

    const profilesRow = await sqlClient`
      SELECT id, nom, prenom, email, role, whatsapp
      FROM public.profiles
      WHERE id = ${userId}::uuid;
    `;
    console.log("public.profiles row:", profilesRow);

  } catch (error: any) {
    console.error("Error checking user status:", error.message);
  } finally {
    await sqlClient.end();
  }
}

main();
