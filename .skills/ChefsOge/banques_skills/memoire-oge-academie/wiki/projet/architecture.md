<!-- Dernière mise à jour : Mai 2026 -->

# Architecture Technique — Favor Company International

**Liens :** [INDEX.md](../INDEX.md) | [vision.md](./vision.md) | [roadmap.md](./roadmap.md)

---

## Stack Principale

```
Frontend   : Next.js 15 (App Router) + React 19 + TypeScript strict
Styling    : Tailwind CSS v4 + shadcn/ui + lucide-react + Framer Motion
Backend    : Supabase (PostgreSQL + Auth + Storage + Realtime + RLS)
ORM        : Drizzle ORM
Paiement   : Paystack (Orange Money CI, MTN MoMo CI, Wave CI, Carte)
Stockage   : Cloudflare R2 (images, vidéos, documents, contrats PDF)
Email      : Resend + React Email
Déploiement: Vercel
CI/CD      : GitHub Actions
Monitoring : Sentry + PostHog + Google Analytics 4
```

## Structure des Dossiers (App Router)

```
src/
├── app/
│   ├── (public)/          ← Site vitrine (non authentifié)
│   ├── (client)/          ← Espace client (authentifié)
│   ├── (admin)/           ← Backoffice admin (authentifié + RBAC)
│   └── api/               ← API Routes + Webhooks
├── components/
│   ├── ui/                ← shadcn/ui components
│   ├── shared/            ← Navbar, Footer, ChatBot, PermissionGate
│   ├── biens/             ← BienCard, BienGallery, BienMap, ReservationModal
│   ├── admin/             ← DataTable, KanbanBoard, Pipeline, StatsCard
│   └── payment/           ← PaymentModal, PaymentHistory
├── lib/
│   ├── supabase/          ← client.ts, server.ts, middleware.ts
│   ├── db/                ← schema.ts + queries/
│   ├── utils/             ← crypto.ts, format.ts, validators.ts
│   ├── paystack/          ← client.ts
│   ├── resend/            ← client.ts + emails/
│   └── cloudflare/        ← r2.ts
├── hooks/                 ← usePermissions, useNotifications, etc.
├── types/                 ← Types TypeScript globaux
└── constants/             ← PIPELINE_ETAPES, etc.
```

## Règles Absolues

```
❌ JAMAIS de `any` TypeScript
❌ JAMAIS de clé API dans NEXT_PUBLIC_ (sauf clés publiques autorisées)
❌ JAMAIS de pages/ directory — uniquement App Router
❌ JAMAIS de mutations côté client — Server Actions ('use server') uniquement
❌ JAMAIS traiter un webhook sans valider la signature HMAC-SHA512
❌ JAMAIS de code directement sur la branche main
✅ TOUJOURS Zod sur tous les inputs côté serveur
✅ TOUJOURS RLS activé sur toutes les tables Supabase
✅ TOUJOURS transactions atomiques pour les réservations (FOR UPDATE NOWAIT)
✅ TOUJOURS chiffrer les données sensibles : AES-256-GCM
✅ TOUJOURS tester une feature avant de passer à la suivante
```

## Pattern Server Action (obligatoire)

```typescript
'use server'
// 1. Vérifier auth
// 2. Vérifier permissions RBAC
// 3. Valider inputs avec Zod
// 4. Exécuter la logique (Drizzle / Supabase)
// 5. revalidatePath()
// 6. return { success, data } ou { error }
```

---

*Lié à : [decisions/decisions-technique.md](../decisions/decisions-technique.md) | [stack/](../stack/)*
