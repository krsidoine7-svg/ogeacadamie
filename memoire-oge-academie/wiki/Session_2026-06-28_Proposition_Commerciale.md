# Session du 28 Juin 2026 : Mise à jour de la Proposition Commerciale OGE Académie

## 📝 Contexte et Demande
L'utilisateur a demandé d'ajuster la proposition commerciale et le contrat de partenariat (`.skills/ChefsOge/proposition_commerciale_oge.docx`). Suite aux retours, les entrepreneurs d'OGE Académie ne doivent payer aucun frais initial (0 FCFA au démarrage, que ce soit pour l'installation, la mise en route ou le remboursement de l'achat du nom de domaine). La rémunération du Concepteur se fera exclusivement via la commission récurrente de 2 % sur chaque inscription d'élève validée sur la plateforme.

De plus, l'utilisateur a exigé que seule la version `.docx` soit conservée dans `.skills/ChefsOge/`, demandant de supprimer définitivement le fichier source `.md`.

## 🛠️ Modifications Effectuées

### 1. Script de conversion Markdown vers Word (`scripts/convert_to_docx.py`)
- Ajout du support pour les arguments en ligne de commande afin de pouvoir spécifier le fichier d'entrée (`.md`) et le fichier de sortie (`.docx`) dynamiquement.
- Conservation du comportement par défaut avec `cahier_de_recette.md` s'il n'y a pas d'arguments.

### 2. Contenu de la Proposition Commerciale (dans `.md` avant suppression)
- **Frais d'Installation initiaux :** Passés de `150 000 FCFA` à `0 FCFA` (mention explicite que les entrepreneurs ne paient rien lors du lancement).
- **Nom de Domaine :** Achat et configuration par le Concepteur sans frais d'acquisition ou de remboursement exigés au démarrage.
- **Article 2 (Frais initiaux) :** Modifié pour refléter l'absence totale de frais de mise en route ou d'installation à la signature (0 FCFA).

### 3. Compilation et Nettoyage
- Compilation du fichier `.md` mis à jour en `.docx` via le script `convert_to_docx.py`.
- Suppression physique du fichier `.skills/ChefsOge/proposition_commerciale_oge.md` comme demandé par l'utilisateur.

### 4. Contacts du Concepteur & Footer
- **Proposition Commerciale :** Remplacement de `[Votre Nom]` et `[Votre Adresse]` par l'identité et les coordonnées réelles du concepteur : M. Sidoine K. (krsidoine7@gmail.com, +225 0503681588).
- **Footer Public :** Intégration dynamique des contacts du Concepteur (Email et bouton de contact WhatsApp avec le libellé "Créé par :") dans le pied de page public de la page d'accueil (`app/page.tsx`).
- **Dashboard Paramètres :** Ajout de deux champs dans la console d'administration (`app/(admin)/admin/parametres/page.tsx` et `SettingsForm.tsx`), éditables uniquement par le rôle `super_admin`, pour modifier dynamiquement les coordonnées du Concepteur stockées dans `system_config`.
- **Actions API :** Mise à jour de la fonction `updateSystemConfig` dans `app/(admin)/admin/actions.ts` pour supporter et sauvegarder de manière sécurisée ces nouveaux champs en effectuant une fusion JSON.

### 5. Clauses de SLA et de Limitation de Responsabilité
- **Panne Critique (SLA) :** Définition d'un délai d'assistance technique de 4 heures ouvrables en journée (de 8h00 à 20h00) durant la période active de juillet à octobre. Pas d'intervention de nuit garantie.
- **Plafond Financier de Responsabilité :** Capping de la responsabilité civile et financière globale du Concepteur en cas de bug ou de perte de données à hauteur du montant total des commissions perçues lors de la campagne annuelle concernée.
- **Ajout Contractuel :** Les clauses ont été rédigées dans les sections 3 et 4 et formalisées sous l'**Article 7** du contrat.

### 6. Correction Page de Connexion
- **Retrait case CGU :** Suppression de la case obligatoire d'acceptation des CGU et de la politique de confidentialité sur la page de connexion (`app/(public)/connexion/page.tsx`), cette case n'étant obligatoire que lors de l'inscription.
- **Mise à jour du schéma Zod :** Nettoyage de `loginSchema` dans le même fichier pour retirer la validation de `acceptTerms`.

## 📄 Fichiers Modifiés ou Supprimés
- **Mis à jour (compilé) :** [proposition_commerciale_oge.docx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/.skills/ChefsOge/proposition_commerciale_oge.docx)
- **Mis à jour :** [convert_to_docx.py](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/scripts/convert_to_docx.py)
- **Mis à jour :** [actions.ts](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/(admin)/admin/actions.ts)
- **Mis à jour :** [page.tsx (admin/parametres)](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/(admin)/admin/parametres/page.tsx)
- **Mis à jour :** [SettingsForm.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/(admin)/admin/parametres/SettingsForm.tsx)
- **Mis à jour :** [page.tsx (homepage)](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/page.tsx)
- **Mis à jour :** [page.tsx (connexion)](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/(public)/connexion/page.tsx)
- **Supprimé :** `.skills/ChefsOge/proposition_commerciale_oge.md`
- **Mis à jour (Manifeste) :** [manifeste_modules.md](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/manifeste_modules.md)

