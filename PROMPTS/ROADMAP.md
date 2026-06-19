# ROADMAP.md
## OGE Académie — Plan de développement

> **Principe** : Une feature = un bloc = on teste = on valide = on continue.  
> Ne jamais passer à l'étape suivante sans avoir testé la précédente.

---

## MVP — Ce qui doit marcher avant tout

Le MVP permet de :
1. Inscrire un candidat
2. Recevoir et vérifier son paiement
3. Lui donner accès à ses documents

---

## MVP_1 — Fondations (Semaine 1)

> **Objectif** : Le projet tourne, la DB existe, on peut se connecter.

- [ ] **1.1** Init projet Next.js 15 + TypeScript + Tailwind + Shadcn
- [ ] **1.2** Configuration Supabase (projet, clés, variables env)
- [ ] **1.3** Exécuter le script DB_SCHEMA.sql dans Supabase
- [ ] **1.4** Client Supabase côté client et serveur (`lib/supabase/`)
- [ ] **1.5** Middleware de protection des routes (`middleware.ts`)
- [ ] **1.6** Page de connexion (`/connexion`) — email + mot de passe
- [ ] **1.7** Page mot de passe oublié (`/mot-de-passe-oublie`)
- [ ] **1.8** Réinitialisation mot de passe (`/reinitialisation`)
- [ ] **1.9** Redirection automatique selon le rôle après connexion

**Test MVP_1** : Je peux me connecter avec un compte créé manuellement dans Supabase. Le bon dashboard s'ouvre selon mon rôle.

---

## MVP_2 — Inscription candidat (Semaine 1-2)

> **Objectif** : Un candidat peut s'inscrire seul depuis la page d'accueil.

- [ ] **2.1** Page d'accueil minimaliste avec un bouton "S'inscrire"
- [ ] **2.2** Formulaire onboarding étape 1 : Identité (Nom, Prénom, Série, WhatsApp, Email, Mot de passe)
- [ ] **2.3** Formulaire onboarding étape 2 : Projet (Concours visés, Mode formation)
- [ ] **2.4** Formulaire onboarding étape 3 : Zone + récapitulatif
- [ ] **2.5** Validation des champs avec Zod
- [ ] **2.6** Création compte Supabase Auth + profil en DB
- [ ] **2.7** Email de confirmation automatique (Resend)
- [ ] **2.8** Stepper visuel (étape 1/3, 2/3, 3/3)

**Test MVP_2** : Je remplis le formulaire en 3 étapes, je reçois un email de confirmation, mon compte apparaît dans Supabase.

---

## MVP_3 — Paiement (Semaine 2)

> **Objectif** : Le candidat peut soumettre sa preuve de paiement.

- [ ] **3.1** Modal bloquante au login si paiement non validé
- [ ] **3.2** Page de paiement dans le dashboard candidat
- [ ] **3.3** Affichage numéro Wave/MoMo selon la zone du candidat
- [ ] **3.4** Upload capture paiement (Supabase Storage)
- [ ] **3.5** Confirmation visuelle après upload ("En attente de validation")
- [ ] **3.6** Statut paiement visible dans le dashboard candidat

**Test MVP_3** : Je me connecte, la modal s'ouvre, je vois le numéro Wave, j'uploade une capture, le statut passe à "En cours".

---

## MVP_4 — Dashboard Manager de Zone (Semaine 2-3)

> **Objectif** : Le manager peut valider les paiements de sa zone.

- [ ] **4.1** Dashboard manager (`/zone`)
- [ ] **4.2** Liste des paiements en attente de sa zone
- [ ] **4.3** Visualisation de la capture uploadée
- [ ] **4.4** Bouton "Valider" → active le compte candidat
- [ ] **4.5** Bouton "Rejeter" → notifie le candidat
- [ ] **4.6** Filtres : en attente, validé, rejeté
- [ ] **4.7** Notification email au candidat après validation

**Test MVP_4** : Le manager voit les paiements de sa zone, valide un paiement, le candidat reçoit un email et peut accéder à son dashboard.

---

## MVP_5 — Dashboard Candidat (Semaine 3)

> **Objectif** : Après paiement validé, le candidat accède à ses cours.

- [ ] **5.1** Dashboard candidat (`/dashboard`)
- [ ] **5.2** Onglet "Mes Documents" : liste des cours disponibles
- [ ] **5.3** Accès document avec lien signé Supabase (durée limitée)
- [ ] **5.4** Protection anti-capture écran (CSS overlay)
- [ ] **5.5** Onglet "Mon Profil" : voir et modifier ses infos
- [ ] **5.6** Onglet "Notifications" : messages reçus

**Test MVP_5** : Le candidat dont le paiement est validé accède à ses documents. L'anti-capture est actif.

---

## Version 1.0 — Dashboard Admin complet (Semaine 3-4)

- [ ] **6.1** Dashboard admin (`/admin`)
- [ ] **6.2** Vue tous les candidats avec filtres (zone, école, statut)
- [ ] **6.3** Vue tous les paiements avec filtres avancés
- [ ] **6.4** Statistiques visuelles (camembert payé/en cours/non soldé)
- [ ] **6.5** Créer/modifier/désactiver des comptes
- [ ] **6.6** Gérer les managers de zone
- [ ] **6.7** Exporter paiements en Excel / ZIP captures
- [ ] **6.8** Envoyer notifications groupées (par zone, école, cours)

---

## Version 1.1 — Page d'accueil complète (Semaine 4-5)

- [ ] **7.1** Bloc Héro avec dégradé bleu
- [ ] **7.2** Bloc Historique + capsule activités
- [ ] **7.3** Bloc Formation avec fiches INP-HB, ESATIC, CME
- [ ] **7.4** Bloc Résultats et statistiques succès
- [ ] **7.5** Bloc Témoignages avec photo et zone
- [ ] **7.6** Footer avec liens sociaux
- [ ] **7.7** CMS admin pour activer/désactiver les blocs

---

## Version 1.2 — Blog & Automatisations (Semaine 5-6)

- [ ] **8.1** Blog articles (création, publication, modification)
- [ ] **8.2** Webhook Make.com/n8n → envoi email cours
- [ ] **8.3** Google Calendar integration
- [ ] **8.4** Génération lien Google Meet pour cours en ligne
- [ ] **8.5** Alertes email automatiques

---

## Version 2.0 — Fonctionnalités avancées (Mois 2)

- [ ] Recherche géolocalisée
- [ ] Filtres avancés et sauvegarde de recherches
- [ ] Favoris
- [ ] Chiffrement AES documents
- [ ] Authentification Google OAuth
- [ ] Onboarding guidé (tooltips)
- [ ] RGPD complet + politique confidentialité

---

## Règles de développement

```
1. Une feature à la fois
2. Tester avant de passer à la suivante
3. Commit Git à chaque feature validée
4. Jamais de `any` en TypeScript
5. Composants réutilisables uniquement
6. Toujours soft delete (jamais DELETE réel)
7. Messages d'erreur en français
8. Mobile first systématiquement
```
