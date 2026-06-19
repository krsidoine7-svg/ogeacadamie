# MEMOIRE_GUIDE.md — Guide du Système de Mémoire Externe
## Favor Company International

> **Ce fichier explique comment fonctionne, s'alimente, se met à jour et s'utilise la mémoire externe du projet.**  
> À lire en premier. Toujours maintenu à jour.

---

## 🗂️ Structure Générale

```
memoire-oge-academie/
│
├── MEMOIRE_GUIDE.md          ← CE FICHIER (lire en premier)
│
├── fourtour/                 ← JOURNAL BRUT — tout, sans exception
│   ├── 2026-05-10_session-001.md
│   ├── 2026-05-11_session-002.md
│   └── ...
│
└── wiki/                     ← MÉMOIRE ORGANISÉE — propre et structurée
    ├── INDEX.md              ← Table des matières du wiki (liens vers tout)
    ├── projet/               ← Vision, scope, stack, architecture
    ├── decisions/            ← Décisions techniques et business prises
    ├── erreurs/              ← Bugs rencontrés et solutions trouvées
    ├── bonnes-pratiques/     ← Ce qui marche bien, patterns validés
    ├── stack/                ← Documentation des outils et intégrations
    ├── sessions/             ← Résumés condensés par session
    └── personnes/            ← Profil de travail (SANS données sensibles)
```

---

## 📁 Le Dossier `fourtour/` — Journal Brut

### Qu'est-ce que c'est ?
Le **journal de bord complet et automatique**. Chaque échange, chaque décision, chaque erreur, chaque idée est enregistrée ici **sans exception** et **dans l'ordre chronologique**.

### Règle de nommage des fichiers
```
AAAA-MM-JJ_session-NNN.md
Ex : 2026-05-10_session-001.md
     2026-05-11_session-002.md
```

### Comment ajouter une entrée

**Automatiquement** : à chaque fin de session de travail, l'IA crée ou met à jour le fichier du jour.

**Manuellement** : créer un nouveau fichier avec la date du jour et écrire dedans.

### Format d'un fichier fourtour

```markdown
# Session 001 — 10 Mai 2026

## Contexte
Ce qu'on faisait, le point de départ de la session.

## Échanges & Décisions
- [10:30] Décidé d'utiliser Drizzle ORM plutôt que Prisma → raison : plus léger
- [11:00] Problème avec le webhook Paystack → la signature n'était pas validée
- [11:45] Solution trouvée : lire le body avec request.text() AVANT JSON.parse()
- [14:00] Feature F04 catalogue biens commencée

## Idées notées
- Ajouter un système de favoris pour les biens plus tard (MVP_2)
- Vérifier la compatibilité Wave CI avec Paystack

## Erreurs rencontrées
- [ERR-001] Type error sur BienCard : props `prix` était `string` au lieu de `number`
- [ERR-002] Build failed : import manquant dans reservations.ts

## État fin de session
- Feature F04 : 60% terminée
- Prochaine action : finir la page de détail du bien (slug)

## Mots-clés
#paystack #webhook #drizzle #catalogue #biens #typescript
```

### Ce qu'on enregistre TOUJOURS dans fourtour
- ✅ Toutes les décisions prises (même petites)
- ✅ Tous les bugs rencontrés
- ✅ Toutes les solutions trouvées
- ✅ Toutes les idées mentionnées
- ✅ L'état d'avancement de chaque feature
- ✅ Les questions posées et réponses obtenues
- ✅ Les changements de cap ou de priorité
- ✅ Les outils ou packages ajoutés ou abandonnés

### Ce qu'on N'enregistre JAMAIS (données sensibles)
Les données sensibles sont **masquées automatiquement** avant tout enregistrement :

| Type de donnée | Format enregistré |
|---|---|
| Nom d'une personne | `{{nom_personne}}` |
| Numéro de téléphone | `{{tel_+225_XXXXXXXX}}` |
| Email personnel | `{{email_personnel}}` |
| Clé API / Token | `{{cle_api_paystack}}` / `{{token_supabase}}` |
| Mot de passe | `{{mot_de_passe}}` |
| Numéro CNI / Passeport | `{{cni_numero}}` |
| Adresse personnelle | `{{adresse_personnelle}}` |
| Données bancaires | `{{donnees_bancaires}}` |
| ENCRYPTION_KEY | `{{encryption_key}}` |

**Exemple :**
```
❌ À ne pas écrire : "Le client Jean Kouassi au 0707070707 a payé..."
✅ Ce qu'on écrit  : "Le client {{nom_personne}} au {{tel_+225_XXXXXXXX}} a payé..."
```

---

## 📚 Le Dossier `wiki/` — Mémoire Organisée

