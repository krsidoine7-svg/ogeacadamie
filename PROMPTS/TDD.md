# TDD — Technical Design Document
## OGE Académie

> **Stack** : Next.js 15 · React 19 · Supabase · Shadcn/ui · Tailwind CSS · TypeScript

---

## 1. Stack technique

| Couche | Technologie | Rôle |
|--------|-------------|------|
| Frontend | Next.js 15 + React 19 | App Router, Server Components |
| UI | Shadcn/ui + Tailwind CSS | Composants, design system |
| Icônes | Lucide React | Icônes cohérentes |
| Backend | Supabase | Auth, DB PostgreSQL, Storage, Realtime |
| Emails | Resend ou Nodemailer | Emails transactionnels |
| Automatisation | Make.com / n8n | Webhooks cours, notifications |
| Agenda | Google Calendar API | Planification cours |
| Visio | Google Meet | Liens cours en ligne |
| Déploiement | Vercel | Hosting production |
| Versioning | GitHub | Git, CI/CD |
| Chiffrement | AES (crypto-js) | Documents sensibles |

---

## 2. Architecture

```
oge-academy/
├── app/                        # Next.js App Router
│   ├── (public)/               # Pages publiques
│   │   ├── page.tsx            # Accueil
│   │   ├── inscription/        # Onboarding
│   │   └── connexion/          # Auth pages
│   ├── (dashboard)/            # Pages protégées
│   │   ├── dashboard/          # Espace candidat
│   │   ├── admin/              # Espace admin
│   │   └── zone/               # Espace manager
│   └── api/                    # API Routes
│       ├── webhooks/           # Make.com / n8n
│       └── paiements/          # Logique paiement
├── components/
│   ├── ui/                     # Shadcn components
│   ├── blocks/                 # Blocs page d'accueil
│   ├── forms/                  # Formulaires
│   ├── dashboard/              # Composants dashboard
│   └── shared/                 # Composants partagés
├── lib/
│   ├── supabase/               # Client Supabase
│   ├── auth/                   # Logique auth + rôles
│   ├── utils/                  # Utilitaires
│   └── validations/            # Schémas Zod
├── hooks/                      # Custom hooks React
├── types/                      # Types TypeScript
├── middleware.ts               # Protection routes
└── public/                     # Assets statiques
```

---

## 3. Base de données (Supabase PostgreSQL)

### Table `profiles`
```sql
id              uuid PRIMARY KEY REFERENCES auth.users
nom             text NOT NULL
prenom          text NOT NULL
email           text UNIQUE NOT NULL
whatsapp        text
serie_bac       text
zone            text  -- yamoussoukro, yopougon, abobo, cocody, port-bouet, bouake
mode_formation  text  -- presentiel, en_ligne
role            text DEFAULT 'user'  -- user, manager_zone, admin, super_admin
is_active       boolean DEFAULT false
created_at      timestamptz DEFAULT now()
updated_at      timestamptz DEFAULT now()
deleted_at      timestamptz  -- soft delete
```

### Table `concours_inscrits`
```sql
id              uuid PRIMARY KEY
user_id         uuid REFERENCES profiles(id)
concours        text  -- inphb, esatic, cme
created_at      timestamptz DEFAULT now()
deleted_at      timestamptz
```

### Table `paiements`
```sql
id              uuid PRIMARY KEY
user_id         uuid REFERENCES profiles(id)
zone            text
montant         integer DEFAULT 15000
statut          text DEFAULT 'en_attente'  -- en_attente, en_cours, valide, rejete
capture_url     text  -- URL Supabase Storage
validé_par      uuid REFERENCES profiles(id)
validé_at       timestamptz
notes           text
created_at      timestamptz DEFAULT now()
updated_at      timestamptz DEFAULT now()
deleted_at      timestamptz
```

### Table `documents`
```sql
id              uuid PRIMARY KEY
titre           text NOT NULL
description     text
fichier_url     text
concours        text  -- inphb, esatic, cme, tous
type            text  -- cours, exercice, corrige
ordre           integer
is_active       boolean DEFAULT true
created_at      timestamptz DEFAULT now()
deleted_at      timestamptz
```

### Table `acces_documents`
```sql
id              uuid PRIMARY KEY
user_id         uuid REFERENCES profiles(id)
document_id     uuid REFERENCES documents(id)
created_at      timestamptz DEFAULT now()
```

