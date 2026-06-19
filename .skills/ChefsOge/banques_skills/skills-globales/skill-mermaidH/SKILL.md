---
name: skill-mermaidH
description: >-
  Skill ultime Mermaid pour concevoir, valider, styliser et exporter des diagrammes
  techniques (flowchart, séquence, ERD, C4, états, Gantt, 20+ types). Fusionne les
  méthodes agent-toolkit, mermaid-skill, Pretty-mermaid, claude-mermaid et C4.
  Intégré à ChefsOge : délégation via mermaid-diagram-specialist, cartographie
  d'impact, brainstorming, nouvelle fonctionnalité, modification, workflows, onboarding
  et UX. Utiliser dès que l'utilisateur mentionne diagramme, schéma, architecture, flux,
  modélisation, ERD, séquence, C4, mermaid, visualiser un système, documenter une
  API, ou demande un export SVG/ASCII — même sans dire "Mermaid" explicitement.
---

# skill-mermaidH — Mermaid unifié

Tu es expert Mermaid : tu choisis le bon type, tu produis du code **valide et maintenable**, tu itères avec l'utilisateur, tu exportes au bon format.

**Architecture du skill :** lire [ARCHITECTURE.md](ARCHITECTURE.md) pour la structure des dossiers et les sources fusionnées.

**Intégration ChefsOge :** lire [references/ChefsOge-integration.md](references/ChefsOge-integration.md) pour la délégation, les 6 sous-agents et les déclencheurs (brainstorming, fonctionnalités, workflows, onboarding, UX).

## Démarrage rapide

Pour toute demande de diagramme :

1. Lire [references/workflow.md](references/workflow.md) (5 phases).
2. Router via [references/INDEX.md](references/INDEX.md) vers la référence syntaxe.
3. Produire le code Mermaid, puis valider (preview MCP, `render.mjs`, ou mermaid.live).
4. Livrer selon le contexte (Markdown, `.mmd`, SVG).

## Syntaxe commune

```mermaid
diagramType
  contenu
```

- Première ligne = type (`flowchart`, `sequenceDiagram`, `erDiagram`, `C4Context`, …).
- Commentaires : `%%`.
- Les fautes de mot-clé cassent souvent le rendu sans message clair — valider tôt.

## Choisir le type (résumé)

| Besoin | Type | Référence |
|--------|------|-----------|
| Processus, décisions, pipeline | `flowchart` | `references/core/flowcharts.md` |
| Appels API, auth, messages | `sequenceDiagram` | `references/core/sequence-diagrams.md` |
| Tables, FK, schéma SQL | `erDiagram` | `references/core/erd-diagrams.md` |
| Modèle objet / DDD | `classDiagram` | `references/core/class-diagrams.md` |
| Vue système (C4) | `C4Context` / `C4Container` / … | `references/c4/` + `references/core/c4-diagrams.md` |
| Infra cloud | `flowchart` ou `architecture-beta` | `references/core/architecture-diagrams.md` |
| Machine à états | `stateDiagram-v2` | `references/types/stateDiagram.md` |
| Planning | `gantt` | `references/types/gantt.md` |

Types avancés (Sankey, quadrant, packet, kanban, …) : catalogue dans `references/types/` — voir [references/INDEX.md](references/INDEX.md).

## Méthode de travail (fusion des skills sources)

### Comprendre avant de dessiner (requirements-clarity / c4)

- Audience : métier (contexte), dev (séquence/composant), ops (déploiement).
- Un diagramme = un message ; scinder si > ~25 nœuds ou plusieurs sujets.
- Pour C4 : Context + Container en priorité ; Component seulement si utile.

### Rédaction incrémentale (mermaid-diagrams + mermaid-skill)

1. Squelette (acteurs, entités, nœuds).
2. Relations et flux.
3. Détails (attributs, cardinalités, notes `%%`).
4. Style/thème en dernier ([references/core/advanced-features.md](references/core/advanced-features.md)).

### Itération live (claude-mermaid)

Si les outils MCP `mermaid_preview` / `mermaid_save` sont disponibles :

- Toujours preview avant de considérer le diagramme fini.
- `preview_id` descriptif et **stable** entre les retouches (`order-checkout`).
- Format `svg` pour le rechargement automatique.
- `mermaid_save` à la fin avec le même `preview_id`.

Détails : [references/integrations.md](references/integrations.md).

### Rendu soigné (Pretty-mermaid)

Pour SVG/ASCII professionnels ou lots de fichiers :

```bash
cd <chemin-skill-mermaidH>
node scripts/render.mjs --input diagram.mmd --output diagram.svg --theme tokyo-night
node scripts/batch.mjs --input-dir ./diagrams --output-dir ./out --workers 4
```

Modèles : `assets/example_diagrams/`. Thèmes : `node scripts/themes.mjs` ou [references/render/THEMES.md](references/render/THEMES.md).

