import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runTest() {
  const email = `test.candidate.${Date.now()}@gmail.com`;
  const password = "Password123!";

  console.log(`1. S'inscrire via API Auth: ${email}`);
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nom: "Test",
        prenom: "Candidat",
      }
    }
  });

  if (signUpError) {
    console.error("❌ Sign up failed:", signUpError);
    process.exit(1);
  }
  console.log(`✅ Sign up success! User ID: ${signUpData.user?.id}`);

  console.log("2. Tenter de se connecter avec ces identifiants...");
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    console.error("❌ Sign in failed:", signInError);
  } else {
    console.log(`✅ Sign in success! User ID: ${signInData.user?.id}`);
  }
  process.exit(0);
}

runTest().catch(err => {
  console.error(err);
  process.exit(1);
});