### Qu'est-ce que c'est ?
La **mémoire propre, structurée et navigable**. Ce n'est pas un journal brut — c'est une base de connaissance organisée où chaque information a sa place logique et des liens vers les autres informations liées.

### Sous-dossiers et leur rôle

#### `wiki/projet/`
Tout ce qui décrit le projet dans sa globalité.
- `vision.md` — Objectifs, cible, raison d'être de Favor Company
- `architecture.md` — Vue macro de l'architecture technique
- `roadmap.md` — MVP_1 → MVP_4, état d'avancement
- `rbac.md` — Rôles et permissions du système

#### `wiki/decisions/`
Toutes les décisions importantes prises, avec le contexte et les raisons.
- `decisions-technique.md` — Choix de stack, patterns, outils
- `decisions-business.md` — Choix fonctionnels, processus métier
- Format : Date + Décision + Contexte + Raison + Alternative rejetée

#### `wiki/erreurs/`
Catalogue des bugs rencontrés et leurs solutions.
- `typescript.md` — Erreurs TypeScript
- `supabase.md` — Erreurs Supabase / RLS
- `paystack.md` — Erreurs Paystack
- `nextjs.md` — Erreurs Next.js / build
- Format : Symptôme + Cause + Solution + Comment éviter

#### `wiki/bonnes-pratiques/`
Ce qui a été validé comme fonctionnant bien dans ce projet.
- `patterns-backend.md` — Server Actions, webhooks, auth
- `patterns-frontend.md` — Composants, UI, responsive
- `patterns-db.md` — Drizzle, RLS, migrations
- `patterns-securite.md` — Chiffrement, validation, sécurité

#### `wiki/stack/`
Documentation condensée et spécifique au projet des outils utilisés.
- `nextjs.md` — Ce qu'on utilise de Next.js dans ce projet
- `supabase.md` — Config Supabase, RLS, Realtime
- `paystack.md` — Intégration Paystack CI
- `drizzle.md` — Schéma, migrations, queries
- `tailwind-shadcn.md` — Design tokens, composants UI

#### `wiki/sessions/`
Résumés condensés de chaque session (extrait de fourtour/).
- `2026-05-10.md` — Résumé session 001
- `2026-05-11.md` — Résumé session 002

#### `wiki/personnes/`
Profil de travail de l'utilisateur — **JAMAIS de données personnelles identifiables**.
- `profil-travail.md` — Style de travail, préférences, habitudes
- `preferences-techniques.md` — Outils préférés, façon de coder

---

## ✏️ Comment AJOUTER des informations

### Ajouter une entrée rapide (fourtour)
```markdown
<!-- Dans le fichier du jour : fourtour/AAAA-MM-JJ_session-NNN.md -->
- [HH:MM] [DÉCISION] Choix de X parce que Y
- [HH:MM] [BUG] Erreur sur Z → Solution : ...
- [HH:MM] [IDÉE] Penser à ajouter W dans MVP_2
```

### Ajouter une décision dans le wiki
```markdown
<!-- Dans wiki/decisions/decisions-technique.md -->

## [2026-05-10] Utiliser Drizzle ORM

**Contexte :** Choix de l'ORM pour Supabase/PostgreSQL
**Décision :** Utiliser Drizzle ORM
**Raison :** Plus léger que Prisma, meilleur support TypeScript, migrations simples
**Alternative rejetée :** Prisma — trop lourd pour ce projet
**Lien :** voir wiki/stack/drizzle.md pour les détails d'utilisation
```

### Ajouter un bug résolu dans le wiki
```markdown
<!-- Dans wiki/erreurs/paystack.md -->

## [ERR-042] Webhook signature invalide

**Symptôme :** Webhook Paystack rejeté avec erreur "Invalid signature"
**Cause :** Le body était parsé en JSON AVANT la validation de signature
**Solution :**
  1. Lire le body avec `request.text()` (pas `request.json()`)
  2. Valider la signature HMAC-SHA512 sur le texte brut
  3. ENSUITE faire `JSON.parse(body)`
**Code corrigé :** voir wiki/bonnes-pratiques/patterns-securite.md
**Date résolu :** 2026-05-10
**Référence fourtour :** session-001 → ERR-001
```

### Ajouter une bonne pratique validée
```markdown
<!-- Dans wiki/bonnes-pratiques/patterns-backend.md -->

## Pattern : Validation Webhook Paystack

**Validé le :** 2026-05-10
**Contexte :** Feature F06 — Paiements Paystack
**Pattern :**
  1. `const body = await request.text()` — lire en texte
  2. Calculer HMAC-SHA512 avec PAYSTACK_WEBHOOK_SECRET
  3. Comparer avec x-paystack-signature header
  4. Rejeter avec 401 si invalide
  5. `const event = JSON.parse(body)` — parser seulement après validation
**Lien :** wiki/stack/paystack.md | docs/INTÉGRATION_PAYSTACK.md
```

