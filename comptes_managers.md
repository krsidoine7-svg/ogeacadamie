# Comptes de la Plateforme (Managers, Admins & Super Admin)

Les comptes suivants ont été créés avec succès directement dans la base de données. Vous pouvez les utiliser pour vous connecter à la plateforme.

---

## 1. Comptes Responsables de Zone (Managers)
* **Mot de passe commun :** `Manager123!`

| Prénom / Ville | E-mail de connexion | Zone géographique | Rôle |
| :--- | :--- | :--- | :--- |
| **Yamoussoukro** | `manager.yamoussoukro@oge-academie.ci` | `yamoussoukro` | `manager_zone` |
| **Yopougon** | `manager.yopougon@oge-academie.ci` | `yopougon` | `manager_zone` |
| **Abobo** | `manager.abobo@oge-academie.ci` | `abobo` | `manager_zone` |
| **Cocody** | `manager.cocody@oge-academie.ci` | `cocody` | `manager_zone` |
| **Port-Bouët** | `manager.portbouet@oge-academie.ci` | `port-bouet` | `manager_zone` |
| **Bouaké** | `manager.bouake@oge-academie.ci` | `bouake` | `manager_zone` |

---

## 2. Comptes Administrateurs (Admins)
* **Mot de passe commun :** `Admin123!`

| Nom complet | E-mail de connexion | Rôle |
| :--- | :--- | :--- |
| **Admin Un** | `admin1@oge-academie.ci` | `admin` |
| **Admin Deux** | `admin2@oge-academie.ci` | `admin` |

---

## 3. Compte Super Administrateur (Super Admin)
* **Mot de passe :** `Admin123!`

| Nom complet | E-mail de connexion | Rôle |
| :--- | :--- | :--- |
| **Admin Super** | `superadmin@oge-academie.ci` | `super_admin` |

---

## Scripts SQL de secours (si réinitialisation de la DB)

### SQL pour recréer les Responsables de Zone (Managers)
```sql
DO $$
DECLARE
    manager_pwd_hash TEXT := crypt('Manager123!', gen_salt('bf', 10));
    new_user_id UUID;
    zone_names text[] := ARRAY['yamoussoukro', 'yopougon', 'abobo', 'cocody', 'port-bouet', 'bouake'];
    emails text[] := ARRAY[
        'manager.yamoussoukro@oge-academie.ci',
        'manager.yopougon@oge-academie.ci',
        'manager.abobo@oge-academie.ci',
        'manager.cocody@oge-academie.ci',
        'manager.portbouet@oge-academie.ci',
        'manager.bouake@oge-academie.ci'
    ];
    prenoms text[] := ARRAY['Yamoussoukro', 'Yopougon', 'Abobo', 'Cocody', 'Port-Bouët', 'Bouaké'];
    i INTEGER;
BEGIN
    FOR i IN 1..6 LOOP
        -- 1. Insertion dans auth.users
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
            emails[i],
            manager_pwd_hash,
            now(),
            '{"provider":"email","providers":["email"]}'::jsonb,
            jsonb_build_object('nom', 'Manager', 'prenom', prenoms[i]),
            now(),
            now(),
            '', '', '', ''
        )
        RETURNING id INTO new_user_id;

        -- 2. Insertion dans auth.identities
        INSERT INTO auth.identities (
            id, user_id, identity_data, provider, provider_id,
            last_sign_in_at, created_at, updated_at
        ) VALUES (
            new_user_id,
            new_user_id,
            jsonb_build_object('sub', new_user_id::text, 'email', emails[i]),
            'email',
            new_user_id,
            now(),
            now(),
            now()
        );

        -- 3. Mise à jour du profil (créé via le trigger handle_new_user)
        UPDATE public.profiles SET
            role = 'manager_zone',
            zone = zone_names[i]::zone_name,
            is_active = true,
            nom = 'Manager',
            prenom = prenoms[i]
        WHERE id = new_user_id;

        -- 4. Liaison avec la table zone_config
        UPDATE public.zone_config SET
            manager_id = new_user_id,
            updated_at = now()
        WHERE zone = zone_names[i]::zone_name;
    END LOOP;
END $$;
```

