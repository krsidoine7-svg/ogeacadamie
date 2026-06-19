import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { pageSections, temoignages, blogArticles } from "@/drizzle/schema";
import { asc, desc, eq, and, isNull } from "drizzle-orm";
import InteractiveSchoolGuides from "@/components/shared/InteractiveSchoolGuides";
import BlogGrid from "@/components/shared/BlogGrid";
import { 
  BookOpen, 
  GraduationCap, 
  Award, 
  CheckCircle2, 
  ArrowRight, 
  MapPin, 
  Phone, 
  Mail, 
  Star, 
  User,
  MessageCircle,
  PlayCircle
} from "lucide-react";

// Fallback contents aligned with user specifications
const DEFAULT_CONTENTS: any = {
  hero: {
    badge: "Session 2026",
    title: "INTEGREZ LES MEILLEURS ECOLES IVOIRIENNE",
    subtitle: "OGE ACADÉMIE vous prépare aux concours de l'INP-HB, de l'ESATIC et du CME grâce à une pédagogie d'excellence, un accompagnement personnalisé et des programmes adaptés aux exigences de chaque école.",
    cta_primary: "S'inscrire",
    cta_secondary: "Se connecter",
    whatsapp_group_link: "https://chat.whatsapp.com/L123456789"
  },
  historique: {
    title: "Notre Histoire & Mission",
    text: "Après deux années d’expérience et de succès à Bouaké, OGE ACADÉMIE franchit une nouvelle étape dans son développement. Cette année, nous avons choisi de nous rapprocher davantage des élèves et étudiants en nous implantant à Yamoussoukro, Yopougon, Abobo, Cocody et Port-Bouët. À travers cette expansion, nous réaffirmons notre engagement à offrir une pédagogie d’excellence et à accompagner chaque apprenant sur le chemin de la réussite.",
    activities: [
      { title: "Conférences d'orientation", desc: "Sessions d'information et d'inspiration sur les filières et carrières des grandes écoles." },
      { title: "Cours de renforcement intensifs", desc: "Des cours en présentiel et en ligne avec supports officiels et corrigés d'examens." }
    ],
    centers: [
      { name: "Lycée Technique de Bouaké", phone: "+225 0707070707", address: "Bouaké, Quartier Commerce" },
      { name: "Centre Yamoussoukro", phone: "+225 0101010101", address: "Yamoussoukro, Quartier 220 Logements" },
      { name: "Centre Yopougon", phone: "+225 0202020202", address: "Abidjan, Yopougon Maroc" },
      { name: "Centre Abobo", phone: "+225 0303030303", address: "Abidjan, Abobo Baoulé" },
      { name: "Centre Cocody", phone: "+225 0404040404", address: "Abidjan, Cocody Riviera" },
      { name: "Centre Port-Bouët", phone: "+225 0505050505", address: "Abidjan, Port-Bouët Centre" }
    ]
  },
  formation: {
    title: "Nos Formations Cibles",
    subtitle: "Nos formations sont spécialement conçues pour répondre aux exigences des concours de l'INP-HB, de l'ESATIC et du CME.",
    inphb: {
      description: "L'Institut National Polytechnique Félix Houphouët-Boigny de Yamoussoukro est le temple de l'ingénierie et de la recherche en Afrique de l'Ouest. Découvrez la fiche d'identité de l'école et toutes les informations officielles du concours bachelier.",
      nom_complet: "Institut National Polytechnique Félix Houphouët-Boigny",
      statut: "Établissement Public",
      localisation: "Yamoussoukro",
      creation: "Septembre 1996",
      effectifs: "6 130+ Élèves",
      hebergement: "Studio Garanti",
      insertion: "100 % d'Insertion",
      site_internet: "inphb.edu.ci",
      cadre_vie: "Le campus offre deux grands restaurants universitaires, des terrains de sport de classe internationale, une assistance médicale continue, et un environnement propice à la concentration et au développement personnel."
    },
    esatic: {
      description: "L'École Supérieure Africaine des Technologies de l'Information et de la Communication d'Abidjan est l'établissement de référence pour les futurs bâtisseurs du monde numérique. Découvrez la fiche technique et les conditions d'accès du concours Licence 1.",
      nom_complet: "École Supérieure Africaine des Technologies de l'Information et de la Communication",
      statut: "Établissement Public LMD",
      localisation: "Treichville, Abidjan (Zone 3, Boulevard de Marseille)",
      creation: "Janvier 2012",
      tutelle: "MTND (Ministère de la Transition Numérique)",
      avantages: "Bourse & Gratuité",
      telephone: "+225 27 21 21 81 00",
      site_internet: "esatic.ci",
      excellence: "Les étudiants de l'ESATIC ont remporté le prestigieux Hackathon de la CEDEAO 2024 à Abuja, illustrant la pertinence et la qualité de la formation en Cybersécurité dispensée au sein du campus.",
      programme: "• Un renforcement ciblé sur les programmes de Mathématiques et Physiques de Terminale C, D et E.\n• Des sessions de tests de logique et de raisonnement rapide.\n• Des concours blancs en temps limité pour maîtriser la gestion du temps le jour J.\n• Une aide à la préinscription en ligne sur le portail concours.esatic.ci."
    },
    cme: {
      description: "Le Centre des Métiers de l'Électricité de Bingerville, opéré par la CIE (groupe ERANOVE) en partenariat avec l'INP-HB, est le fleuron de la formation technique industrielle. Découvrez la fiche technique et le calendrier officiel pour intégrer ce centre d'excellence.",
      nom_complet: "Centre des Métiers de l'Électricité de Bingerville",
      operateur: "CIE (Compagnie Ivoirienne d'Électricité)",
      localisation: "Bingerville, Abidjan (Quartier Akouai Santé)",
      creation: "Mars 1970",
      certifications: "Centre d'Excellence ASEA / RH Excellence",
      frais_etudes: "Filières Payantes",
      telephone: "+225 27 21 33 66 41",
      site_internet: "cme.ci",
      mixite: "Le CME s'engage activement pour le développement durable en visant un quota ambitieux de 43% de filles dans ses filières techniques.",
      accompagnement: "• Renforcement des bases de physique industrielle, électricité et mécanique.\n• Préparation spécifique à la lettre de motivation requise dans le dossier physique.\n• Résolution guidée des sujets des sessions précédentes du concours commun INP-HB / CME.\n• Méthode d'organisation et gestion du temps le jour du test."
    }
  },
  resultats: {
    title: "Nos Résultats & Zones",
    subtitle: "Une réussite bâtie sur le travail, l'encadrement et la discipline.",
    stats: [
      { value: "6 zones", label: "Yamoussoukro, Yopougon, Abobo, Cocody, Port-Bouët et Bouaké" },
      { value: "2 ans", label: "d'expérience et de succès à Bouaké" },
      { value: "15 000 F", label: "Frais de prépa tout inclus (Wave, Mobile Money)" }
    ]
  },
  temoignages: {
    title: "Ce que disent nos candidats",
    subtitle: "Découvrez les retours d'expérience des candidats qui ont réussi grâce à OGE Académie."
  },
  inscription: {
    title: "Rejoignez OGE Académie dès maintenant",
    subtitle: "Inscrivez-vous dès aujourd'hui pour seulement 15 000 FCFA (frais Wave / Mobile Money inclus) et accédez immédiatement à nos cours.",
    cta_text: "S'inscrire en ligne"
  },
  footer: {
    facebook: "https://facebook.com/ogeacademie",
    whatsapp: "https://wa.me/2250000000000",
    tiktok: "https://tiktok.com/@ogeacademie",
    email: "contact@oge-academie.ci",
    phone: "+225 01 02 03 04 05",
    address: "Abidjan / Bouaké, Côte d'Ivoire"
  }
};

