<!-- Dernière mise à jour : Mai 2026 -->

# Erreurs Paystack — Favor Company International

**Liens :** [INDEX.md](../INDEX.md) | [stack/paystack.md](../stack/paystack.md) | [bonnes-pratiques/patterns-paiement.md](../bonnes-pratiques/patterns-paiement.md)

> Format : `[ERR-XXX] Titre | Symptôme | Cause | Solution | Comment éviter | Référence session`

---

## [ERR-PAY-001] Webhook signature invalide

**Symptôme :** Erreur "Invalid signature" — webhook Paystack rejeté  
**Cause :** Le body était parsé en JSON avec `request.json()` AVANT la validation de signature. Une fois parsé, le body brut ne peut plus être lu, donc la signature calculée ne correspond pas.  
**Solution :**
```typescript
// ❌ Mauvais
const body = await request.json()  // Consomme le stream

// ✅ Correct
const body = await request.text()  // Lire en texte brut
const hash = crypto.createHmac('sha512', process.env.PAYSTACK_WEBHOOK_SECRET!)
  .update(body).digest('hex')
if (hash !== signature) return Response.json({ error: '401' }, { status: 401 })
const event = JSON.parse(body)  // Parser APRÈS la validation
```
**Comment éviter :** Toujours lire le body avec `request.text()` dans les webhooks — jamais `request.json()`  
**Date résolu :** —  
**Référence fourtour :** À compléter lors de la rencontre du bug

---

## [ERR-PAY-002] Double traitement du webhook (non-idempotent)

**Symptôme :** Facture générée deux fois, client notifié deux fois  
**Cause :** Paystack peut envoyer le même webhook plusieurs fois (retry). Sans vérification d'idempotence, le code traite le même événement deux fois.  
**Solution :**
```typescript
// Vérifier si la référence a déjà été traitée AVANT tout traitement
const { data: existing } = await supabase
  .from('paiements')
  .select('statut')
  .eq('reference', event.data.reference)
  .single()

if (existing?.statut === 'succès') {
  return Response.json({ received: true })  // Ignorer silencieusement
}
```
**Comment éviter :** Toujours vérifier l'idempotence sur la référence avant traitement  
**Référence fourtour :** À compléter

---

*Ajouter ici chaque bug Paystack rencontré et résolu.*
