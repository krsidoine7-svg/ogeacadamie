# Manifeste de Compétences Principal - ChefsOge

Ce manifeste répertorie l'ensemble des sous-agents et banques de compétences gérés par **ChefsOge**. 
En tant que manager, utilisez ce registre structuré par domaine d'expertise pour savoir à qui déléguer quelles tâches.

## 🎨 Pôle Design & Visuel

Ces agents se concentrent sur l'interface, l'ergonomie et la représentation visuelle brute.

### `ui-ux-designer`
- **Lien** : [📁 Consulter le SKILL](./agents/ui-ux-designer.md) | [📄 Manifeste Local](./agents/manifestes/ui-ux-designer_manifest.md)
- **Rôle** : Conception de l'expérience utilisateur et des interfaces.
- **Utilisation** : À solliciter pour définir des parcours utilisateurs, l'esthétique générale, et proposer des améliorations d'interface.

### `ascii-ui-mockup-generator`
- **Lien** : [📁 Consulter le SKILL](./agents/ascii-ui-mockup-generator.md) | [📄 Manifeste Local](./agents/manifestes/ascii-ui-mockup-generator_manifest.md)
- **Rôle** : Création de maquettes d'interface utilisateur en format texte ASCII.
- **Utilisation** : À solliciter pour concevoir rapidement la structure visuelle d'une application dans le terminal.

---

## 💻 Pôle Code & Architecture

Ces agents se concentrent sur la base de code, les motifs architecturaux et la documentation technique visuelle.

### `codebase-pattern-finder`
- **Lien** : [📁 Consulter le SKILL](./agents/codebase-pattern-finder.md) | [📄 Manifeste Local](./agents/manifestes/codebase-pattern-finder_manifest.md)
- **Rôle** : Analyse de code et recherche de motifs.
- **Utilisation** : À solliciter pour auditer la base de code, trouver des structures récurrentes, ou comprendre l'architecture existante.
- **🛡️ Skill attaché : `veille-securite`**
  - **Lien** : [📁 Consulter le SKILL](./banques_skills/skills-globales/veille-securite/SKILL.md)
  - **Rôle** : Expert cybersécurité, conformité RGPD, OWASP et veille CVE. Audit de dépendances (`npm audit`), vérification RLS Supabase, prévention XSS/Injection SQL, maintenance du registre VDOS.md.
  - **Déclencheurs** : Audit de sécurité, vérification de dépendances, revue de code orientée sécurité, analyse d'impact RGPD, incident de sécurité (CVSS > 7.0).

### `mermaid-diagram-specialist`
- **Lien** : [📁 Consulter le SKILL](./agents/mermaid-diagram-specialist.md) | [📄 Manifeste Local](./agents/manifestes/mermaid-diagram-specialist_manifest.md)
- **Rôle** : Génération de diagrammes Mermaid complexes.
- **Utilisation** : À solliciter pour documenter des architectures, des bases de données ou des flux de travail visuellement.
- **🛡️ Skill attaché : `skill-mermaidH`**
  - **Lien** : [📁 Consulter le SKILL](./banques_skills/skills-globales/skill-mermaidH/SKILL.md)
  - **Rôle** : Skill unifié Mermaid (flowchart, séquence, ERD, C4, UX, onboarding, workflows). Délégation orchestrée par ChefsOge.
  - **Déclencheurs** : Brainstorming, nouvelle fonctionnalité, modification, création/modification de workflows, onboarding, expérience utilisateur, architecture, flux auth, schéma BDD.

---

## 📝 Pôle Support & Communication

Ces agents sont polyvalents et se chargent de la rédaction, de la documentation, ou des tâches génériques.

### `communication-excellence-coach`
- **Lien** : [📁 Consulter le SKILL](./agents/communication-excellence-coach.md) | [📄 Manifeste Local](./agents/manifestes/communication-excellence-coach_manifest.md)
- **Rôle** : Amélioration de la communication, rédaction, et documentation.
- **Utilisation** : À solliciter pour réviser des textes, rédiger de la documentation claire ou optimiser des messages.

### `general-purpose`
- **Lien** : [📁 Consulter le SKILL](./agents/general-purpose.md) | [📄 Manifeste Local](./agents/manifestes/general-purpose_manifest.md)
- **Rôle** : Tâches générales ne rentrant pas dans un cadre très spécialisé.
- **Utilisation** : À solliciter pour de la manipulation de fichiers simple, des recherches ou des scripts basiques.

---

## 📚 Pôle Ressources & Mémoire (Banques Externes)

En plus des sous-agents, ChefsOge dispose de banques de compétences intégrées dans le dossier `banques_skills/` :

### `skills-globales`
- **Lien** : [📁 Accéder au Référentiel](./banques_skills/skills-globales/)
- **Rôle** : Grande banque de compétences unifiée contenant l'ensemble des outils, scripts, documentations et skills du projet.

### `memoire-oge-academie`
- **Lien** : [📁 Accéder à la Mémoire](./banques_skills/memoire-oge-academie/)
- **Rôle** : Mémoire externe structurée du projet (fourtour, wiki, sessions, décisions, erreurs, bonnes pratiques).

---

## 📄 Pilier Spécifications (`prompt/`)

Les documents de spécifications techniques et métiers sont centralisés dans le dossier [`prompt/`](./prompt/). 
L'index de tous les documents disponibles est tenu à jour dans [`references/docs_index.md`](./references/docs_index.md).

Documents types attendus : `PRD.md`, `TDD.md`, `stack.md`, `roadmap.md`, `architecture.md`, `mcp.md`, `api.md`, `mvp.md`, etc.

---

## 🔒 Protocole de Délégation Inter-Agents

### Règles Strictes
Chaque agent dispose de son propre manifeste local dans `agents/manifestes/`. 
Lorsqu'un agent souhaite déléguer à un autre agent listé ci-dessus, ou utiliser un outil des banques de compétences, il doit **obligatoirement** obtenir la validation préalable de ChefsOge.

### Format de Brief Obligatoire
```markdown
[DÉLÉGATION SOUS-AGENT]
- **Cartographie d'Impact** : [Objectif / Acteurs / Impacts / Livrables]
- **Rôle attendu** : [Spécialité du sous-agent]
- **Skill à charger** : [Chemin relatif vers le skill]
- **Manifeste agent** : [agents/manifestes/{agent}_manifest.md]
- **Spécifications applicables** : [Lien vers le document prompt/ adéquat]
- **Tâche à accomplir** : [Description claire et critères de validation]
- **Compétences à utiliser** : [Liste des skills nécessaires]
- **Délégation inter-agents autorisée** : [oui/non]
```

### Protocole de Réponse du Manager
- `[DÉLÉGATION APPROUVÉE]` : avec brief structuré vers l'agent.
- `[DÉLÉGATION MODIFIÉE]` : avec corrections du périmètre.
- `[DÉLÉGATION REFUSÉE]` : avec justification.
- **Interdit** : délégation en chaîne (A→B→C) sans nouvelle approbation à chaque maillon.

