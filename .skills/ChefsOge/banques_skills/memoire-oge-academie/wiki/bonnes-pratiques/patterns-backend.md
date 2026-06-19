<!-- Dernière mise à jour : Mai 2026 -->

# Patterns Backend Validés — Favor Company International

**Liens :** [INDEX.md](../INDEX.md) | [projet/architecture.md](../projet/architecture.md) | [decisions/decisions-technique.md](../decisions/decisions-technique.md)

---

## Pattern 1 — Server Action Standard

**Validé le :** Mai 2026 | **Feature :** Toutes  
**Règle :** Toutes les mutations passent par ce pattern sans exception.

```typescript
'use server'

import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { checkPermission } from '@/lib/auth/permissions'
import { revalidatePath } from 'next/cache'

const Schema = z.object({
  // Tous les champs typés avec Zod
})

export async function maAction(input: z.infer<typeof Schema>) {
  // 1. Auth
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  // 2. RBAC
  const ok = await checkPermission(user.id, 'module.action')
  if (!ok) return { error: 'Accès refusé' }

  // 3. Validation Zod
  const parsed = Schema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.flatten() }

  // 4. Logique métier
  const { data, error } = await supabase.from('table').insert(parsed.data).select().single()
  if (error) return { error: error.message }

  // 5. Revalider cache
  revalidatePath('/chemin')

  return { success: true, data }
}
```

---

## Pattern 2 — Validation Webhook Paystack

**Validé le :** Mai 2026 | **Feature :** F06 Paiements  
**Règle absolue :** Jamais traiter un webhook sans valider la signature.

```typescript
// app/api/webhooks/paystack/route.ts
export async function POST(request: Request) {
  const body = await request.text()  // TEXT, pas JSON
  const sig = request.headers.get('x-paystack-signature')

  const expected = crypto
    .createHmac('sha512', process.env.PAYSTACK_WEBHOOK_SECRET!)
    .update(body).digest('hex')

  if (expected !== sig) return Response.json({}, { status: 401 })

  const event = JSON.parse(body)  // Parser APRÈS validation

  // Vérifier idempotence avant traitement
  // ...
}
```

---

## Pattern 3 — Transaction Atomique Anti-Double Réservation

**Validé le :** Mai 2026 | **Feature :** F05 Réservation  
**Règle :** Toute opération qui lit + modifie un statut critique = RPC PostgreSQL avec FOR UPDATE.

```sql
CREATE OR REPLACE FUNCTION reserver_bien_atomic(p_bien_id UUID, p_client_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_statut TEXT; v_id UUID;
BEGIN
  SELECT statut INTO v_statut FROM biens WHERE id = p_bien_id FOR UPDATE NOWAIT;
  IF v_statut != 'disponible' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Non disponible');
  END IF;
  INSERT INTO reservations (bien_id, client_id, statut, date_expiration)
  VALUES (p_bien_id, p_client_id, 'en_attente', NOW() + INTERVAL '3 months')
  RETURNING id INTO v_id;
  UPDATE biens SET statut = 'réservé' WHERE id = p_bien_id;
  RETURN jsonb_build_object('success', true, 'reservation_id', v_id);
EXCEPTION WHEN lock_not_available THEN
  RETURN jsonb_build_object('success', false, 'error', 'En cours de réservation');
END; $$;
```

---

## Pattern 4 — Chiffrement Données Sensibles

**Validé le :** Mai 2026 | **Feature :** Partout où téléphone/CNI/finances sont stockés

```typescript
// Toujours utiliser lib/utils/crypto.ts — ne pas dupliquer
import { encrypt, decrypt } from '@/lib/utils/crypto'

// Avant INSERT en DB
const telephoneChiffre = encrypt(telephone)
await supabase.from('users').insert({ telephone: telephoneChiffre })

// Après SELECT
const telephoneClaire = decrypt(user.telephone)
```

**Données à chiffrer :**
- `users.telephone`
- `users.telephone_whatsapp`  
- `users.cni_number`
- Toute colonne contenant des données financières personnelles

---

*Lié à : [erreurs/](../erreurs/) | [decisions/decisions-technique.md](../decisions/decisions-technique.md)*
