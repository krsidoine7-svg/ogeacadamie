import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de Confidentialité",
  description: "Consultez la charte de protection des données personnelles et de respect de la vie privée d'OGE Académie, en stricte conformité RGPD.",
};

export default function PolitiqueLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
