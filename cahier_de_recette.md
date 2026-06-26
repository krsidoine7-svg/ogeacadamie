# 📝 CAHIER DE RECETTE FONCTIONNEL & TECHNIQUE — OGE ACADÉMIE

Ce document sert de protocole officiel de test et de validation de la plateforme **OGE Académie** (Objectifs Grandes Écoles). Il permet de valider la conformité de l'application Next.js 15 par rapport aux exigences du PRD et du TDD, pour tous les rôles d'utilisateurs et dans tous les contextes locaux d'utilisation (Côte d'Ivoire).

---

## 🔑 1. IDENTIFIANTS DES COMPTES DE TEST ET PRÉREQUIS

Pour exécuter les scénarios ci-dessous, utilisez les comptes réels préconfigurés en base de données :

### 👤 1.1 Candidats de Test (Mot de passe commun : `Candidat123!`)
* **Yamoussoukro**
  * `candidat1.yamoussoukro@oge-academie.ci` (Statut paiement : 🟡 *En cours de validation*)
  * `candidat2.yamoussoukro@oge-academie.ci` (Statut paiement : 🟢 *Validé / Actif*)
* **Yopougon**
  * `candidat1.yopougon@oge-academie.ci` (Statut paiement : 🟡 *En cours de validation*)
  * `candidat2.yopougon@oge-academie.ci` (Statut paiement : 🟢 *Validé / Actif*)
* **Abobo**
  * `candidat1.abobo@oge-academie.ci` (Statut paiement : 🟡 *En cours de validation*)
  * `candidat2.abobo@oge-academie.ci` (Statut paiement : 🟢 *Validé / Actif*)
* **Cocody**
  * `candidat1.cocody@oge-academie.ci` (Statut paiement : 🟡 *En cours de validation*)
  * `candidat2.cocody@oge-academie.ci` (Statut paiement : 🟢 *Validé / Actif*)
* **Port-Bouët**
  * `candidat1.port-bouet@oge-academie.ci` (Statut paiement : 🟡 *En cours de validation*)
  * `candidat2.port-bouet@oge-academie.ci` (Statut paiement : 🟢 *Validé / Actif*)
* **Bouaké**
  * `candidat1.bouake@oge-academie.ci` (Statut paiement : 🟡 *En cours de validation*)
  * `candidat2.bouake@oge-academie.ci` (Statut paiement : 🟢 *Validé / Actif*)

### 💼 1.2 Responsables de Zone / Managers (Mot de passe commun : `Manager123!`)
* Manager Yamoussoukro : `manager.yamoussoukro@oge-academie.ci`
* Manager Yopougon : `manager.yopougon@oge-academie.ci`
* Manager Abobo : `manager.abobo@oge-academie.ci`
* Manager Cocody : `manager.cocody@oge-academie.ci`
* Manager Port-Bouët : `manager.portbouet@oge-academie.ci`
* Manager Bouaké : `manager.bouake@oge-academie.ci`

### 👑 1.3 Administrateurs et Super Admin (Mot de passe commun : `Admin123!`)
* Admin Principal 1 : `admin1@oge-academie.ci`
* Admin Principal 2 : `admin2@oge-academie.ci`
* Super Administrateur : `superadmin@oge-academie.ci`

---

## 👥 2. DROITS ET FONCTIONNALITÉS PAR INTERVENANT

Cette section détaille les droits accordés et les interdictions strictes pour chaque profil d'utilisateur.

### 👤 2.1 Candidat (`user`)
**Description & Périmètre :** Candidat ivoirien inscrit pour préparer un ou plusieurs concours.

**Droits & Fonctionnalités Autorisées :**
- S'inscrire en ligne (onboarding 3 étapes)
- Se connecter / réinitialiser son mot de passe
- Visualiser les coordonnées Wave de sa zone
- Transmettre son reçu de paiement de 15 000 FCFA (PDF/Image de moins de 5 Mo)
- Consulter le statut de son paiement (En cours, Validé, Rejeté avec motif)
- Accéder à l'espace de révisions (cours, TD, corrigés cibles)
- Utiliser le visualiseur PDF sécurisé réactif (retina + lazy rendering)
- Recevoir les notifications avec carillon sonore synthétisé en temps réel
- Mettre à jour ses infos (WhatsApp, mot de passe)

