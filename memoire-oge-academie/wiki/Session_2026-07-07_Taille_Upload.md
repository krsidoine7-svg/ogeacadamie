# Fiche Technique - Augmentation des Limites de Téléversement Média

Cette fiche documente l'augmentation des limites de taille pour le téléversement des images, affiches et vidéos dans la console d'administration et le CMS.

## Problème initial
Auparavant, le téléversement de médias sur la plateforme était soumis à des restrictions strictes :
- **Affiches / Galerie de médias** : Limité à 10 Mo (aussi bien pour les images que pour les vidéos téléversées dans cet espace).
- **Vidéo de présentation (Hero)** : Limité à 100 Mo.

Ces limites étaient insuffisantes pour des vidéos haute définition ou des médias volumineux, bloquant les administrateurs et managers lors de la gestion du contenu.

---

## Solution implémentée
Les limites ont été relevées à :
- **Images / Affiches** : **50 Mo** (au lieu de 10 Mo).
- **Vidéos** : **200 Mo** (au lieu de 100 Mo).

Ces changements ont été répercutés de manière cohérente sur la validation serveur et les libellés de l'interface utilisateur.

---

## Détails des modifications

### 1. Serveur (Validation Backend)
Fichier modifié : [route.ts](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/api/admin/upload/route.ts)
Les constantes de validation ont été augmentées et le message d'erreur de dépassement a été adapté pour refléter les nouvelles valeurs :

```typescript
// Validation des limites de taille (Images : 50 Mo, Vidéos : 200 Mo)
const maxImageSize = 50 * 1024 * 1024;
const maxVideoSize = 200 * 1024 * 1024;
const sizeLimit = isImage ? maxImageSize : maxVideoSize;

if (file.size > sizeLimit) {
  const displayLimit = isImage ? "50 Mo" : "200 Mo";
  return NextResponse.json(
    { error: `Fichier trop volumineux. La limite pour ce type est de ${displayLimit}.` },
    { status: 400 }
  );
}
```

### 2. Interface Client (UI CMS)
Fichier modifié : [CMSClient.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/oge-academie/app/(admin)/admin/contenu/CMSClient.tsx)
Les indications de taille sous les zones de téléversement ont été mises à jour pour guider correctement l'utilisateur :
- **Zone de vidéo de présentation (Hero)** :
  ```tsx
  <p className="text-[10px] text-slate-400 font-medium">MP4, WebM, OGG, MOV (Taille max: 200 Mo)</p>
  ```
- **Zone de liste des affiches / médias** :
  ```tsx
  <p className="text-[10px] text-slate-400 font-medium">PNG, JPG, WEBP, MP4, MOV (Taille max: 50 Mo pour images, 200 Mo pour vidéos)</p>
  ```

---

## Rappel Infrastructure (Supabase)
> [!NOTE]
> Les fichiers sont stockés dans le bucket de stockage Supabase nommé `documents`.
> Si vous rencontrez une erreur de type `Payload Too Large` ou une erreur réseau persistante lors de l'envoi de fichiers volumineux (> 50 Mo), assurez-vous également que la taille maximale autorisée par fichier ("Maximum File Size") dans le tableau de bord Supabase (paramètres de Storage) est configurée à au moins 200 Mo pour ce bucket.
