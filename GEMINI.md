# Architecture Multi-Agents du Projet

Ce projet utilise une architecture multi-agents dirigée par un skill principal appelé **ChefsOge**.

## ChefsOge

**ChefsOge** est l'agent principal (le manager, chef de projet et orchestrateur central). Son rôle est de :
- Superviser l'intégralité du développement.
- Assurer le respect absolu des spécifications contenues dans `prompt/`.
- Orchestrer la délégation des tâches à des sous-agents spécialisés.
- Gérer la mémoire externe du projet (`memoire-oge-academie`).

Il possède un **Manifeste de Compétences** global qui répertorie l'ensemble des sous-agents à sa disposition et leurs capacités.

## Les Sous-Agents

ChefsOge gère 6 sous-agents spécialisés, chacun ayant son propre manifeste de compétences local :

1. **ascii-ui-mockup-generator** : Spécialiste de la création de maquettes UI en ASCII.
2. **codebase-pattern-finder** : Analyste de code, chargé de trouver des motifs et structures dans le code.
3. **communication-excellence-coach** : Coach pour la rédaction et la communication.
4. **general-purpose** : Agent polyvalent pour les tâches génériques.
5. **mermaid-diagram-specialist** : Spécialiste de la génération de diagrammes Mermaid.
6. **ui-ux-designer** : Designer UI/UX.

## Procédures Clés

ChefsOge applique 3 procédures fondamentales :

1. **Reprise de Session** : Au démarrage, il recharge le contexte depuis la mémoire (`memoire-oge-academie`) et les spécifications (`prompt/`).
2. **Exécution & Délégation** : Pour toute tâche complexe, il réalise une **Cartographie d'Impact**, identifie les compétences requises, formule un brief structuré, et supervise l'exécution.
3. **Mise à Jour de la Mémoire et Clôture** : En fin de session, il sauvegarde automatiquement l'historique dans `fourtour/`, met à jour les résumés dans `sessions/`, documente les décisions techniques ou erreurs résolues, et structure les nouveaux fichiers dans le `wiki/`.

### Règles de Délégation

- Lorsqu'un sous-agent a besoin de l'expertise d'un autre sous-agent, il doit demander la validation de **ChefsOge**.
- L'ensemble des skills et des manifestes est encapsulé de manière relative dans le dossier `.skills/ChefsOge` pour garantir la portabilité du système.
- **Visualisation de flux** : pour brainstorming, nouvelle fonctionnalité, modification, workflows, onboarding ou UX — ChefsOge délègue à `mermaid-diagram-specialist` avec `skill-mermaidH`.
- **Tests de Charge & Performance** : pour tester la charge, le stress, les pics de trafic ou l'endurance — ChefsOge délègue à `codebase-pattern-finder` ou `general-purpose` avec le skill `run-load-test` dans `.skills/ChefsOge/banques_skills/locust-template/skills/run-load-test/SKILL.md`.
- **Interdit** : délégation en chaîne (A→B→C) sans nouvelle approbation à chaque maillon.

### Règles d'Or

- **Manifeste de Modules obligatoire** : Chaque fichier ou composant créé ou modifié doit être immédiatement documenté dans `manifeste_modules.md` (chemin, but et relations).
- **Mise à jour et structuration de la mémoire** : En fin de session, classer et ordonner tous les travaux dans les dossiers de la mémoire (`memoire-oge-academie/wiki/` et `memoire-oge-academie/fourtour/`).
- **Soft Delete obligatoire** pour toutes les entités clés (pas de suppression physique).
- **Cartographie d'Impact** obligatoire avant toute modification de code ou de fonctionnalité.
- **Qualité Premium** : aucun placeholder ou code à moitié écrit.
- **Standards 5 Étoiles** : tout nouveau skill doit passer par le processus d'audit de `skill-creator`.

## Comment l'utiliser

Pour utiliser cette architecture, invoquez le skill principal depuis votre assistant IA avec la commande de skill correspondante pointant vers `.skills/ChefsOge/SKILL.md`. Vous pouvez lui confier une tâche de haut niveau, et il se chargera de la diviser et de la déléguer aux bons sous-agents.