**Actions Strictement Interdites :**
- Accéder au dashboard sans paiement validé (la modal Wave est bloquante)
- Consulter les cours de concours non choisis
- Accéder aux routes réservées `/admin/*` ou `/zone/*`
- Contourner la sécurité PDF (téléchargement, clic droit, impression Ctrl+P ou capture de focus)
- Modifier le rôle ou la zone géographique d'autres comptes

### 💼 2.2 Manager de Zone (`manager_zone`)
**Description & Périmètre :** Gestionnaire local désigné pour piloter l'une des 6 zones géographiques.

**Droits & Fonctionnalités Autorisées :**
- Accéder à `/zone` avec KPIs filtrés sur sa zone géographique locale
- Consulter la liste et le détail des candidats de sa zone
- Inspecter les reçus de paiement via la modal d'inspection `CaptureViewer`
- Valider les paiements (ce qui active le candidat) ou les rejeter (avec motif)
- Demander le blocage/déblocage d'un candidat (soumis à double contrôle)
- Uploader et gérer les cours/TD spécifiques à sa zone locale
- Configurer le lien de paiement Wave et l'adresse physique du centre local

**Actions Strictement Interdites :**
- Consulter ou valider les données de candidats d'une autre zone
- Créer manuellement des comptes ou modifier des rôles d'utilisateurs
- Accéder aux réglages système globaux de `/admin/*`
- Modifier le contenu CMS de la page d'accueil ou du blog général
- Désactiver la sécurité PDF globale

### 👑 2.3 Administrateur (`admin`)
**Description & Périmètre :** Gestionnaire global de la plateforme OGE Académie.

**Droits & Fonctionnalités Autorisées :**
- Accéder à `/admin` avec KPIs globaux consolidés de toutes les zones
- Rechercher, filtrer et exporter en CSV la base des candidats et des paiements
- Valider ou rejeter les paiements de toutes les zones de Côte d'Ivoire
- Gérer les managers de zone (promotion de rôles, affectation géographique)
- Valider les demandes d'action (activation/blocage) en double contrôle
- Configurer les coordonnées bancaires/physiques de toutes les zones
- Diffuser des notifications groupées par ciblage (par école, zone, mode)
- Gérer le contenu CMS (historique, résultats) et les témoignages de la page d'accueil
- Créer/éditer et publier des articles de blog (boutons actifs/inactifs)
- Uploader des cours globaux et planifier des visios Google Meet / Calendar

**Actions Strictement Interdites :**
- Créer ou promouvoir des comptes au statut d'Admin ou de Super Admin
- Modifier les variables techniques système (`system_config`) du Super Admin
- Modifier les schémas de la base de données Supabase

### 🔌 2.4 Super Admin (`super_admin`)
**Description & Périmètre :** Administrateur technique détenant l'accès complet au système.

**Droits & Fonctionnalités Autorisées :**
- Détenir l'intégralité des privilèges de l'Administrateur Global
- Accéder à `/admin/parametres` pour modifier les variables d'environnement système (`system_config`) en base de données
- Activer/désactiver l'édition Wave par les managers (`allow_manager_edit`)
- Configurer les secrets d'API, agendas de service et webhooks (Make/n8n)
- Activer/désactiver globalement les restrictions de sécurité PDF (`togglePdfSecurity`) pour masquer les filigranes et réactiver les téléchargements candidats
- Créer manuellement des comptes Admins et Managers de zone

**Actions Strictement Interdites :**
- Effectuer des suppressions physiques de données clés en base (le protocole de soft delete `deleted_at` est obligatoire)

---

## 🧪 3. PROTOCOLES DE TEST ET CAS D'USAGE PAS À PAS

### 📍 3.1 Espace Public & Onboarding (Candidat non connecté)

#### Scénario ONB-001 : Navigation et Orientation (Page d'accueil)
1. **Prérequis :** Être non connecté. Ouvrir le navigateur à l'adresse racine `/`.
2. **Étapes de test :**
   * Vérifier que tous les textes de la page d'accueil (Héro, Histoire, Centres physiques) sont centrés.
   * Cliquer sur les différents onglets de la section d'orientation "Interactive School Guides" (INP-HB, ESATIC, CME) et s'assurer que les informations d'école s'affichent correctement.
   * Cliquer sur l'infobulle WhatsApp flottante située en bas à droite de l'écran et s'assurer que l'animation de slide de l'infobulle est fluide.
   * Cliquer sur le bouton WhatsApp pour vérifier qu'il ouvre une conversation vers le numéro officiel unique `+225 01 71 61 95 31` sans redirection cassée.
