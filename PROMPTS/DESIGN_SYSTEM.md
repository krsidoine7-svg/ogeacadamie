# DESIGN_SYSTEM.md
## OGE Académie — Charte Graphique & Composants

---

## 1. Couleurs

```css
/* Primaire */
--color-white:      #FFFFFF
--color-navy:       #0F172A   /* Bleu marine */

/* Secondaire */
--color-gold:       #D4A017   /* Or */

/* Statuts */
--color-success:    #22C55E   /* vert — payé */
--color-warning:    #F97316   /* orange — en cours */
--color-danger:     #EF4444   /* rouge — non soldé */

/* Dégradés */
--gradient-hero:    linear-gradient(135deg, #D4A017 0%, #0F172A 100%)
--gradient-card:    linear-gradient(180deg, #1E293B 0%, #0F172A 100%)
```

---

## 2. Typographie

```css
/* Police principale */
font-family: 'Inter', 'Geist', sans-serif;

/* Tailles */
--text-xs:    0.75rem   /* 12px — labels, badges */
--text-sm:    0.875rem  /* 14px — corps secondaire */
--text-base:  1rem      /* 16px — corps principal */
--text-lg:    1.125rem  /* 18px — sous-titres */
--text-xl:    1.25rem   /* 20px — titres section */
--text-2xl:   1.5rem    /* 24px — titres carte */
--text-3xl:   1.875rem  /* 30px — titres page */
--text-4xl:   2.25rem   /* 36px — héro mobile */
--text-5xl:   3rem      /* 48px — héro desktop */

/* Poids */
--font-light:   300
--font-normal:  400
--font-medium:  500
--font-semibold: 600
--font-bold:    700
```

---

## 3. Composants UI (Shadcn)

### Boutons
```
Primaire   → bg-gold hover:bg-yellow-600 text-white
Secondaire → border border-gold text-gold hover:bg-gold/10
Fantôme    → text-gold hover:bg-slate-800
Danger     → bg-red-500 hover:bg-red-600 text-white
```

### Badges Statut Paiement
```
Payé       → bg-green-950/50 text-green-400 border border-green-500/20
En cours   → bg-orange-950/50 text-orange-400 border border-orange-500/20
Non soldé  → bg-red-950/50 text-red-400 border border-red-500/20
```

### Cards
```
Ombre légère : shadow-lg rounded-xl border border-slate-800 bg-[#0F172A]/70
Hover        : hover:border-gold/30 transition-all duration-300
```

---

## 4. Layout

```
Mobile first — breakpoints Tailwind standard
Container max-width : 1280px
Padding page : px-4 (mobile) px-8 (desktop)
Gap sections  : py-16 (mobile) py-24 (desktop)
```

---

## 5. Blocs Page d'Accueil (réutilisables)

Chaque bloc est un composant indépendant, activable/désactivable depuis le dashboard admin.

```
<HeroBlock />         → Titre, sous-titre, CTA
<HistoriqueBlock />   → Texte + photo activités
<FormationBlock />    → Cards des 3 concours
<ResultatsBlock />    → Statistiques succès
<TemoignagesBlock />  → Avis avec photo + zone
<InscriptionBlock />  → CTA vers formulaire
<FooterBlock />       → Liens, contacts, légal
```

---

## 6. Règles UX

- Toujours afficher l'étape en cours dans un stepper (1/3, 2/3, 3/3)
- Modal bloquante si paiement non validé (ne peut pas être fermée)
- Toasts de confirmation après chaque action importante
- Loading states sur tous les boutons de soumission
- Messages d'erreur en français clair (pas de codes techniques)
- Confirmation avant toute action destructive
- Retour visuel immédiat sur upload (barre de progression)
