# MVP_2.md
## Étape 2 — Inscription candidat (Onboarding 3 étapes)

> **Prérequis** : MVP_1 validé  
> **Durée estimée** : 3-4 heures  
> **Résultat** : Un candidat peut s'inscrire seul, son compte est créé en DB.

---

## Checklist

### 1. Schéma de validation Zod

**`lib/validations/inscription.schema.ts`**
```typescript
import { z } from 'zod'

export const step1Schema = z.object({
  nom: z.string().min(2, 'Nom requis'),
  prenom: z.string().min(2, 'Prénom requis'),
  serie_bac: z.string().min(1, 'Sélectionnez votre série'),
  whatsapp: z.string().min(8, 'Numéro WhatsApp requis'),
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Minimum 8 caractères'),
})

export const step2Schema = z.object({
  concours: z.array(z.enum(['inphb', 'esatic', 'cme'])).min(1, 'Choisissez au moins un concours'),
  mode_formation: z.enum(['presentiel', 'en_ligne']),
})

export const step3Schema = z.object({
  zone: z.enum(['yamoussoukro', 'yopougon', 'abobo', 'cocody', 'port-bouet', 'bouake']),
})

export type Step1Data = z.infer<typeof step1Schema>
export type Step2Data = z.infer<typeof step2Schema>
export type Step3Data = z.infer<typeof step3Schema>
```

### 2. Composant Stepper

**`components/shared/Stepper.tsx`**
```typescript
// Affiche les étapes : 1/3, 2/3, 3/3
// Barre de progression visuelle
// Étape active en bleu nuit, complétées en bleu ciel, futures en gris
```

### 3. Formulaire Étape 1 — Identité

**`components/forms/OnboardingStep1.tsx`**

Champs :
- Nom (text)
- Prénom (text)
- Série de Bac (select : A1, A2, C, D, E)
- Contact WhatsApp (text, format +225...)
- Adresse email (email)
- Mot de passe (password + confirmer)

### 4. Formulaire Étape 2 — Projet

**`components/forms/OnboardingStep2.tsx`**

Champs :
- Concours visés (checkboxes : INP-HB, ESATIC, CME)
- Mode de formation (radio : Présentiel / En ligne)

### 5. Formulaire Étape 3 — Zone + Récapitulatif

**`components/forms/OnboardingStep3.tsx`**

Champs :
- Zone géographique (select : Yamoussoukro, Yopougon, Abobo, Cocody, Port-Bouët, Bouaké)
- Récapitulatif de toutes les infos saisies
- Bouton "Confirmer mon inscription"

### 6. Page d'inscription

**`app/(public)/inscription/page.tsx`**
```typescript
// State : currentStep (1, 2, 3)
// State : formData (accumule les données de chaque étape)
// Affiche le bon composant selon l'étape
// Boutons Précédent / Suivant
// À l'étape 3 : appel API pour créer le compte
```

### 7. Logique de création de compte

```typescript
// 1. supabase.auth.signUp({ email, password })
// 2. Insérer dans profiles (nom, prenom, serie_bac, whatsapp, zone, mode_formation)
// 3. Insérer dans concours_inscrits (un enregistrement par concours coché)
// 4. Envoyer email de confirmation via Resend
// 5. Rediriger vers /connexion avec message de succès
```

### 8. Email de confirmation

Contenu minimal :
```
Objet : Bienvenue chez OGE Académie 🎓

Bonjour [Prénom],

Votre inscription est bien enregistrée.

Voici les prochaines étapes :
1. Connectez-vous sur la plateforme
2. Effectuez votre paiement de 15 000 FCFA
3. Uploadez votre capture de paiement
4. Attendez la validation de votre responsable de zone

Lien : [URL du site]

— L'équipe OGE Académie
```

---

## Test de validation MVP_2

```
✅ Le formulaire affiche bien les 3 étapes
✅ Le stepper indique l'étape courante
✅ La validation Zod bloque si un champ est vide
✅ On peut revenir à l'étape précédente sans perdre les données
✅ La soumission crée bien un compte dans Supabase Auth
✅ Le profil est bien créé dans la table profiles
✅ Les concours sont bien enregistrés dans concours_inscrits
✅ L'email de confirmation arrive dans la boîte mail
✅ Après inscription → redirection vers /connexion
```

**Ne pas continuer vers MVP_3 avant que ces tests passent.**