3. **Résultat attendu :** Affichage fluide, centré et moderne. Le bouton WhatsApp est présent sur tous les écrans (y compris mobile) et fonctionne correctement.

#### Scénario ONB-002 : Inscription multi-étapes (Onboarding)
1. **Prérequis :** Être non connecté. Naviguer vers `/inscription`.
2. **Étapes de test :**
   * **Étape 1 (Identité) :** Saisir les champs obligatoires (Nom, Prénom, Email, WhatsApp). Choisir une série de Bac (C, D, E, F) via le sélecteur stylisé. Cocher la case d'acceptation des CGU et de la Politique de Confidentialité. Cliquer sur "Suivant".
   * **Étape 2 (Projet) :** Cocher au moins un concours (ex: INP-HB). Choisir le mode de préparation (En présentiel ou En ligne). Cliquer sur "Suivant".
   * **Étape 3 (Zone & Validation) :** Sélectionner une zone géographique locale (ex: Cocody). Examiner le récapitulatif de toutes les informations saisies. Cliquer sur le bouton final "S'inscrire".
3. **Résultat attendu :** Un email de bienvenue automatique est expédié par Resend à l'adresse du candidat. Le compte est inséré en base de données (`profiles` et `concours_inscrits`). Le statut de paiement du candidat est initialisé à `non_solde`, `is_active` à `false` et l'utilisateur est redirigé vers l'écran de connexion.

---

### 💳 3.2 Gestion des Paiements et Dashboard Candidat (`user`)

#### Scénario PAY-001 : Modal de paiement bloquante au Login
1. **Prérequis :** Se connecter avec un compte de candidat nouvellement créé ou avec le compte test `candidat1.yamoussoukro@oge-academie.ci`.
2. **Étapes de test :**
   * Renseigner l'email et le mot de passe sur `/connexion`.
   * Valider la connexion.
3. **Résultat attendu :** L'utilisateur est connecté mais reste bloqué sur son dashboard par une boîte de dialogue modale en surimpression. Il est impossible de fermer cette modal. Elle affiche le lien marchand Wave CI configuré pour la zone géographique de Yamoussoukro ainsi que le numéro de téléphone associé pour les transferts manuels de 15 000 FCFA.

#### Scénario PAY-002 : Soumission de la preuve de versement
1. **Prérequis :** Être sur la modal bloquante de facturation (PAY-001).
2. **Étapes de test :**
   * Essayer d'uploader un fichier texte ou audio (devrait être refusé par le filtre d'extension).
   * Essayer d'uploader une image de plus de 5 Mo (devrait afficher une alerte d'erreur de taille).
   * Sélectionner un fichier image valide (reçu de paiement de test de moins de 5 Mo).
   * Valider l'upload.
3. **Résultat attendu :** Une barre de progression d'upload s'affiche à l'écran. Une fois le transfert terminé à 100%, l'écran se rafraîchit automatiquement (`router.refresh()`). Le statut du paiement du candidat passe à `en_cours` (À valider) sur son interface et le reçu est disponible dans le bucket privé Supabase Storage sous le dossier `userId/`.

#### Scénario PAY-003 : Validation du paiement par le Manager de Zone
1. **Prérequis :** Se connecter avec le compte manager `manager.yamoussoukro@oge-academie.ci`.
2. **Étapes de test :**
   * Naviguer vers l'espace `/zone/paiements`.
   * Repérer la ligne du candidat test `candidat1.yamoussoukro@oge-academie.ci`.
   * Cliquer sur le bouton d'inspection pour ouvrir la modal `CaptureViewer`.
   * Examiner le justificatif.
   * Cliquer sur le bouton vert "Valider le paiement".
3. **Résultat attendu :** Le statut de paiement du candidat passe à `valide` en base de données. Le champ `is_active` du profil passe immédiatement à `true`. Le manager voit le candidat disparaître de la liste des validations en attente.

#### Scénario PAY-004 : Accès libéré au Dashboard Candidat
1. **Prérequis :** Se reconnecter avec le compte du candidat test validé au scénario PAY-003.
2. **Étapes de test :**
   * Se connecter sur `/connexion`.
   * Accéder à l'index du dashboard `/dashboard`.
3. **Résultat attendu :** La modal bloquante n'apparaît plus. Le candidat accède à son tableau de bord complet, visualise ses concours d'inscription et peut naviguer dans les différents onglets de l'espace membre.

