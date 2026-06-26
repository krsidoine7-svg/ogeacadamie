# Fourtour — Session du 21 Juin 2026

## 🎯 Sujet : Création du Cahier de Recette Fonctionnel & Technique

Cette session a été consacrée à la création et à l'intégration d'un cahier de recette complet pour la plateforme OGE Académie.

## 📝 Choix de Conception & Échanges avec l'Utilisateur
* **Emplacement** : Suite aux préférences de l'utilisateur (commande `/grill-me`), le cahier de recette a été positionné à la racine du projet sous le nom de `cahier_de_recette.md`, et a été référencé dans le manifeste des modules pour en assurer le suivi.
* **Format des Droits** : À la demande finale de l'utilisateur, les droits et fonctionnalités de chaque intervenant (Candidat, Manager de Zone, Admin, Super Admin) ont été présentés sous la forme d'un **tableau comparatif structuré** pour plus de clarté visuelle et de compacité.
* **Aspects Techniques additionnels** : Le document intègre des protocoles de test pour la sécurité avancée (chiffrement PDF AES-256-CBC, alimentation automatique de `acces_documents`), le double contrôle manager/admin, le consentement RGPD local et le référencement SEO ivoirien (sitemap, robots et JSON-LD `EducationalOrganization`).

## 📁 Fichiers Affectés
* **[cahier_de_recette.md](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/cahier_de_recette.md)** [NEW] : Fichier officiel du cahier de recette au format Markdown.
* **[cahier_de_recette.docx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/cahier_de_recette.docx)** [NEW] : Version Microsoft Word (.docx) mise en page du cahier de recette.
* **[scripts/convert_to_docx.py](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/scripts/convert_to_docx.py)** [NEW] : Script Python de compilation Markdown vers Word.
* **[manifeste_modules.md](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/manifeste_modules.md)** [MODIFY] : Ajout de la liaison vers le cahier de recette (formats MD et DOCX) et le script.
* **[memoire-oge-academie/wiki/Session_2026-06-21_Cahier_Recette.md](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/memoire-oge-academie/wiki/Session_2026-06-21_Cahier_Recette.md)** [NEW] : Fiche wiki résumant la structure du protocole.
* **[memoire-oge-academie/fourtour/Session_2026-06-21_Fourtour.md](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/memoire-oge-academie/fourtour/Session_2026-06-21_Fourtour.md)** [NEW] : Ce journal de session.

## ⏭️ Prochaines Étapes
1. Déploiement et tests manuels sur la plateforme en suivant les protocoles de validation décrits.
2. Remplissage de la grille de validation finale pour acter le bon fonctionnement de la V1.
