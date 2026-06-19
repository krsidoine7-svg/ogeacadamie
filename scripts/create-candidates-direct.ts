import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, { prepare: false });

const zones = ["yamoussoukro", "yopougon", "abobo", "cocody", "port-bouet", "bouake"];
const PASSWORD = "Candidat123!";

async function createCandidates() {
  console.log("🧹 Suppression des anciens comptes candidats de test...\n");
  
  try {
    await sql`
      DELETE FROM auth.users 
      WHERE email LIKE 'candidat1.%@oge-academie.ci' 
         OR email LIKE 'candidat2.%@oge-academie.ci'
    `;
    console.log("✅ Anciens comptes supprimés.");
  } catch (err: any) {
    console.warn("⚠️ Avertissement lors de la suppression des anciens comptes:", err.message);
  }

  console.log("\n👤 Création de 2 candidats par zone via SQL direct...\n");

  for (const zone of zones) {
    console.log(`\nZone: ${zone.toUpperCase()}`);

    // Candidate 1: payment 'en_cours', is_active = false
    try {
      const email1 = `candidat1.${zone}@oge-academie.ci`;
      const nom1 = zone.charAt(0).toUpperCase() + zone.slice(1).replace("-", " ");
      const prenom1 = "Candidat1";
      
      const rawUserMetaData = { nom: nom1, prenom: prenom1 };
      const rawAppMetaData = { provider: "email", providers: ["email"] };

      const result1 = await sql`
        INSERT INTO auth.users (
          instance_id, id, aud, role, email, encrypted_password,
          email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
          created_at, updated_at, confirmation_token, email_change,
          email_change_token_new, recovery_token
        ) VALUES (
          '00000000-0000-0000-0000-000000000000',
          gen_random_uuid(),
          'authenticated',
          'authenticated',
          ${email1},
          crypt(${PASSWORD}, gen_salt('bf', 10)),
          now(),
          ${rawAppMetaData as any},
          ${rawUserMetaData as any},
          now(),
          now(),
          '', '', '', ''
        )
        RETURNING id
      `;
      const userId1 = result1[0].id;

      const identityData1 = { sub: userId1, email: email1, nom: nom1, prenom: prenom1 };

      await sql`
        INSERT INTO auth.identities (
          id, user_id, identity_data, provider, provider_id,
          last_sign_in_at, created_at, updated_at
        ) VALUES (
          ${userId1},
          ${userId1},
          ${identityData1 as any},
          'email',
          ${userId1},
          now(),
          now(),
          now()
        )
      `;

      await sql`
        UPDATE profiles SET
          role = 'user',
          zone = ${zone}::zone_name,
          is_active = false,
          nom = ${nom1},
          prenom = ${prenom1},
          whatsapp = '+225 01020304',
          serie_bac = 'D',
          mode_formation = 'presentiel'
        WHERE id = ${userId1}::uuid
      `;

      await sql`
        INSERT INTO concours_inscrits (user_id, concours)
        VALUES (${userId1}::uuid, 'inphb')
      `;

      // Create a pending payment (en_cours)
      await sql`
        INSERT INTO paiements (user_id, zone, montant, statut, capture_url, created_at, updated_at)
        VALUES (${userId1}::uuid, ${zone}::zone_name, 15000, 'en_cours', 'test-receipt.png', now(), now())
      `;

      console.log(`  ✅ Candidat 1 créé: ${email1} (Paiement EN COURS)`);
    } catch (e: any) {
      console.log(`  ❌ Candidat 1 failed: ${e.message}`);
    }

    // Candidate 2: payment 'valide', is_active = true
    try {
      const email2 = `candidat2.${zone}@oge-academie.ci`;
      const nom2 = zone.charAt(0).toUpperCase() + zone.slice(1).replace("-", " ");
      const prenom2 = "Candidat2";
      
      const rawUserMetaData = { nom: nom2, prenom: prenom2 };
      const rawAppMetaData = { provider: "email", providers: ["email"] };

      const result2 = await sql`
        INSERT INTO auth.users (
          instance_id, id, aud, role, email, encrypted_password,
          email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
          created_at, updated_at, confirmation_token, email_change,
          email_change_token_new, recovery_token
        ) VALUES (
          '00000000-0000-0000-0000-000000000000',
          gen_random_uuid(),
          'authenticated',
          'authenticated',
          ${email2},
          crypt(${PASSWORD}, gen_salt('bf', 10)),
          now(),
          ${rawAppMetaData as any},
          ${rawUserMetaData as any},
          now(),
          now(),
          '', '', '', ''
        )
        RETURNING id
      `;
      const userId2 = result2[0].id;

      const identityData2 = { sub: userId2, email: email2, nom: nom2, prenom: prenom2 };

      await sql`
        INSERT INTO auth.identities (
          id, user_id, identity_data, provider, provider_id,
          last_sign_in_at, created_at, updated_at
        ) VALUES (
          ${userId2},
          ${userId2},
          ${identityData2 as any},
          'email',
          ${userId2},
          now(),
          now(),
          now()
        )
      `;

      await sql`
        UPDATE profiles SET
          role = 'user',
          zone = ${zone}::zone_name,
          is_active = true,
          nom = ${nom2},
          prenom = ${prenom2},
          whatsapp = '+225 05060708',
          serie_bac = 'C',
          mode_formation = 'en_ligne'
        WHERE id = ${userId2}::uuid
      `;

      await sql`
        INSERT INTO concours_inscrits (user_id, concours)
        VALUES (${userId2}::uuid, 'esatic'), (${userId2}::uuid, 'cme')
      `;

      // Create validated payment
      await sql`
        INSERT INTO paiements (user_id, zone, montant, statut, valide_at, created_at, updated_at)
        VALUES (${userId2}::uuid, ${zone}::zone_name, 15000, 'valide', now(), now() - INTERVAL '1 day', now())
      `;

      console.log(`  ✅ Candidat 2 créé: ${email2} (Paiement VALIDÉ)`);
    } catch (e: any) {
      console.log(`  ❌ Candidat 2 failed: ${e.message}`);
    }
  }

  console.log("\n🎉 Terminé ! Les comptes candidats ont été régénérés avec succès.");
  process.exit(0);
}

createCandidates().catch((err) => {
  console.error("❌ Erreur:", err.message);
  process.exit(1);
});
