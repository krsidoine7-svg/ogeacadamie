# Workflow unifié — skill-mermaidH

> **Contexte ChefsOge** : en mode multi-agents, la phase 0 (cartographie + délégation) est gérée par le manager. Voir [ChefsOge-integration.md](ChefsOge-integration.md).

## Phase 0 — Cartographie (ChefsOge)

Avant de diagrammer, le manager évalue :

- **Contexte** : brainstorming, nouvelle fonctionnalité, modification, workflow, onboarding, UX ?
- **Besoin de viz** : le flux ou l'architecture est-il ambigu sans schéma ?
- **Délégation** : brief vers `mermaid-diagram-specialist` + chargement de ce skill.

Si l'un des déclencheurs ChefsOge s'applique, **proposer un diagramme avant le code**.

## Phase 1 — Comprendre

Clarifier si nécessaire (sans bloquer sur des détails mineurs) :

- **Quoi** documenter ? (flux, schéma BDD, architecture, états)
- **Pour qui** ? (métier → contexte ; dev → séquence/composant ; ops → déploiement)
- **Où** ça vit ? (README, ADR, PR, présentation, terminal)

## Phase 2 — Choisir le type

| Signal dans la demande | Type recommandé |
|------------------------|-----------------|
| « étapes », « si/sinon », parcours utilisateur | flowchart |
| « appelle », « requête », « webhook », temporalité | sequenceDiagram |
| « tables », « clés », « relations » | erDiagram |
| « classes », « agrégat », DDD | classDiagram |
| « système », « microservices », « qui parle à qui » | C4 (Context puis Container) |
| « états », « cycle de vie » | stateDiagram-v2 |
| « planning », « jalons » | gantt |
| « branches », release | gitGraph |

Règle C4 : **Context + Container** suffisent souvent ; Component/Code seulement si la valeur est claire.

## Phase 3 — Rédiger

1. Lire la référence du type (`references/INDEX.md`).
2. Commencer minimal : acteurs/entités/nœuds principaux, puis relations.
3. Nommer clairement (`User`, `OrderService`, pas `A`/`B` sauf brouillon).
4. Commenter avec `%%` les zones ambiguës.
5. Encadrer la livraison Markdown :

````markdown
```mermaid
flowchart LR
  A --> B
```
````

## Phase 4 — Valider

Ordre préféré :

1. Relecture syntaxe (mots-clés, guillemets, flèches).
2. Si MCP mermaid disponible : `mermaid_preview` avec `preview_id` stable.
3. Sinon : [mermaid.live](https://mermaid.live) ou `node scripts/render.mjs --input x.mmd`.

Corrections fréquentes : sequence sans `style` ; caractères spéciaux dans les labels ; diagramme trop large → le scinder.

## Phase 5 — Livrer

| Besoin | Action |
|--------|--------|
| Doc versionnée | `.md` + bloc mermaid et/ou `diagrams/*.mmd` |
| Asset figé | `render.mjs` → SVG, ou `mmdc`, ou `mermaid_save` |
| README terminal | `render.mjs --format ascii` |
| Lot de diagrammes | `batch.mjs` |

Itérer avec le même `preview_id` MCP lors des retouches.

## Qualité (checklist rapide)

- [ ] Un message par diagramme
- [ ] Légendes / titres si public mixte
- [ ] Cardinalités / PK-FK cohérentes (ERD)
- [ ] Pas de style sur sequenceDiagram
- [ ] Thème adapté clair/sombre si export SVG