### SQL pour recréer les Administrateurs et le Super Administrateur
```sql
DO $$
DECLARE
    admin_pwd_hash TEXT := crypt('Admin123!', gen_salt('bf', 10));
    new_user_id UUID;
    roles text[] := ARRAY['admin', 'admin', 'super_admin'];
    emails text[] := ARRAY[
        'admin1@oge-academie.ci',
        'admin2@oge-academie.ci',
        'superadmin@oge-academie.ci'
    ];
    prenoms text[] := ARRAY['Un', 'Deux', 'Super'];
    i INTEGER;
BEGIN
    FOR i IN 1..3 LOOP
        -- 1. Insertion dans auth.users
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
            emails[i],
            admin_pwd_hash,
            now(),
            '{"provider":"email","providers":["email"]}'::jsonb,
            jsonb_build_object('nom', 'Admin', 'prenom', prenoms[i]),
            now(),
            now(),
            '', '', '', ''
        )
        RETURNING id INTO new_user_id;

        -- 2. Insertion dans auth.identities
        INSERT INTO auth.identities (
            id, user_id, identity_data, provider, provider_id,
            last_sign_in_at, created_at, updated_at
        ) VALUES (
            new_user_id,
            new_user_id,
            jsonb_build_object('sub', new_user_id::text, 'email', emails[i]),
            'email',
            new_user_id,
            now(),
            now(),
            now()
        );

        -- 3. Mise à jour du profil (créé via le trigger handle_new_user)
        UPDATE public.profiles SET
            role = roles[i]::user_role,
            zone = NULL,
            is_active = true,
            nom = 'Admin',
            prenom = prenoms[i]
        WHERE id = new_user_id;
    END LOOP;
END $$;

---

## 4. Comptes Candidats de Test (2 par Zone)
* **Mot de passe commun :** `Candidat123!`

| Zone | Nom complet | E-mail de connexion | Statut du Paiement | WhatsApp / Info |
| :--- | :--- | :--- | :--- | :--- |
| **Yamoussoukro** | Candidat1 Yamoussoukro | `candidat1.yamoussoukro@oge-academie.ci` | 🟡 **À valider (En cours)** | `+225 01020304` |
| | Candidat2 Yamoussoukro | `candidat2.yamoussoukro@oge-academie.ci` | 🟢 **Validé (Actif)** | `+225 05060708` |
| **Yopougon** | Candidat1 Yopougon | `candidat1.yopougon@oge-academie.ci` | 🟡 **À valider (En cours)** | `+225 01020304` |
| | Candidat2 Yopougon | `candidat2.yopougon@oge-academie.ci` | 🟢 **Validé (Actif)** | `+225 05060708` |
| **Abobo** | Candidat1 Abobo | `candidat1.abobo@oge-academie.ci` | 🟡 **À valider (En cours)** | `+225 01020304` |
| | Candidat2 Abobo | `candidat2.abobo@oge-academie.ci` | 🟢 **Validé (Actif)** | `+225 05060708` |
| **Cocody** | Candidat1 Cocody | `candidat1.cocody@oge-academie.ci` | 🟡 **À valider (En cours)** | `+225 01020304` |
| | Candidat2 Cocody | `candidat2.cocody@oge-academie.ci` | 🟢 **Validé (Actif)** | `+225 05060708` |
| **Port-Bouët** | Candidat1 Port Bouët | `candidat1.port-bouet@oge-academie.ci` | 🟡 **À valider (En cours)** | `+225 01020304` |
| | Candidat2 Port Bouët | `candidat2.port-bouet@oge-academie.ci` | 🟢 **Validé (Actif)** | `+225 05060708` |
| **Bouaké** | Candidat1 Bouaké | `candidat1.bouake@oge-academie.ci` | 🟡 **À valider (En cours)** | `+225 01020304` |
| | Candidat2 Bouaké | `candidat2.bouake@oge-academie.ci` | 🟢 **Validé (Actif)** | `+225 05060708` |

---

### SQL pour recréer les Candidats de Test (si réinitialisation)
```sql
DO $$
DECLARE
    pwd_hash TEXT := crypt('Candidat123!', gen_salt('bf', 10));
    new_user_id UUID;
    zone_names text[] := ARRAY['yamoussoukro', 'yopougon', 'abobo', 'cocody', 'port-bouet', 'bouake'];
    zone_name text;
    email TEXT;
    nom TEXT;
