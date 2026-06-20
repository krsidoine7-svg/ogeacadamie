"use client";

import React, { useState } from "react";
import { Award, MapPin, Building, Calendar, Users, Home, Shield, Percent, Globe, CheckCircle } from "lucide-react";

interface SchoolData {
  nom_complet?: string;
  description?: string;
  statut?: string;
  localisation?: string;
  creation?: string;
  site_internet?: string;
  tutelle?: string;
  operateur?: string;
  telephone?: string;
  hebergement?: string;
  insertion?: string;
  avantages?: string;
  excellence?: string;
  certifications?: string;
  frais_etudes?: string;
  mixite?: string;
  cadre_vie?: string;
  programme?: string;
  accompagnement?: string;
}

interface SchoolGuideProps {
  formationData: Record<string, SchoolData>;
}

export default function InteractiveSchoolGuides({ formationData }: SchoolGuideProps) {
  const [activeSchool, setActiveSchool] = useState<string>("inphb");
  const [activeTab, setActiveTab] = useState<string>("presentation");

  const schools = [
    { code: "inphb", name: "INP-HB Yamoussoukro" },
    { code: "esatic", name: "ESATIC Treichville" },
    { code: "cme", name: "CME Bingerville" }
  ];

  const sData = formationData[activeSchool] || {};

  return (
    <div className="space-y-8 bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
      {/* School Selector Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 border-b border-slate-100 pb-6">
        {schools.map((s) => (
          <button
            key={s.code}
            type="button"
            onClick={() => {
              setActiveSchool(s.code);
              setActiveTab("presentation");
            }}
            className={`px-5 py-3 rounded-xl text-sm font-bold tracking-tight transition-all cursor-pointer ${
              activeSchool === s.code
                ? "bg-[#0F172A] text-white shadow-md shadow-slate-900/10"
                : "bg-slate-50 text-slate-650 hover:bg-slate-100"
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* Interactive Tabs Menu for Selected School */}
      <div className="flex border-b border-slate-100 pb-2 text-xs md:text-sm font-bold text-slate-500">
        <button
          type="button"
          onClick={() => setActiveTab("presentation")}
          className={`flex-1 pb-3 text-center border-b-2 transition-all cursor-pointer ${
            activeTab === "presentation"
              ? "border-[#D4A017] text-[#0F172A]"
              : "border-transparent hover:text-slate-700"
          }`}
        >
          Présentation
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("filieres")}
          className={`flex-1 pb-3 text-center border-b-2 transition-all cursor-pointer ${
            activeTab === "filieres"
              ? "border-[#D4A017] text-[#0F172A]"
              : "border-transparent hover:text-slate-700"
          }`}
        >
          Vie sur le Campus & Avantages
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("admission")}
          className={`flex-1 pb-3 text-center border-b-2 transition-all cursor-pointer ${
            activeTab === "admission"
              ? "border-[#D4A017] text-[#0F172A]"
              : "border-transparent hover:text-slate-700"
          }`}
        >
          Notre Prépa & Admission
        </button>
      </div>
      {/* Tab Content Display */}
      <div className="pt-4 space-y-6 min-h-[300px]">
        {activeTab === "presentation" && (
          <div className="space-y-6 text-center flex flex-col items-center">
            <div className="space-y-2 max-w-3xl mx-auto text-center">
              <span className="text-xs font-bold text-[#D4A017] uppercase tracking-wider block">
                Fiche d&apos;identité
              </span>
              <h3 className="text-2xl font-light tracking-tight text-slate-900 leading-tight">
                {sData.nom_complet || "École Cible"}
              </h3>
              <p className="text-slate-550 text-sm font-light leading-relaxed max-w-4xl text-center">
                {sData.description}
              </p>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
              <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50/30 flex flex-col items-center justify-center text-center gap-2">
                <Building className="w-5 h-5 text-[#D4A017]" />
                <div>
                  <span className="block text-[10px] text-slate-400 font-bold uppercase">Statut</span>
                  <span className="text-xs font-semibold text-slate-800 block">{sData.statut || "Public"}</span>
                </div>
              </div>
              <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50/30 flex flex-col items-center justify-center text-center gap-2">
                <MapPin className="w-5 h-5 text-[#D4A017]" />
                <div>
                  <span className="block text-[10px] text-slate-400 font-bold uppercase">Localisation</span>
                  <span className="text-xs font-semibold text-slate-800 block">{sData.localisation}</span>
                </div>
              </div>
              <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50/30 flex flex-col items-center justify-center text-center gap-2">
                <Calendar className="w-5 h-5 text-[#D4A017]" />
                <div>
                  <span className="block text-[10px] text-slate-400 font-bold uppercase">Création</span>
                  <span className="text-xs font-semibold text-slate-800 block">{sData.creation}</span>
                </div>
              </div>
              {sData.site_internet && (
                <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50/30 flex flex-col items-center justify-center text-center gap-2">
                  <Globe className="w-5 h-5 text-[#D4A017]" />
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">Site officiel</span>
                    <a
                      href={`https://${sData.site_internet}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-blue-600 hover:underline block"
                    >
                      {sData.site_internet}
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* General school info details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100 w-full text-center">
              {sData.tutelle && (
                <div className="space-y-1">
                  <span className="block text-xs font-bold text-slate-400 uppercase">Tutelle Administrative</span>
                  <p className="text-sm font-medium text-slate-700">{sData.tutelle}</p>
                </div>
              )}
              {sData.operateur && (
                <div className="space-y-1">
                  <span className="block text-xs font-bold text-slate-400 uppercase">Opérateur de Référence</span>
                  <p className="text-sm font-medium text-slate-700">{sData.operateur}</p>
                </div>
              )}
              {sData.telephone && (
                <div className="space-y-1">
                  <span className="block text-xs font-bold text-slate-400 uppercase">Renseignements Téléphoniques</span>
                  <a href={`tel:${sData.telephone}`} className="text-sm font-medium text-slate-700 hover:text-blue-600 font-mono block">
                    {sData.telephone}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "filieres" && (
          <div className="space-y-6 text-center flex flex-col items-center">
            <div className="space-y-2 max-w-3xl mx-auto">
              <span className="text-xs font-bold text-[#D4A017] uppercase tracking-wider block">
                Avantages & Vie Académique
              </span>
              <h3 className="text-2xl font-light tracking-tight text-slate-900 leading-tight">
                Cadre de vie et opportunités d&apos;excellence
              </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start w-full">
              {/* Left Column - Key School-Specific Advantages */}
              <div className="space-y-4">
                {activeSchool === "inphb" && (
                  <>
                    <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50 flex flex-col items-center text-center gap-3">
                      <Home className="w-8 h-8 text-[#D4A017] flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Hébergement Garanti</h4>
                        <p className="text-xs text-slate-550 leading-relaxed mt-1">{sData.hebergement || "Studio individuel meublé sur le campus."}</p>
                      </div>
                    </div>
                    <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50 flex flex-col items-center text-center gap-3">
                      <Percent className="w-8 h-8 text-[#D4A017] flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Insertion Immédiate</h4>
                        <p className="text-xs text-slate-550 leading-relaxed mt-1">{sData.insertion || "100% d'insertion professionnelle rapide."}</p>
                      </div>
                    </div>
                  </>
                )}
                {activeSchool === "esatic" && (
                  <>
                    <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50 flex flex-col items-center text-center gap-3">
                      <Award className="w-8 h-8 text-[#D4A017] flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Bourse & Gratuité</h4>
                        <p className="text-xs text-slate-550 leading-relaxed mt-1">{sData.avantages || "Scolarité gratuite pour admis et bourses d'études."}</p>
                      </div>
                    </div>
                    <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50 flex flex-col items-center text-center gap-3">
                      <Users className="w-8 h-8 text-[#D4A017] flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Excellence Numérique</h4>
                        <p className="text-xs text-slate-550 leading-relaxed mt-1">{sData.excellence || "Champions de cybersécurité Hackathon CEDEAO."}</p>
                      </div>
                    </div>
                  </>
                )}
                {activeSchool === "cme" && (
                  <>
                    <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50 flex flex-col items-center text-center gap-3">
                      <Shield className="w-8 h-8 text-[#D4A017] flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Opérateur Industriel d&apos;Élite</h4>
                        <p className="text-xs text-slate-550 leading-relaxed mt-1">{sData.certifications || "Certifié par la CIE avec label ASEA."}</p>
                      </div>
                    </div>
                    <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50 flex flex-col items-center text-center gap-3">
                      <Percent className="w-8 h-8 text-[#D4A017] flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Frais d&apos;Études & Employabilité</h4>
                        <p className="text-xs text-slate-550 leading-relaxed mt-1">{sData.frais_etudes || "Filières payantes menant à l'insertion immédiate."}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Right Column - Descriptive Cadre de vie / Mixité / Excellence */}
              <div className="p-6 border border-slate-100 bg-slate-50/30 rounded-3xl space-y-4 text-center">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest text-center">
                  {activeSchool === "inphb" ? "Le Campus de Yamoussoukro" : activeSchool === "esatic" ? "Palmarès Académique" : "Mixité & RSE"}
                </span>
                <p className="text-xs sm:text-sm text-slate-655 leading-relaxed font-light text-center">
                  {activeSchool === "inphb" ? sData.cadre_vie : activeSchool === "esatic" ? sData.excellence : sData.mixite}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "admission" && (
          <div className="space-y-6 text-center flex flex-col items-center">
            <div className="space-y-2 max-w-3xl mx-auto">
              <span className="text-xs font-bold text-[#D4A017] uppercase tracking-wider block">
                Objectifs Admissions & Réussite
              </span>
              <h3 className="text-2xl font-light tracking-tight text-slate-900 leading-tight">
                Comment nous vous préparons pour intégrer {schools.find((s) => s.code === activeSchool)?.name}
              </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center w-full">
              {/* Accompagnement Bullet Points */}
              <div className="space-y-4 text-center flex flex-col items-center">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 text-center">Piliers de notre Encadrement</span>
                
                {activeSchool === "inphb" && (
                  <ul className="space-y-3 text-center flex flex-col items-center">
                    <li className="flex flex-col items-center text-center gap-1.5 text-xs sm:text-sm text-slate-655 font-light">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span>Renforcement ciblé sur le programme de Mathématiques de prépa (Sup/Spé).</span>
                    </li>
                    <li className="flex flex-col items-center text-center gap-1.5 text-xs sm:text-sm text-slate-655 font-light">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span>Simulations régulières des épreuves de Physique, Chimie et Français.</span>
                    </li>
                    <li className="flex flex-col items-center text-center gap-1.5 text-xs sm:text-sm text-slate-655 font-light">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span>Entraînement guidé sur les anciens sujets officiels de l&apos;INP-HB.</span>
                    </li>
                  </ul>
                )}

                {activeSchool === "esatic" && sData.programme && (
                  <div className="space-y-2 text-xs sm:text-sm text-slate-655 leading-relaxed whitespace-pre-line font-light text-center">
                    {sData.programme}
                  </div>
                )}

                {activeSchool === "cme" && sData.accompagnement && (
                  <div className="space-y-2 text-xs sm:text-sm text-slate-655 leading-relaxed whitespace-pre-line font-light text-center">
                    {sData.accompagnement}
                  </div>
                )}
              </div>

              {/* Call to action card */}
              <div className="p-6 bg-gradient-to-br from-[#0F172A] to-[#1E293B] text-white rounded-3xl space-y-4 text-center flex flex-col items-center justify-center">
                <h4 className="text-lg font-bold text-white tracking-tight">Prêt à commencer ?</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  L&apos;inscription à notre classe de préparation accélère vos chances de réussite. Les places par zone géographique sont limitées pour assurer un suivi optimal de chaque apprenant.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 pt-2 justify-center w-full">
                  <a
                    href="/inscription"
                    className="text-center text-xs font-bold bg-[#D4A017] hover:bg-yellow-600 text-white px-4 py-2.5 rounded-lg shadow-md transition-all"
                  >
                    S&apos;inscrire maintenant
                  </a>
                  {sData.site_internet && (
                    <a
                      href={`https://${sData.site_internet}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-center text-xs font-semibold border border-slate-700 hover:border-slate-500 text-slate-300 px-4 py-2.5 rounded-lg transition-all"
                    >
                      Portail de l&apos;école
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
