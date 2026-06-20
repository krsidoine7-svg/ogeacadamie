import React from "react";

interface StepperProps {
  currentStep: number;
}

const steps = [
  { number: 1, label: "Identité" },
  { number: 2, label: "Concours" },
  { number: 3, label: "Zone & Récap" },
];

export default function Stepper({ currentStep }: StepperProps) {
  return (
    <div className="w-full px-8">
      <div className="flex items-center justify-between relative mb-6">
        {/* Barre de progression en arrière-plan */}
        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-slate-200 -translate-y-1/2 pointer-events-none z-0" />
        <div
          className="absolute top-1/2 left-0 h-[2px] bg-gold -translate-y-1/2 transition-all duration-300 pointer-events-none z-0"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step) => {
          const isActive = step.number === currentStep;
          const isCompleted = step.number < currentStep;

          return (
            <div key={step.number} className="flex flex-col items-center relative z-10">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                  isActive
                    ? "bg-gold text-white shadow-lg shadow-gold/20 ring-4 ring-gold/10"
                    : isCompleted
                    ? "bg-[#0F172A] text-white"
                    : "bg-slate-50 border border-slate-200 text-slate-400"
                }`}
              >
                {step.number}
              </div>
              <span
                className={`text-xs font-semibold mt-2 absolute top-9 left-1/2 -translate-x-1/2 whitespace-nowrap transition-all duration-300 ${
                  isActive
                    ? "text-gold font-bold scale-105"
                    : isCompleted
                    ? "text-slate-500"
                    : "text-slate-400"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="h-4" />
    </div>
  );
}