---

## 🔄 Comment MODIFIER des informations

### Modifier une entrée fourtour
Les fichiers fourtour sont **immuables** — ne jamais modifier une entrée passée.  
Pour corriger : ajouter une note à la suite avec la mention `[CORRECTION]` :
```markdown
- [14:00] [CORRECTION de 11:45] La vraie solution est X, pas Y comme noté plus tôt
```

### Modifier le wiki
Le wiki est **vivant** — modifier directement le fichier concerné.  
Toujours noter la date de modification en haut du fichier :
```markdown
<!-- Dernière mise à jour : 2026-05-15 -->
```

### Mettre à jour une décision
Si une décision change, ne pas supprimer l'ancienne — ajouter un bloc `[MISE À JOUR]` :
```markdown
## [2026-05-10] Utiliser Drizzle ORM
...
### [2026-05-20] MISE À JOUR
Ajout de la config multi-schema pour les partenaires SaaS.
Lien : wiki/decisions/decisions-technique.md#saas-multi-tenant
```

---

## 🗑️ Comment SUPPRIMER des informations

### Supprimer du fourtour
**Ne jamais supprimer** du fourtour. C'est un journal immuable.  
Si une info est erronée → ajouter une correction à la suite.  
Si une info est sensible découverte après coup → la masquer avec `{{REDACTÉ}}`.

### Supprimer du wiki
Supprimer librement si l'info est obsolète.  
Avant de supprimer, vérifier s'il y a des liens vers ce contenu dans `wiki/INDEX.md`.  
Si oui, mettre à jour INDEX.md.

---

## 🔍 Comment UTILISER la mémoire

### Retrouver une information
1. Commencer par `wiki/INDEX.md` — table des matières complète
2. Si cherche un bug précis → `wiki/erreurs/[technologie].md`
3. Si cherche une décision → `wiki/decisions/`
4. Si cherche le contexte d'une session passée → `wiki/sessions/` ou `fourtour/`

### Donner le contexte à l'IA en début de session
```
Voici ma mémoire externe — lis ces fichiers pour avoir le contexte complet :
- wiki/projet/architecture.md
- wiki/sessions/[date-derniere-session].md
- wiki/decisions/decisions-technique.md
```

### Résumé de session à demander à l'IA en fin de session
```
Résume cette session pour ma mémoire externe :
1. Crée/mets à jour fourtour/[date]_session-[N].md avec tout ce qu'on a fait
2. Mets à jour wiki/sessions/[date].md avec le résumé condensé
3. Si nouvelles décisions → les ajouter à wiki/decisions/
4. Si nouveaux bugs résolus → les ajouter à wiki/erreurs/
5. Si nouvelles bonnes pratiques → les ajouter à wiki/bonnes-pratiques/
6. Masquer toutes les données sensibles avec les placeholders {{...}}
```

---

## 🔐 Règles de Sécurité des Données

### Données TOUJOURS masquées
```
{{nom_personne}}          → Noms et prénoms
{{tel_+225_XXXXXXXX}}    → Numéros de téléphone
{{email_personnel}}       → Adresses email personnelles
{{cle_api_[service]}}    → Toutes les clés API
{{token_[service]}}       → Tous les tokens
{{mot_de_passe}}          → Mots de passe
{{cni_numero}}            → Numéros CNI / Passeport
{{adresse_personnelle}}   → Adresses physiques personnelles
{{donnees_bancaires}}     → IBAN, numéros de carte
{{encryption_key}}        → Clés de chiffrement
{{secret_[nom]}}          → Tous les secrets
```

### Comment gérer si une donnée sensible est dans une discussion
1. Identifier la donnée sensible
2. La remplacer par le placeholder approprié
3. Ne JAMAIS stocker la valeur réelle
4. Exemple : `PAYSTACK_SECRET_KEY=sk_live_xxx` → `PAYSTACK_SECRET_KEY={{cle_api_paystack}}`

---

## 📋 Liens Rapides

| Besoin | Fichier |
|---|---|
| Comprendre la structure | Ce fichier (MEMOIRE_GUIDE.md) |
| Table des matières du wiki | `wiki/INDEX.md` |
| Dernière session | `wiki/sessions/[date-la-plus-récente].md` |
| Architecture du projet | `wiki/projet/architecture.md` |
| Décisions prises | `wiki/decisions/` |
| Bug connu et solution | `wiki/erreurs/` |
| Bonne pratique validée | `wiki/bonnes-pratiques/` |
| Journal brut complet | `fourtour/` |

---

*Fichier créé : Mai 2026 | Projet : Favor Company International*  
*Maintenir ce guide à jour si la structure change.*