---

### 📚 3.3 Visualisation des Documents et Sécurité PDF

#### Scénario DOC-001 : Accès aux cours autorisés par concours
1. **Prérequis :** Se connecter avec le candidat test `candidat2.yamoussoukro@oge-academie.ci` (inscrit au concours INP-HB).
2. **Étapes de test :**
   * Cliquer sur l'onglet "Mes Documents".
   * Vérifier que la liste des cours affiche uniquement les PDF configurés pour "Tous" ou pour "INP-HB".
   * Essayer d'accéder via URL directe au visualiseur d'un document réservé aux étudiants de l'ESATIC.
3. **Résultat attendu :** La liste filtre correctement les cours. L'accès direct non autorisé par URL à un document d'un autre concours est bloqué côté serveur par la route API `/api/documents/[id]/view` qui renvoie un message d'erreur ou une redirection.

#### Scénario DOC-002 : Rendu PDF Sécurisé et Performance (PDF.js Retina + Lazy Rendering)
1. **Prérequis :** Cliquer sur un document PDF de cours pour ouvrir le visualiseur.
2. **Étapes de test :**
   * S'assurer que le cours se charge rapidement sans latence excessive de mémoire.
   * Faire défiler le document et vérifier que le rendu sur `<canvas>` HTML5 s'effectue uniquement lorsque les pages entrent dans le viewport (Lazy Rendering réactif).
   * Tester les boutons de zoom (Zoom In, Zoom Out, Ajuster à la largeur).
   * Changer le thème de lecture (Clair, Sombre, Sépia) et valider l'affichage.
   * Redimensionner l'écran en mode mobile et s'assurer qu'aucun débordement horizontal ne se produit.
3. **Résultat attendu :** Le visualiseur s'adapte parfaitement à toutes les tailles d'écrans. Le rendu paresseux préserve la mémoire du navigateur sur smartphone.

#### Scénario DOC-003 : Mesures anti-capture d'écran (Sécurité PDF active)
1. **Prérequis :** Le Super Admin a activé la sécurité PDF. Être sur l'écran du visualiseur PDF.
2. **Étapes de test :**
   * Effectuer un clic droit sur le document (doit être bloqué).
   * Tenter de copier du texte (le texte est protégé contre la sélection).
   * Tenter d'imprimer le document en effectuant un raccourci clavier `Ctrl+P` (l'action d'impression est interceptée et bloquée).
   * Changer d'onglet dans le navigateur pour simuler l'utilisation d'un outil de capture externe.
   * Revenir sur l'onglet du visualiseur.
3. **Résultat attendu :** Le visualiseur floute instantanément le cours dès que la fenêtre perd le focus (`blur` event). Un quadrillage de filigrane nominatif répété (Nom + Prénom du candidat) est apposé en surimpression sur chaque page. Aucun bouton de téléchargement direct n'est présent à l'écran.

#### Scénario DOC-004 : Désactivation globale de la Sécurité PDF
1. **Prérequis :** Se connecter en tant que Super Admin (`superadmin@oge-academie.ci`).
2. **Étapes de test :**
   * Sur le dashboard d'accueil admin, désactiver le switch switch de sécurité PDF "Restrictions de Sécurité PDF".
   * Se reconnecter avec le candidat test `candidat2.yamoussoukro@oge-academie.ci`.
   * Ouvrir le même cours PDF.
