# Wiki — Session du 26 Juin 2026 : Support & Détection Dynamique des Aspect Ratios

Ce document explique les détails de conception et d'implémentation pour le support dynamique des formats (carré, portrait/TikTok, paysage) sur la page d'accueil de la plateforme OGE Académie.

## 📌 Objectif
Garantir que les affiches de communication importées par les administrateurs et la vidéo de présentation s'affichent dans leur format d'origine (sans recadrage ou déformation) sur la page d'accueil.

## ⚙️ Détails Techniques

### 1. Détection de Ratio Vidéo
La vidéo de présentation est gérée par le composant `AutoplayVideo.tsx` :
- Lors du chargement de la vidéo, l'événement `onLoadedMetadata` lit les dimensions réelles (`videoWidth` et `videoHeight`).
- L'aspect ratio est calculé (`videoWidth / videoHeight`).
- En fonction de la valeur du ratio :
  - **Portrait / TikTok** (ratio < 0.8) : La balise `<video>` est encapsulée dans un conteneur avec `max-w-[340px]` pour éviter qu'elle n'occupe tout l'écran verticalement, tout en appliquant le ratio exact avec la propriété CSS `aspectRatio`.
  - **Carré** (0.8 <= ratio <= 1.2) : Le conteneur se limite à `max-w-[480px]` et applique le ratio d'origine.
  - **Paysage** (ratio > 1.2) : La vidéo occupe la largeur standard `max-w-3xl`.
- Pour éviter les décalages de mise en page (Layout Shift) avant le chargement de la vidéo, un format paysage par défaut `aspect-video` est appliqué.

### 2. Adaptation de la Grille d'Affiches
La grille d'affiches est gérée par `AffichesGallery.tsx` :
- Les cartes de la grille ne forcent plus le format `aspect-[3/4]` ni l'ajustement `object-cover`.
- Chaque carte utilise `w-full h-auto` pour s'adapter à la hauteur de son image.
- L'image utilise `w-full h-auto block` pour préserver exactement ses dimensions d'origine.
- La grille CSS utilise `items-start` pour aligner harmonieusement les affiches de hauteurs variables par le haut.
- L'effet de survol (overlay de description) et la lightbox s'adaptent automatiquement à ces tailles.
