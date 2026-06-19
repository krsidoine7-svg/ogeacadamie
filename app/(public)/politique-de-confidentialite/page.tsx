import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Eye, Lock, FileText, Smartphone } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Premium Dark Header (Matches Homepage Hero style) */}
      <header className="bg-[#0A0E17] text-white py-16 px-4 relative overflow-hidden flex-shrink-0">
        {/* Glow effects */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-[#F04438]/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-64 h-64 bg-[#F04438]/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-4xl mx-auto text-center space-y-4 relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#F04438] hover:text-[#d9382e] transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </Link>
          <div className="flex items-center justify-center gap-2">
            <ShieldCheck className="w-8 h-8 text-[#F04438]" />
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Politique de Confidentialité
            </h1>
          </div>
          <p className="text-sm text-slate-400 font-medium">
            Dernière mise à jour : 19 Juin 2026 — Conformité RGPD & Oge Académie
          </p>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-10 shadow-sm space-y-8 text-slate-700 leading-relaxed text-sm sm:text-base font-light">
          
          {/* Section 1: Introduction */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#F04438]" />
              1. Introduction
            </h2>
            <p>
              Chez <strong>OGE Académie</strong>, nous accordons une importance primordiale à la protection de vos données personnelles et au respect de votre vie privée. Cette politique a pour but de vous informer de manière transparente sur la façon dont nous recueillons, utilisons, conservons et protégeons vos informations personnelles lorsque vous utilisez notre plateforme de préparation aux concours.
            </p>
          </section>

          {/* Section 2: Données Collectées */}
          <section className="space-y-4">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-[#F04438]" />
              2. Informations collectées et finalités
            </h2>
            <p>
              Nous collectons uniquement les informations strictement nécessaires à la gestion de votre dossier de candidature et à votre suivi pédagogique :
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 border border-slate-150 rounded-2xl bg-slate-50/50 space-y-2">
                <span className="font-bold text-slate-900 block text-xs uppercase text-[#F04438]">Identité & Inscription</span>
                <p className="text-xs text-slate-600">
                  <strong>Nom, Prénom, Email, Série du Bac</strong> : Utilisés pour valider vos concours cibles (INP-HB, ESATIC, CME), vous rattacher à un rôle Candidat et expédier vos e-mails de connexion ou confirmations.
                </p>
              </div>
              <div className="p-4 border border-slate-150 rounded-2xl bg-slate-50/50 space-y-2">
                <span className="font-bold text-slate-900 block text-xs uppercase text-[#F04438]">Coordonnées WhatsApp</span>
                <p className="text-xs text-slate-600">
                  <strong>Numéro WhatsApp</strong> : Collecté obligatoirement afin de vous intégrer dans nos groupes d'étude et de coaching locaux par zone pour l'accompagnement pédagogique.
                </p>
              </div>
              <div className="p-4 border border-slate-150 rounded-2xl bg-slate-50/50 space-y-2">
                <span className="font-bold text-slate-900 block text-xs uppercase text-[#F04438]">Justificatifs Comptables</span>
                <p className="text-xs text-slate-600">
                  <strong>Preuve de paiement Wave / MoMo</strong> : Captures d'écran stockées de manière sécurisée pour permettre aux managers de zone de vérifier le règlement des frais de 15 000 FCFA.
                </p>
              </div>
              <div className="p-4 border border-slate-150 rounded-2xl bg-slate-50/50 space-y-2">
                <span className="font-bold text-slate-900 block text-xs uppercase text-[#F04438]">Logs de Sécurité</span>
                <p className="text-xs text-slate-600">
                  <strong>Accès aux documents</strong> : Nous enregistrons vos consultations (adresse email incrustée en filigrane, heure) pour prévenir le piratage et la distribution frauduleuse de nos cours protégés.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Sécurité & Protection */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#F04438]" />
              3. Sécurité de vos données
            </h2>
            <p>
              Vos données sont stockées sur des serveurs sécurisés en Europe opérés par <strong>Supabase</strong>. Toutes les connexions sont chiffrées via le protocole HTTPS. L'accès à vos fichiers de paiement et à vos fiches est strictement restreint via des règles de sécurité (Row Level Security) afin qu'aucun autre utilisateur ne puisse y accéder. Les cours PDF de révision bénéficient de protections anti-copie (filigranes personnalisés, interdiction d'impression et blocage de captures d'écran).
            </p>
          </section>

          {/* Section 4: Conservation */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#F04438]" />
              4. Durée de conservation
            </h2>
            <p>
              Vos informations personnelles et scolaires sont conservées pendant toute la durée de la session de préparation en cours (généralement 12 mois), après quoi les profils inactifs sont archivés ou anonymisés en accord avec les réglementations de protection des données (Soft Delete).
            </p>
          </section>

          {/* Section 5: Droits de l'utilisateur */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#F04438]" />
              5. Vos Droits
            </h2>
            <p>
              Conformément à la réglementation RGPD, vous disposez d'un droit d'accès, de rectification et d'effacement de vos données personnelles. Pour des raisons évidentes de sécurité, vous ne pouvez pas modifier votre adresse e-mail de connexion directement depuis le site, mais vous pouvez mettre à jour votre numéro WhatsApp ou introduire une demande de suppression définitive de votre compte en écrivant au support à l'adresse suivante : <strong>contact@oge-academie.ci</strong>.
            </p>
          </section>

          <div className="pt-6 border-t border-slate-150 text-center text-xs text-slate-450">
            © 2026 OGE Académie — Tous droits réservés.
          </div>
        </div>
      </main>
    </div>
  );
}
