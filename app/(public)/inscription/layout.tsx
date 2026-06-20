import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inscription & Onboarding",
  description: "Inscrivez-vous sur OGE Académie pour débuter votre préparation intensive aux concours INP-HB, CME CIE et ESATIC en ligne ou dans nos centres physiques en Côte d'Ivoire.",
};

export default function InscriptionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
