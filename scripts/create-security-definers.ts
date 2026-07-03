import postgres from "postgres";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres.ydaqlbwnxqmkfbuapbhv:cJ2YgZtMUdELIhUG@aws-0-eu-west-1.pooler.supabase.com:6543/postgres";

async function main() {
  const sqlClient = postgres(connectionString, { prepare: false });
  try {
    console.log("Dropping existing public.admin_update_auth_user_email to recreate it...");
    await sqlClient`DROP FUNCTION IF EXISTS public.admin_update_auth_user_email(uuid, text);`;

    console.log("Creating public.admin_update_auth_user_email with auth.identities synchronization...");
    await sqlClient`
      CREATE FUNCTION public.admin_update_auth_user_email(target_user_id uuid, new_email text)
      RETURNS void
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        -- 1. Update the email and force immediate verification in auth.users
        UPDATE auth.users 
        SET email = new_email,
            email_confirmed_at = COALESCE(email_confirmed_at, now()),
            updated_at = now()
        WHERE id = target_user_id;

        -- 2. Sync changes inside auth.identities (only provider_id and identity_data, as email is generated)
        UPDATE auth.identities
        SET provider_id = new_email,
            identity_data = jsonb_set(identity_data, '{email}', to_jsonb(new_email)),
            updated_at = now()
        WHERE user_id = target_user_id AND provider = 'email';
      END;
      $$;
    `;
    console.log("Function public.admin_update_auth_user_email created successfully!");
  } catch (error: any) {
    console.error("Error creating function:", error.message);
  } finally {
    await sqlClient.end();
  }
}

main();
