# Wiki — Session du 21 Juin 2026 : Structure & Validation du Cahier de Recette

Ce document synthétise la structure et l'utilisation du **Cahier de Recette Fonctionnel & Technique** mis en place pour la plateforme OGE Académie.

## 📌 Objectif
Le cahier de recette a été conçu pour permettre une validation pas-à-pas de l'intégralité des fonctionnalités de l'application Next.js 15, avant tout déploiement final ou livraison de version. Il s'assure du bon fonctionnement métier, de la sécurité technique (chiffrement PDF, anti-capture, RLS) et des intégrations (Google Meet, webhooks Make/n8n, Resend).

## 🗂️ Fichiers Créés
Les documents se trouvent à la racine et dans les scripts du projet :
* **[cahier_de_recette.md](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/cahier_de_recette.md)** : Cahier de recette au format Markdown.
* **[cahier_de_recette.docx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/cahier_de_recette.docx)** : Cahier de recette au format Microsoft Word (généré et mis en page).
* **[scripts/convert_to_docx.py](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/scripts/convert_to_docx.py)** : Script de compilation de Markdown vers Word.

## 📄 Structure du Protocole
Le cahier de recette se décline en plusieurs sections :
1. **Comptes et Jeux de données de test** : Référence directe des profils réels en DB pour chaque rôle (Candidats, Managers, Admins, Super Admin) et zone locale.
2. **Droits et Fonctionnalités par Rôle** : Tableau comparatif structuré détaillant les permissions accordées et refusées pour chaque intervenant.
3. **Scénarios de test fonctionnels** :
   - Onboarding & Inscription multi-étapes (3 étapes).
   - Modal de paiement bloquante, liens Wave et formulaires de reçus.
   - Dashboard candidat, filtres et visualiseur PDF sécurisé.
   - Carillons sonores de notifications temps réel (API Web Audio).
   - Espaces et cloisonnement des Managers de Zone.
   - CMS Admin, CMS Blog et boutons d'activation de publication.
4. **Scénarios de Sécurité & Technique** :
   - Chiffrement AES-256-CBC des PDF en stockage privé.
   - Alimentation automatique de la table `acces_documents`.
   - Consentement des cookies RGPD (LocalStorage).
   - SEO local ivoirien (robots.ts, sitemap.ts et données structurées JSON-LD `EducationalOrganization`).
5. **Gestion des Cas Limites et Erreurs** : Tailles de fichiers > 5 Mo, formats de fichiers refusés, tokens de réinitialisation expirés.
6. **Grille de validation vierge** : Pour le suivi manuel par un testeur.
