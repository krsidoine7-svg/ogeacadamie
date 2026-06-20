import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous à votre espace personnel OGE Académie pour accéder à vos cours, sujets d'entraînement et documents de préparation aux concours d'excellence en Côte d'Ivoire (INP-HB, CME CIE, ESATIC).",
};

export default function ConnexionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
