<!-- Dernière mise à jour : Mai 2026 -->

# INDEX.md — Table des Matières du Wiki
## Favor Company International — Mémoire Externe

> Point d'entrée unique du wiki. Tous les fichiers sont listés ici avec leur description.  
> Mettre à jour à chaque ajout d'un nouveau fichier.

---

## 🗂️ Navigation Rapide

| Je cherche... | Je vais dans... |
|---|---|
| Vision et objectifs du projet | [projet/vision.md](#projet) |
| Architecture technique | [projet/architecture.md](#projet) |
| État d'avancement (roadmap) | [projet/roadmap.md](#projet) |
| Une décision technique | [decisions/decisions-technique.md](#decisions) |
| Une décision business | [decisions/decisions-business.md](#decisions) |
| Un bug TypeScript | [erreurs/typescript.md](#erreurs) |
| Un bug Supabase / RLS | [erreurs/supabase.md](#erreurs) |
| Un bug Paystack | [erreurs/paystack.md](#erreurs) |
| Un bug Next.js | [erreurs/nextjs.md](#erreurs) |
| Un pattern backend validé | [bonnes-pratiques/patterns-backend.md](#bonnes-pratiques) |
| Un pattern frontend validé | [bonnes-pratiques/patterns-frontend.md](#bonnes-pratiques) |
| La doc Supabase du projet | [stack/supabase.md](#stack) |
| La doc Paystack du projet | [stack/paystack.md](#stack) |
| Le résumé d'une session | [sessions/](#sessions) |
| Le style de travail | [personnes/profil-travail.md](#personnes) |

---

## 📁 projet/

| Fichier | Description | Dernière MAJ |
|---|---|---|
| `projet/vision.md` | Objectifs business, cible, valeur ajoutée | Mai 2026 |
| `projet/architecture.md` | Architecture technique macro du projet | Mai 2026 |
| `projet/roadmap.md` | MVP_1 → MVP_4, features et statuts | Mai 2026 |
| `projet/rbac.md` | Rôles, permissions, RBAC granulaire | Mai 2026 |
| `projet/services.md` | Services proposés par Favor Company | Mai 2026 |

**Relations :** Ces fichiers sont la source de vérité du projet. Ils sont liés aux decisions/ et à la roadmap dans TASKS.md.

---

## 📋 decisions/

| Fichier | Description | Dernière MAJ |
|---|---|---|
| `decisions/decisions-technique.md` | Choix stack, ORM, patterns, outils | — |
| `decisions/decisions-business.md` | Processus métier, pricing, fonctionnel | — |
| `decisions/decisions-securite.md` | Choix sécurité, chiffrement, politique | — |
| `decisions/decisions-ui.md` | Choix design system, couleurs, composants | — |

**Format de chaque décision :**
```
Date | Décision | Contexte | Raison | Alternative rejetée | Liens
```

---

## 🐛 erreurs/

| Fichier | Description | Dernière MAJ |
|---|---|---|
| `erreurs/typescript.md` | Erreurs TypeScript et solutions | — |
| `erreurs/supabase.md` | Erreurs Supabase, RLS, Auth | — |
| `erreurs/paystack.md` | Erreurs Paystack, webhooks, paiements | — |
| `erreurs/nextjs.md` | Erreurs Next.js, build, routing | — |
| `erreurs/drizzle.md` | Erreurs Drizzle ORM, migrations | — |
| `erreurs/general.md` | Autres erreurs non catégorisées | — |

**Relations :** Chaque bug résolu dans erreurs/ a une référence vers la session fourtour où il a été résolu.

---

## ✅ bonnes-pratiques/

| Fichier | Description | Dernière MAJ |
|---|---|---|
| `bonnes-pratiques/patterns-backend.md` | Server Actions, webhooks, auth | — |
| `bonnes-pratiques/patterns-frontend.md` | Composants, UI, responsive | — |
| `bonnes-pratiques/patterns-db.md` | Drizzle, RLS, migrations | — |
| `bonnes-pratiques/patterns-securite.md` | Chiffrement AES, validation, OWASP | — |
| `bonnes-pratiques/patterns-paiement.md` | Paystack, webhooks, idempotence | — |
| `bonnes-pratiques/workflow-git.md` | Branches, commits, CI/CD | — |

---

## 🛠️ stack/

| Fichier | Description | Dernière MAJ |
|---|---|---|
| `stack/nextjs.md` | Patterns Next.js App Router utilisés | — |
| `stack/supabase.md` | Config Supabase, RLS, Realtime | — |
| `stack/paystack.md` | Intégration Paystack CI | — |
| `stack/drizzle.md` | Schéma, migrations, queries Drizzle | — |
| `stack/tailwind-shadcn.md` | Design tokens, composants shadcn/ui | — |
| `stack/cloudflare-r2.md` | Upload, URLs signées, R2 | — |
| `stack/resend.md` | Templates emails, envoi transactionnel | — |

---

## 📅 sessions/

| Fichier | Description |
|---|---|
| `sessions/2026-05-10.md` | Session 001 — Setup projet + documentation |
| `sessions/2026-06-18.md` | Session 002 — Réorganisation ChefsOge et setup Supabase & Drizzle |

**Relations :** Chaque résumé de session pointe vers le fichier fourtour correspondant.

---

## 👤 personnes/

> ⚠️ AUCUNE donnée personnelle identifiable. Uniquement le profil de travail.

| Fichier | Description | Dernière MAJ |
|---|---|---|
| `personnes/profil-travail.md` | Style de travail, préférences, rythme | — |
| `personnes/preferences-techniques.md` | Outils préférés, façon de coder | — |
| `personnes/contexte-projet.md` | Contexte business (anonymisé) | — |

---

## 🔗 Relations entre les sections

```
projet/architecture.md
    ↕ lié à
decisions/decisions-technique.md
    ↕ lié à
stack/*.md (détails d'implémentation)
    ↕ lié à
bonnes-pratiques/*.md (patterns validés)
    ↕ lié à
erreurs/*.md (bugs rencontrés en appliquant ces patterns)
    ↕ tous référencent
sessions/*.md → fourtour/*.md (journal source)
```

---

## 📝 Comment maintenir cet index

À chaque création d'un nouveau fichier dans le wiki :
1. Ajouter une ligne dans le tableau de la section correspondante
2. Décrire brièvement le contenu du fichier
3. Mettre à jour la date
4. Vérifier si des relations existent avec d'autres fichiers → les documenter

---

*Index créé : Mai 2026 | Mis à jour : automatiquement à chaque session*
