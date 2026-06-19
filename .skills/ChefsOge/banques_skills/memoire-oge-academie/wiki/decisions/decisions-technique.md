<!-- Dernière mise à jour : Mai 2026 -->

# Décisions Techniques — Favor Company International

**Liens :** [INDEX.md](../INDEX.md) | [projet/architecture.md](../projet/architecture.md)

> Format : `[Date] Décision | Contexte | Raison | Alternative rejetée`

---

## [Mai 2026] Utiliser Next.js 15 App Router

**Contexte :** Choix du framework principal  
**Décision :** Next.js 15 avec App Router uniquement (pas de pages/)  
**Raison :** Server Actions natifs, SSR/SSG intégré, meilleur DX TypeScript, Vercel natif  
**Alternative rejetée :** Remix — moins mature dans l'écosystème Vercel/Supabase  
**Lien :** [stack/nextjs.md](../stack/nextjs.md)

---

## [Mai 2026] Utiliser Drizzle ORM

**Contexte :** Choix de l'ORM pour PostgreSQL/Supabase  
**Décision :** Drizzle ORM  
**Raison :** Plus léger que Prisma, 100% type-safe, migrations simples, compatible Supabase  
**Alternative rejetée :** Prisma — overhead trop important, génération de types moins précise  
**Lien :** [stack/drizzle.md](../stack/drizzle.md)

---

## [Mai 2026] Utiliser Paystack pour les paiements

**Contexte :** Choix du prestataire de paiement en Côte d'Ivoire  
**Décision :** Paystack  
**Raison :** Meilleure couverture Mobile Money CI (Orange Money, MTN MoMo, Wave), API stable, documentation claire  
**Alternative rejetée :** Stripe — pas disponible en CI, pas de Mobile Money local  
**Lien :** [stack/paystack.md](../stack/paystack.md)

---

## [Mai 2026] Utiliser Cloudflare R2 pour le stockage

**Contexte :** Stockage des images, vidéos, contrats PDF  
**Décision :** Cloudflare R2  
**Raison :** Pas de frais d'egress (vs AWS S3), compatible API S3, prix compétitif  
**Alternative rejetée :** AWS S3 — frais d'egress importants, Supabase Storage — limites de taille  
**Lien :** [stack/cloudflare-r2.md](../stack/cloudflare-r2.md)

---

## [Mai 2026] Server Actions uniquement pour les mutations

**Contexte :** Sécurité des mutations côté serveur  
**Décision :** Toutes les mutations passent par des Server Actions (`'use server'`)  
**Raison :** Sécurité (pas d'exposition des secrets), validation côté serveur garantie, meilleure DX  
**Alternative rejetée :** API Routes pour les mutations — plus verbeux, même sécurité mais plus de code  
**Lien :** [bonnes-pratiques/patterns-backend.md](../bonnes-pratiques/patterns-backend.md)

---

## [Mai 2026] AES-256-GCM pour les données sensibles

**Contexte :** Chiffrement des données personnelles en base  
**Décision :** AES-256-GCM avec ENCRYPTION_KEY de 32 bytes  
**Données chiffrées :** Téléphones, CNI, données financières  
**Raison :** Standard recommandé NIST, authentifié (détecte les modifications), rapide  
**Alternative rejetée :** AES-256-CBC — pas d'authentification intégrée  
**Lien :** [bonnes-pratiques/patterns-securite.md](../bonnes-pratiques/patterns-securite.md)

---

## [Mai 2026] Transaction atomique pour les réservations

**Contexte :** Éviter la double réservation simultanée  
**Décision :** Fonction RPC PostgreSQL avec `FOR UPDATE NOWAIT`  
**Raison :** Verrou au niveau DB = seule garantie fiable contre la concurrence  
**Alternative rejetée :** Vérification applicative (SELECT + UPDATE séparés) — race condition possible  
**Lien :** [bonnes-pratiques/patterns-db.md](../bonnes-pratiques/patterns-db.md)

---

*Ajouter chaque nouvelle décision technique importante ici.*  
*Format : `## [Date] Titre | Contexte | Décision | Raison | Alternative | Lien`*
