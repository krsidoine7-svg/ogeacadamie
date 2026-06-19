import postgres from "postgres";
import { randomUUID } from "crypto";

const sql = postgres(process.env.DATABASE_URL!, { prepare: false });

const managers = [
  { zone: "yamoussoukro", nom: "Manager", prenom: "Yamoussoukro", email: "manager.yamoussoukro@oge-academie.ci", role: "manager_zone" },
  { zone: "yopougon",     nom: "Manager", prenom: "Yopougon",     email: "manager.yopougon@oge-academie.ci", role: "manager_zone" },
  { zone: "abobo",        nom: "Manager", prenom: "Abobo",        email: "manager.abobo@oge-academie.ci", role: "manager_zone" },
  { zone: "cocody",       nom: "Manager", prenom: "Cocody",       email: "manager.cocody@oge-academie.ci", role: "manager_zone" },
  { zone: "port-bouet",   nom: "Manager", prenom: "Port-Bouët",   email: "manager.portbouet@oge-academie.ci", role: "manager_zone" },
  { zone: "bouake",       nom: "Manager", prenom: "Bouaké",       email: "manager.bouake@oge-academie.ci", role: "manager_zone" },
];

const admins = [
  { zone: null, nom: "Admin", prenom: "Un",   email: "admin1@oge-academie.ci", role: "admin" },
  { zone: null, nom: "Admin", prenom: "Deux",   email: "admin2@oge-academie.ci", role: "admin" },
  { zone: null, nom: "Admin", prenom: "Super",  email: "superadmin@oge-academie.ci", role: "super_admin" },
];

async function run() {
  console.log("🧼 Dé-association des managers dans zone_config...");
  await sql`
    UPDATE zone_config SET manager_id = NULL
  `;

  console.log("🧼 Nettoyage des anciens comptes...");
  const allEmails = [...managers.map(m => m.email), ...admins.map(a => a.email)];
  
  await sql`
    DELETE FROM auth.users WHERE email = ANY(${allEmails})
  `;
  console.log("✅ Anciens comptes supprimés.");

  console.log("\n🚀 Création des comptes avec le bon formatage...");

  for (const acc of [...managers, ...admins]) {
    try {
      const userId = randomUUID();
      const password = acc.role === "manager_zone" ? "Manager123!" : "Admin123!";

      const rawUserMetaData = {
        nom: acc.nom,
        prenom: acc.prenom,
        sub: userId,
        email: acc.email,
        email_verified: false,
        phone_verified: false
      };

      const identityData = {
        nom: acc.nom,
        prenom: acc.prenom,
        sub: userId,
        email: acc.email,
        email_verified: false,
        phone_verified: false
      };

      // 1. Insertion dans auth.users
      await sql`
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
          recovery_token,
          is_anonymous
        ) VALUES (
          '00000000-0000-0000-0000-000000000000',
          ${userId},
          'authenticated',
          'authenticated',
          ${acc.email},
          crypt(${password}, gen_salt('bf', 10)),
          now(),
          ${ { provider: "email", providers: ["email"] } as any },
          ${ rawUserMetaData as any },
          now(),
          now(),
          '',
          '',
          '',
          '',
          false
        )
      `;

      // 2. Insertion dans auth.identities (on omet la colonne email car elle est générée)
      const identityId = randomUUID();
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
          ${identityId},
          ${userId},
          ${ identityData as any },
          'email',
          ${userId},
          now(),
          now(),
          now()
        )
      `;

      // 3. Le trigger handle_new_user crée le profil, mettons-le à jour
      await sql`
        UPDATE profiles SET
          role = ${acc.role}::user_role,
          zone = ${acc.zone}::zone_name,
          is_active = true,
          nom = ${acc.nom},
          prenom = ${acc.prenom}
        WHERE id = ${userId}::uuid
      `;

      // 4. Si c'est un manager, on l'associe dans zone_config
      if (acc.role === "manager_zone" && acc.zone) {
        await sql`
          UPDATE zone_config SET
            manager_id = ${userId}::uuid,
            updated_at = now()
          WHERE zone = ${acc.zone}::zone_name
        `;
      }

      console.log(`  ✅ ${acc.prenom} (${acc.email}) -> ${acc.role}`);
    } catch (e: any) {
      console.error(`  ❌ Erreur pour ${acc.email}:`, e.message);
    }
  }

  console.log("\n📋 Liste finale des comptes :");
  const users = await sql`
    SELECT prenom, email, role, zone, is_active 
    FROM profiles 
    WHERE deleted_at IS NULL 
    ORDER BY role, created_at
  `;
  console.table(users);
  process.exit(0);
}

run().catch(err => {
  console.error("❌ Erreur générale:", err);
  process.exit(1);
});
