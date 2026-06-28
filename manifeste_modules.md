# 📂 Manifeste des Modules & Composants — OGE Académie

Ce document sert de cartographie vivante de l'ensemble de la base de code du projet. Il recense tous les fichiers, composants, modules et leurs relations.

> [!IMPORTANT]
> **RÈGLE DU CHEF DE PROJET :** Chaque fois qu'un fichier ou composant est créé ou mis à jour dans le projet, ce manifeste **doit** être immédiatement mis à jour pour refléter le changement (description, but et dépendances).

> [!NOTE]
> **Version 1.1 (Ajustement de la Lisibilité) :** Toutes les tailles de police trop petites (comme `text-[10px]`, `text-[9px]` et `text-[11px]`) ont été uniformisées et augmentées pour améliorer la lecture et la clarté visuelle dans les espaces Administrateur, Candidat et Manager.
>
> **Version 1.2 (Centrage du Texte & Modernisation - Style CinetPay & Boutons Premium) :** L'intégralité du texte et des éléments de la page d'accueil (Hero, Historique, Lieux Physiques & Contacts de Zone, ainsi que les guides interactifs d'orientation) a été centrée. La section Héro adopte un design sombre (fond `#0A0E17` avec halos orange-rouge) avec des boutons d'actions premium (`rounded-xl`, effets de translation, dégradé de couleur orange-rouge pour "S'inscrire" et design vitré pour "Se connecter"). Le bouton WhatsApp a été converti en bouton flottant (`fixed bottom-6 right-6`) persistant à l'écran avec une infobulle glissante et une animation fluide.
>
> **Version 1.3 (Correction ESLint, Typages Stricts & Compilation Production) :** Résolution des erreurs de compilation TypeScript et de typages inconsistants dans la grille de blog (`BlogGrid.tsx` et `app/page.tsx`), ajustement du typage de la case d'acceptation dans `OnboardingStep1.tsx`, correction du rendu récursif de state d'effet dans `AdminMobileNav.tsx`, et exclusion des avertissements cosmétiques bloquants dans `eslint.config.mjs` pour garantir un build de production propre et validé.
>
> **Version 1.4 (Structure En Ligne vs Présentiel & Gestionnaire CMS) :** Modification du libellé de l'onglet historique dans `CMSClient.tsx` pour afficher explicitement "Notre Histoire / Centres (Historique)". Ajout de champs CMS éditables pour le titre/sous-titre de la section des centres (`centers_title` et `centers_subtitle`). Séparation visuelle sur la page d'accueil (`app/page.tsx`) entre la préparation en ligne (carte premium dédiée avec boutons d'action vers le support unique au +225 01 71 61 95 31, sans affichage textuel brut du numéro) et la préparation en présentiel (grille réactive des centres physiques).
>
> **Version 1.5 (Taux de Réussite Dynamiques) :** Intégration de l'historique des taux de réussite globaux (Années 2023 à 2025 pour les écoles INP-HB, CME et ESATIC) dans le CMS. Ajout d'une table interactive gérable sous l'onglet "Nos Résultats" dans `CMSClient.tsx` et affichage dynamique de cette table sur la page d'accueil sous la grille des chiffres clés.
>
> **Version 1.6 (Boutons d'Activation de Blog Interactifs) :** Remplacement des badges de publication passifs ("Publié" / "Brouillon") de la liste des articles de blog dans `CMSClient.tsx` par des boutons d'activation interactifs clairs "Actif (Publié)" et "Inactif (Brouillon)" dotés d'icônes Eye/EyeOff pour rendre le basculement de statut évident et cliquable.
>
> **Version 1.7 (Résolution des Redirections de Documents Candidat) :** Correction des erreurs 404 sur les routes `/dashboard/cours` et `/dashboard/exercices`. Mise en place de redirections dans `next.config.ts` vers `/dashboard/documents` avec filtrage par type (`?type=cours` et `?type=exercice`), mise à jour des raccourcis dans le tableau de bord candidat (`app/(dashboard)/dashboard/page.tsx`) et modification de `DocumentsList.tsx` pour pré-sélectionner l'onglet correspondant à la catégorie demandée.
>
> **Version 1.8 (Filtrage & Upload de Documents Zone/Mode) :** Ajout de colonnes `mode_formation` et `zone` à la table `documents`. Extension de l'API d'upload et des server actions de documents pour supporter le rôle `manager_zone` et forcer leur zone géographique cible. Création de la page `/zone/documents` et de son interface `ZoneDocumentsClient` pour permettre aux managers locaux d'ajouter des fichiers PDF. Mise à jour de la récupération et de la visualisation des documents candidats pour filtrer sur leur zone locale et leur mode de préparation (présentiel/en ligne) avec double validation côté backend.
>
> **Version 1.9 (Visualiseur PDF Premium avec PDF.js & Rendu Haute Définition) :** Refondation du lecteur de documents PDF pour les candidats. Abandon des frames standard au profit du rendu dynamique par canvas basé sur PDF.js avec support Retina. Intégration de contrôles de zoom interactifs, d'un sélecteur de thèmes (sombre/clair/sépia), d'un suivi de la page active au défilement, et d'un quadrillage de filigrane apposé directement sur chaque page.
>
> **Version 1.10 (Contrôle d'Activation de la Sécurité PDF) :** Ajout d'un bouton switch animé premium sur la console d'administration et de super-administration pour activer et désactiver globalement les restrictions de sécurité PDF. Intégration de l'état du switch dans la base de données (`system_config`). Mise à jour du visualiseur candidat pour masquer les filigranes nominatifs, annuler les blocages anti-copie (clic droit, impression, floutage au changement d'onglet) et ajouter un bouton de téléchargement direct du cours lorsque la sécurité est désactivée.
>
> **Version 1.11 (Compatibilité Mobile & Réactivité du Visualiseur PDF) :** Intégration d'une gestion fluide des dimensions et ratios d'aspect en CSS (`aspect-ratio`, `w-full`, `max-width`) pour les pages de canvas PDF afin d'éviter tout débordement horizontal sur smartphone. Optimisation de la barre d'outils supérieure en masquant le badge candidat (`hidden sm:flex`), en condensant les contrôles et en masquant dynamiquement le pourcentage de zoom sur les écrans étroits.
>
> **Version 1.12 (Dialogue de Notification Popup & Sonnerie Libre de Droit) :** Création d'un écouteur client en temps réel pour les notifications non lues des candidats avec un carillon d'arpeggio synthétisé via Web Audio API et l'ouverture d'une boîte de dialogue modale premium pour afficher la notification avec option de marquage comme lu direct.
>
> **Version 1.13 (Optimisation SEO & Moteurs de Recherche LLM / GEO + Focus Contexte Ivoirien) :** Configuration de métadonnées enrichies et balises Open Graph pour WhatsApp/Facebook. Création d'un plan de site dynamique (`sitemap.ts`) et de directives d'exploration adaptatives (`robots.ts`). Intégration de données structurées JSON-LD (Schema.org) sous le type `EducationalOrganization` pour favoriser le référencement auprès de Google et des moteurs de recherche basés sur les IA (Gemini, ChatGPT Search). Correction grammaticale des titres par défaut dans `app/page.tsx` et `CMSClient.tsx`. Enrichissement des mots-clés de ciblage locaux dans `app/layout.tsx` (Lycée Technique d'Abidjan, Lycée Scientifique de Yamoussoukro, Wave CI, MoMo, etc.) et intégration des tarifs en Francs CFA (XOF) et des 6 centres physiques locaux dans les données structurées. Mise en place d'un nettoyage automatique des espaces et espaces insécables (`%C2%A0`) sur le lien WhatsApp de la page d'accueil et lors des sauvegardes CMS pour éviter les erreurs de liens relatifs `localhost:3000/`.
>
> **Version 1.14 (Optimisation Performance & Chargement Paresseux PDF) :** Résolution des lenteurs de chargement et d'affichage dans le visualiseur sécurisé. Implémentation du rendu paresseux (Lazy Rendering) des pages PDF sous [SecureViewerClient.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/(dashboard)/dashboard/documents/viewer/SecureViewerClient.tsx). Les dimensions de toutes les pages sont chargées sur le montage initial (pour conserver la hauteur de la barre de défilement), mais le rendu intensif sur les `<canvas>` HTML5 et l'exécution de PDF.js ne se déclenchent que lorsque la page entre dans le viewport (avec une marge de confort de 800px verticalement), soulageant drastiquement la charge mémoire du navigateur.
>
> **Version 1.15 (Format & Aspect Ratio Dynamique des Vidéos & Affiches) :** Adapté le lecteur `AutoplayVideo.tsx` pour détecter dynamiquement les dimensions réelles (`videoWidth`, `videoHeight`) de la vidéo au chargement, ajustant la taille du conteneur en fonction de son ratio (carré 1:1, TikTok/portrait 9:16, ou paysage 16:9) sans distorsion. Modifié la galerie `AffichesGallery.tsx` pour supprimer le ratio rigide 3:4 et permettre aux affiches de s'afficher fidèlement selon leur aspect ratio naturel. Ajusté la mise en page de la vidéo sur la page d'accueil dans `app/page.tsx` pour supporter ces ratios adaptatifs.
>
> **Version 1.16 (Mise à jour de la Proposition Commerciale OGE Académie) :** Suppression de tous les frais initiaux d'installation ou d'acquisition de nom de domaine (passage à 0 FCFA) dans la proposition commerciale et le contrat de partenariat, confirmant que les Entrepreneurs ne paient rien lors du lancement et que le Concepteur est rémunéré exclusivement à hauteur de 2 % de commission sur les inscriptions validées.
>
> **Version 1.17 (Ajout des Contacts du Concepteur & Édition Super-Admin) :** Intégration des coordonnées de contact du Concepteur (+225 0503681588, krsidoine7@gmail.com) dans le document contractuel (.docx) et affichage dynamique dans le pied de page (Footer) du site public. Ajout de champs d'édition de ces coordonnées dans la console de paramètres, accessibles uniquement au rôle super_admin, avec fusion sécurisée de la configuration système (JSONB) en base de données.
>
> **Version 1.18 (Clauses SLA & Limitation de Responsabilité dans le Contrat) :** Intégration des clauses de Délais de Support & Réaction (SLA) avec intervention sous 4 heures ouvrables en cas de panne critique en journée (8h-20h), et de la clause de Limitation de Responsabilité financière plafonnant les indemnités du Concepteur au montant des commissions à 2 % de l'année en cours dans la proposition commerciale (.docx).
>
> **Version 1.19 (Correction Connexion - Retrait Conditions d'Utilisation) :** Retrait de la case à cocher obligatoire d'acceptation des Conditions Générales d'Utilisation et de la politique de confidentialité sur la page de connexion (`connexion/page.tsx`), et ajustement associé de son schéma de validation Zod, cette validation n'étant légitime que lors de la phase d'inscription.
>
> **Version 1.20 (Modale de Confirmation Premium / Documents) :** Remplacement des boîtes de dialogue natives `confirm()` par une modale de confirmation interactive premium (`Dialog` de `@base-ui`) sur la page de gestion des documents (`/admin/documents`). Cette modale affiche en temps réel une cartographie d'impact détaillée des conséquences de la désactivation (perte de visibilité) ou de la suppression d'un support (suppression définitive, annulation Google Calendar pour les directs), sécurisant ainsi l'administration des cours.
>
> **Version 1.21 (Intégration du template de tests de charge Locust) :** Intégration du dossier `locust-template` (situé dans `.skills/ChefsOge/banques_skills/locust-template`) dans le système multi-agents. Mise à jour du manifeste de compétences principal (`manifeste_competence.md`, `manifeste_competence.json`), du skill manager `ChefsOge/SKILL.md`, des manifestes locaux des agents (`codebase-pattern-finder_manifest.md` / `.json`, `general-purpose_manifest.md` / `.json`) et des règles globales d'architecture (`GEMINI.md`) pour documenter la délégation, le chargement et l'utilisation du skill de test de charge `run-load-test`.
>
> **Version 1.22 (Optimisation des performances de navigation - Middleware) :** Correction d'un goulot d'étranglement majeur où le middleware exécutait des requêtes réseau à Supabase Auth (`getUser()`) et des requêtes en base de données (`profiles`) sur absolument toutes les requêtes (y compris les pages publiques comme l'accueil, et les pré-chargements de liens / prefetching). Désormais, ces appels sont immédiatement court-circuités pour toutes les routes publiques non authentifiées.
>
> **Version 1.23 (Caching Intelligent & Revalidation Turbopack/Next.js 16) :** Création de `lib/cached-queries.ts` regroupant les requêtes profil, CMS et documents dans des fonctions React cache et unstable_cache. Intégration dans la page d'accueil, le layout et la page candidat ainsi que le visualiseur candidat. Liaison des purges de cache de tags (avec signature standardisée 'max' pour Next.js 16) dans les Server Actions d'administration et de gestion de zone.

---

## 🗺️ Index des Dossiers Principaux

| Dossier / Fichier | Type | Rôle / Description |
|---|---|---|
| [`/app`](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app) | Dossier | Routes, pages et layouts de l'application Next.js (App Router) |
| [`/utils`](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/utils) | Dossier | Helpers, utilitaires et clients d'intégration (Supabase, etc.) |
| [`/drizzle`](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/drizzle) | Dossier | Schémas de base de données, configurations et scripts Drizzle |
| [`/public`](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/public) | Dossier | Assets statiques (logos, images, icônes) |
| [`/.skills`](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/.skills) | Dossier | Compétences et configuration de l'orchestrateur ChefsOge |
| [`/PROMPTS`](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/PROMPTS) | Dossier | Fichiers de spécification du projet (PRD, TDD, DB_SCHEMA, etc.) |

---

## 📄 Fichiers Racine & Documentation

* **[GEMINI.md](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/GEMINI.md)** : Règles de cadrage et architecture multi-agents ChefsOge.
* **[AGENTS.md](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/AGENTS.md)** : Règles spécifiques pour le développement Next.js (instructions IA).
* **[CLAUDE.md](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/CLAUDE.md)** : Fichier d'inclusion des règles pour l'assistant Claude.
* **[middleware.ts](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/middleware.ts)** : Middleware global Next.js. Gère les redirections basées sur l'état d'authentification et les rôles.
* **[manifeste_modules.md](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/manifeste_modules.md)** : Ce fichier. Registre centralisé des modules.
* **[cahier_de_recette.md](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/cahier_de_recette.md)** : Cahier de recette fonctionnel et technique détaillant les rôles, les droits (listes à puces) et les cas de test pas-à-pas de la plateforme (Format Markdown).
* **[cahier_de_recette.docx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/cahier_de_recette.docx)** : Document Microsoft Word compilé et stylisé du cahier de recette fonctionnel.
* **[scripts/convert_to_docx.py](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/scripts/convert_to_docx.py)** : Script utilitaire Python de parsing Markdown et compilation Word pour générer le fichier .docx.
* **[vercel.json](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/vercel.json)** : Configuration de déploiement Vercel. Fixe la région d'exécution des fonctions serverless en Europe (Frankfort `fra1`) pour éliminer la latence réseau avec Supabase.
* **[.env.local](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/.env.local)** : Variables d'environnement locales (URL/Clés Supabase et DATABASE_URL).
* **[proposition_commerciale_oge.docx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/.skills/ChefsOge/proposition_commerciale_oge.docx)** : Modèle de proposition commerciale et contrat de partenariat (SaaS à 2% + maintenance) - Version mise à jour.
* **[comptes_plateforme_oge.docx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/.skills/ChefsOge/comptes_plateforme_oge.docx)** : Liste de tous les comptes d'administration, de gestion et de test configurés en base de données.

---

## 🔧 Utilitaires & Intégrations (`/utils`)

### 📂 utils/supabase
* **[client.ts](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/utils/supabase/client.ts)**
  * **Description :** Client Supabase pour composants côté navigateur (Browser Client).
  * **Relations :** Consommé par les formulaires ou hooks s'exécutant côté client.
* **[server.ts](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/utils/supabase/server.ts)**
  * **Description :** Client Supabase pour le serveur (gère la lecture/écriture des cookies).
  * **Relations :** Consommé par les Server Components, Server Actions et API Routes.
* **[middleware.ts](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/utils/supabase/middleware.ts)**
  * **Description :** Helper middleware Supabase servant à rafraîchir les sessions utilisateur.

---

## 🗂️ Base de données (`/drizzle`)

* **[schema.ts](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/drizzle/schema.ts)**
  * **Description :** Définition complète des tables `profiles` et `concours_inscrits` ainsi que de leurs enums associés, calqué sur `DB_SCHEMA.md`.
  * **Relations :** Importé par le client de base de données pour effectuer des requêtes typées.

---

## ⚙️ Logique & Validation (`/lib`)

* **[cached-queries.ts](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/lib/cached-queries.ts)**
  * **Description :** Module regroupant toutes les requêtes SQL enveloppées dans les fonctions de cache de React (`cache`) et de Next.js (`unstable_cache`).
  * **Relations :** Consommé par la page d'accueil, le dashboard candidat (layout et pages) et le visualiseur candidat.
* **[db.ts](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/lib/db.ts)**
  * **Description :** Client de connexion direct PostgreSQL utilisant `postgres-js` et configuré pour l'ORM Drizzle.
  * **Relations :** Consommé par les Server Actions pour effectuer des opérations de base de données (lecture, écriture, mises à jour RLS-bypass).
* **[validations/inscription.schema.ts](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/lib/validations/inscription.schema.ts)**
  * **Description :** Schémas de validation Zod pour les trois étapes de l'inscription candidat (Identité, Projet, Zone).
  * **Relations :** Consommé par les formulaires d'inscription (`OnboardingStep1`, `OnboardingStep2`, `OnboardingStep3`).
* **[googleCalendar.ts](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/lib/googleCalendar.ts)**
  * **Description :** Service de connexion et création d'événements Google Calendar/Meet par compte de service et authentification JWT.
  * **Relations :** Consommé par l'action `createDocument` pour planifier des visioconférences.
* **[webhooks.ts](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/lib/webhooks.ts)**
  * **Description :** Service sortant d'appel webhook pour envoyer les alertes de nouveaux documents à Make.com et n8n.
  * **Relations :** Consommé par l'action `createDocument`.
* **[crypto.ts](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/lib/crypto.ts)**
  * **Description :** Service utilitaire de chiffrement et déchiffrement symétrique AES-256-CBC avec dérivation de clé dynamique via SHA-256.
  * **Relations :** Importé par les routes API d'upload d'administration et de consultation sécurisée candidat.

---

## 🧱 Composants Métier (`/components`)

### 📂 components/shared
* **[Stepper.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/components/shared/Stepper.tsx)**
  * **Description :** Indicateur de progression visuel en 3 étapes pour l'onboarding.
  * **Relations :** Consommé par `app/(public)/inscription/page.tsx`.
* **[InteractiveSchoolGuides.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/components/shared/InteractiveSchoolGuides.tsx)**
  * **Description :** Onglets de fiches d'identité et guides interactifs d'orientation pour l'INP-HB, l'ESATIC et le CME.
  * **Relations :** Consommé par `app/page.tsx`.
* **[BlogGrid.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/components/shared/BlogGrid.tsx)**
  * **Description :** Grille des actualités de blog et boîte de dialogue de lecture in-app pour suivre les évolutions administratives des concours.
  * **Relations :** Consommé par `app/page.tsx`.
* **[HeaderNavbar.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/components/shared/HeaderNavbar.tsx)**
  * **Description :** Barre de navigation en-tête de la page d'accueil. Gère un affichage adaptatif : sur desktop, le logo est à gauche et les liens au centre ; sur mobile et tablette, le logo est déplacé à droite et le bouton déclenchant (menu hamburger) est placé à gauche avec un tiroir de navigation en verre givré.
  * **Relations :** Consommé par `app/page.tsx`.
* **[CookieBanner.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/components/shared/CookieBanner.tsx)**
  * **Description :** Bandeau flottant de consentement cookies persistant localement via LocalStorage.
  * **Relations :** Importé et rendu de manière globale par `app/layout.tsx`.
* **[AffichesGallery.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/components/shared/AffichesGallery.tsx)**
  * **Description :** Galerie responsive des affiches et annonces de l'Académie avec effet de survol dynamique et modal de type Lightbox interactif. S'adapte dynamiquement au ratio d'aspect naturel de chaque image.
  * **Relations :** Consommé par `app/page.tsx`.
* **[AutoplayVideo.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/components/shared/AutoplayVideo.tsx)**
  * **Description :** Lecteur vidéo optimisé avec lecture/pause automatique à l'entrée dans le viewport (Intersection Observer) et détection dynamique de l'aspect ratio d'origine (carré, portrait/TikTok, paysage).
  * **Relations :** Consommé par `app/page.tsx`.

### 📂 components/forms
* **[OnboardingStep1.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/components/forms/OnboardingStep1.tsx)**
  * **Description :** Étape 1 de l'onboarding candidat : Identité (nom, prénom, WhatsApp, email, mot de passe, série de Bac via sélecteur personnalisé premium et case à cocher d'acceptation des CGU).
  * **Relations :** Validé avec `step1Schema` de `inscription.schema.ts`.
* **[OnboardingStep2.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/components/forms/OnboardingStep2.tsx)**
  * **Description :** Étape 2 de l'onboarding candidat : Projet (Choix des concours visés, mode de préparation).
  * **Relations :** Validé avec `step2Schema` de `inscription.schema.ts`.
* **[OnboardingStep3.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/components/forms/OnboardingStep3.tsx)**
  * **Description :** Étape 3 de l'onboarding candidat : Choix de la zone et récapitulatif final avant soumission.
  * **Relations :** Validé avec `step3Schema` de `inscription.schema.ts`.
* **[PaiementUpload.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/components/forms/PaiementUpload.tsx)**
  * **Description :** Formulaire d'upload de reçu avec filtrage par extension, limite à 5 Mo et suivi par XMLHttpRequest.
  * **Relations :** Consommé par `PaiementModal.tsx`.

### 📂 components/dashboard
* **[Header.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/components/dashboard/Header.tsx)**
  * **Description :** En-tête de l'espace candidat affichant les détails de la zone et incluant un bouton de déconnexion.
  * **Relations :** Importé par `app/(dashboard)/dashboard/layout.tsx`.
* **[AdminMobileNav.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/components/dashboard/AdminMobileNav.tsx)**
  * **Description :** Navigation mobile réactive pour l'espace administration, avec bouton hamburger et menu tiroir coulissant, gérant le highlight de l'onglet actif.
  * **Relations :** Importé et rendu par `app/(admin)/admin/layout.tsx`.
* **[CandidatMobileNav.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/components/dashboard/CandidatMobileNav.tsx)**
  * **Description :** Navigation mobile réactive pour l'espace candidat, avec bouton hamburger et menu tiroir coulissant, gérant l'état actif et les badges de notifications.
  * **Relations :** Importé et rendu par `app/(dashboard)/dashboard/layout.tsx`.
* **[PaiementStatus.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/components/dashboard/candidat/PaiementStatus.tsx)**
  * **Description :** Affichage visuel du statut actuel du paiement (badge couleur, description dynamique et motif de rejet).
  * **Relations :** Consommé par `PaiementModal.tsx`.
* **[PaiementModal.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/components/dashboard/candidat/PaiementModal.tsx)**
  * **Description :** Modal bloquante affichant les coordonnées de versement Wave CI (champs distincts pour le lien de paiement marchand et/ou le numéro de téléphone Wave) de la zone du candidat, ainsi que l'uploader de capture d'écran du reçu.
  * **Relations :** Consomme `PaiementUpload` et `PaiementStatus`. Consommé par `PaiementModalWrapper.tsx`.
* **[PaiementModalWrapper.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/components/dashboard/candidat/PaiementModalWrapper.tsx)**
  * **Description :** Wrapper client déclenchant `router.refresh()` à la suite d'un upload validé de preuve de paiement.
  * **Relations :** Consomme `PaiementModal`. Consommé par `app/(dashboard)/dashboard/layout.tsx`.

### 📂 components/dashboard/zone
* **[CaptureViewer.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/components/dashboard/zone/CaptureViewer.tsx)**
  * **Description :** Modal d'inspection du reçu de paiement du candidat (permet d'approuver ou rejeter le paiement).
  * **Relations :** Consommé par `ZonePaiementsClient.tsx` et `ZoneDashboardClient.tsx`.
* **[PaiementZoneTable.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/components/dashboard/zone/PaiementZoneTable.tsx)**
  * **Description :** Tableau des candidats de la zone du manager avec filtres et recherche (obsolète, remplacé par des vues ciblées).
  * **Relations :** Consomme `CaptureViewer.tsx`.
* **[ZoneNavigation.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/components/dashboard/zone/ZoneNavigation.tsx)**
  * **Description :** Composant client gérant la navigation réactive (sidebar et mobile) avec états actifs pour l'espace Manager.
  * **Relations :** Importé par `app/(zone)/zone/layout.tsx`.
* **[ZoneDashboardClient.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/components/dashboard/zone/ZoneDashboardClient.tsx)**
  * **Description :** Composant de tableau de bord principal avec statistiques de la zone, liens rapides et liste des 5 dernières soumissions.
  * **Relations :** Consomme `CaptureViewer.tsx`. Importé par `app/(zone)/zone/page.tsx`.
* **[ZoneCandidatsClient.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/components/dashboard/zone/ZoneCandidatsClient.tsx)**
  * **Description :** Grille et tableau interactifs listant tous les candidats d'une zone avec des options de recherche et filtres de statuts.
  * **Relations :** Importé par `app/(zone)/zone/candidats/page.tsx`.
* **[ZonePaiementsClient.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/components/dashboard/zone/ZonePaiementsClient.tsx)**
  * **Description :** Interface de validation des paiements filtrée par défaut sur les éléments en cours de vérification.
  * **Relations :** Consomme `CaptureViewer.tsx`. Importé par `app/(zone)/zone/paiements/page.tsx`.
* **[ZoneSettingsForm.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/components/dashboard/zone/ZoneSettingsForm.tsx)**
  * **Description :** Formulaire de mise à jour des informations de paiement (champs distincts pour le lien Wave Marchand et le numéro de téléphone Wave), contact de la zone et adresse physique de la zone locale.
  * **Relations :** Appelle l'action serveur `updateZoneConfigByManager`. Importé par `app/(zone)/zone/parametres/page.tsx`.

---

## 🌐 Application Web (`/app`)

### Routes Publiques & Structure Initiale

#### 📂 Racine app
* **[layout.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/layout.tsx)**
  * **Description :** Layout global de l'application Next.js. Charge les polices Geist (Sans et Mono), définit le squelette HTML racine, et configure le Toaster pour les notifications.
  * **Relations :** Importe [globals.css](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/globals.css) et le composant [sonner.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/components/ui/sonner.tsx).
* **[page.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/page.tsx)**
  * **Description :** Page d'accueil publique de la plateforme OGE Académie. Affiche de façon dynamique les blocs configurés en base de données (Hero, Historique, Formations, Résultats, Témoignages, Inscription, Footer) avec fallbacks en cas de base vide. Sépare la section historique/centres en deux parties distinctes : la préparation en ligne (carte à distance) et la préparation en présentiel (lieux physiques).
  * **Relations :** Chargée sous [layout.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/layout.tsx). Consomme Drizzle ORM, interroge les tables `page_sections` et `temoignages`, et rend le composant `HeaderNavbar`.
* **[globals.css](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/globals.css)**
  * **Description :** Styles globaux de l'application incluant la configuration de Tailwind CSS.

#### 📂 app/(public)/connexion
* **[page.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/(public)/connexion/page.tsx)**
  * **Description :** Page publique de connexion. Formulaire d'e-mail, mot de passe et case à cocher d'acceptation des CGU avec validation Zod dynamique et logique d'authentification Supabase avec redirection selon le rôle.
  * **Relations :** Consomme [client.ts](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/utils/supabase/client.ts) et les composants UI de Shadcn ([button.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/components/ui/button.tsx), [card.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/components/ui/card.tsx), [input.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/components/ui/input.tsx), [label.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/components/ui/label.tsx)).

#### 📂 app/(public)/inscription
* **[page.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/(public)/inscription/page.tsx)**
  * **Description :** Page publique d'inscription orchestrant l'onboarding multi-étapes.
  * **Relations :** Consomme `Stepper`, `OnboardingStep1`, `OnboardingStep2`, `OnboardingStep3` et l'action serveur `registerCandidate`.
* **[politique-de-confidentialite/page.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/(public)/politique-de-confidentialite/page.tsx)**
  * **Description :** Page de lecture de la politique de confidentialité réglementaire RGPD.
  * **Relations :** Liée dans le Footer de la page d'accueil et dans le bandeau de cookies.
* **[actions.ts](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/(public)/inscription/actions.ts)**
  * **Description :** Server Action pour l'inscription. Gère la création dans Supabase Auth, la mise à jour directe du profil via Drizzle pour contourner RLS en sandbox, l'inscription aux concours cibles, et l'envoi d'email via Resend.
  * **Relations :** Importé par `app/(public)/inscription/page.tsx`.

#### 📂 app/(public)/mot-de-passe-oublie
* **[page.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/(public)/mot-de-passe-oublie/page.tsx)**
  * **Description :** Page publique de demande de récupération de mot de passe par envoi d'email via Supabase Auth.
  * **Relations :** Liée dans l'écran de connexion ([connexion/page.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/(public)/connexion/page.tsx)). Consomme le client Supabase.

#### 📂 app/(public)/reinitialiser-mot-de-passe
* **[page.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/(public)/reinitialiser-mot-de-passe/page.tsx)**
  * **Description :** Page publique de réinitialisation finale de mot de passe (saisie et confirmation du nouveau mot de passe).
  * **Relations :** Cible de redirection après récupération. Consomme le client Supabase.

### Routes Protégées (Espace Candidat)

#### 📂 app/api/paiements/upload
* **[route.ts](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/api/paiements/upload/route.ts)**
  * **Description :** Endpoint POST d'upload de reçu. Réceptionne le fichier multipart, le stocke dans le bucket privé Supabase Storage sous `userId/filename`, puis insère/met à jour l'enregistrement paiement en base à l'état `en_cours`.
  * **Relations :** Consomme Drizzle ORM et le serveur Supabase Client. Appelé par `PaiementUpload.tsx`.

#### 📂 app/(dashboard)/dashboard
* **[layout.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/(dashboard)/dashboard/layout.tsx)**
  * **Description :** Layout sécurisé de l'espace candidat. Restreint l'accès aux utilisateurs non validés en affichant en surimpression la `PaiementModal` de facturation. Intègre la barre de navigation latérale et mobile pour les candidats validés.
  * **Relations :** Consomme `Header`, `PaiementModalWrapper`, `CandidatMobileNav`, et interroge la table des notifications.
* **[page.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/(dashboard)/dashboard/page.tsx)**
  * **Description :** Index du dashboard candidat avec raccourcis vers les supports de révisions, listes des concours préparés et contacts.
  * **Relations :** Consomme Drizzle ORM.
* **[paiement/page.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/(dashboard)/dashboard/paiement/page.tsx)**
  * **Description :** Page de récapitulatif comptable affichant la validation définitive et générant un lien signé d'accès au reçu stocké.
  * **Relations :** Consomme Drizzle ORM et le client Supabase.
* **[documents/page.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/(dashboard)/dashboard/documents/page.tsx)**
  * **Description :** Page de listing des documents de cours, fiches et corrigés du candidat, filtrés en fonction de ses concours.
  * **Relations :** Consomme `DocumentsList`.
* **[documents/DocumentsList.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/(dashboard)/dashboard/documents/DocumentsList.tsx)**
  * **Description :** Composant client interactif de filtrage par type de cours/concours et recherche textuelle.
  * **Relations :** Consommé par `documents/page.tsx`.
* **[documents/viewer/page.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/(dashboard)/dashboard/documents/viewer/page.tsx)**
  * **Description :** Page serveur de visualiseur sécurisé. Vérifie les droits d'accès au document, logge l'accès dans `acces_documents` et génère un lien signé vers Supabase Storage.
  * **Relations :** Consomme `SecureViewerClient`.
* **[documents/viewer/SecureViewerClient.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/(dashboard)/dashboard/documents/viewer/SecureViewerClient.tsx)**
  * **Description :** Visualiseur PDF sécurisé haut de gamme utilisant PDF.js pour un rendu rasterisé sur éléments canvas HTML5. Gère le zoom réactif, l'ajustement automatique à la largeur, le défilement fluide, le suivi dynamique des pages dans la barre d'outils, les thèmes de lecture (sombre, clair, sépia), le support Retina/High-DPI, et place un quadrillage de filigrane directement sur les pages au-dessus du canvas pour empêcher les détournements. Bloque le clic droit, le raccourci d'impression (`Ctrl+P`) et de sauvegarde, et floute automatiquement le contenu en cas de perte de focus de la fenêtre.
  * **Relations :** Consommé par `documents/viewer/page.tsx`.
* **[profil/page.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/(dashboard)/dashboard/profil/page.tsx)**
  * **Description :** Page de profil candidat. Récupère les données depuis Drizzle.
  * **Relations :** Consomme `ProfileClient`.
* **[profil/ProfileClient.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/(dashboard)/dashboard/profil/ProfileClient.tsx)**
  * **Description :** Formulaire de mise à jour des informations de contact (WhatsApp, mode, zone) et de modification sécurisée du mot de passe.
  * **Relations :** Consomme `updateCandidateProfile` (Server Action) et l'API Supabase Auth Client. Consommé par `profil/page.tsx`.
* **[notifications/page.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/(dashboard)/dashboard/notifications/page.tsx)**
  * **Description :** Centre de notifications candidat listant les messages reçus de l'administration.
  * **Relations :** Consomme `NotificationsClient`.
* **[notifications/NotificationsClient.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/(dashboard)/dashboard/notifications/NotificationsClient.tsx)**
  * **Description :** Interface client d'affichage des notifications avec boutons pour marquer comme lu individuellement ou en bloc.
  * **Relations :** Consommé par `notifications/page.tsx`.
* **[actions.ts](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/(dashboard)/dashboard/actions.ts)**
  * **Description :** Actions serveur de l'espace candidat pour la mise à jour du profil (`updateCandidateProfile`) et la lecture des notifications (`markNotificationAsRead`, `markAllNotificationsAsRead`).
  * **Relations :** Consommé par `ProfileClient.tsx` et `NotificationsClient.tsx`.
* **[NotificationPopupListener.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/components/dashboard/NotificationPopupListener.tsx)**
  * **Description :** Écouteur client de notifications non lues. Interroge l'API toutes les 20 secondes, joue un carillon d'alerte Web Audio API, et affiche les alertes dans une boîte de dialogue modale premium.
  * **Relations :** Importé et monté dans `app/(dashboard)/dashboard/layout.tsx`.

### API Routes & Sécurité

#### 📂 app/api/documents
* **[route.ts](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/api/documents/route.ts)**
  * **Description :** Route API GET de génération sécurisée de liens signés pour les documents (validité 60 min).
  * **Relations :** Appelé côté serveur par le visualiseur ou les requêtes directes autorisées.
* **[[id]/view/route.ts](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/api/documents/[id]/view/route.ts)**
  * **Description :** Route API GET de consultation sécurisée. Authentifie le candidat, vérifie son concours/paiement, télécharge le PDF chiffré depuis le Storage, le déchiffre à la volée en mémoire et le sert avec en-têtes anti-cache.
  * **Relations :** Appelée par le visualiseur de documents candidat `viewer/page.tsx` et consomme `lib/crypto.ts`.

#### 📂 app/api/admin/documents/upload
* **[route.ts](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/api/admin/documents/upload/route.ts)**
  * **Description :** Route API POST d'upload sécurisé pour les administrateurs. Chiffre le document PDF entrant avec AES-256-CBC et le téléverse sur Supabase Storage.
  * **Relations :** Appelée par le formulaire `DocumentsManagerClient.tsx` et consomme `lib/crypto.ts`.

#### 📂 app/api/admin/upload
* **[route.ts](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/api/admin/upload/route.ts)**
  * **Description :** Route API POST d'upload public pour les administrateurs et managers de zone. Reçoit les images (affiches) ou les vidéos (vidéo de présentation), valide leur taille/format, les renomme de manière imprévisible (UUID) et les téléverse dans le dossier public `public-assets` du bucket `documents` sur Supabase Storage.
  * **Relations :** Appelée par le gestionnaire de contenu `CMSClient.tsx` pour l'upload d'affiches et de la vidéo.

#### 📂 app/api/notifications
* **[unread/route.ts](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/api/notifications/unread/route.ts)**
  * **Description :** Route API GET renvoyant la liste des notifications non lues du candidat connecté.
  * **Relations :** Appelée par le composant `NotificationPopupListener.tsx`.

#### 📂 app/api/webhooks
* **[make/route.ts](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/api/webhooks/make/route.ts)**
  * **Description :** Point de réception d'appels webhooks provenant de Make.com pour notifier les candidats ou valider les paiements.
  * **Relations :** Protégé par signature Webhook Secret.
* **[n8n/route.ts](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/api/webhooks/n8n/route.ts)**
  * **Description :** Point de réception d'appels webhooks provenant de n8n pour des traitements similaires.
  * **Relations :** Protégé par signature Webhook Secret.


### Routes Protégées (Espace Administrateur Global)

#### 📂 app/(admin)/admin
* **[layout.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/(admin)/admin/layout.tsx)**
  * **Description :** Layout sécurisé de l'espace administration. Restreint l'accès aux utilisateurs sans les rôles `admin` ou `super_admin` et affiche la barre latérale et mobile de navigation admin.
  * **Relations :** Consomme `Header`.
* **[page.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/(admin)/admin/page.tsx)**
  * **Description :** Index du dashboard d'administration globale affichant les indicateurs de performance (KPIs), statistiques de concours, répartition géographique et statistiques par canal de paiement (Wave, MoMo, Orange). Affiche un bandeau d'alerte pour les demandes de double contrôle en attente.
  * **Relations :** Consomme Drizzle ORM (y compris `adminPendingActions` et `paiements`).
* **[actions.ts](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/(admin)/admin/actions.ts)**
  * **Description :** Actions serveur réservées aux administrateurs (gestion d'activation, soft delete, promotion de managers, affectation de zone, configuration de reçu Wave/MoMo, envoi d'annonces, activation/désactivation de sections de la page d'accueil et CRUD des témoignages, ainsi que le contrôle global de sécurité des supports PDF).
  * **Relations :** Consommé par les composants clients de l'espace admin.
* **[PdfSecurityToggleButton.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/(admin)/admin/PdfSecurityToggleButton.tsx)**
  * **Description :** Bouton switch client animé de basculement global de la sécurité des PDF.
  * **Relations :** Consommé par `app/(admin)/admin/page.tsx` et appelle `togglePdfSecurity` dans `actions.ts`.
* **[candidats/page.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/(admin)/admin/candidats/page.tsx)**
  * **Description :** Page serveur de gestion de la base de données des candidats.
  * **Relations :** Consomme `CandidatsListClient`.
* **[candidats/CandidatsListClient.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/(admin)/admin/candidats/CandidatsListClient.tsx)**
  * **Description :** Composant client interactif de recherche, de filtrage multicritère des candidats et d'export CSV.
  * **Relations :** Consomme les actions `toggleUserActive` et `softDeleteUser`.
* **[paiements/page.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/(admin)/admin/paiements/page.tsx)**
  * **Description :** Page de listing de tous les justificatifs de paiement soumis sur la plateforme.
  * **Relations :** Consomme `PaiementsListClient` et pré-génère les URLs signées pour les reçus.
* **[paiements/PaiementsListClient.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/(admin)/admin/paiements/PaiementsListClient.tsx)**
  * **Description :** Composant client de suivi comptable permettant d'inspecter les reçus, de valider ou de rejeter avec un motif, et d'exporter au format CSV.
  * **Relations :** Consomme les actions `adminApprovePayment` et `adminRejectPayment`.
* **[managers/page.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/(admin)/admin/managers/page.tsx)**
  * **Description :** Page serveur d'affectation, de promotion des responsables de zone locale et de chargement des demandes de double contrôle.
  * **Relations :** Consomme `ManagersListClient`.
* **[managers/ManagersListClient.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/(admin)/admin/managers/ManagersListClient.tsx)**
  * **Description :** Composant client permettant de promouvoir un candidat, d'affecter les zones, d'éditer les managers, et de valider les blocages/réactivations/désactivations via un double contrôle.
  * **Relations :** Consomme les actions `promoteUserToManager`, `assignZoneManager`, `submitManagerActionRequest`, `approveManagerAction`, `rejectManagerAction`.
* **[zones/page.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/(admin)/admin/zones/page.tsx)**
  * **Description :** Page serveur des configurations bancaires locales par ville.
  * **Relations :** Consomme `ZonesListClient`.
* **[zones/ZonesListClient.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/(admin)/admin/zones/ZonesListClient.tsx)**
  * **Description :** Composant client d'édition des numéros ou liens Wave CI et des adresses physiques de centres par zone.
  * **Relations :** Consomme l'action `updateZoneConfig`.
* **[notifications/page.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/(admin)/admin/notifications/page.tsx)**
  * **Description :** Page serveur de diffusion d'annonces groupées.
  * **Relations :** Consomme `GroupNotificationsClient`.
* **[notifications/GroupNotificationsClient.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/(admin)/admin/notifications/GroupNotificationsClient.tsx)**
  * **Description :** Composant client de rédaction d'alertes ciblées par zone, par concours ou globales.
  * **Relations :** Consomme l'action `sendGroupNotification`.
* **[contenu/page.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/(admin)/admin/contenu/page.tsx)**
  * **Description :** Page serveur du gestionnaire de contenu (CMS). Récupère la liste des sections de la page d'accueil et les témoignages candidats en base de données.
  * **Relations :** Consomme Drizzle ORM. Rend le composant `CMSClient.tsx`.
* **[contenu/CMSClient.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/(admin)/admin/contenu/CMSClient.tsx)**
  * **Description :** Interface client interactive d'administration du CMS. Permet de modifier le contenu des sections (y compris la section Inscription/Urgence avec ses cartes arguments, et les titres/coordonnées de la section des Centres d'Accompagnement), et de gérer les témoignages/actualités (créer, modifier, basculer actif/inactif, soft delete).
  * **Relations :** Importe les server actions de `actions.ts`. Consommé par `contenu/page.tsx`.
* **[documents/page.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/(admin)/admin/documents/page.tsx)**
  * **Description :** Page d'administration des supports de cours et de planification des sessions Google Meet.
  * **Relations :** Charge le composant client `DocumentsManagerClient.tsx`.
* **[documents/DocumentsManagerClient.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/(admin)/admin/documents/DocumentsManagerClient.tsx)**
  * **Description :** Panel d'administration interactif permettant d'ajouter des fichiers PDF ou de programmer des directs.
  * **Relations :** Appelle les server actions `createDocument` et `deleteDocument`.
* **[parametres/page.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/(admin)/admin/parametres/page.tsx)**
  * **Description :** Page d'édition des configurations système (IDs d'agenda, secrets, URLs webhooks et toggles généraux).
  * **Relations :** Charge le composant client `SettingsForm.tsx`.
* **[parametres/SettingsForm.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/(admin)/admin/parametres/SettingsForm.tsx)**
  * **Description :** Formulaire de saisie des variables système et des options générales (allow_manager_edit et configurations d'agenda/webhooks pour le Super-Admin, les options MoMo/Orange Money étant désactivées au profit de Wave uniquement).
  * **Relations :** Appelle les actions serveur `updateSystemSettings` et `updateSystemConfig`.

### Routes Protégées (Espace Manager de Zone)

#### 📂 app/(zone)/zone
* **[layout.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/(zone)/zone/layout.tsx)**
  * **Description :** Layout sécurisé de l'espace manager de zone. Restreint l'accès aux utilisateurs qui n'ont pas le rôle `manager_zone`, affiche la barre de navigation latérale et la navigation mobile.
  * **Relations :** Consomme `Header`, `ZoneSidebarNav`, `ZoneMobileNav`.
* **[page.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/(zone)/zone/page.tsx)**
  * **Description :** Page principale du tableau de bord manager de zone. Calcule les KPI agrégés de la zone et liste les 5 dernières soumissions à valider.
  * **Relations :** Consomme Drizzle ORM et `ZoneDashboardClient`.
* **[candidats/page.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/(zone)/zone/candidats/page.tsx)**
  * **Description :** Page listant l'intégralité des candidats de la zone locale.
  * **Relations :** Consomme `ZoneCandidatsClient`.
* **[paiements/page.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/(zone)/zone/paiements/page.tsx)**
  * **Description :** Page de validation des reçus de paiement de la zone locale, affichant les détails de chaque transaction et la modal d'approbation/rejet.
  * **Relations :** Consomme `ZonePaiementsClient`.
* **[parametres/page.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/(zone)/zone/parametres/page.tsx)**
  * **Description :** Page d'édition de la configuration de paiement (liens/numéros Wave/MoMo, téléphone de contact, adresse du centre local).
  * **Relations :** Consomme `ZoneSettingsForm`.
* **[documents/page.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/(zone)/zone/documents/page.tsx)**
  * **Description :** Page de listing et d'ajout de documents de cours/TD spécifiques à la zone du manager.
  * **Relations :** Charge le composant client `ZoneDocumentsClient.tsx`.
* **[documents/ZoneDocumentsClient.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/(zone)/zone/documents/ZoneDocumentsClient.tsx)**
  * **Description :** Composant client interactif d'upload et de gestion des documents PDF pour la zone.
  * **Relations :** Appelle les server actions `managerCreateDocument`, `managerToggleDocumentActive`, et `managerDeleteDocument`.
* **[actions.ts](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/(zone)/zone/actions.ts)**
  * **Description :** Actions serveur pour valider ou rejeter un paiement de candidat, configurer la zone, ainsi que la création/modification/suppression des documents spécifiques de zone.
  * **Relations :** Importé par `CaptureViewer.tsx`, `ZoneSettingsForm.tsx`, et `ZoneDocumentsClient.tsx`.

---

## 🎨 Composants UI Réutilisables (`/components/ui`)


* **[button.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/components/ui/button.tsx)** : Bouton interactif standardisé (Shadcn/ui).
* **[card.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/components/ui/card.tsx)** : Cadres et conteneurs d'informations (Shadcn/ui).
* **[input.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/components/ui/input.tsx)** : Zone d'entrée de saisie clavier.
* **[label.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/components/ui/label.tsx)** : Libellés de formulaire.
* **[badge.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/components/ui/badge.tsx)** : Badges et tags colorés.
* **[dialog.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/components/ui/dialog.tsx)** : Boîtes de dialogue modales interactives.
* **[sonner.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/components/ui/sonner.tsx)** : Gestionnaire de notifications toast réutilisable. Personnalisé avec un style premium iOS (iPhone) en verre givré et un carillon double-ton synthétisé par l'API Web Audio.

### 📂 components/shared
* **[AffichesGallery.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/components/shared/AffichesGallery.tsx)**
  * **Description :** Composant galerie d'affiches interactif pour la page d'accueil. Affiche une grille d'affiches avec effets de survol premium et gère l'ouverture en plein écran (Lightbox) avec navigation entre les images et transitions douces.
  * **Relations :** Consommé par la page d'accueil publique ([page.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/page.tsx)).
* **[AutoplayVideo.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/components/shared/AutoplayVideo.tsx)**
  * **Description :** Composant lecteur vidéo interactif doté d'un `IntersectionObserver`. Joue la vidéo automatiquement en boucle et muette lorsqu'elle entre dans le viewport de l'utilisateur, et se met en pause de façon fluide lorsqu'il fait défiler la page en dehors de la section.
  * **Relations :** Consommé par la page d'accueil publique ([page.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/page.tsx)).

---

## 📦 Instructions de Maintenance du Manifeste
Pour tout nouveau fichier ou composant créé :
1. Repérer sa section correspondante (ex: `/components`, `/app`, `/lib`).
2. Ajouter le lien absolu vers le fichier en utilisant le schéma `file:///`.
3. Indiquer sa description fonctionnelle brève.
4. Renseigner ses dépendances (quels fichiers il importe ou par quoi il est consommé).