3. **Résultat attendu :** Le filigrane nominatif a disparu. Les restrictions anti-copie (clic droit, raccourci d'impression) sont inactives. Un bouton de téléchargement direct du PDF original est visible dans la barre d'outils et permet d'enregistrer le fichier localement.

---

### 🔊 3.4 Notifications et Carillon Sonore

#### Scénario NOT-001 : Réception en temps réel et carillon sonore
1. **Prérequis :** Se connecter avec le candidat test `candidat2.yamoussoukro@oge-academie.ci` sur son dashboard.
2. **Étapes de test :**
   * Dans un autre navigateur ou fenêtre privée, se connecter en Administrateur (`admin1@oge-academie.ci`).
   * Aller sur `/admin/notifications` et envoyer une annonce ciblée sur la zone Yamoussoukro.
   * Revenir immédiatement sur l'écran du candidat connecté.
3. **Résultat attendu :** Dans un délai maximum de 20 secondes, un carillon double-ton mélodieux (généré via Web Audio API) retentit sur le terminal du candidat. Une modal de notification premium s'ouvre au centre de son écran affichant l'annonce envoyée. Le candidat peut cliquer sur le bouton de marquage comme lu pour fermer la boîte de dialogue.

---

### 💼 3.5 Espace Manager de Zone (`manager_zone`)

#### Scénario MAN-001 : Séparation géographique et cloisonnement
1. **Prérequis :** Se connecter avec le manager de Yopougon (`manager.yopougon@oge-academie.ci`).
2. **Étapes de test :**
   * Naviguer sur `/zone/candidats`.
   * Vérifier que la grille de données affiche uniquement les candidats dont le profil indique la zone `yopougon`.
   * Tenter de consulter la fiche de paiement d'un candidat de Yamoussoukro en forçant son ID dans l'URL.
3. **Résultat attendu :** Le filtrage géographique est absolu. L'accès forcé par URL à un dossier d'une autre zone est rejeté avec un message d'erreur d'autorisation.

#### Scénario MAN-002 : Configuration des coordonnées de versement
1. **Prérequis :** Se connecter avec le manager de Bouaké (`manager.bouake@oge-academie.ci`).
2. **Étapes de test :**
   * Naviguer vers `/zone/parametres`.
   * Mettre à jour le lien marchand Wave, le numéro de téléphone de contact et l'adresse physique du centre de Bouaké.
   * Valider la modification.
3. **Résultat attendu :** Les modifications sont enregistrées dans la table `zone_config` en base de données. Tout nouveau candidat s'inscrivant à Bouaké visualisera instantanément ces nouveaux détails sur sa modal de paiement.

---

### 👑 3.6 Espace Administrateur Global (`admin`)

#### Scénario ADM-001 : Administration du CMS et de la Page d'Accueil
1. **Prérequis :** Se connecter avec le compte admin (`admin1@oge-academie.ci`).
2. **Étapes de test :**
   * Naviguer sur `/admin/contenu`.
   * Dans l'onglet "Nos Résultats", ajouter une ligne à la table des taux de réussite (ex : Année 2025, INP-HB 85%, CME 90%, ESATIC 88%). Sauvegarder.
   * Se déconnecter et retourner sur la page d'accueil `/`.
3. **Résultat attendu :** La table interactive des résultats de la page d'accueil affiche dynamiquement les nouvelles données saisies sans erreur d'affichage.

#### Scénario ADM-002 : Gestion du Blog et interactivité
1. **Prérequis :** Se connecter en admin. Aller sur `/admin/contenu` dans l'onglet Blog.
2. **Étapes de test :**
   * Rédiger un nouvel article de blog de test (Titre, Contenu, Concours visé).
   * Enregistrer en mode brouillon (Inactif).
   * Aller sur la page d'accueil et vérifier que l'article n'est pas visible dans la grille.
   * Retourner dans le CMS Admin et cliquer sur le bouton d'activation interactif pour passer le statut à "Actif (Publié)".
   * Retourner sur la page d'accueil publique.
3. **Résultat attendu :** L'article de blog apparaît instantanément dans la grille publique avec l'icône de visibilité correspondante.

#### Scénario ADM-003 : Double Contrôle pour l'Activation des Candidats
1. **Prérequis :** Un manager de zone a initié une demande de blocage ou réactivation de compte candidat.
2. **Étapes de test :**
   * Se connecter en admin.
   * Consulter les alertes "Demandes de double contrôle en attente" sur la page d'accueil de l'espace administration.
   * Cliquer sur "Approuver la demande".
3. **Résultat attendu :** L'état du profil du candidat est mis à jour de manière sécurisée en base de données. La demande est retirée des actions en attente de l'administrateur.

---

## 🔒 4. SCÉNARIOS DE SÉCURITÉ TECHNIQUE & INTÉGRATIONS

### 🛡️ 4.1 Chiffrement PDF AES-256-CBC
1. **Scénario :** Téléversement d'un nouveau document PDF par l'administration.
2. **Action attendue :** La route d'API `/api/admin/documents/upload` intercepte le fichier, génère une clé de dérivation dynamique SHA-256, chiffre le fichier en mémoire avec l'algorithme AES-256-CBC, puis téléverse le binaire chiffré dans le bucket privé.
3. **Validation :** Si un utilisateur tente d'accéder au fichier directement sur le bucket de stockage Supabase sans passer par la route sécurisée de décryptage à la volée `/api/documents/[id]/view`, le fichier téléchargé est illisible et corrompu.

### 🛡️ 4.2 Alimentation des Logs d'Accès (`acces_documents`)
1. **Scénario :** Un candidat ouvre un cours sur le visualiseur.
2. **Action attendue :** Au chargement de la page de visualisation serveur, une ligne d'historique de consultation contenant le `user_id`, le `document_id` et un horodatage précis (`created_at`) est automatiquement insérée dans la table `acces_documents`.
3. **Validation :** L'administrateur peut visualiser ces logs dans la base pour s'assurer du respect des règles anti-fraude.

### 🛡️ 4.3 RGPD & Bandeau de Consentement des Cookies
1. **Scénario :** Première visite d'un internaute sur la plateforme.
2. **Action attendue :** Le bandeau de consentement s'affiche en bas de l'écran.
3. **Validation :** Cliquer sur "Accepter". Rafraîchir la page. Le bandeau ne doit plus apparaître. Vérifier dans la console de développement du navigateur (Application > LocalStorage) qu'une clé de consentement de cookie a bien été enregistrée et persiste.

### 🛡️ 4.4 SEO Local & Données Structurées JSON-LD
1. **Scénario :** Audit d'indexation SEO.
2. **Action attendue :** La plateforme génère dynamiquement un plan de site valide `/sitemap.xml` et un fichier de directives `/robots.txt`.
3. **Validation :** Inspecter le code source de la page d'accueil `/` et vérifier la présence des balises `<script type="application/ld+json">` de type `EducationalOrganization` contenant la liste des centres locaux ivoiriens de préparation physique, les tarifs en FCFA (XOF), et le ciblage des étudiants des lycées d'excellence d'Abidjan et Yamoussoukro.

---

## ⚠️ 5. CAS LIMITES ET MESSAGES D'ERREURS D'INTERFACE

* **Reçu trop volumineux :** L'uploader bloque instantanément les fichiers > 5 Mo et affiche : *"Le fichier est trop volumineux. La taille maximale autorisée est de 5 Mo."*
* **Format de reçu invalide :** Uploader un fichier `.docx` ou `.zip`. L'uploader affiche un message d'erreur : *"Format de fichier non pris en charge. Veuillez uploader une image (PNG, JPG) ou un PDF."*
* **Mot de passe de récupération expiré :** Cliquer sur un lien de réinitialisation de mot de passe datant de plus de 24h. L'interface doit afficher un message clair : *"Le lien de réinitialisation a expiré. Veuillez effectuer une nouvelle demande."*
* **Identifiants invalides :** Saisir un e-mail inexistant ou un mauvais mot de passe sur `/connexion`. Le système renvoie l'alerte toast : *"Identifiants incorrects. Veuillez réessayer."*

---

## 📋 6. FICHE DE VALIDATION (MODÈLE À REMPLIR)

| Réf Test | Module testé | Description du test | Testeur | Date | Statut (PASS/FAIL) | Remarques / Anomalies |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **ONB-001** | Espace Public | Navigation Page d'accueil & WhatsApp | | | | |
| **ONB-002** | Inscription | Onboarding candidat en 3 étapes | | | | |
| **PAY-001** | Facturation | Blocage modal pour candidat non payé | | | | |
| **PAY-002** | Facturation | Upload du reçu de versement Wave | | | | |
| **PAY-003** | Zone Manager | Validation du reçu par le Manager | | | | |
| **PAY-004** | Espace Candidat| Libération de l'accès au Dashboard | | | | |
| **DOC-001** | Espace Candidat| Filtrage des cours par concours | | | | |
| **DOC-002** | Sécurité PDF | Lazy rendering et Zoom PDF.js | | | | |
| **DOC-003** | Sécurité PDF | Anti-capture (clic droit, Ctrl+P, blur) | | | | |
| **DOC-004** | Sécurité PDF | Switch admin de désactivation sécurité| | | | |
| **NOT-001** | Notifications | Réception temps réel & carillon sonore | | | | |
| **MAN-001** | Zone Manager | Cloisonnement des données de zone | | | | |
| **MAN-002** | Zone Manager | Config Wave & adresse du centre | | | | |
| **ADM-001** | Admin CMS | Mise à jour de la table des résultats | | | | |
| **ADM-002** | Admin CMS | Activation/Désactivation blog interactif| | | | |
| **ADM-003** | Admin Double | Validation double contrôle activation | | | | |
