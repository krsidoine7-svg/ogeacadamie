<!-- Dernière mise à jour : Mai 2026 -->

# Erreurs TypeScript — Favor Company International

**Liens :** [INDEX.md](../INDEX.md) | [bonnes-pratiques/patterns-backend.md](../bonnes-pratiques/patterns-backend.md)

---

## [ERR-TS-001] Type 'any' implicite sur les props de composant

**Symptôme :** `Parameter 'props' implicitly has an 'any' type`  
**Cause :** Props de composant non typées  
**Solution :**
```typescript
// ❌ Mauvais
export function BienCard(props) { ... }

// ✅ Correct
interface BienCardProps {
  nom: string
  prix: number
  statut: 'disponible' | 'réservé' | 'vendu'
}
export function BienCard({ nom, prix, statut }: BienCardProps) { ... }
```
**Référence fourtour :** À compléter

---

## [ERR-TS-002] Type 'string' non assignable à type 'number'

**Symptôme :** `Type 'string' is not assignable to type 'number'`  
**Cause fréquente en Drizzle :** Les colonnes `numeric` Drizzle retournent des strings en JavaScript (comportement PostgreSQL)  
**Solution :**
```typescript
// Drizzle retourne numeric comme string
const prix: string = bien.prix  // ← C'est une string !

// Convertir explicitement
const prixNumber = parseFloat(bien.prix)
// Ou dans le schema Drizzle, utiliser integer si pas de décimales
```
**Référence fourtour :** À compléter

---

*Ajouter ici chaque erreur TypeScript rencontrée et résolue.*

---
---

<!-- Dernière mise à jour : Mai 2026 -->

# Erreurs Supabase — Favor Company International

**Liens :** [INDEX.md](../INDEX.md) | [stack/supabase.md](../stack/supabase.md) | [bonnes-pratiques/patterns-db.md](../bonnes-pratiques/patterns-db.md)

---

## [ERR-SUP-001] RLS bloque une opération légitime

**Symptôme :** `new row violates row-level security policy` ou données vides sans erreur  
**Cause :** La RLS policy ne couvre pas le cas d'usage en question (ex: un admin ne peut pas voir les données d'un autre user parce que la policy est trop restrictive)  
**Solution :**
```sql
-- Vérifier les policies actives sur la table
SELECT * FROM pg_policies WHERE tablename = 'nom_table';

-- Tester en désactivant RLS temporairement (DEV SEULEMENT)
SET LOCAL row_security = off;

-- Corriger la policy
CREATE POLICY "admin_voir_tout"
ON nom_table FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
    AND r.name IN ('admin', 'super_admin')
  )
);
```
**Comment éviter :** Tester chaque nouvelle table avec plusieurs rôles différents  
**Référence fourtour :** À compléter

---

## [ERR-SUP-002] `createServerClient` appelé sans cookies dans App Router

**Symptôme :** Session utilisateur null dans les Server Components malgré un user connecté  
**Cause :** `createServerClient` nécessite l'accès aux cookies — dans Next.js App Router, il faut utiliser `cookies()` de `next/headers`  
**Solution :**
```typescript
// ✅ Correct pour App Router
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```
**Référence fourtour :** À compléter

---

*Ajouter ici chaque erreur Supabase rencontrée et résolue.*
