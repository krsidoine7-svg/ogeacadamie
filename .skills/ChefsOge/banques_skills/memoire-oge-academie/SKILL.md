---
name: memoire-oge-academie
description: >
  Mémoire externe automatique pour le projet Favor Company International. Active ce skill
  dès qu'une session de travail commence ou se termine, quand l'utilisateur dit "enregistre",
  "mémorise", "note ça", "résume la session", "qu'est-ce qu'on a fait", "reprends où on en était",
  ou quand il faut retrouver une information passée. Ce skill gère deux dossiers : fourtour/
  (journal brut chronologique de TOUT) et wiki/ (mémoire structurée et navigable). TOUTES les
  informations sensibles (noms, téléphones, emails, clés API, tokens, mots de passe, CNI) sont
  AUTOMATIQUEMENT masquées avec des placeholders {{...}} avant tout enregistrement. Ne jamais
  stocker de données réelles sensibles.
---

# Mémoire Externe — Favor Company International

## Rôle
Tu gères la mémoire persistante du projet Favor Company entre les sessions.  
Tu enregistres tout dans `fourtour/` (journal brut) et tu organises dans `wiki/` (mémoire propre).  
Tu masques automatiquement toutes les données sensibles AVANT d'écrire quoi que ce soit.

---

## Structure

```
memoire-oge-academie/
├── MEMOIRE_GUIDE.md          ← Guide d'utilisation (lire en premier)
├── fourtour/                 ← Journal brut chronologique (TOUT, sans exception)
│   └── AAAA-MM-JJ_session-NNN.md
└── wiki/                     ← Mémoire organisée et navigable
    ├── INDEX.md              ← Table des matières (point d'entrée wiki)
    ├── projet/               ← Vision, architecture, roadmap, RBAC
    ├── decisions/            ← Décisions techniques et business
    ├── erreurs/              ← Bugs rencontrés + solutions
    ├── bonnes-pratiques/     ← Patterns validés
    ├── stack/                ← Documentation des outils
    ├── sessions/             ← Résumés condensés par session
    └── personnes/            ← Profil de travail (SANS données personnelles)
```

---

## Règle Absolue — Masquage des Données Sensibles

**Avant tout enregistrement, scanner et remplacer automatiquement :**

| Type | Placeholder |
|---|---|
| Nom/prénom | `{{nom_personne}}` |
| Numéro de téléphone | `{{tel_+225_XXXXXXXX}}` |
| Email personnel | `{{email_personnel}}` |
| Clé API (Paystack, etc.) | `{{cle_api_[service]}}` |
| Token (Supabase, etc.) | `{{token_[service]}}` |
| Mot de passe | `{{mot_de_passe}}` |
| CNI / Passeport | `{{cni_numero}}` |
| Adresse personnelle | `{{adresse_personnelle}}` |
| Données bancaires | `{{donnees_bancaires}}` |
| ENCRYPTION_KEY | `{{encryption_key}}` |
| Tout autre secret | `{{secret_[description]}}` |

**Ne jamais stocker la valeur réelle. Toujours le placeholder.**

---

## Quand Déclencher

### Début de session
1. Lire `wiki/sessions/` → trouver la dernière session
2. Lire `wiki/projet/roadmap.md` → état d'avancement
3. Résumer à l'utilisateur : "Lors de la dernière session, on a [X]. La prochaine étape est [Y]."

### Pendant la session
Enregistrer au fil de l'eau dans le fichier fourtour du jour :
- Toute décision prise (même petite)
- Tout bug rencontré + sa solution
- Toute idée mentionnée
- Tout changement de direction

### Fin de session
Exécuter le protocole de clôture :

```
1. Créer ou mettre à jour : fourtour/AAAA-MM-JJ_session-NNN.md
2. Créer ou mettre à jour : wiki/sessions/AAAA-MM-JJ.md (résumé condensé)
3. Si nouvelles décisions → wiki/decisions/
4. Si nouveaux bugs résolus → wiki/erreurs/[technologie].md
5. Si nouvelles bonnes pratiques → wiki/bonnes-pratiques/
6. Si nouveau package/outil → wiki/stack/
7. Mettre à jour wiki/projet/roadmap.md (statuts des features)
8. Mettre à jour le fichier racine manifeste_modules.md (enregistrer ou modifier les composants/fichiers créés/modifiés de la session, leurs rôles et relations).
9. Mettre à jour wiki/INDEX.md si de nouveaux fichiers ont été créés dans le wiki.
10. Masquer TOUTES les données sensibles avant d'écrire.
```

### Quand l'utilisateur dit "mémorise / note / enregistre"
Ajouter immédiatement dans le fichier fourtour du jour avec horodatage.

### Quand l'utilisateur demande "qu'est-ce qu'on a fait ?"
1. Lire `wiki/sessions/` → dernière session
2. Lire `fourtour/` → dernière session brute si besoin de détails
3. Résumer de façon concise

---

## Format Fichier fourtour

```markdown
# Session NNN — JJ Mois AAAA

## Contexte
[Point de départ de la session]

## Échanges & Décisions
- [HH:MM] [DÉCISION] ...
- [HH:MM] [BUG] ... → Solution : ...
- [HH:MM] [IDÉE] ...
- [HH:MM] [INFO] ...

## Idées Notées
- [idée 1]
- [idée 2]

## Erreurs Rencontrées
- [ERR-XXX] Titre → Solution trouvée : ...

## État Fin de Session
- Feature en cours : F[XX] — [nom] ([X]% terminée)
- Prochaine action : [action précise]

## Données Sensibles Masquées
- [type] → {{placeholder}}

## Mots-clés
#tag1 #tag2 #tag3
```

## Format Fichier wiki/sessions/

```markdown
# Résumé Session NNN — JJ Mois AAAA

**Lien fourtour :** [fourtour/AAAA-MM-JJ_session-NNN.md](../../fourtour/...)

## En une ligne
[Résumé en une phrase]

## Ce qui a été fait
- [point 1]
- [point 2]

## Décisions clés
- [décision 1]

## État du projet
- MVP actuel : MVP_[X]
- Feature en cours : F[XX]
- Prochaine étape : [action]
```

---

## Règles d'Écriture dans le Wiki

- **fourtour/** = immuable. Ne jamais modifier le passé. Ajouter `[CORRECTION]` si erreur.
- **wiki/** = vivant. Modifier directement. Toujours noter `<!-- Dernière mise à jour : Date -->` en haut.
- **Liens relatifs** = toujours utiliser des chemins relatifs entre fichiers wiki.
- **INDEX.md** = mettre à jour à chaque nouveau fichier créé dans le wiki.

---

## Contexte de Reprise Rapide (en début de session)

Avant de répondre à quoi que ce soit, lire ces fichiers :
1. `wiki/sessions/` → fichier de la dernière session
2. `wiki/projet/roadmap.md` → état d'avancement
3. `wiki/personnes/profil-travail.md` → préférences de l'utilisateur

Puis dire :
```
📋 Reprise du projet Favor Company

Dernière session : [date] — [résumé en 1 phrase]
Feature en cours : F[XX] — [nom]
Prochaine étape : [action précise]

On continue ?
```
