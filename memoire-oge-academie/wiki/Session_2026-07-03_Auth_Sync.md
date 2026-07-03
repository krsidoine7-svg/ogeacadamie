# Fiche Technique - Synchronisation Supabase Auth & SECURITY DEFINER

Cette fiche documente l'architecture mise en place pour modifier les identifiants d'authentification des utilisateurs (Admins, Managers, Candidats) sans déclencher d'erreurs de permission et sans casser la connexion.

## Le Problème d'Authentification Supabase

Dans Supabase, l'authentification repose sur le moteur GoTrue et utilise le schéma `auth` :
* La table **`auth.users`** stocke l'email de base et le mot de passe crypté.
* La table **`auth.identities`** stocke les liens d'identité (notamment pour le fournisseur `email`).

### Erreurs résolues :
1. **Permission Denied** : Les connexions applicatives standard se voient refuser l'écriture directe sur le schéma `auth`.
2. **Invalid Credentials** : Modifier uniquement `auth.users.email` crée un décalage avec `auth.identities.email` et `provider_id`. GoTrue rejette alors les nouvelles connexions.
3. **Generated Column Restriction** : Les colonnes `auth.users.confirmed_at` et `auth.identities.email` sont calculées dynamiquement par PostgreSQL ; tenter de les modifier directement lève une exception fatale.

---

## Architecture de Solution

### 1. Fonctions Privilégiées (SECURITY DEFINER)
Créées dans le schéma `public` par le super-utilisateur `postgres`, ces fonctions s'exécutent avec ses droits élevés (ce qui permet de modifier le schéma `auth` de manière contrôlée) :

```sql
-- Met à jour l'email dans les deux tables d'authentification
CREATE OR REPLACE FUNCTION public.admin_update_auth_user_email(target_user_id uuid, new_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Met à jour auth.users (et force la confirmation)
  UPDATE auth.users 
  SET email = new_email,
      email_confirmed_at = COALESCE(email_confirmed_at, now()),
      updated_at = now()
  WHERE id = target_user_id;

  -- Met à jour auth.identities (provider_id et JSONB identity_data)
  UPDATE auth.identities
  SET provider_id = new_email,
      identity_data = jsonb_set(identity_data, '{email}', to_jsonb(new_email)),
      updated_at = now()
  WHERE user_id = target_user_id AND provider = 'email';
END;
$$;
```

```sql
-- Met à jour le mot de passe et réinitialise les sessions
CREATE OR REPLACE FUNCTION public.admin_reset_user_password_and_sessions(target_user_id uuid, new_password text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Mise à jour du mot de passe chiffré via pgcrypto
  UPDATE auth.users 
  SET encrypted_password = extensions.crypt(new_password, extensions.gen_salt('bf')) 
  WHERE id = target_user_id;
  
  -- Suppression des sessions de connexion actives
  DELETE FROM auth.sessions 
  WHERE user_id = target_user_id;
END;
$$;
```

### 2. Invocation dans le Code Applicatif
Les fonctions sont appelées directement via Drizzle ORM avec la syntaxe `SELECT` :
```typescript
await db.execute(sql`
  SELECT public.admin_update_auth_user_email(${userId}, ${newEmail})
`);
```

Cela garantit une synchronisation parfaite des identifiants et des sessions, éliminant tout blocage utilisateur.
