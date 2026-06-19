# skill-mermaidH

Skill agent **ultime Mermaid** pour Cursor — fusion de `mermaid-diagrams`, `mermaid-skill`, `Pretty-mermaid-skills`, `claude-mermaid` et `c4-architecture`.

## Installation

```text
# Projet
<repo>/.cursor/skills/skill-mermaidH/

# Global Windows
%USERPROFILE%\.cursor\skills\skill-mermaidH\
```

Invocation : `@skill-mermaidH` ou demande contenant diagramme / architecture / ERD.

## Dépendances rendu (optionnel)

```bash
cd skill-mermaidH
npm install
node scripts/render.mjs --input assets/example_diagrams/flowchart.mmd --output test.svg
```

## Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) — structure et flux
- [SKILL.md](SKILL.md) — instructions agent
- [evals/evals.json](evals/evals.json) — cas de test (skill-creator)

## Contenu

| Dossier | Rôle |
|---------|------|
| `references/core/` | Guides logiciel (agent-toolkit) |
| `references/types/` | Syntaxe 23+ types (mermaid-skill) |
| `references/c4/` | C4 approfondi |
| `references/render/` | Thèmes beautiful-mermaid |
| `scripts/` | render, batch, themes |
| `assets/example_diagrams/` | Modèles `.mmd` |
