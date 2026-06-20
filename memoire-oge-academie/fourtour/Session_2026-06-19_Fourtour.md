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

### 5. Personnalisation de la section d'urgence (CMS)
* **Problème** : La section d'accroche d'urgence sous Inscription sur la page d'accueil possédait des textes fixes codés en dur ou nécessitant des requêtes complexes si configurés sous forme de table séparée.
* **Résolution** : Intégration de champs dynamiques supplémentaires (`urgence_badge`, `urgence_title`, `urgence_description`, `urgence_warning`, `urgence_cards`) dans le document JSONB de la section `'inscription'` dans la table `page_sections`. L'implémentation réutilise les helpers génériques du client d'administration (`handleFieldChange`, `handleNestedFieldChange`, `handleAddNestedItem`, `handleRemoveNestedItem`), garantissant la cohérence et l'absence de régression de style.

### 6. Correction "Image non disponible" (Manager de Zone)
* **Problème** : Lors de l'inspection d'un reçu de paiement par un manager de zone, l'image du justificatif affichait "Image non disponible". Cela venait de la fonction `createSignedUrls` (batch) de Supabase Storage qui retournait des clés de chemin discordantes par rapport aux chemins initialement demandés, empêchant l'association de la `signedUrl` au candidat correspondant.
* **Résolution** : Remplacement de l'appel par lot par des appels unitaires concurrents via `createSignedUrl` enveloppés dans `Promise.all`. L'association est ainsi directe et garantie à 100%.

### 7. Résolution de l'infinie récursion RLS et accès sécurisé aux justificatifs
* **Problème** : Après la mise en place de la politique de sécurité pour la lecture des reçus par les managers de zone, les images affichaient toujours "Image non disponible". L'analyse a révélé une erreur de base de données PostgreSQL : `"infinite recursion detected in policy for relation "profiles""`. La politique `admin_all_profiles` sur la table `public.profiles` effectuait un `SELECT` sur `profiles` pour vérifier le rôle de l'utilisateur en cours (`auth.uid()`), ce qui déclenchait récursivement la politique à l'infini. Comme la politique de stockage `storage.objects` ou de paiements `public.paiements` interrogeait également ces tables, tout le processus de résolution des URLs signées échouait silencieusement dans le client d'API.
* **Résolution** :
  1. Création de fonctions utilitaires avec l'option `SECURITY DEFINER` et le `search_path` forcé à `public` : `public.get_user_role(user_id)` et `public.get_user_zone(user_id)`. Ces fonctions s'exécutent avec les privilèges du propriétaire de la base et interrogent la table `profiles` en contournant l'évaluation RLS, éliminant ainsi toute récursion.
  2. Création de la fonction de contrôle d'accès `public.can_read_receipt(user_id, object_owner_str)` pour centraliser de manière optimisée et sécurisée la logique de visibilité des reçus (les administrateurs voient tout, les managers voient les reçus de leur zone géographique, les candidats voient leur propre reçu, avec une gestion d'erreur robuste sur la conversion UUID).
  3. Mise à jour de la politique `admin_all_profiles` sur `public.profiles` pour utiliser `public.get_user_role(auth.uid())`.
  4. Remplacement des politiques de lecture de stockage par une politique unique optimisée et non-récursive : `Allow read access to receipts based on roles` sur `storage.objects` s'appuyant sur la fonction sécurisée `public.can_read_receipt(auth.uid(), (storage.foldername(name))[1])`.

### 8. Sécurisation des informations critiques du candidat (Profil)
* **Problème** : Les candidats pouvaient modifier directement leur zone de formation et leur mode de formation dans leur profil, ce qui contournait la répartition géographique des frais d'inscription et le suivi financier par les managers de zone.
* **Résolution** :
  - **Côté Client** : Blocage dans l'interface candidat en passant les éléments `<select>` du mode et de la zone en mode `disabled` dans `ProfileClient.tsx` et en adaptant le style graphique pour correspondre aux autres champs bloqués (fond gris `bg-slate-50`, texte gris `text-slate-500` et curseur `cursor-not-allowed`).
  - **Côté Serveur** : Modification de la signature et de la logique de l'action serveur `updateCandidateProfile` dans `app/(dashboard)/dashboard/actions.ts` afin d'exclure totalement les champs `modeFormation` et `zone` de la requête de mise à jour en base de données. Seul le numéro WhatsApp reste éditable par le candidat.

