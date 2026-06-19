# OGE ACADÉMIE — Documentation Projet

> **Objectifs Grandes Écoles** — Plateforme de préparation aux concours ivoiriens  
> INP-HB · ESATIC · CME  
> Créateurs : Toto Mohamed & Joseph Brou

---

## 📁 Documents du projet

| Fichier | Contenu |
|---------|---------|
| `PRD.md` | **Quoi construire** — Fonctionnalités, pages, rôles |
| `TDD.md` | **Comment construire** — Stack, API, structure |
| `DB_SCHEMA.md` | **Base de données** — Script SQL complet Supabase |
| `ARCHITECTURE.md` | **Structure des dossiers** — Arborescence + flux navigation |
| `DESIGN_SYSTEM.md` | **Charte graphique** — Couleurs, typo, composants |
| `SECURITY.md` | **Sécurité** — OWASP, RLS, protection documents |
| `ROADMAP.md` | **Plan de développement** — MVP → Versions |
| `MVP_1.md` | **Étape 1** — Fondations (projet + connexion) |
| `MVP_2.md` | **Étape 2** — Inscription candidat (onboarding) |
| `MVP_3.md` | **Étape 3** — Paiement (upload capture) |
| `MVP_4_5.md` | **Étapes 4 & 5** — Dashboard Manager + Candidat |
| `GITHUB.md` | **Git** — Branches, commits, workflow |

---

## 🚀 Comment utiliser ces documents avec une IA

### Ordre de travail recommandé

```
1. Donner PRD.md + TDD.md + ARCHITECTURE.md → pour comprendre le projet
2. Donner DB_SCHEMA.md → pour créer la base de données
3. Donner MVP_1.md → construire feature par feature
4. Tester MVP_1 → valider
5. Donner MVP_2.md → continuer
6. ... et ainsi de suite
```

### Prompt de démarrage pour l'IA

```
Voici la documentation complète du projet OGE Académie.
Lis d'abord PRD.md, TDD.md et ARCHITECTURE.md pour comprendre le projet.
Ensuite, on va construire le projet étape par étape en suivant MVP_1.md.
Une feature à la fois. On teste avant de continuer.
Stack : Next.js 15, React 19, TypeScript, Supabase, Shadcn/ui, Tailwind CSS.
Pas de 'any' en TypeScript. Composants réutilisables. Messages en français.
```

---

## 🎯 Résumé en une phrase

OGE Académie est une plateforme qui permet à des candidats ivoiriens de s'inscrire, payer (Wave/MoMo), et accéder à des cours de préparation pour les concours INP-HB, ESATIC et CME, avec un système de validation par zone géographique.

---

## 🗺️ Zones

Yamoussoukro · Yopougon · Abobo · Cocody · Port-Bouët · Bouaké

## 👥 Rôles

`user` (candidat) · `manager_zone` · `admin` · `super_admin`

## 💰 Prix

15 000 FCFA (Wave & Mobile Money acceptés)