### Table `notifications`
```sql
id              uuid PRIMARY KEY
destinataire_id uuid REFERENCES profiles(id)
titre           text
message         text
type            text  -- info, alerte, cours
lu              boolean DEFAULT false
created_at      timestamptz DEFAULT now()
deleted_at      timestamptz
```

### Table `blog_articles`
```sql
id              uuid PRIMARY KEY
titre           text NOT NULL
contenu         text
concours        text  -- inphb, esatic, cme, general
auteur_id       uuid REFERENCES profiles(id)
is_published    boolean DEFAULT false
created_at      timestamptz DEFAULT now()
updated_at      timestamptz DEFAULT now()
deleted_at      timestamptz
```

### Table `page_sections`
```sql
id              uuid PRIMARY KEY
cle             text UNIQUE  -- hero, historique, formation, resultats
titre           text
contenu         jsonb
ordre           integer
is_active       boolean DEFAULT true
updated_at      timestamptz DEFAULT now()
```

### Table `zone_config`
```sql
id              uuid PRIMARY KEY
zone            text UNIQUE
manager_id      uuid REFERENCES profiles(id)
lien_wave       text
lien_momo       text
adresse         text
telephone       text
updated_at      timestamptz DEFAULT now()
```

---

## 4. Sécurité

### Row Level Security (RLS) Supabase
- `user` : lit uniquement ses propres données
- `manager_zone` : lit/écrit les données de sa zone uniquement
- `admin` : lit/écrit toutes les données
- `super_admin` : accès total

### Middleware Next.js
```typescript
// middleware.ts
// Vérifie le rôle à chaque requête protégée
// Redirige user → /dashboard uniquement
// Redirige admin → /admin uniquement
// Bloque toute tentative d'accès cross-rôle
```

### Protection documents
- Liens documents signés (Supabase Signed URLs, durée limitée)
- Anti-capture CSS : `user-select: none`, overlay transparent
- Chiffrement AES sur les fichiers sensibles

---

## 5. Rôles et permissions

| Action | user | manager_zone | admin | super_admin |
|--------|------|--------------|-------|-------------|
| Voir ses propres données | ✅ | ✅ | ✅ | ✅ |
| Voir données de sa zone | ❌ | ✅ | ✅ | ✅ |
| Voir toutes les données | ❌ | ❌ | ✅ | ✅ |
| Valider paiements (zone) | ❌ | ✅ | ✅ | ✅ |
| Créer compte user | ❌ | ❌ | ✅ | ✅ |
| Créer compte manager | ❌ | ❌ | ✅ | ✅ |
| Créer compte admin | ❌ | ❌ | ❌ | ✅ |
| Modifier page accueil | ❌ | ❌ | ✅ | ✅ |
| Paramètres plateforme | ❌ | ❌ | ❌ | ✅ |

---

## 6. API Routes

```
POST /api/auth/inscription        → Créer compte candidat
POST /api/paiements/upload        → Upload capture paiement
POST /api/paiements/valider       → Valider paiement (manager/admin)
POST /api/webhooks/make           → Réception webhook Make.com
POST /api/webhooks/n8n            → Réception webhook n8n
GET  /api/documents/[id]          → Récupérer document (signé)
POST /api/notifications/envoyer   → Envoi notification groupe
POST /api/blog                    → Créer article blog
```

---

## 7. Webhooks & Automatisations

### Make.com / n8n
- **Déclencheur** : Nouveau cours créé en DB
- **Action** : Envoi email à tous les candidats du concours concerné avec le lien du cours

### Google Calendar
- Les admins/managers créent des événements cours
- Génération automatique lien Google Meet
- Envoi invitation Google Agenda aux candidats inscrits

---

## 8. Indexations DB (performances)

```sql
CREATE INDEX idx_profiles_zone ON profiles(zone);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_paiements_statut ON paiements(statut);
CREATE INDEX idx_paiements_zone ON paiements(zone);
CREATE INDEX idx_paiements_user ON paiements(user_id);
CREATE INDEX idx_documents_concours ON documents(concours);
CREATE INDEX idx_notifications_destinataire ON notifications(destinataire_id, lu);
```

---

## 9. Variables d'environnement

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Email
RESEND_API_KEY=

# Google
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALENDAR_ID=

# Webhooks
WEBHOOK_SECRET=
MAKE_WEBHOOK_URL=

# App
NEXT_PUBLIC_APP_URL=
```
