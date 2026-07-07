# Fiche Technique - Augmentation des Limites de Téléversement Média

Cette fiche documente l'architecture de contournement de la limite matérielle d'upload sur Vercel (HTTP 413) par la mise en place d'un téléversement direct client-side (navigateur à Supabase Storage).

## Problème initial (Erreur HTTP 413)
Auparavant, le téléversement de médias (affiches, images, vidéos) passait par une route API Next.js faisant office de proxy (`/api/admin/upload`).
En production sur Vercel :
- Les requêtes vers les Serverless Functions sont bridées par Vercel à une taille de requête maximale stricte de **4,5 Mo**.
- Toute tentative de téléverser un média de taille supérieure (par exemple, une affiche HD de 8 Mo ou une vidéo de 30 Mo) échouait instantanément avec le statut de retour **`413 Payload Too Large`** au niveau de la passerelle Vercel, sans jamais pouvoir atteindre notre route API.

---

## Solution implémentée (Direct Client-Side Upload)
Pour éliminer totalement le goulot d'étranglement de Next.js/Vercel, le téléversement de la galerie d'affiches et de la vidéo d'accueil a été basculé en **téléversement direct** (Client-to-Storage).

Le navigateur de l'administrateur communique directement avec le bucket Supabase `documents` de l'instance `ydaqlbwnxqmkfbuapbhv.supabase.co` en utilisant son jeton de session JWT standard.

### Avantages :
1. **Contournement de la limite Vercel** : Les fichiers ne passent plus par le serveur Next.js. La seule limite est celle configurée sur le bucket Supabase (50 Mo pour les images, 200 Mo pour les vidéos).
2. **Performance & Vitesse** : Le flux de données va directement du navigateur vers les serveurs de stockage de Supabase, évitant un double transfert (Client -> Next.js -> Supabase).
3. **Barre de progression réelle** : Utilisation du callback `onUploadProgress` du SDK Supabase pour mettre à jour en temps réel l'avancement de l'upload (0% à 100%) sur l'interface graphique.

---

## Détails techniques

### 1. Initialisation client-side
Dans le composant [CMSClient.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/(admin)/admin/contenu/CMSClient.tsx) :
```typescript
import { createClient } from "@/utils/supabase/client";

// Au début du composant CMSClient
const supabase = createClient();
```

### 2. Upload direct avec progression
Les gestionnaires d'upload `handleVideoUpload` et `handleAfficheUpload` effectuent désormais l'appel direct :
```typescript
const uniqueId = window.crypto.randomUUID();
const fileName = `${uniqueId}.${fileExt}`;
const filePath = `public-assets/${fileName}`;

const { data, error } = await supabase.storage
  .from("documents")
  .upload(filePath, file, {
    cacheControl: "3600",
    upsert: false,
    onUploadProgress: (progress) => {
      const percentage = Math.round((progress.loaded / progress.total) * 100);
      setVideoProgress(percentage); // Mise à jour de la barre en temps réel
    }
  });
```

Puis l'URL publique est récupérée directement :
```typescript
const { data: { publicUrl } } = supabase.storage.from("documents").getPublicUrl(filePath);
```

---

## Configuration RLS & Sécurité
Ce mécanisme repose sur la transmission automatique de l'en-tête `Authorization: Bearer <user_token>` par le client Supabase.
Les politiques de sécurité (RLS) du bucket `documents` vérifient que l'utilisateur possède un rôle habilité (`admin`, `super_admin` ou `manager_zone`) pour autoriser l'écriture dans le dossier `public-assets/`.