## Exemples minimaux

### Flowchart

```mermaid
flowchart TD
    Start([Visite]) --> Auth{Connecté?}
    Auth -->|Non| Login[Connexion]
    Auth -->|Oui| App[Application]
    Login --> Auth
```

### Séquence (pas de `style` ici)

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant API
    participant DB
    U->>API: POST /login
    API->>DB: Vérifier
    alt OK
        API-->>U: 200 + token
    else Échec
        API-->>U: 401
    end
```

### ERD

```mermaid
erDiagram
    USER ||--o{ ORDER : places
    ORDER ||--|{ LINE_ITEM : contains
    USER {
        int id PK
        string email UK
    }
```

### C4 Context

```mermaid
C4Context
    title Contexte
    Person(u, "Utilisateur")
    System(app, "Mon application")
    Rel(u, app, "Utilise")
```

## Bonnes pratiques

1. **Noms parlants** — `PaymentService`, pas `S1`.
2. **Versionner** — fichiers `.mmd` à côté du code ou dans `docs/diagrams/`.
3. **Commenter** — `%%` pour hypothèses et limites du diagramme.
4. **Thèmes** — `default`, `dark`, `forest`, `neutral`, ou frontmatter `config` (voir advanced-features).
5. **Layouts** — `layout: dagre` (défaut) ; `elk` pour graphes denses si supporté.
6. **Accessibilité** — ne pas coder l'info **uniquement** par la couleur ; libeller les flèches.

## Pièges fréquents

| Problème | Solution |
|----------|----------|
| Sequence + `style` | Non supporté — retirer les styles |
| Diagramme illisible | Changer direction `LR`/`TB` ou scinder |
| C4 trop détaillé trop tôt | Rester Context/Container ([references/c4/common-mistakes.md](references/c4/common-mistakes.md)) |
| Export flou | Augmenter échelle MCP ou SVG haute résolution |
| Syntaxe invalide | mermaid.live ou `render.mjs` pour localiser la ligne |

## Format de livraison

Par défaut, fournir :

1. Le bloc ` ```mermaid ` prêt pour Markdown **ou**
2. Un fichier `.mmd` proposé + commande d'export si assets demandés.

Indiquer brièvement **pourquoi** ce type de diagramme a été choisi.

## Ressources (ne pas tout charger)

| Fichier | Quand |
|---------|--------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Structure du skill, installation |
| [references/INDEX.md](references/INDEX.md) | Routage vers la bonne doc |
| [references/workflow.md](references/workflow.md) | Processus complet |
| [references/ChefsOge-integration.md](references/ChefsOge-integration.md) | Délégation manager, 6 sous-agents |
| [references/integrations.md](references/integrations.md) | MCP, CLI, plateformes |
| `references/core/` | Guides logiciel détaillés |
| `references/types/` | Syntaxe par type (23+) |
| `references/c4/` | C4 avancé |
| `references/render/` | Thèmes beautiful-mermaid |

## Interaction utilisateur

1. Clarifier seulement si le type ou le livrable est ambigu.
2. Proposer un premier diagramme **simple** puis enrichir sur demande.
3. Preview / render dès que possible ; même `preview_id` pour les retouches.
4. Pour « enregistrer » : demander chemin et format (svg/png/md) si non précisé.

## Quand diagrammer

- **ChefsOge** — cartographie d'impact, délégation, validation avant exécution (voir [ChefsOge-integration.md](references/ChefsOge-integration.md)).
- **Brainstorming** — structurer options et décisions (flowchart, mindmap).
- **Nouvelle fonctionnalité ou modification** — visualiser le flux avant le code.
- **Création / modification de workflows** — étapes, conditions, intégrations.
- **Onboarding** — parcours équipe ou utilisateur (userJourney, flowchart).
- **Expérience utilisateur (UX)** — parcours, friction, états d'écran.
- Refactor, revue d'architecture, schéma BDD, flux auth.
- Décision technique à aligner avant le code.

Les diagrammes restent **vivants** : les mettre à jour quand le code ou le workflow change.

## Délégation ChefsOge

Ce skill est invoqué par **ChefsOge** via le sous-agent `mermaid-diagram-specialist`. Les 5 autres sous-agents sollicitent une visualisation **uniquement** après validation du manager.

| Étape | Responsable | Action |
|-------|-------------|--------|
| 1 | ChefsOge | Cartographie d'impact — la viz est-elle nécessaire ? |
| 2 | ChefsOge | Brief structuré → `mermaid-diagram-specialist` + ce skill |
| 3 | mermaid-diagram-specialist | Workflow 5 phases ([workflow.md](references/workflow.md)) |
| 4 | ChefsOge | Validation et assemblage du livrable |

Détails, matrice des 6 sous-agents et exemples : [references/ChefsOge-integration.md](references/ChefsOge-integration.md).
