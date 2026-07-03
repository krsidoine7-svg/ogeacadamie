import postgres from "postgres";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres.ydaqlbwnxqmkfbuapbhv:cJ2YgZtMUdELIhUG@aws-0-eu-west-1.pooler.supabase.com:6543/postgres";

async function main() {
  const sqlClient = postgres(connectionString, { prepare: false });
  try {
    console.log("Testing execution of public.admin_update_auth_user_email...");
    await sqlClient`
      SELECT public.admin_update_auth_user_email('f5c91587-babc-49d0-abad-e24d303ebc2a'::uuid, 'kcedic995@gmail.com')
    `;
    console.log("Execution succeeded!");
  } catch (error: any) {
    console.error("Runtime error caught:", error.message);
  } finally {
    await sqlClient.end();
  }
}

main();
