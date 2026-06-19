import { createClient } from "@supabase/supabase-js";
import postgres from "postgres";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const sql = postgres(process.env.DATABASE_URL!, { prepare: false });

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const zones = [
  { zone: "yamoussoukro", nom: "Manager", prenom: "Yamoussoukro", email: "manager.yamoussoukro@oge-academie.ci" },
  { zone: "yopougon",     nom: "Manager", prenom: "Yopougon",     email: "manager.yopougon@oge-academie.ci" },
  { zone: "abobo",        nom: "Manager", prenom: "Abobo",        email: "manager.abobo@oge-academie.ci" },
  { zone: "cocody",       nom: "Manager", prenom: "Cocody",       email: "manager.cocody@oge-academie.ci" },
  { zone: "port-bouet",   nom: "Manager", prenom: "Port-Bouët",   email: "manager.portbouet@oge-academie.ci" },
  { zone: "bouake",       nom: "Manager", prenom: "Bouaké",       email: "manager.bouake@oge-academie.ci" },
];

const PASSWORD = "Manager123!";

async function createManagers() {
  console.log("👤 Création des comptes manager_zone...\n");

  for (const z of zones) {
    // 1. Créer le compte dans Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: z.email,
      password: PASSWORD,
      options: {
        data: {
          nom: z.nom,
          prenom: z.prenom,
        },
      },
    });

    if (error) {
      console.log(`  ❌ ${z.zone}: ${error.message}`);
      continue;
    }

    if (!data.user) {
      console.log(`  ❌ ${z.zone}: utilisateur non créé`);
      continue;
    }

    const userId = data.user.id;

    // 2. Mettre à jour le profil avec le rôle manager_zone et la zone
    await sql`
      UPDATE profiles SET
        role = 'manager_zone',
        zone = ${z.zone}::zone_name,
        is_active = true,
        nom = ${z.nom},
        prenom = ${z.prenom}
      WHERE id = ${userId}::uuid
    `;

    // 3. Associer le manager à sa zone dans zone_config
    await sql`
      UPDATE zone_config SET
        manager_id = ${userId}::uuid,
        updated_at = now()
      WHERE zone = ${z.zone}::zone_name
    `;

    console.log(`  ✅ ${z.prenom} (${z.email}) → manager de ${z.zone} [${userId}]`);
  }

  // Vérification finale
  console.log("\n📋 Comptes créés :");
  const managers = await sql`
    SELECT p.prenom, p.email, p.role, p.zone, zc.telephone
    FROM profiles p
    LEFT JOIN zone_config zc ON zc.zone = p.zone
    WHERE p.role = 'manager_zone' AND p.deleted_at IS NULL
    ORDER BY p.zone
  `;
  console.table(managers);

  console.log(`\n🔑 Mot de passe pour tous les managers : ${PASSWORD}`);
  console.log("\n🎉 Terminé !");
  process.exit(0);
}

createManagers().catch((err) => {
  console.error("❌ Erreur:", err.message);
  process.exit(1);
});
