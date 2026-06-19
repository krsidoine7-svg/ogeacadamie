import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log("Testing manager login...");
  const { data, error } = await supabase.auth.signInWithPassword({
    email: "manager.yamoussoukro@oge-academie.ci",
    password: "Manager123!",
  });

  if (error) {
    console.error("❌ Login failed:", error);
  } else {
    console.log("✅ Login successful! User ID:", data.user?.id);
  }
  process.exit(0);
}

test().catch(err => {
  console.error(err);
  process.exit(1);
});
