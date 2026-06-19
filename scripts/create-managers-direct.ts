import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, { prepare: false });

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
  console.log("👤 Création des comptes manager_zone via SQL direct...\n");

  for (const z of zones) {
    try {
      // 1. Créer l'utilisateur dans auth.users directement
      // Supabase utilise pgcrypto pour hasher les mots de passe avec crypt()
      const result = await sql`
        INSERT INTO auth.users (
          instance_id,
          id,
          aud,
          role,
          email,
          encrypted_password,
          email_confirmed_at,
          raw_app_meta_data,
          raw_user_meta_data,
          created_at,
          updated_at,
          confirmation_token,
          email_change,
          email_change_token_new,
          recovery_token
        ) VALUES (
          '00000000-0000-0000-0000-000000000000',
          gen_random_uuid(),
          'authenticated',
          'authenticated',
          ${z.email},
          crypt(${PASSWORD}, gen_salt('bf')),
          now(),
          '{"provider":"email","providers":["email"]}',
          ${JSON.stringify({ nom: z.nom, prenom: z.prenom })}::jsonb,
          now(),
          now(),
          '',
          '',
          '',
          ''
        )
        RETURNING id
      `;

      const userId = result[0].id;

      // 2. Créer l'identité email dans auth.identities
      await sql`
        INSERT INTO auth.identities (
          id,
          user_id,
          identity_data,
          provider,
          provider_id,
          last_sign_in_at,
          created_at,
          updated_at
        ) VALUES (
          ${userId},
          ${userId},
          ${JSON.stringify({ sub: userId, email: z.email })}::jsonb,
          'email',
          ${userId},
          now(),
          now(),
          now()
        )
      `;

      // 3. Le trigger handle_new_user a créé le profil, mettons-le à jour
      await sql`
        UPDATE profiles SET
          role = 'manager_zone',
          zone = ${z.zone}::zone_name,
          is_active = true,
          nom = ${z.nom},
          prenom = ${z.prenom}
        WHERE id = ${userId}::uuid
      `;

      // 4. Associer le manager à sa zone dans zone_config
      await sql`
        UPDATE zone_config SET
          manager_id = ${userId}::uuid,
          updated_at = now()
        WHERE zone = ${z.zone}::zone_name
      `;

      console.log(`  ✅ ${z.prenom} (${z.email}) → manager de ${z.zone}`);
    } catch (e: any) {
      console.log(`  ❌ ${z.zone}: ${e.message}`);
    }
  }

  // Vérification finale
  console.log("\n📋 Tous les comptes :");
  const all = await sql`
    SELECT prenom, email, role, zone, is_active
    FROM profiles
    WHERE deleted_at IS NULL
    ORDER BY role, zone
  `;
  console.table(all);

  console.log(`\n🔑 Mot de passe managers : ${PASSWORD}`);
  console.log("\n🎉 Terminé !");
  process.exit(0);
}

createManagers().catch((err) => {
  console.error("❌ Erreur:", err.message);
  process.exit(1);
});
