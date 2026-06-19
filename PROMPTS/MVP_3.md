# MVP_3.md
## Étape 3 — Paiement candidat

> **Prérequis** : MVP_2 validé  
> **Durée estimée** : 3 heures  
> **Résultat** : Le candidat peut soumettre sa preuve de paiement Wave/MoMo.

---

## Checklist

### 1. Modal bloquante au login

**`components/dashboard/candidat/PaiementModal.tsx`**

```typescript
// S'ouvre automatiquement si paiement.statut !== 'valide'
// Ne peut PAS être fermée (pas de bouton X, pas de clic dehors)
// Affiche :
//   - Montant : 15 000 FCFA
//   - Numéro Wave/MoMo de la zone du candidat (depuis zone_config)
//   - Zone de dépôt de la capture
//   - Statut actuel du paiement
```

### 2. Récupération des infos de paiement par zone

```typescript
// Fetch zone_config WHERE zone = user.zone
// Afficher le lien Wave et/ou MoMo de la zone
```

### 3. Upload capture paiement

**`components/forms/PaiementUpload.tsx`**

```typescript
// Input type="file" acceptant JPG, PNG, WEBP uniquement
// Taille max 5 MB (validation côté client ET serveur)
// Barre de progression pendant l'upload
// Aperçu de l'image avant soumission
// Upload vers Supabase Storage (bucket : captures-paiements, privé)
// Nom fichier : {user_id}_{timestamp}.{ext}
// Après upload → INSERT dans paiements avec capture_url + statut 'en_cours'
```

### 4. API Route upload

**`app/api/paiements/upload/route.ts`**
```typescript
// POST avec multipart/form-data
// Vérifier auth (user connecté)
// Vérifier type MIME (image/* uniquement)
// Vérifier taille (max 5MB)
// Upload Supabase Storage
// Upsert dans table paiements
// Retourner { success: true, statut: 'en_cours' }
```

### 5. Affichage statut paiement

**`components/dashboard/candidat/PaiementStatus.tsx`**

```typescript
// Badge selon statut :
// en_attente → gris  "En attente de votre paiement"
// en_cours   → orange "Capture soumise, en cours de vérification"
// valide     → vert   "Paiement validé ✓"
// rejete     → rouge  "Paiement rejeté - veuillez recommencer"
```

### 6. Page paiement dans le dashboard

**`app/(dashboard)/dashboard/paiement/page.tsx`**
```typescript
// Affiche le statut actuel
// Si en_attente ou rejete → formulaire d'upload
// Si en_cours → message d'attente
// Si valide → message de confirmation + accès aux documents
```

---

## Test de validation MVP_3

```
✅ Connexion → modal s'ouvre si paiement non validé
✅ La modal NE peut PAS être fermée
✅ Le bon numéro Wave/MoMo de la zone s'affiche
✅ Upload d'une image JPG fonctionne
✅ Upload d'un PDF est refusé
✅ Upload > 5MB est refusé
✅ La capture apparaît dans Supabase Storage
✅ Le statut passe à "en_cours" dans la DB
✅ La modal affiche le bon statut après upload
```

**Ne pas continuer vers MVP_4 avant que ces tests passent.**