BEGIN
    FOREACH zone_name IN ARRAY zone_names LOOP
        -- 1. Candidat 1 (Paiement en cours, Inactif)
        email := 'candidat1.' || zone_name || '@oge-academie.ci';
        nom := upper(substring(zone_name from 1 for 1)) || substring(zone_name from 2);
        
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
            email,
            pwd_hash,
            now(),
            '{"provider":"email","providers":["email"]}'::jsonb,
            jsonb_build_object('nom', nom, 'prenom', 'Candidat1'),
            now(),
            now(),
            '', '', '', ''
        )
        RETURNING id INTO new_user_id;

        INSERT INTO auth.identities (
            id, user_id, identity_data, provider, provider_id,
            last_sign_in_at, created_at, updated_at
        ) VALUES (
            new_user_id,
            new_user_id,
            jsonb_build_object('sub', new_user_id::text, 'email', email),
            'email',
            new_user_id,
            now(),
            now(),
            now()
        );

        UPDATE public.profiles SET
            role = 'user',
            zone = zone_name::zone_name,
            is_active = false,
            nom = nom,
            prenom = 'Candidat1',
            whatsapp = '+225 01020304',
            serie_bac = 'D',
            mode_formation = 'presentiel'
        WHERE id = new_user_id;

        INSERT INTO public.concours_inscrits (user_id, concours)
        VALUES (new_user_id, 'inphb');

        INSERT INTO public.paiements (user_id, zone, montant, statut, capture_url, created_at, updated_at)
        VALUES (new_user_id, zone_name::zone_name, 15000, 'en_cours', 'test-receipt.png', now(), now());


        -- 2. Candidat 2 (Paiement validé, Actif)
        email := 'candidat2.' || zone_name || '@oge-academie.ci';
        
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
            email,
            pwd_hash,
            now(),
            '{"provider":"email","providers":["email"]}'::jsonb,
            jsonb_build_object('nom', nom, 'prenom', 'Candidat2'),
            now(),
            now(),
            '', '', '', ''
        )
        RETURNING id INTO new_user_id;

        INSERT INTO auth.identities (
            id, user_id, identity_data, provider, provider_id,
            last_sign_in_at, created_at, updated_at
        ) VALUES (
            new_user_id,
            new_user_id,
            jsonb_build_object('sub', new_user_id::text, 'email', email),
            'email',
            new_user_id,
            now(),
            now(),
            now()
        );

        UPDATE public.profiles SET
            role = 'user',
            zone = zone_name::zone_name,
            is_active = true,
            nom = nom,
            prenom = 'Candidat2',
            whatsapp = '+225 05060708',
            serie_bac = 'C',
            mode_formation = 'en_ligne'
        WHERE id = new_user_id;

        INSERT INTO public.concours_inscrits (user_id, concours)
        VALUES (new_user_id, 'esatic'), (new_user_id, 'cme');

        INSERT INTO public.paiements (user_id, zone, montant, statut, valide_at, created_at, updated_at)
        VALUES (new_user_id, zone_name::zone_name, 15000, 'valide', now(), now() - INTERVAL '1 day', now());
    END LOOP;
END $$;
```

```
