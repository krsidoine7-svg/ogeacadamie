# MVP_4.md
## Étape 4 — Dashboard Manager de Zone

> **Prérequis** : MVP_3 validé  
> **Durée estimée** : 3-4 heures  
> **Résultat** : Le manager valide les paiements, le candidat est activé.

---

## Checklist

### 1. Layout dashboard zone

**`app/(zone)/zone/layout.tsx`**
```typescript
// Sidebar avec : Tableau de bord, Candidats, Paiements
// Header avec nom du manager + zone
// Protégé : rôle manager_zone uniquement
```

### 2. Table des paiements par zone

**`components/dashboard/zone/PaiementZoneTable.tsx`**
```typescript
// Colonnes : Nom, Prénom, Date, Montant, Statut, Actions
// Filtres : en_attente | en_cours | valide | rejete
// Tri par date décroissante (plus récent en premier)
// Affiche UNIQUEMENT les paiements de la zone du manager
```

### 3. Visualiseur de capture

**`components/dashboard/zone/CaptureViewer.tsx`**
```typescript
// Ouvre une modal avec la capture uploadée par le candidat
// Affiche l'image en grand
// Bouton télécharger
// Boutons : "Valider" (vert) | "Rejeter" (rouge)
```

### 4. Action Valider paiement

```typescript
// UPDATE paiements SET statut = 'valide', valide_par = manager_id, valide_at = now()
// UPDATE profiles SET is_active = true WHERE id = user_id
// Envoi email au candidat "Votre paiement a été validé ✓"
// Toast succès pour le manager
```

### 5. Action Rejeter paiement

```typescript
// Modal de confirmation avec champ "Motif du rejet" (optionnel)
// UPDATE paiements SET statut = 'rejete', notes = motif
// Envoi email au candidat "Votre paiement a été rejeté"
//   avec le motif si renseigné
// Toast pour le manager
```

### 6. Email de validation automatique

```
Objet : ✅ Paiement validé — OGE Académie

Bonjour [Prénom],

Bonne nouvelle ! Votre paiement de 15 000 FCFA a été validé.

Vous pouvez maintenant accéder à tous vos cours et documents
sur votre espace candidat.

→ [Accéder à mon espace]

— L'équipe OGE Académie
```

---

## Test de validation MVP_4

```
✅ Le manager voit uniquement les paiements de sa zone
✅ Il peut voir la capture uploadée
✅ Clic "Valider" → statut passe à "valide"
✅ Le compte candidat est bien activé (is_active = true)
✅ Le candidat reçoit l'email de validation
✅ La modal candidat disparaît après validation
✅ Clic "Rejeter" → statut passe à "rejete"
✅ Le candidat reçoit l'email de rejet
```

---

---

# MVP_5.md
## Étape 5 — Dashboard Candidat complet

> **Prérequis** : MVP_4 validé  
> **Durée estimée** : 2-3 heures  
> **Résultat** : Le candidat dont le paiement est validé accède à ses cours.

---

## Checklist

### 1. Layout dashboard candidat

**`app/(dashboard)/dashboard/layout.tsx`**
```typescript
// Sidebar : Tableau de bord, Mes Documents, Mon Paiement, Notifications, Mon Profil
// Header avec nom du candidat + badge concours
// Vérification paiement validé à chaque navigation
```

### 2. Page Mes Documents

**`app/(dashboard)/dashboard/documents/page.tsx`**
```typescript
// Liste des documents disponibles selon les concours du candidat
// Chaque document : titre, type (cours/exercice/corrigé), bouton "Ouvrir"
// Clic "Ouvrir" → appel API pour obtenir un lien signé
// Ouverture dans un onglet avec protection anti-capture
```

### 3. API lien signé document

**`app/api/documents/[id]/route.ts`**
```typescript
// Vérifier auth + paiement validé
// Créer un lien signé Supabase Storage (expire dans 1 heure)
// Logger l'accès dans acces_documents
// Retourner { signedUrl }
```

### 4. Protection anti-capture écran

```css
/* Sur la page de lecture de document */
.document-viewer {
  user-select: none;
  -webkit-user-select: none;
  pointer-events: none;
}

/* Overlay transparent qui bloque les captures */
.document-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 9999;
  background: transparent;
}
```

### 5. Page Mon Profil

**`app/(dashboard)/dashboard/profil/page.tsx`**
```typescript
// Afficher toutes les infos du profil
// Permettre la modification : WhatsApp, mode formation, zone
// Bouton "Changer mon mot de passe"
// NE PAS permettre de changer email (sécurité)
```

### 6. Page Notifications

**`app/(dashboard)/dashboard/notifications/page.tsx`**
```typescript
// Liste des notifications avec date
// Badge "non lu" sur les nouvelles
// Clic → marquer comme lu
// Types : info, alerte, cours
```

---

## Test de validation MVP_5

```
✅ Après paiement validé, la modal bloquante a disparu
✅ Le dashboard s'affiche correctement
✅ Les documents du bon concours sont listés
✅ L'ouverture d'un document génère un lien signé
✅ Le lien expire après 1 heure
✅ L'anti-capture CSS est actif
✅ Le profil affiche les bonnes informations
✅ On peut modifier son WhatsApp
✅ Les notifications s'affichent
```

**MVP complet validé ! Passer à Version 1.0 (Dashboard Admin).**
