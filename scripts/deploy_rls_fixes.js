const postgres = require("postgres");
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is not defined.");
  process.exit(1);
}

const sql = postgres(connectionString, { prepare: false });

async function run() {
  try {
    console.log("Starting transaction for RLS fixes...");
    
    await sql.begin(async (sql) => {
      // 1. Create helper functions
      console.log("Creating function public.get_user_role...");
      await sql`
        CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
        RETURNS text SECURITY DEFINER
        SET search_path = public
        LANGUAGE sql AS $$
          SELECT role::text FROM public.profiles WHERE id = user_id AND deleted_at IS NULL;
        $$;
      `;

      console.log("Creating function public.get_user_zone...");
      await sql`
        CREATE OR REPLACE FUNCTION public.get_user_zone(user_id uuid)
        RETURNS text SECURITY DEFINER
        SET search_path = public
        LANGUAGE sql AS $$
          SELECT zone FROM public.profiles WHERE id = user_id AND deleted_at IS NULL;
        $$;
      `;

      console.log("Creating function public.can_read_receipt...");
      await sql`
        CREATE OR REPLACE FUNCTION public.can_read_receipt(user_id uuid, object_owner_str text)
        RETURNS boolean SECURITY DEFINER
        SET search_path = public
        LANGUAGE plpgsql AS $$
        DECLARE
          v_role text;
          v_user_zone text;
          v_owner_zone text;
          v_owner_id uuid;
        BEGIN
          -- Safe conversion of string to UUID
          BEGIN
            v_owner_id := object_owner_str::uuid;
          EXCEPTION WHEN OTHERS THEN
            RETURN FALSE;
          END;

          -- Get role of the querying user
          SELECT role::text INTO v_role FROM public.profiles WHERE id = user_id AND deleted_at IS NULL;
          
          -- If admin or super_admin, they can read all receipts
          IF v_role IN ('admin', 'super_admin') THEN
            RETURN TRUE;
          END IF;
          
          -- If manager, check if they manage the zone of the candidate
          IF v_role = 'manager_zone' THEN
            -- Get zone of the manager
            SELECT zone INTO v_user_zone FROM public.profiles WHERE id = user_id AND deleted_at IS NULL;
            -- Get zone of the candidate
            SELECT zone INTO v_owner_zone FROM public.profiles WHERE id = v_owner_id AND deleted_at IS NULL;
            
            RETURN (v_user_zone IS NOT NULL AND v_user_zone = v_owner_zone);
          END IF;
          
          -- Otherwise, user can only read their own receipt
          RETURN (user_id = v_owner_id);
        END;
        $$;
      `;

      // 2. Recreate public.profiles policy
      console.log("Dropping old admin_all_profiles policy...");
      await sql`DROP POLICY IF EXISTS "admin_all_profiles" ON public.profiles;`;
      
      console.log("Creating new admin_all_profiles policy...");
      await sql`
        CREATE POLICY "admin_all_profiles" ON public.profiles
        FOR ALL
        TO public
        USING (public.get_user_role(auth.uid()) IN ('admin', 'super_admin'));
      `;

      // 3. Recreate storage.objects policy
      console.log("Dropping old storage read policies...");
      await sql`DROP POLICY IF EXISTS "Allow admins and zone managers to read receipts" ON storage.objects;`;
      await sql`DROP POLICY IF EXISTS "Allow read access to receipts based on roles" ON storage.objects;`;
      
      console.log("Creating new storage read policy...");
      await sql`
        CREATE POLICY "Allow read access to receipts based on roles"
        ON storage.objects FOR SELECT TO authenticated
        USING (
          bucket_id = 'captures-paiements'
          AND public.can_read_receipt(auth.uid(), (storage.foldername(name))[1])
        );
      `;
    });

    console.log("RLS fixes deployed successfully!");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await sql.end();
  }
}

run();
