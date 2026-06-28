# Fourtour — Session du 28 Juin 2026

## 🎯 Sujet : Tarification à 2 %, Contacts Concepteur & Clauses de SLA/Responsabilité

Cette session a permis de :
1. Mettre à jour la proposition commerciale et le contrat de partenariat pour la plateforme OGE Académie afin de supprimer tous les frais initiaux (0 FCFA) et d'y inscrire les coordonnées réelles du Concepteur.
2. Ajouter des clauses de Délais de Support & Réaction (SLA) (4h ouvrables de 8h à 20h en saison de juillet-octobre) et de Limitation de Responsabilité financière (plafonnée au montant des commissions à 2 % de la campagne annuelle en cours).
3. Intégrer dynamiquement les coordonnées du Concepteur (+225 0503681588 et krsidoine7@gmail.com) dans le pied de page (Footer) du site public.
4. Rendre ces coordonnées modifiables uniquement par le Super-Administrateur via la page de configuration globale.

## 📝 Choix de Conception
* **Zéro Frais d'Entrée (0 FCFA) :** La proposition stipule désormais explicitement que les entrepreneurs ne paient aucun frais de mise en route, de configuration, de nom de domaine ou d'installation à la signature du contrat.
* **Intégration Contractuelle :** Coordonnées de contact du Concepteur insérées directement dans le texte de la proposition et du contrat de partenariat (Auteur, Signature, Désignation).
* **Délais de Réaction (SLA) :** Clause d'assistance sous 4 heures ouvrables en journée (8h - 20h) pendant la saison active (juillet-octobre). Traitement des demandes nocturnes ou non critiques le lendemain pour limiter les interventions de nuit.
* **Capping Financier de Responsabilité :** Clause limitant la responsabilité civile/financière globale du Concepteur en cas de bug ou de perte de données à hauteur du total des commissions perçues sur la campagne en cours, sécurisant juridiquement le Concepteur.
* **Affichage Dynamique dans le Footer :** Affichage d'un bloc de contact technique (Email + lien WhatsApp généré dynamiquement avec le libellé "Créé par :") dans le Footer du site public.
* **Sécurisation de l'Édition (Super-Admin) :** Deux nouveaux champs d'édition ont été intégrés dans le formulaire de paramètres système (`SettingsForm.tsx`), masqués aux administrateurs classiques et accessibles uniquement aux Super-Admins.
* **Préservation de la Configuration :** La fonction `updateSystemConfig` a été réécrite pour effectuer un merge JSON de la configuration en base de données afin de ne pas perdre de paramètres tiers (comme la sécurité PDF).
* **Conservation Unique du Fichier DOCX :** Le fichier source Markdown `.md` a été supprimé afin de ne conserver que la version finale compilée `.docx` dans les dossiers de compétences.
* **Arguments du Script de Compilation :** Modification de `scripts/convert_to_docx.py` pour lui permettre d'accepter des arguments en ligne de commande.

## 📁 Fichiers Affectés
* **[.skills/ChefsOge/proposition_commerciale_oge.docx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/.skills/ChefsOge/proposition_commerciale_oge.docx)** [MODIFY] : Proposition commerciale et contrat compilés contenant les coordonnées, la tarification, le SLA et la limitation de responsabilité.
* **[.skills/ChefsOge/proposition_commerciale_oge.md](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/.skills/ChefsOge/proposition_commerciale_oge.md)** [DELETE] : Suppression du fichier source Markdown.
* **[scripts/convert_to_docx.py](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/scripts/convert_to_docx.py)** [MODIFY] : Support des arguments d'entrée/sortie sur la ligne de commande.
* **[app/page.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/page.tsx)** [MODIFY] : Récupération de `system_config` et affichage dynamique des contacts concepteurs dans le pied de page.
* **[app/(admin)/admin/actions.ts](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/(admin)/admin/actions.ts)** [MODIFY] : Mise à jour de `updateSystemConfig` avec merge JSON sécurisé et support des champs concepteurs.
* **[app/(admin)/admin/parametres/page.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/(admin)/admin/parametres/page.tsx)** [MODIFY] : Passage des valeurs par défaut des champs concepteurs à `SettingsForm`.
* **[app/(admin)/admin/parametres/SettingsForm.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/(admin)/admin/parametres/SettingsForm.tsx)** [MODIFY] : Interface et affichage des champs d'édition pour Super-Admin.
* **[app/(public)/connexion/page.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/(public)/connexion/page.tsx)** [MODIFY] : Retrait de la case obligatoire des CGU et de la politique de confidentialité sur la page de connexion et mise à jour de son schéma de validation.
* **[app/(admin)/admin/documents/DocumentsManagerClient.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/(admin)/admin/documents/DocumentsManagerClient.tsx)** [MODIFY] : Intégration de la modale de confirmation `Dialog` premium avec la cartographie d'impact des actions.
* **[manifeste_modules.md](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/manifeste_modules.md)** [MODIFY] : Ajout des versions 1.17, 1.18, 1.19 et 1.20 dans l'historique du manifeste.
* **[memoire-oge-academie/wiki/Session_2026-06-28_Proposition_Commerciale.md](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/memoire-oge-academie/wiki/Session_2026-06-28_Proposition_Commerciale.md)** [MODIFY] : Fiche wiki de la proposition mise à jour.
* **[memoire-oge-academie/wiki/Session_2026-06-28_Documents_Confirmation.md](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/memoire-oge-academie/wiki/Session_2026-06-28_Documents_Confirmation.md)** [NEW] : Fiche wiki de la modale de confirmation.
* **[memoire-oge-academie/fourtour/Session_2026-06-28_Fourtour.md](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/memoire-oge-academie/fourtour/Session_2026-06-28_Fourtour.md)** [MODIFY] : Ce journal de session.

