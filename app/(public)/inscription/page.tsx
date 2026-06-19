"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { GraduationCap } from "lucide-react";

import Stepper from "@/components/shared/Stepper";
import OnboardingStep1 from "@/components/forms/OnboardingStep1";
import OnboardingStep2 from "@/components/forms/OnboardingStep2";
import OnboardingStep3 from "@/components/forms/OnboardingStep3";
import { registerCandidate } from "./actions";
import { Step1Data, Step2Data, Step3Data } from "@/lib/validations/inscription.schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function InscriptionPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [step1Data, setStep1Data] = useState<Partial<Step1Data>>({});
  const [step2Data, setStep2Data] = useState<Partial<Step2Data>>({});
  const [step3Data, setStep3Data] = useState<Partial<Step3Data>>({});

  const handleStep1Next = (data: Step1Data) => {
    setStep1Data(data);
    setStep(2);
  };

  const handleStep2Next = (data: Step2Data) => {
    setStep2Data(data);
    setStep(3);
  };

  const handleStep2Back = () => {
    setStep(1);
  };

  const handleStep3Back = () => {
    setStep(2);
  };

  const handleFinalSubmit = async (data: Step3Data) => {
    setStep3Data(data);
    setIsLoading(true);

    try {
      const result = await registerCandidate({
        nom: step1Data.nom!,
        prenom: step1Data.prenom!,
        serie_bac: step1Data.serie_bac!,
        whatsapp: step1Data.whatsapp!,
        email: step1Data.email!,
        password: step1Data.password!,
        concours: step2Data.concours!,
        mode_formation: step2Data.mode_formation!,
        zone: data.zone,
      });

      if (!result.success) {
        toast.error(result.error || "Une erreur est survenue lors de l'inscription.");
        setIsLoading(false);
        return;
      }

      toast.success("Inscription réussie ! Vous pouvez maintenant vous connecter.");
      router.push("/connexion");
    } catch (err) {
      console.error(err);
      toast.error("Une erreur inattendue est survenue.");
      setIsLoading(false);
    }
  };

  const recapData = {
    nom: step1Data.nom || "",
    prenom: step1Data.prenom || "",
    serie_bac: step1Data.serie_bac || "",
    whatsapp: step1Data.whatsapp || "",
    email: step1Data.email || "",
    concours: step2Data.concours || [],
    mode_formation: step2Data.mode_formation || "presentiel",
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4 relative overflow-hidden font-sans">
      <Card className="w-full max-w-md bg-white border border-slate-200 shadow-2xl shadow-slate-100 rounded-2xl relative z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent" />

        <CardHeader className="space-y-1 text-center pt-8 pb-4">
          <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-tr from-gold to-amber-600 flex items-center justify-center shadow-lg shadow-gold/20 mb-2">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
            OGE ACADÉMIE
          </CardTitle>
          <CardDescription className="text-slate-500 text-sm">
            Création de votre compte candidat
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Stepper currentStep={step} />

          {step === 1 && (
            <OnboardingStep1 initialData={step1Data} onNext={handleStep1Next} />
          )}

          {step === 2 && (
            <OnboardingStep2
              initialData={step2Data}
              onNext={handleStep2Next}
              onBack={handleStep2Back}
            />
          )}

          {step === 3 && (
            <OnboardingStep3
              initialData={step3Data}
              recapData={recapData}
              onSubmit={handleFinalSubmit}
              onBack={handleStep3Back}
              isLoading={isLoading}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
