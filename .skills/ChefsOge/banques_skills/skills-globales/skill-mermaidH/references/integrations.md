# Intégrations — preview, export, plateformes

## MCP claude-mermaid (si configuré)

Outils typiques : `mermaid_preview`, `mermaid_save`.

**Preview**

- `diagram` : code Mermaid
- `preview_id` : identifiant kebab-case stable entre itérations (`auth-flow`)
- `format` : `svg` pour live reload
- `theme` : default | forest | dark | neutral
- Réutiliser le **même** `preview_id` pour mettre à jour l’onglet navigateur

**Save**

- `save_path` : ex. `./docs/architecture.svg`
- `preview_id` : identique à la preview
- `format` : aligné avec la preview

Fichiers de travail live (claude-mermaid) : souvent sous `~/.config/claude-mermaid/live`.

## Scripts skill-mermaidH (beautiful-mermaid)

Depuis la racine du skill :

```bash
node scripts/render.mjs --input diagram.mmd --output diagram.svg --theme tokyo-night
node scripts/batch.mjs --input-dir ./diagrams --output-dir ./out --theme github-dark --workers 4
node scripts/themes.mjs
```

ASCII : `--format ascii --use-ascii`

Première exécution : `npm install` dans le dossier du skill si `beautiful-mermaid` manque.

## Mermaid CLI (mmdc)

```bash
npm install -g @mermaid-js/mermaid-cli
mmdc -i input.mmd -o output.png
```

Utile pour CI et PNG/PDF sans Node skill.

## Rendu natif Markdown

- GitHub / GitLab : blocs ` ```mermaid `
- VS Code : extension Markdown Mermaid
- Notion, Obsidian, Confluence : support intégré variable

## Mermaid Live Editor

https://mermaid.live — validation rapide, export PNG/SVG manuel.

## Complémentarité avec d’autres skills

- **c4-architecture** (agent-toolkit) : même modèle C4, références dans `references/c4/`
- **excalidraw / draw-io** : brouillon à main levée ; Mermaid pour doc versionnée
- **database-schema-designer** : modélisation amont ; ERD Mermaid pour doc

Ne pas remplacer Mermaid par Excalidraw quand l’utilisateur veut du texte diffable dans Git.
