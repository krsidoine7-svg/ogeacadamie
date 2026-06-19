# Notes techniques de la Session — 19 Juin 2026

## Décisions & Résolutions techniques

### 1. Structure de configuration en base de données
* **Problème** : Où stocker de manière sécurisée les paramètres éditables (`WEBHOOK_SECRET`, `MAKE_WEBHOOK_URL`, `N8N_WEBHOOK_URL`, `GOOGLE_CALENDAR_ID`) sans forcer le redéploiement ?
* **Résolution** : Exploiter la table `page_sections` existante en insérant une ligne clé `'parametres'` avec stockage JSONB. Cela évite d'ajouter une nouvelle table à PostgreSQL, réduisant la complexité de maintenance.

### 2. Gestion de l'authentification Google sans librairies lourdes
* **Problème** : L'importation de la suite `googleapis` alourdit inutilement le bundle de production de Next.js.
* **Résolution** : Création d'un utilitaire JWT natif (`lib/googleCalendar.ts`) s'appuyant uniquement sur le module `crypto` de Node.js. La clé privée du compte de service (Service Account) est signée en RS256 pour générer un token d'accès directement consommable via l'API REST de Google Calendar.

### 3. Typage strict Drizzle
* **Problème** : Lors du retour de l'action `createDocument`, Drizzle marque le champ `createdAt` comme potentiellement `null` (car optionnel en insertion), provoquant une erreur à la compilation Next.js.
* **Résolution** : Ajout d'une conditionnelle `newDoc.createdAt ? newDoc.createdAt.toISOString() : new Date().toISOString()` pour garantir un type `string` propre au webhook sortant.

### 4. Hydratation SSR pour le bandeau cookie
* **Problème** : Si le bandeau cookie vérifie immédiatement le LocalStorage dans le rendu JSX, Next.js génère une erreur d'hydratation car le serveur ne possède pas de LocalStorage.
* **Résolution** : Initialiser la visibilité à `false` et vérifier le LocalStorage uniquement à l'intérieur d'un Hook `useEffect` côté client avec un léger décalage d'une seconde pour l'effet visuel.
