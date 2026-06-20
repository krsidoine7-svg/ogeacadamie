import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://oge-academie.ci";

  return {
    rules: {
      userAgent: "*",
      allow: [
        "/",
        "/connexion",
        "/inscription",
        "/politique-de-confidentialite",
        "/mot-de-passe-oublie",
        "/reinitialiser-mot-de-passe"
      ],
      disallow: [
        "/admin/",
        "/dashboard/",
        "/zone/",
        "/api/"
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
