import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, { prepare: false });

const accounts = [
  { role: "admin",       nom: "Admin", prenom: "Un",   email: "admin1@oge-academie.ci" },
  { role: "admin",       nom: "Admin", prenom: "Deux",   email: "admin2@oge-academie.ci" },
  { role: "super_admin", nom: "Admin", prenom: "Super",  email: "superadmin@oge-academie.ci" },
];

const PASSWORD = "Admin123!";

async function createAdmins() {
  console.log("👤 Création des comptes admin et super_admin via SQL direct...\n");

  for (const acc of accounts) {
    try {
      // 1. Créer l'utilisateur dans auth.users directement
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
          ${acc.email},
          crypt(${PASSWORD}, gen_salt('bf')),
          now(),
          '{"provider":"email","providers":["email"]}',
          ${JSON.stringify({ nom: acc.nom, prenom: acc.prenom })}::jsonb,
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
          ${JSON.stringify({ sub: userId, email: acc.email })}::jsonb,
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
          role = ${acc.role}::user_role,
          zone = NULL,
          is_active = true,
          nom = ${acc.nom},
          prenom = ${acc.prenom}
        WHERE id = ${userId}::uuid
      `;

      console.log(`  ✅ ${acc.prenom} (${acc.email}) → ${acc.role}`);
    } catch (e: any) {
      console.log(`  ❌ ${acc.email}: ${e.message}`);
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

  console.log(`\n🔑 Mot de passe admin : ${PASSWORD}`);
  console.log("\n🎉 Terminé !");
  process.exit(0);
}

createAdmins().catch((err) => {
  console.error("❌ Erreur:", err.message);
  process.exit(1);
});
