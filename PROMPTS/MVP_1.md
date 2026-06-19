# MVP_1.md
## Étape 1 — Fondations du projet

> **Durée estimée** : 2-3 heures  
> **Résultat** : Le projet tourne, Supabase est connecté, la connexion fonctionne.

---

## Checklist

### 1. Initialiser le projet

```bash
npx create-next-app@latest oge-academie \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir=false \
  --import-alias="@/*"

cd oge-academie

# Installer les dépendances
npm install @supabase/supabase-js @supabase/ssr
npm install lucide-react
npm install zod react-hook-form @hookform/resolvers
npm install class-variance-authority clsx tailwind-merge

# Installer Shadcn
npx shadcn@latest init
```

### 2. Configurer Shadcn

Répondre aux questions :
- Style : Default
- Couleur : Blue
- CSS variables : Yes

Installer les composants nécessaires :
```bash
npx shadcn@latest add button card input label form toast badge dialog
```

### 3. Créer le projet Supabase

1. Aller sur https://supabase.com
2. Créer un nouveau projet : `oge-academie`
3. Copier l'URL et la clé anon

### 4. Créer le fichier `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Créer les clients Supabase

**`lib/supabase/client.ts`**
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**`lib/supabase/server.ts`**
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```

### 6. Exécuter le schéma SQL

Dans Supabase > SQL Editor, coller et exécuter tout le contenu de `DB_SCHEMA.md`.

### 7. Créer le middleware

**`middleware.ts`** (à la racine du projet)
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const ROLE_REDIRECTS: Record<string, string> = {
  user: '/dashboard',
  manager_zone: '/zone',
  admin: '/admin',
  super_admin: '/admin',
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  // Routes protégées
  const protectedPaths = ['/dashboard', '/admin', '/zone']
  const isProtected = protectedPaths.some(p => pathname.startsWith(p))

  // Non connecté sur route protégée → connexion
  if (!user && isProtected) {
    return NextResponse.redirect(new URL('/connexion', request.url))
  }

  // Connecté sur page auth → dashboard selon rôle
  if (user && (pathname === '/connexion' || pathname === '/inscription')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role ?? 'user'
    const redirect = ROLE_REDIRECTS[role] ?? '/dashboard'
    return NextResponse.redirect(new URL(redirect, request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
```

### 8. Page de connexion minimale

**`app/(public)/connexion/page.tsx`**
```typescript
// Formulaire email + mot de passe
// Appel supabase.auth.signInWithPassword()
// Redirection vers le bon dashboard selon le rôle
// Lien vers mot de passe oublié
```

---

## Test de validation MVP_1

```
✅ npm run dev fonctionne sans erreur
✅ La page /connexion s'affiche
✅ Je peux créer un compte manuellement dans Supabase Auth
✅ Je peux me connecter avec ce compte
✅ Je suis redirigé vers /dashboard (rôle user)
✅ /admin est inaccessible sans le bon rôle
✅ Le middleware redirige correctement
```

**Ne pas continuer vers MVP_2 avant que ces tests passent.**
