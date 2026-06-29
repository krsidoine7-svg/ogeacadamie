import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import CookieBanner from "@/components/shared/CookieBanner";
import { AnalyticsProvider } from "@/components/analytics-provider";
import "./globals.css";


export const metadata: Metadata = {
  title: {
    default: "OGE Académie — Préparation Concours INP-HB, CME & ESATIC (Côte d'Ivoire)",
    template: "%s | OGE Académie"
  },
  description: "Plateforme n°1 en Côte d'Ivoire pour la préparation aux concours d'entrée de l'INP-HB (Yamoussoukro), de l'ESATIC (Abidjan) et du CME CIE (Bingerville). Cours d'excellence, exercices corrigés officiels et suivi WhatsApp par zone.",
  keywords: [
    "OGE Académie",
    "OGE Academie",
    "Concours INP-HB 2026",
    "Concours ESATIC 2026",
    "Concours CME CIE 2026",
    "INP-HB Yamoussoukro",
    "ESATIC Abidjan Treichville",
    "CME CIE Bingerville",
    "préparation concours Côte d'Ivoire",
    "cours prépa concours CI",
    "exercices corrigés mathématiques terminale C D E",
    "sujets officiels physique chimie BAC",
    "Lycée Technique d'Abidjan",
    "Lycée Scientifique de Yamoussoukro",
    "réussir son concours en Côte d'Ivoire",
    "prépa concours Abidjan",
    "prépa concours Yamoussoukro",
    "prépa concours Bouaké",
    "inscriptions concours Côte d'Ivoire",
    "classe préparatoire côte d'ivoire",
    "Cycle Technicien Supérieur INPHB",
    "Cycle Ingénieur INPHB",
    "Wave CI",
    "Orange Money CI",
    "MTN Mobile Money CI",
    "Yopougon Maroc",
    "Abobo Baoulé",
    "Cocody Riviera",
    "Port-Bouët Centre",
    "Bouaké Commerce",
    "Côte d'Ivoire",
    "CI"
  ],
  authors: [{ name: "OGE Académie" }],
  creator: "OGE Académie",
  publisher: "OGE Académie",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://oge-academie.ci"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "OGE Académie — Préparation Concours INP-HB, CME & ESATIC (Côte d'Ivoire)",
    description: "Rejoignez la prépa n°1 en Côte d'Ivoire pour intégrer l'INP-HB, l'ESATIC et le CME Bingerville. En ligne et en présentiel dans nos 6 centres de formation.",
    url: "https://oge-academie.ci",
    siteName: "OGE Académie",
    locale: "fr_CI",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col font-sans">
        <AnalyticsProvider>
          {children}
        </AnalyticsProvider>
        <CookieBanner />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}

