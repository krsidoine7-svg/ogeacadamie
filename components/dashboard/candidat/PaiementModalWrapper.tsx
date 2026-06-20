"use client";

import React from "react";
import { useRouter } from "next/navigation";
import PaiementModal from "@/components/dashboard/candidat/PaiementModal";

interface ZoneConfigData {
  zone: string;
  lienWave: string | null;
  adresse: string | null;
  telephone: string | null;
}

interface PaiementModalWrapperProps {
  status: "en_attente" | "en_cours" | "valide" | "rejete";
  notes?: string | null;
  zoneConfig: ZoneConfigData | null;
}

export default function PaiementModalWrapper({
  status,
  notes,
  zoneConfig,
}: PaiementModalWrapperProps) {
  const router = useRouter();

  const handleUploadSuccess = () => {
    // Refresh the current route to fetch the new payment status from the database
    router.refresh();
  };

  return (
    <PaiementModal
      isOpen={status !== "valide"}
      status={status}
      notes={notes}
      zoneConfig={zoneConfig}
      onUploadSuccess={handleUploadSuccess}
    />
  );
}
