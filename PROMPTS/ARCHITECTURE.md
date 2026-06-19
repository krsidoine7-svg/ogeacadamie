# ARCHITECTURE.md
## OGE Académie — Structure du projet

---

## Structure complète des dossiers

```
oge-academy/
│
├── app/                              # Next.js App Router
│   │
│   ├── (public)/                     # Groupe routes publiques
│   │   ├── page.tsx                  # Page d'accueil
│   │   ├── inscription/
│   │   │   └── page.tsx              # Onboarding 3 étapes
│   │   ├── connexion/
│   │   │   └── page.tsx              # Login
│   │   ├── mot-de-passe-oublie/
│   │   │   └── page.tsx
│   │   └── reinitialisation/
│   │       └── page.tsx
│   │
│   ├── (dashboard)/                  # Routes protégées candidat
│   │   └── dashboard/
│   │       ├── layout.tsx            # Layout dashboard candidat
│   │       ├── page.tsx              # Accueil dashboard
│   │       ├── documents/
│   │       │   └── page.tsx
│   │       ├── paiement/
│   │       │   └── page.tsx
│   │       ├── notifications/
│   │       │   └── page.tsx
│   │       └── profil/
│   │           └── page.tsx
│   │
│   ├── (admin)/                      # Routes admin
│   │   └── admin/
│   │       ├── layout.tsx
│   │       ├── page.tsx              # Vue générale admin
│   │       ├── candidats/
│   │       ├── paiements/
│   │       ├── statistiques/
│   │       ├── contenu/              # CMS page d'accueil
│   │       ├── blog/
│   │       ├── notifications/
│   │       └── parametres/
│   │
│   ├── (zone)/                       # Routes manager de zone
│   │   └── zone/
│   │       ├── layout.tsx
│   │       ├── page.tsx
│   │       ├── candidats/
│   │       └── paiements/
│   │
│   └── api/                          # API Routes Next.js
│       ├── auth/
│       │   └── callback/
│       │       └── route.ts          # Callback Supabase Auth
│       ├── paiements/
│       │   ├── upload/route.ts
│       │   └── valider/route.ts
│       ├── documents/
│       │   └── [id]/route.ts         # Lien signé document
│       ├── notifications/
│       │   └── envoyer/route.ts
│       └── webhooks/
│           ├── make/route.ts
│           └── n8n/route.ts
│
├── components/
│   │
│   ├── ui/                           # Composants Shadcn/ui
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── badge.tsx
│   │   └── ...
│   │
│   ├── blocks/                       # Blocs page d'accueil (CMS)
│   │   ├── HeroBlock.tsx
│   │   ├── HistoriqueBlock.tsx
│   │   ├── FormationBlock.tsx
│   │   ├── ResultatsBlock.tsx
│   │   ├── TemoignagesBlock.tsx
│   │   ├── InscriptionBlock.tsx
│   │   └── FooterBlock.tsx
│   │
│   ├── forms/                        # Formulaires
│   │   ├── OnboardingStep1.tsx
│   │   ├── OnboardingStep2.tsx
│   │   ├── OnboardingStep3.tsx
│   │   ├── LoginForm.tsx
│   │   └── PaiementUpload.tsx
│   │
│   ├── dashboard/                    # Composants dashboards
│   │   ├── candidat/
│   │   │   ├── DocumentCard.tsx
│   │   │   ├── PaiementStatus.tsx
│   │   │   └── PaiementModal.tsx     # Modal bloquante
│   │   ├── admin/
│   │   │   ├── CandidatTable.tsx
│   │   │   ├── PaiementTable.tsx
│   │   │   ├── StatsChart.tsx
│   │   │   └── SectionEditor.tsx
│   │   └── zone/
│   │       ├── PaiementZoneTable.tsx
│   │       └── CaptureViewer.tsx
│   │
│   └── shared/                       # Composants partagés
│       ├── Stepper.tsx               # Barre de progression onboarding
│       ├── RoleBadge.tsx
│       ├── ZoneBadge.tsx
│       ├── StatutBadge.tsx
│       ├── Sidebar.tsx
│       ├── Header.tsx
│       └── NotificationBell.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # Client navigateur
│   │   ├── server.ts                 # Client serveur
│   │   └── middleware.ts             # Client middleware
│   ├── auth/
│   │   ├── getUser.ts
│   │   └── checkRole.ts
│   ├── validations/
│   │   ├── inscription.schema.ts     # Zod schemas
│   │   └── paiement.schema.ts
│   └── utils/
│       ├── formatDate.ts
│       ├── formatMontant.ts
│       └── generateSlug.ts
│
├── hooks/
│   ├── useUser.ts
│   ├── usePaiement.ts
│   ├── useDocuments.ts
│   └── useNotifications.ts
│
├── types/
│   ├── database.ts                   # Types générés Supabase
│   ├── auth.ts
│   └── index.ts
│
├── middleware.ts                     # Protection globale des routes
├── next.config.js
├── tailwind.config.ts
└── .env.local                        # Variables d'environnement (gitignore)
```

---

## Flux de navigation

```
Visiteur
  └── Page d'accueil (/)
        ├── Bouton "S'inscrire" → /inscription (onboarding 3 étapes)
        └── Bouton "Se connecter" → /connexion

Candidat connecté (user)
  └── /dashboard
        ├── Paiement non validé → Modal bloquante
        └── Paiement validé → Accès complet
              ├── /dashboard/documents
              ├── /dashboard/paiement
              ├── /dashboard/notifications
              └── /dashboard/profil

Manager de Zone
  └── /zone
        ├── /zone/candidats
        └── /zone/paiements

Admin / Super Admin
  └── /admin
        ├── /admin/candidats
        ├── /admin/paiements
        ├── /admin/statistiques
        ├── /admin/contenu
        ├── /admin/blog
        ├── /admin/notifications
        └── /admin/parametres
```

---

## Règles de redirection

```typescript
// middleware.ts — logique de redirection
role === 'user'         → toujours /dashboard
role === 'manager_zone' → toujours /zone
role === 'admin'        → toujours /admin
role === 'super_admin'  → toujours /admin

// Tentative d'accès cross-rôle → redirection vers son dashboard
// Non authentifié sur route protégée → /connexion
```
