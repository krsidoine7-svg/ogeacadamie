# 📊 Système de Statistiques — Guide d'installation complet

## Structure des fichiers à créer

```
votre-projet/
├── db/
│   └── schema.ts                          ← Ajouter le contenu de schema.analytics.ts
├── hooks/
│   └── use-analytics.ts                   ← Copier use-analytics.ts
├── components/
│   └── analytics-provider.tsx             ← Copier analytics-provider.tsx
├── app/
│   ├── api/
│   │   └── analytics/
│   │       ├── pageview/
│   │       │   └── route.ts               ← Copier api-pageview-route.ts
│   │       ├── click/
│   │       │   └── route.ts               ← Copier api-click-route.ts
│   │       └── stats/
│   │           └── route.ts               ← Copier api-stats-route.ts
│   ├── admin/
│   │   └── analytics/
│   │       └── page.tsx                   ← Copier admin-analytics-page.tsx
│   └── layout.tsx                         ← Modifier (voir étape 4)
└── middleware.ts                          ← Copier ou fusionner middleware.ts
```

---

## Étape 1 — Base de données Supabase

1. Ouvrez **Supabase Dashboard → SQL Editor**
2. Collez et exécutez le contenu de `0001_analytics_tables.sql`
3. Vérifiez que les 3 tables sont créées :
   - `page_views`
   - `click_events`
   - `daily_stats`

> **Important** : Si votre champ `role` n'est pas dans `raw_user_meta_data` ou `raw_app_meta_data`,
> adaptez les politiques RLS dans le fichier SQL en conséquence.

---

## Étape 2 — Variables d'environnement

Vérifiez que votre `.env.local` contient :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # utilisé en option pour les routes API si besoin
```

---

## Étape 3 — Schéma Drizzle

Dans votre fichier `db/schema.ts`, ajoutez les exports de `schema.analytics.ts` :

```ts
// db/schema.ts
export * from "./schema.analytics"; // ou copier-coller le contenu directement
```

Puis régénérez les types Drizzle si nécessaire :

```bash
npx drizzle-kit generate
# ou si vous poussez directement en DB :
npx drizzle-kit push
```

---

## Étape 4 — Layout racine

Dans `app/layout.tsx`, wrappez vos enfants avec `AnalyticsProvider` :

```tsx
// app/layout.tsx
import { AnalyticsProvider } from "@/components/analytics-provider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <AnalyticsProvider>
          {children}
        </AnalyticsProvider>
      </body>
    </html>
  );
}
```

> `AnalyticsProvider` est un Client Component ; il ne bloque pas le SSR.

---

## Étape 5 — Middleware

Si vous avez déjà un `middleware.ts`, **fusionnez** le contenu du fichier fourni
avec le vôtre. L'essentiel est la vérification du rôle `super_admin` sur `/admin/*`.

---

## Étape 6 — Accès au dashboard

Naviguez vers :

```
https://votre-site.com/admin/analytics
```

Vous devez être connecté avec un compte dont le `role` est `super_admin`.

---

## Ce qui est tracké automatiquement

| Métrique | Comment |
|---|---|
| Pages vues | Chaque changement de route Next.js |
| Visiteurs uniques | Cookie de session anonyme 30 jours |
| Clics | Délégation d'événement sur `<a>`, `<button>`, `[data-analytics-id]` |
| Pages par visite | Calculé à partir des sessions |

### Ajouter un attribut personnalisé sur un élément

```tsx
// Tous les éléments avec data-analytics-id sont trackés avec leur identifiant
<button data-analytics-id="cta-hero-inscription">
  S'inscrire maintenant
</button>
```

---

## Auto-refresh

Le dashboard se rafraîchit automatiquement **toutes les 30 secondes**.
Pour changer l'intervalle, modifiez dans `admin-analytics-page.tsx` :

```ts
const REFRESH_INTERVAL = 30; // secondes
```

---

## Notes de confidentialité

- Les IPs sont **anonymisées** (3 premiers octets seulement)
- Aucune donnée personnelle n'est stockée
- Les sessions sont identifiées par un cookie aléatoire, sans lien avec le compte utilisateur
- Les RLS Supabase garantissent que seul le super admin peut lire ces tables
