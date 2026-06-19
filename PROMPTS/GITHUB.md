# GITHUB.md
## OGE Académie — Bonnes pratiques Git & GitHub

---

## Structure des branches

```
main          → Production (code déployé sur Vercel)
develop       → Intégration (tests avant prod)
feature/*     → Nouvelles fonctionnalités
fix/*         → Corrections de bugs
```

---

## Convention de commits

```
feat: ajout formulaire onboarding étape 1
fix: correction redirection après connexion
style: mise à jour couleurs bouton primaire
refactor: extraction logique paiement en hook
docs: mise à jour README
test: ajout tests validation Zod
chore: mise à jour dépendances
```

---

## Workflow feature par feature

```bash
# 1. Partir de develop
git checkout develop
git pull origin develop

# 2. Créer une branche feature
git checkout -b feature/mvp1-connexion

# 3. Développer + tester
# ... code ...

# 4. Commit
git add .
git commit -m "feat: page connexion avec Supabase Auth"

# 5. Push et Pull Request vers develop
git push origin feature/mvp1-connexion

# 6. Après validation → merge dans develop
# 7. Après tests complets → merge develop dans main
```

---

## .gitignore

```
.env.local
.env*.local
node_modules/
.next/
out/
*.log
.DS_Store
```

---

## Variables secrètes

- Jamais dans le code
- Toujours dans `.env.local`
- Sur Vercel : Environment Variables dans les settings du projet
