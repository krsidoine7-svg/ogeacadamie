# SECURITY.md
## OGE Académie — Politique de Sécurité

---

## 1. Authentification

- Supabase Auth (JWT) pour toutes les sessions
- Mots de passe : minimum 8 caractères, hachage bcrypt côté Supabase
- Sessions expirées après inactivité (1 heure)
- Réinitialisation mot de passe par email uniquement
- Rate limiting sur les endpoints auth (5 tentatives / 15 min)

---

## 2. Autorisation (RBAC)

```
super_admin > admin > manager_zone > user
```

- Vérification du rôle côté serveur à chaque requête
- Middleware Next.js bloque les accès cross-rôle
- RLS Supabase comme dernière ligne de défense
- Règle absolue : `user` ne peut jamais atteindre `/admin` ou `/zone`

---

## 3. Protection des documents

- Liens signés Supabase Storage (expiration 1 heure)
- CSS anti-capture : `user-select: none`, overlay transparent sur documents
- Aucun lien permanent vers les fichiers
- Journalisation des accès aux documents

---

## 4. Sécurité API (OWASP Top 10)

| Risque | Mesure |
|--------|--------|
| Injection SQL | Supabase paramétré, pas de SQL concaténé |
| XSS | Sanitisation des inputs, CSP headers |
| CSRF | Tokens CSRF sur formulaires sensibles |
| Broken Auth | JWT vérifiés côté serveur systématiquement |
| Sensitive Data | Env variables, jamais de secrets dans le code |
| Broken Access | RLS + middleware + vérification rôle |
| Mass Assignment | Validation Zod stricte avant insertion |
| SSRF | Validation des URLs uploadées |

---

## 5. Upload fichiers (captures paiement)

- Types acceptés : JPG, PNG, WEBP uniquement
- Taille max : 5 MB
- Scan du type MIME côté serveur
- Nom de fichier aléatoire (UUID) à l'enregistrement
- Dossier Supabase Storage privé (pas d'accès public direct)

---

## 6. Données sensibles

- Numéros WhatsApp et emails : accessibles uniquement aux rôles autorisés
- Aucun mot de passe stocké en clair
- Soft delete : données jamais supprimées définitivement (traçabilité)
- Logs d'activité admin conservés

---

## 7. Headers de sécurité (Next.js)

```javascript
// next.config.js
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; img-src 'self' data: blob:; script-src 'self' 'unsafe-eval';"
  }
]
```

---

## 8. Variables d'environnement

- Jamais de secrets dans le code source
- Fichier `.env.local` dans `.gitignore`
- Variables publiques préfixées `NEXT_PUBLIC_` uniquement si nécessaire côté client
- Rotation des clés Supabase Service Role en cas de compromission

---

## 9. RGPD (Côte d'Ivoire + bonnes pratiques)

- Consentement explicite au moment de l'inscription
- Droit de suppression : soft delete + anonymisation sur demande
- Politique de confidentialité accessible depuis le footer
- Données stockées sur serveurs Supabase (région Europe ou US)
- Aucune revente de données personnelles
