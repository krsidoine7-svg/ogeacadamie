# PRD — Product Requirements Document
## OGE Académie — Plateforme de préparation aux concours

> **Version** : 1.0  
> **Créateurs** : Toto Mohamed & Joseph Brou  
> **Contexte** : Abidjan & Bouaké, Côte d'Ivoire  
> **Stack** : Next.js 15, React 19, Supabase, Shadcn/ui, Tailwind CSS

---

## 1. Vision du produit

OGE Académie (Objectifs Grandes Écoles) organise des cours de renforcement — physiques et en ligne — pour les candidats aux concours d'entrée des grandes écoles ivoiriennes : **INP-HB**, **ESATIC**, **CME**.

La plateforme doit permettre :
- L'inscription et le paiement des candidats
- La gestion des accès par zone géographique
- La diffusion de cours et documents
- Le suivi administratif complet

---

## 2. Utilisateurs cibles

| Rôle | Description |
|------|-------------|
| `user` | Candidat qui s'inscrit et suit les cours |
| `manager_zone` | Responsable d'une zone géographique |
| `admin` | Gestionnaire global de la plateforme |
| `super_admin` | Informaticien créateur du site (accès total) |

> **Règle stricte** : Le profil `user` est toujours redirigé vers le dashboard candidat uniquement.  
> Les comptes `admin`, `manager_zone`, `super_admin` ne peuvent pas être créés par les utilisateurs eux-mêmes.

---

## 3. Zones géographiques

- Yamoussoukro
- Yopougon
- Abobo
- Cocody
- Port-Bouët
- Bouaké

Chaque zone a un `manager_zone` dédié.

---

## 4. Concours préparés

| Concours | École | Description |
|----------|-------|-------------|
| INP-HB | Institut National Polytechnique Félix Houphouët-Boigny | CPGE, DTS |
| ESATIC | École Supérieure Africaine des TIC | Licence 1 numérique |
| CME | Centre des Métiers de l'Électricité (CIE/ERANOVE) | Filières électriques |

---

## 5. Fonctionnalités principales

### 5.1 Page d'accueil publique
- Section Héro avec CTA
- Historique OGE Académie
- Présentation des 3 concours (INP-HB, ESATIC, CME)
- Résultats et témoignages
- Formulaire d'inscription
- Footer avec liens sociaux (Facebook, WhatsApp, TikTok)

### 5.2 Inscription candidat (Onboarding 3 étapes)
- **Étape 1** : Identité (Nom, Prénom, Série de Bac, WhatsApp, Email)
- **Étape 2** : Projet (Concours visés, Mode présentiel/en ligne)
- **Étape 3** : Zone géographique + récapitulatif
- Email de confirmation automatique après inscription

### 5.3 Paiement
- Montant : **15 000 FCFA** (frais Wave/MoMo inclus)
- Le candidat uploade sa capture de paiement Wave ou MoMo
- Tant que le paiement n'est pas validé → modal bloquante au login
- Le `manager_zone` valide le paiement de sa zone
- Le `admin` peut voir tous les paiements

### 5.4 Dashboard Candidat (`user`)
- Accès après validation du paiement uniquement
- Onglet **Mes Documents** : cours et exercices
- Onglet **Paiement** : statut de son paiement
- Onglet **Profil** : informations personnelles
- Protection anti-capture d'écran sur les documents

### 5.5 Dashboard Manager de Zone (`manager_zone`)
- Voir les candidats de sa zone uniquement
- Valider ou rejeter les paiements de sa zone
- Activer/désactiver les comptes candidats de sa zone
- Envoyer des notifications aux candidats de sa zone

### 5.6 Dashboard Admin (`admin`)
- Voir tous les dashboards des managers de zone
- Gérer les droits d'accès
- Activer/désactiver tous les comptes
- Créer des comptes `user`, `manager_zone`, `admin`
- Voir tous les paiements (filtres : payé, en cours, non soldé, par date, par école)
- Exporter les captures paiements en ZIP ou Excel
- Statistiques visuelles (camembert : vert payé, orange en cours, rouge non soldé)
- Envoyer des mails/notifications groupés (par école, zone, cours, mode)
- Modifier les sections de la page d'accueil (activer/désactiver blocs)
- Blog : ajouter/modifier des articles sur les concours

### 5.7 Dashboard Super Admin (`super_admin`)
- Tous les droits admin
- Accès technique complet
- Paramètres globaux de la plateforme

### 5.8 Automatisations
- Lien de cours envoyé par mail via webhook Make.com / n8n
- Synchronisation Google Agenda & Google Meet pour les cours
- Notifications email à chaque étape clé

---

## 6. Contraintes techniques

- **Anti-capture d'écran** sur les documents et cours
- **Soft delete** sur toutes les entités (jamais de suppression définitive)
- **RGPD** et politique de confidentialité
- **Sécurité OWASP** respectée
- Indexation DB pour performances des requêtes
- Recherche géolocalisée
- Pas de `any` côté TypeScript frontend
- Composants réutilisables (blocs interchangeables)

---

## 7. Design System

- **Couleurs** : Blanc (primaire), Bleu ciel (secondaire), Bleu nuit (tertiaire)
- **Police** : Fine, moderne (Inter ou Geist)
- **Style** : Dégradés, cartes, composants Shadcn/ui
- **Responsive** : Mobile first (contexte Abidjan)

---

## 8. Pages de la plateforme

```
/                        → Page d'accueil publique
/inscription             → Onboarding candidat (3 étapes)
/connexion               → Login
/mot-de-passe-oublie     → Mot de passe oublié
/reinitialisation        → Réinitialisation mot de passe
/dashboard               → Dashboard candidat (protégé)
/dashboard/documents     → Mes documents
/dashboard/paiement      → Mon paiement
/dashboard/profil        → Mon profil
/admin                   → Dashboard admin
/admin/candidats         → Liste candidats
/admin/paiements         → Gestion paiements
/admin/statistiques      → Stats visuelles
/admin/contenu           → Éditeur page d'accueil
/admin/blog              → Gestion blog
/admin/parametres        → Paramètres plateforme
/zone                    → Dashboard manager de zone
/zone/candidats          → Candidats de ma zone
/zone/paiements          → Paiements de ma zone
```