const formatTitle = (title: string) => {
  if (!title || title.toUpperCase() === "SECTION HÉRO" || title.toUpperCase() === "SECTION HERO") {
    return (
      <>
        Intégrez les{" "}
        <span className="bg-[#F04438] text-white px-5 py-1.5 rounded-full inline-block font-extrabold normal-case mx-1.5 shadow-md">
          meilleures écoles
        </span>{" "}
        ivoiriennes
      </>
    );
  }
  const upper = title.toUpperCase();
  if (upper.includes("MEILLEURS ECOLES") || upper.includes("MEILLEURES ECOLES")) {
    return (
      <>
        Intégrez les{" "}
        <span className="bg-[#F04438] text-white px-5 py-1.5 rounded-full inline-block font-extrabold normal-case mx-1.5 shadow-md">
          meilleures écoles
        </span>{" "}
        ivoiriennes
      </>
    );
  }
  return title;
};

export default async function Home() {
  // Fetch active sections
  const dbSections = await db.query.pageSections.findMany({
    orderBy: [asc(pageSections.ordre)]
  });

  // Fetch active testimonials
  const dbTestimonials = await db.query.temoignages.findMany({
    where: and(
      eq(temoignages.isActive, true),
      isNull(temoignages.deletedAt)
    )
  });

  // Fetch published blog articles
  const dbArticles = await db.query.blogArticles.findMany({
    where: and(
      eq(blogArticles.isPublished, true),
      isNull(blogArticles.deletedAt)
    ),
    orderBy: [desc(blogArticles.publishedAt)]
  });

  const fallbackTestimonials = [
    {
      nom: "Koffi",
      prenom: "Ange",
      zone: "yamoussoukro",
      concours: "inphb",
      message: "Grâce à OGE Académie, j'ai pu intégrer les CPGE de l'INP-HB. Les cours intensifs de physique m'ont sauvé !",
      note: 5
    },
    {
      nom: "Diallo",
      prenom: "Mamadou",
      zone: "bouake",
      concours: "esatic",
      message: "L'encadrement par zone de formation et le suivi WhatsApp m'ont permis de rester motivé tout au long de ma préparation.",
      note: 5
    },
    {
      nom: "Kouadio",
      prenom: "Sylvie",
      zone: "yopougon",
      concours: "cme",
      message: "Des corrigés clairs et des explications en vidéo que l'on ne trouve nulle part ailleurs. Recommandé à 100% !",
      note: 5
    }
  ];

  const testimonialsList = dbTestimonials.length > 0 ? dbTestimonials : fallbackTestimonials;

  // Build section contents mapping
  const contentMap: any = {};
  const activeMap: any = {};

  dbSections.forEach((sec) => {
    activeMap[sec.cle] = sec.isActive;
    contentMap[sec.cle] = {
      ...DEFAULT_CONTENTS[sec.cle],
      title: sec.titre || DEFAULT_CONTENTS[sec.cle].title,
      ...(sec.contenu || {})
    };
  });

  // Ensure default maps are filled
  Object.keys(DEFAULT_CONTENTS).forEach((key) => {
    if (activeMap[key] === undefined) activeMap[key] = true;
    if (contentMap[key] === undefined) contentMap[key] = DEFAULT_CONTENTS[key];
  });

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-[#D4A017] selection:text-white">
      {/* Universal Navigation Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 py-4 sm:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-[#0F172A] fill-[#D4A017]/25" />
            <span className="text-xl font-bold tracking-tight text-slate-900">
              OGE <span className="text-[#D4A017]">Académie</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-700">
            {activeMap.hero && <a href="#accueil" className="hover:text-[#D4A017] transition-all">Accueil</a>}
            {activeMap.historique && <a href="#historique" className="hover:text-[#D4A017] transition-all">Historique</a>}
            {activeMap.formation && <a href="#formations" className="hover:text-[#D4A017] transition-all">Formations</a>}
            {activeMap.resultats && <a href="#statistiques" className="hover:text-[#D4A017] transition-all">Résultats</a>}
            {dbArticles.length > 0 && <a href="#blog" className="hover:text-[#D4A017] transition-all">Blog</a>}
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/connexion"
              className="text-sm font-bold text-slate-700 hover:text-[#0F172A] transition-all py-2 px-4"
              id="nav-connexion-btn"
            >
              Connexion
            </Link>
            <Link
              href="/inscription"
              className="text-sm font-bold text-white bg-[#0F172A] hover:bg-[#1E293B] border border-transparent rounded-xl py-2 px-5 transition-all shadow-md"
              id="nav-inscription-btn"
            >
              S'inscrire
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* HERO SECTION */}
        {activeMap.hero && (
          <section id="accueil" className="relative overflow-hidden bg-[#0A0E17] text-white py-16 sm:py-24 lg:py-28 px-4 sm:px-8 lg:px-12 flex items-center border border-white/10 rounded-[24px] sm:rounded-[36px] lg:rounded-[48px] mx-4 sm:mx-8 lg:mx-[100px] mt-4 sm:mt-6 lg:mt-8">
            {/* Red/Orange Glow Backdrops */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-[#F04438]/10 rounded-full blur-[120px] pointer-events-none -z-10" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#F04438]/10 rounded-full blur-[120px] pointer-events-none -z-10" />
            
            <div className="max-w-5xl mx-auto flex flex-col items-center justify-center text-center relative z-10 space-y-6">
              {contentMap.hero.badge && (
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-white/5 text-white border border-white/10 uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {contentMap.hero.badge}
                </span>
              )}
              <h1 className="text-4xl sm:text-5xl lg:text-[64px] font-black tracking-tight text-white leading-[1.1] max-w-5xl mx-auto uppercase">
                {formatTitle(contentMap.hero.title)}
              </h1>
              <p className="text-slate-400 text-base sm:text-lg lg:text-xl font-normal leading-relaxed max-w-3xl mx-auto">
                {contentMap.hero.subtitle}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 w-full">
                <Link
                  href="/inscription"
                  className="w-full sm:w-auto text-center font-bold text-white bg-gradient-to-r from-[#F04438] to-[#FF6B6B] hover:opacity-95 px-8 py-4 rounded-xl shadow-lg shadow-[#F04438]/20 transition-all text-sm tracking-wide uppercase cursor-pointer hover:-translate-y-0.5 active:translate-y-0 duration-150"
                  id="hero-cta-primary"
                >
                  {contentMap.hero.cta_primary}
                </Link>
                <Link
                  href="/connexion"
                  className="w-full sm:w-auto text-center font-bold text-slate-200 hover:text-white border border-slate-800 hover:border-slate-600 bg-slate-900/40 hover:bg-slate-900/80 px-8 py-4 rounded-xl shadow-sm transition-all text-sm tracking-wide uppercase cursor-pointer hover:-translate-y-0.5 active:translate-y-0 duration-150"
                  id="hero-cta-secondary"
                >
                  {contentMap.hero.cta_secondary}
                </Link>
              </div>

              {/* Bottom trust checks matching the PressSync model */}
              <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 pt-12 border-t border-white/5 w-full text-slate-400 text-xs sm:text-sm font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="text-[#F04438] font-bold">✓</span> Prépa n°1 en Côte d'Ivoire
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[#F04438] font-bold">✓</span> Suivi WhatsApp continu
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[#F04438] font-bold">✓</span> 6 zones d'études
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[#F04438] font-bold">✓</span> Supports officiels
                </div>
              </div>
            </div>
          </section>
        )}

        {/* HISTORIQUE SECTION WITH DETAILED CENTERS */}
        {activeMap.historique && (
          <section id="historique" className="py-20 px-4 sm:px-8 bg-white border-b border-slate-200">
            <div className="max-w-7xl mx-auto space-y-12">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-7 space-y-6 text-center flex flex-col items-center">
                  <span className="text-xs font-bold text-[#D4A017] uppercase tracking-wider block">
                    Depuis Bouaké jusqu'à Abidjan & Yamoussoukro
                  </span>
                  <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
                    {contentMap.historique.title}
                  </h2>
                  <p className="text-slate-600 text-base sm:text-lg font-light leading-relaxed max-w-2xl mx-auto">
                    {contentMap.historique.text}
                  </p>
                </div>

                <div className="lg:col-span-5 space-y-4 flex flex-col items-center justify-center text-center">
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest text-center">
                    Capsule de nos activités
                  </span>
                  {contentMap.historique.activities.map((activity: any, index: number) => (
                    <div
                      key={index}
                      className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col items-center text-center gap-3 hover:border-[#D4A017]/35 transition-all duration-300 shadow-sm w-full"
                    >
                      <div className="w-10 h-10 rounded-xl bg-[#0F172A] flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-[#D4A017]" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-base font-semibold text-slate-900 tracking-tight">
                          {activity.title}
                        </h4>
                        <p className="text-sm text-slate-500 font-light leading-relaxed">
                          {activity.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Physical locations and direct call contact mappings */}
              <div className="space-y-6 pt-10 border-t border-slate-100 text-center">
                <div className="space-y-2">
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight text-center">
                    Nos Lieux Physiques & Contacts de Zone
                  </h3>
                  <p className="text-xs text-slate-450 font-light text-center">
                    Cliquez sur les numéros pour nous appeler directement ou localiser nos centres.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(contentMap.historique.centers || []).map((center: any, index: number) => (
                    <div
                      key={index}
                      className="p-5 rounded-2xl border border-slate-150 bg-white shadow-sm flex flex-col justify-between space-y-4 text-center items-center"
                    >
                      <div className="space-y-1 w-full text-center">
                        <span className="text-[10px] font-bold text-[#D4A017] uppercase tracking-widest block text-center">
                          Centre de Formation
                        </span>
                        <h4 className="text-sm font-bold text-slate-800 uppercase text-center">
                          {center.name}
                        </h4>
                        <p className="text-xs text-slate-550 font-light flex items-center justify-center gap-1">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                          {center.address}
                        </p>
                      </div>
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-6 w-full">
                        <a
                          href={`tel:${center.phone.replace(/\s+/g, "")}`}
                          className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-700 hover:text-[#D4A017] transition-all"
                        >
                          <Phone className="w-3.5 h-3.5 text-slate-400 hover:text-[#D4A017]" />
                          Appeler
                        </a>
                        <a
                          href={`https://wa.me/${center.phone.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-all"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                          WhatsApp
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* FORMATIONS TARGET SECTION WITH INTERACTIVE GUIDE */}
        {activeMap.formation && (
          <section id="formations" className="py-20 px-4 sm:px-8 bg-slate-50 border-b border-slate-200">
            <div className="max-w-7xl mx-auto space-y-12">
              <div className="text-center max-w-3xl mx-auto space-y-3">
                <span className="text-xs font-bold text-[#D4A017] uppercase tracking-wider">
                  Programmes Académiques d'Excellence
                </span>
                <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
                  {contentMap.formation.title}
                </h2>
                <p className="text-slate-500 text-base font-light">
                  {contentMap.formation.subtitle}
                </p>
              </div>

              {/* SCHOOL GUIDE INTERACTIVE PANELS */}
              <InteractiveSchoolGuides formationData={contentMap.formation} />
            </div>
          </section>
        )}

        {/* RESULTATS / CHIFFRES CLÉS SECTION */}
        {activeMap.resultats && (
          <section id="statistiques" className="py-20 px-4 sm:px-8 bg-gradient-to-br from-[#0F172A] to-[#1E293B] text-white border-b border-slate-900">
            <div className="max-w-7xl mx-auto space-y-12">
              <div className="text-center max-w-3xl mx-auto space-y-3">
                <span className="text-xs font-bold text-[#D4A017] uppercase tracking-wider">
                  Chiffres Clés & Tarifs
                </span>
                <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
                  {contentMap.resultats.title}
                </h2>
                <p className="text-slate-300 text-base font-light">
                  {contentMap.resultats.subtitle}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {contentMap.resultats.stats.map((stat: any, index: number) => (
                  <div key={index} className="text-center p-8 bg-white/5 rounded-3xl border border-white/5 space-y-3">
                    <span className="block text-4xl sm:text-5xl font-extralight text-[#D4A017] tracking-tight">
                      {stat.value}
                    </span>
                    <span className="block text-sm font-light text-slate-300 leading-relaxed">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* DYNAMIC BLOG NEWS ANNOUNCEMENTS */}
        {dbArticles.length > 0 && (
          <section id="blog" className="py-20 px-4 sm:px-8 bg-white border-b border-slate-200">
            <div className="max-w-7xl mx-auto space-y-12">
              <div className="text-center max-w-3xl mx-auto space-y-3">
                <span className="text-xs font-bold text-[#D4A017] uppercase tracking-wider">
                  Actualités & Procédures de Concours
                </span>
                <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-slate-900">
                  Suivez les Modifications Administrates
                </h2>
                <p className="text-slate-550 text-base font-light">
                  Retrouvez ici toutes les informations officielles et les procédures d'admission mises à jour pour la session en cours.
                </p>
              </div>

              {/* Render dynamic Grid of blog articles */}
              <BlogGrid articles={dbArticles} />
            </div>
          </section>
        )}

        {/* TEMOIGNAGES SECTION */}
        {activeMap.temoignages && (
          <section id="temoignages" className="py-20 px-4 sm:px-8 bg-slate-50 border-b border-slate-200">
            <div className="max-w-7xl mx-auto space-y-12">
              <div className="text-center max-w-3xl mx-auto space-y-3">
                <span className="text-xs font-bold text-[#D4A017] uppercase tracking-wider">
                  Retours d'Expérience
                </span>
                <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-slate-900">
                  {contentMap.temoignages.title}
                </h2>
                <p className="text-slate-500 text-base font-light">
                  {contentMap.temoignages.subtitle}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {testimonialsList.map((t: any, index: number) => (
                  <div
                    key={index}
                    className="p-6 md:p-8 bg-white rounded-3xl border border-slate-100 hover:border-slate-200 transition-all flex flex-col justify-between space-y-6 shadow-sm"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center text-amber-500 gap-0.5">
                        {Array.from({ length: t.note || 5 }).map((_, idx) => (
                          <Star key={idx} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                      <p className="text-slate-500 text-sm font-light italic leading-relaxed">
                        "{t.message}"
                      </p>
                    </div>

                    <div className="flex items-center gap-3.5 pt-4 border-t border-slate-100">
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-655 flex-shrink-0 font-semibold overflow-hidden border border-slate-200">
                        {t.photoUrl ? (
                          <img src={t.photoUrl} alt={`${t.prenom} ${t.nom}`} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900">
                          {t.prenom} {t.nom}
                        </h4>
                        <span className="block text-[11px] text-[#D4A017] uppercase font-semibold tracking-wider">
                          Zone {t.zone || "-"} {t.concours && `• Concours ${t.concours.toUpperCase()}`}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* HIGH-IMPACT MARKETING OPPORTUNITY SECTION */}
        {activeMap.inscription && (
          <section className="py-24 px-4 sm:px-8 bg-slate-50 border-t border-slate-200">
            <div className="max-w-5xl mx-auto space-y-16">
              <div className="text-center max-w-3xl mx-auto space-y-6">
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-extrabold bg-red-50 text-red-650 border border-red-200 uppercase tracking-widest animate-pulse">
                  🚨 L'OPPORTUNITÉ D'UNE VIE
                </span>
                <h2 className="text-3xl sm:text-5xl font-black tracking-tight uppercase leading-tight text-slate-900">
                  Ne gâchez pas votre unique chance d'intégrer l'élite
                </h2>
                <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-normal">
                  Les places à l'<strong>INP-HB</strong>, l'<strong>ESATIC</strong> et au <strong>CME</strong> sont extrêmement chères et limitées. Chaque année, des milliers d’élèves brillants ratent ces concours simplement parce qu'ils n’ont pas eu la bonne préparation stratégique. Rater ce concours maintenant, c'est compromettre vos ambitions et risquer de passer à côté d'une carrière exceptionnelle.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4 hover:border-red-500/30 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 font-extrabold text-lg">
                    01
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Le Succès ou le Regret</h3>
                  <p className="text-slate-500 text-xs sm:text-sm font-normal leading-relaxed">
                    Intégrer ces écoles d'élite garantit une bourse d’études, un diplôme prestigieux et une insertion professionnelle assurée. Ne pas vous donner tous les moyens de réussir aujourd’hui est le plus grand risque pour votre avenir.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4 hover:border-red-500/30 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 font-extrabold text-lg">
                    02
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Une Compétition Impitoyable</h3>
                  <p className="text-slate-500 text-xs sm:text-sm font-normal leading-relaxed">
                    Les autres candidats se préparent déjà jour et nuit. Sans nos corrigés d'examens officiels, nos méthodes de résolution rapide et notre accompagnement par zone WhatsApp, vous partez avec un immense désavantage.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4 hover:border-gold/30 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 font-extrabold text-lg">
                    03
                  </div>
                  <h3 className="text-lg font-bold text-amber-700 uppercase tracking-tight">L'Investissement Décisif</h3>
                  <p className="text-slate-500 text-xs sm:text-sm font-normal leading-relaxed">
                    Pour seulement 15 000 FCFA (frais tout inclus), vous accédez à l'arme absolue pour forcer les portes du succès. C'est l'investissement le plus rentable et le plus décisif que vous ferez pour votre carrière.
                  </p>
                </div>
              </div>

              <div className="text-center pt-4">
                <p className="text-xs sm:text-sm font-bold text-red-650 italic uppercase tracking-wider">
                  ⚠️ Le concours n'attend pas. C'est maintenant que se décide votre avenir.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* INSCRIPTION BANNER CTA SECTION */}
        {activeMap.inscription && (
          <section className="py-24 px-4 sm:px-8 bg-white border-t border-slate-100">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
                {contentMap.inscription.title}
              </h2>
              <p className="text-slate-600 text-lg sm:text-xl font-normal max-w-2xl mx-auto leading-relaxed">
                {contentMap.inscription.subtitle}
              </p>
              <div className="pt-4">
                <Link
                  href="/inscription"
                  className="inline-block font-bold text-white bg-[#D4A017] hover:bg-yellow-600 px-10 py-4.5 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 text-base"
                  id="final-cta-btn"
                >
                  {contentMap.inscription.cta_text}
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* FOOTER SECTION */}
      {activeMap.footer && (
        <footer className="bg-[#0F172A] text-slate-400 py-12 px-4 sm:px-8 border-t border-slate-800">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <Link href="/" className="flex items-center gap-2">
                <GraduationCap className="w-8 h-8 text-white fill-[#D4A017]/25" />
                <span className="text-xl font-bold tracking-tight text-white">
                  OGE <span className="text-[#D4A017]">Académie</span>
                </span>
              </Link>
              <p className="text-xs text-slate-450 leading-relaxed">
                Leader de la préparation aux concours de grandes écoles en Côte d'Ivoire. Intégrez l'excellence.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Navigation</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#historique" className="hover:text-white transition-all">Notre Mission</a></li>
                <li><a href="#formations" className="hover:text-white transition-all">Concours visés</a></li>
                <li><a href="#statistiques" className="hover:text-white transition-all">Résultats</a></li>
                <li><a href="/inscription" className="hover:text-white transition-all font-semibold text-[#D4A017]">S'inscrire</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Contacts</h4>
              <ul className="space-y-2 text-xs">
                {contentMap.footer.email && (
                  <li className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-450" />
                    <a href={`mailto:${contentMap.footer.email}`} className="hover:text-white transition-all">{contentMap.footer.email}</a>
                  </li>
                )}
                {contentMap.footer.phone && (
                  <li className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-450" />
                    <span>{contentMap.footer.phone}</span>
                  </li>
                )}
                {contentMap.footer.address && (
                  <li className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-450" />
                    <span>{contentMap.footer.address}</span>
                  </li>
                )}
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider font-semibold">Suivez-nous</h4>
              <div className="flex items-center gap-3">
                {contentMap.footer.facebook && (
                  <a
                    href={contentMap.footer.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#D4A017]/20 text-slate-300 hover:text-white flex items-center justify-center transition-all"
                    title="Facebook"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                )}
                {contentMap.footer.whatsapp && (
                  <a
                    href={contentMap.footer.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#D4A017]/20 text-slate-300 hover:text-white flex items-center justify-center transition-all"
                    title="WhatsApp"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.637-1.023-5.116-2.887-6.981-1.864-1.865-4.343-2.888-6.985-2.89-5.439 0-9.865 4.424-9.869 9.868-.002 1.773.465 3.5 1.353 5.03L1.95 22.046l6.096-1.597.001-.001-.001.001zm12.355-7.39c-.271-.136-1.603-.79-1.854-.882-.25-.091-.433-.136-.615.136-.182.271-.705.882-.864 1.064-.159.182-.318.204-.589.068-.27-.136-1.144-.421-2.18-1.345-.806-.719-1.35-1.606-1.508-1.877-.159-.27-.017-.417.118-.552.122-.122.271-.318.407-.477.136-.159.182-.272.272-.454.091-.181.045-.34-.023-.477-.068-.136-.615-1.482-.841-2.029-.22-.533-.442-.46-.615-.469-.159-.008-.341-.01-.523-.01s-.477.068-.727.34c-.25.272-.955.932-.955 2.273s.977 2.636 1.114 2.818c.136.182 1.92 2.929 4.654 4.111.65.281 1.157.449 1.553.575.654.208 1.25.179 1.722.108.525-.078 1.602-.656 1.83-1.256.227-.6.227-1.114.159-1.222-.068-.108-.25-.173-.522-.309z"/>
                    </svg>
                  </a>
                )}
                {contentMap.footer.tiktok && (
                  <a
                    href={contentMap.footer.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#D4A017]/20 text-slate-300 hover:text-white flex items-center justify-center transition-all font-bold text-xs"
                    title="TikTok"
                  >
                    <span>T</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto pt-8 border-t border-slate-800 mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-550">
            <div>
              &copy; {new Date().getFullYear()} OGE Académie. Tous droits réservés.
            </div>
            <div>
              <Link href="/politique-de-confidentialite" className="hover:text-white hover:underline transition-all">
                Politique de Confidentialité
              </Link>
            </div>
          </div>
        </footer>
      )}
      {/* Floating WhatsApp Button */}
      {contentMap.hero.whatsapp_group_link && (
        <a
          href={contentMap.hero.whatsapp_group_link}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-full shadow-2xl shadow-[#25D366]/30 transition-all duration-300 hover:scale-110 group cursor-pointer border border-[#25D366]/20"
          id="floating-whatsapp-btn"
          title="Rejoindre le groupe WhatsApp"
        >
          <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.637-1.023-5.116-2.887-6.981-1.864-1.865-4.343-2.888-6.985-2.89-5.439 0-9.865 4.424-9.869 9.868-.002 1.773.465 3.5 1.353 5.03L1.95 22.046l6.096-1.597.001-.001-.001.001zm12.355-7.39c-.271-.136-1.603-.79-1.854-.882-.25-.091-.433-.136-.615.136-.182.271-.705.882-.864 1.064-.159.182-.318.204-.589.068-.27-.136-1.144-.421-2.18-1.345-.806-.719-1.35-1.606-1.508-1.877-.159-.27-.017-.417.118-.552.122-.122.271-.318.407-.477.136-.159.182-.272.272-.454.091-.181.045-.34-.023-.477-.068-.136-.615-1.482-.841-2.029-.22-.533-.442-.46-.615-.469-.159-.008-.341-.01-.523-.01s-.477.068-.727.34c-.25.272-.955.932-.955 2.273s.977 2.636 1.114 2.818c.136.182 1.92 2.929 4.654 4.111.65.281 1.157.449 1.553.575.654.208 1.25.179 1.722.108.525-.078 1.602-.656 1.83-1.256.227-.6.227-1.114.159-1.222-.068-.108-.25-.173-.522-.309z"/>
          </svg>
          <span className="absolute right-16 scale-0 transition-all rounded-xl bg-slate-950/90 border border-white/5 backdrop-blur-sm px-3.5 py-2 text-xs text-white group-hover:scale-100 whitespace-nowrap shadow-xl font-bold tracking-wide">
            Rejoindre le groupe WhatsApp
          </span>
        </a>
      )}
    </div>
  );
}
