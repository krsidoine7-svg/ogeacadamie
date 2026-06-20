"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { 
  toggleSectionActive, 
  updateSectionContent, 
  createTestimonial, 
  updateTestimonial, 
  toggleTestimonialActive, 
  deleteTestimonial,
  createBlogArticle,
  updateBlogArticle,
  toggleBlogArticlePublished,
  deleteBlogArticle
} from "../actions";
import { Eye, EyeOff, Edit, Trash2, Plus, Star, Save, Newspaper, Check } from "lucide-react";

interface CMSClientProps {
  initialSections: any[];
  initialTestimonials: any[];
  initialArticles: any[];
}

const DEFAULT_CONTENTS: any = {
  hero: {
    badge: "Session 2026",
    title: "INTEGREZ LES MEILLEURES ECOLES IVOIRIENNES",
    subtitle: "OGE ACADÉMIE vous prépare aux concours de l'INP-HB, de l'ESATIC et du CME grâce à une pédagogie d'excellence, un accompagnement personnalisé et des programmes adaptés aux exigences de chaque école.",
    cta_primary: "S'inscrire",
    cta_secondary: "Se connecter",
    whatsapp_group_link: "https://chat.whatsapp.com/..."
  },
  historique: {
    title: "Notre Histoire & Mission",
    centers_title: "Nos Lieux Physiques & Contacts de Zone",
    centers_subtitle: "Cliquez sur les numéros pour nous appeler directement ou localiser nos centres.",
    text: "Après deux années d’expérience et de succès à Bouaké, OGE ACADÉMIE franchit une nouvelle étape dans son développement. Cette année, nous avons choisi de nous rapprocher davantage des élèves et étudiants en nous implantant à Yamoussoukro, Yopougon, Abobo, Cocody et Port-Bouët. À travers cette expansion, nous réaffirmons notre engagement à offrir une pédagogie d’excellence et à accompagner chaque apprenant sur le chemin de la réussite.",
    activities: [
      { title: "Supports de cours de qualité", desc: "Rédigés par des enseignants expérimentés et des diplômés des grandes écoles." },
      { title: "Suivi personnalisé par zone", desc: "Des responsables de zone pour encadrer vos révisions locales et valider vos étapes." },
      { title: "Examens blancs réguliers", desc: "Pour évaluer votre niveau en conditions réelles et cibler vos lacunes." }
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
    title: "Nos Résultats en Chiffres",
    subtitle: "Une réussite bâtie sur le travail, l'encadrement et la discipline.",
    stats: [
      { value: "6 zones", label: "Yamoussoukro, Yopougon, Abobo, Cocody, Port-Bouët et Bouaké" },
      { value: "2 ans", label: "d'expérience et de succès à Bouaké" },
      { value: "15 000 F", label: "Prix de la prépa, frais Wave/Mobile Money inclus" }
    ],
    percentages: [
      { year: "2023", inphb: "91,30%", cme: "96,80%", esatic: "100%" },
      { year: "2024", inphb: "95,90%", cme: "100%", esatic: "95,40%" },
      { year: "2025", inphb: "98,60%", cme: "100%", esatic: "97,10%" }
    ]
  },
  temoignages: {
    title: "Ce que disent nos candidats",
    subtitle: "Découvrez les retours d'expérience des candidats qui ont réussi grâce à OGE Académie."
  },
  inscription: {
    title: "Rejoignez OGE Académie dès maintenant",
    subtitle: "Inscrivez-vous dès aujourd'hui pour seulement 15 000 FCFA (frais Wave / Mobile Money inclus) et accédez immédiatement à nos cours.",
    cta_text: "S'inscrire en ligne",
    urgence_badge: "🚨 L'OPPORTUNITÉ D'UNE VIE",
    urgence_title: "Ne gâchez pas votre unique chance d'intégrer l'élite",
    urgence_description: "Les places à l'INP-HB, l'ESATIC et au CME sont extrêmement chères et limitées. Chaque année, des milliers d'élèves brillants ratent ces concours simplement parce qu'ils n'ont pas eu la bonne préparation stratégique. Rater ce concours maintenant, c'est compromettre vos ambitions et risquer de passer à côté d'une carrière exceptionnelle.",
    urgence_cards: [
      { title: "Le Succès ou le Regret", text: "Intégrer ces écoles d'élite garantit une bourse d'études, un diplôme prestigieux et une insertion professionnelle assurée. Ne pas vous donner tous les moyens de réussir aujourd'hui est le plus grand risque pour votre avenir." },
      { title: "Une Compétition Impitoyable", text: "Les autres candidats se préparent déjà jour et nuit. Sans nos corrigés d'examens officiels, nos méthodes de résolution rapide et notre accompagnement par zone WhatsApp, vous partez avec un immense désavantage." },
      { title: "L'Investissement Décisif", text: "Pour seulement 15 000 FCFA (frais tout inclus), vous accédez à l'arme absolue pour forcer les portes du succès. C'est l'investissement le plus rentable et le plus décisif que vous ferez pour votre carrière." }
    ],
    urgence_warning: "⚠️ Le concours n'attend pas. C'est maintenant que se décide votre avenir."
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

const ZONES = [
  { value: "yamoussoukro", label: "Yamoussoukro" },
  { value: "yopougon", label: "Yopougon" },
  { value: "abobo", label: "Abobo" },
  { value: "cocody", label: "Cocody" },
  { value: "port-bouet", label: "Port-Bouët" },
  { value: "bouake", label: "Bouaké" }
];

const CONCOURS = [
  { value: "inphb", label: "INP-HB" },
  { value: "esatic", label: "ESATIC" },
  { value: "cme", label: "CME" }
];

export default function CMSClient({ initialSections, initialTestimonials, initialArticles }: CMSClientProps) {
  const [sections, setSections] = useState<any[]>(initialSections);
  const [testimonials, setTestimonials] = useState<any[]>(initialTestimonials);
  const [articles, setArticles] = useState<any[]>(initialArticles);
  
  // Tabs: sections or "blog"
  const [activeTab, setActiveTab] = useState<string>("hero");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Testimonial Modal State
  const [isTestimonialModalOpen, setIsTestimonialModalOpen] = useState<boolean>(false);
  const [editingTestimonial, setEditingTestimonial] = useState<any | null>(null);
  const [testimonialForm, setTestimonialForm] = useState({
    nom: "",
    prenom: "",
    zone: "yamoussoukro",
    concours: "inphb",
    message: "",
    note: 5,
    photoUrl: ""
  });

  // Blog Modal State
  const [isBlogModalOpen, setIsBlogModalOpen] = useState<boolean>(false);
  const [editingArticle, setEditingArticle] = useState<any | null>(null);
  const [blogForm, setBlogForm] = useState({
    titre: "",
    extrait: "",
    contenu: "",
    imageUrl: "",
    concours: "general",
    isPublished: false
  });

  const activeSection = sections.find((s) => s.cle === activeTab);
  const activeContent = activeSection ? { ...DEFAULT_CONTENTS[activeTab], ...(activeSection.contenu || {}) } : {};
  const [formFields, setFormFields] = useState<any>(activeContent);

  // Sync state when tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab !== "blog") {
      const sec = sections.find((s) => s.cle === tab);
      const content = sec ? { ...DEFAULT_CONTENTS[tab], ...(sec.contenu || {}) } : {};
      setFormFields(content);
    }
  };

  // Section visibility toggle
  const handleToggleSection = async (section: any) => {
    try {
      const res = await toggleSectionActive(section.id, !section.isActive);
      if (res.success) {
        setSections(
          sections.map((s) => (s.id === section.id ? { ...s, isActive: !s.isActive } : s))
        );
        toast.success(`Section ${section.titre} mise à jour avec succès.`);
      } else {
        toast.error(res.error || "Une erreur est survenue.");
      }
    } catch (err) {
      toast.error("Erreur de connexion.");
    }
  };

  // Save current section content
  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSection) return;

    setIsSaving(true);
    try {
      // Clean and trim string fields (resolving copy-paste spaces/non-breaking spaces issues)
      const cleanedFields = { ...formFields };
      Object.keys(cleanedFields).forEach((key) => {
        if (typeof cleanedFields[key] === "string") {
          cleanedFields[key] = cleanedFields[key].trim().replace(/^[\s\u00a0\u200b\xa0]+/, "");
        }
      });

      const res = await updateSectionContent(activeSection.id, activeSection.titre, cleanedFields);
      if (res.success) {
        setSections(
          sections.map((s) => (s.id === activeSection.id ? { ...s, contenu: cleanedFields } : s))
        );
        toast.success("Contenu de la section enregistré.");
      } else {
        toast.error(res.error || "Une erreur est survenue.");
      }
    } catch (err) {
      toast.error("Erreur lors de l'enregistrement.");
    } finally {
      setIsSaving(false);
    }
  };

  // Update input helper
  const handleFieldChange = (key: string, value: any) => {
    setFormFields((prev: any) => ({
      ...prev,
      [key]: value
    }));
  };

  // Helper for deep school profile updates
  const handleSchoolFieldChange = (school: string, key: string, value: any) => {
    setFormFields((prev: any) => ({
      ...prev,
      [school]: {
        ...(prev[school] || {}),
        [key]: value
      }
    }));
  };

  // Nested list items (activities, stats, centers)
  const handleNestedFieldChange = (listKey: string, index: number, field: string, value: any) => {
    const list = [...(formFields[listKey] || [])];
    list[index] = { ...list[index], [field]: value };
    setFormFields((prev: any) => ({
      ...prev,
      [listKey]: list
    }));
  };

  const handleAddNestedItem = (listKey: string, template: any) => {
    setFormFields((prev: any) => ({
      ...prev,
      [listKey]: [...(prev[listKey] || []), template]
    }));
  };

  const handleRemoveNestedItem = (listKey: string, index: number) => {
    const list = [...(formFields[listKey] || [])];
    list.splice(index, 1);
    setFormFields((prev: any) => ({
      ...prev,
      [listKey]: list
    }));
  };

  // Testimonials Handlers
  const handleOpenTestimonialModal = (testimonial: any = null) => {
    if (testimonial) {
      setEditingTestimonial(testimonial);
      setTestimonialForm({
        nom: testimonial.nom,
        prenom: testimonial.prenom || "",
        zone: testimonial.zone || "yamoussoukro",
        concours: testimonial.concours || "inphb",
        message: testimonial.message,
        note: testimonial.note || 5,
        photoUrl: testimonial.photoUrl || ""
      });
    } else {
      setEditingTestimonial(null);
      setTestimonialForm({
        nom: "",
        prenom: "",
        zone: "yamoussoukro",
        concours: "inphb",
        message: "",
        note: 5,
        photoUrl: ""
      });
    }
    setIsTestimonialModalOpen(true);
  };

  const handleSaveTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testimonialForm.nom || !testimonialForm.message) {
      toast.error("Le nom et le message sont requis.");
      return;
    }

    try {
      if (editingTestimonial) {
        const res = await updateTestimonial(editingTestimonial.id, testimonialForm);
        if (res.success) {
          setTestimonials(
            testimonials.map((t) =>
              t.id === editingTestimonial.id ? { ...t, ...testimonialForm } : t
            )
          );
          toast.success("Témoignage mis à jour.");
          setIsTestimonialModalOpen(false);
        } else {
          toast.error(res.error || "Erreur de mise à jour.");
        }
      } else {
        const res = await createTestimonial(testimonialForm);
        if (res.success) {
          toast.success("Témoignage créé.");
          window.location.reload();
        } else {
          toast.error(res.error || "Erreur de création.");
        }
      }
    } catch (err) {
      toast.error("Erreur réseau.");
    }
  };

  const handleToggleTestimonial = async (id: string, active: boolean) => {
    try {
      const res = await toggleTestimonialActive(id, active);
      if (res.success) {
        setTestimonials(
          testimonials.map((t) => (t.id === id ? { ...t, isActive: active } : t))
        );
        toast.success(active ? "Témoignage activé." : "Témoignage désactivé.");
      } else {
        toast.error(res.error || "Erreur.");
      }
    } catch (err) {
      toast.error("Erreur réseau.");
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer ce témoignage ?")) return;
    try {
      const res = await deleteTestimonial(id);
      if (res.success) {
        setTestimonials(testimonials.filter((t) => t.id !== id));
        toast.success("Témoignage supprimé (archivé).");
      } else {
        toast.error(res.error || "Erreur.");
      }
    } catch (err) {
      toast.error("Erreur réseau.");
    }
  };

  // Blog Article Handlers
  const handleOpenBlogModal = (article: any = null) => {
    if (article) {
      setEditingArticle(article);
      setBlogForm({
        titre: article.titre,
        extrait: article.extrait || "",
        contenu: article.contenu || "",
        imageUrl: article.imageUrl || "",
        concours: article.concours || "general",
        isPublished: article.isPublished || false
      });
    } else {
      setEditingArticle(null);
      setBlogForm({
        titre: "",
        extrait: "",
        contenu: "",
        imageUrl: "",
        concours: "general",
        isPublished: false
      });
    }
    setIsBlogModalOpen(true);
  };

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogForm.titre) {
      toast.error("Le titre est requis.");
      return;
    }

    try {
      if (editingArticle) {
        const res = await updateBlogArticle(editingArticle.id, blogForm);
        if (res.success) {
          toast.success("Article de blog mis à jour.");
          window.location.reload();
        } else {
          toast.error(res.error || "Erreur.");
        }
      } else {
        const res = await createBlogArticle(blogForm);
        if (res.success) {
          toast.success("Article de blog créé.");
          window.location.reload();
        } else {
          toast.error(res.error || "Erreur.");
        }
      }
    } catch (err) {
      toast.error("Erreur réseau.");
    }
  };

  const handleToggleBlogPublish = async (id: string, published: boolean) => {
    try {
      const res = await toggleBlogArticlePublished(id, published);
      if (res.success) {
        setArticles(
          articles.map((a) => (a.id === id ? { ...a, isPublished: published } : a))
        );
        toast.success(published ? "Article publié en ligne." : "Article retiré des publications.");
      } else {
        toast.error(res.error || "Erreur.");
      }
    } catch (err) {
      toast.error("Erreur réseau.");
    }
  };

  const handleDeleteBlog = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cet article de blog ?")) return;
    try {
      const res = await deleteBlogArticle(id);
      if (res.success) {
        setArticles(articles.filter((a) => a.id !== id));
        toast.success("Article de blog supprimé.");
      } else {
        toast.error(res.error || "Erreur.");
      }
    } catch (err) {
      toast.error("Erreur réseau.");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar - Tabs */}
      <div className="lg:col-span-1 space-y-3">
        {/* Mobile Dropdown Selector */}
        <div className="block lg:hidden bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
            Section à configurer
          </label>
          <select
            value={activeTab}
            onChange={(e) => handleTabChange(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 cursor-pointer"
          >
            <optgroup label="Sections Accueil">
              {sections.map((section) => (
                <option key={section.id} value={section.cle}>
                  {section.cle === "historique" ? "Notre Histoire / Centres (Historique)" : section.titre} {section.isActive ? "✓" : " (Désactivée)"}
                </option>
              ))}
            </optgroup>
            <optgroup label="Actualités & Blog">
              <option value="blog">Gestion du Blog</option>
            </optgroup>
          </select>
        </div>

        {/* Desktop Sidebar Buttons */}
        <div className="hidden lg:block bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 block mb-2">
            Sections Accueil
          </span>
          {sections.map((section) => (
            <div
              key={section.id}
              className={`flex items-center justify-between p-2 rounded-xl text-sm font-semibold tracking-tight transition-all duration-200 ${
                activeTab === section.cle
                  ? "bg-[#0F172A] text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <button
                type="button"
                onClick={() => handleTabChange(section.cle)}
                className="flex-1 text-left py-1 px-2"
              >
                {section.cle === "historique" ? "Notre Histoire / Centres (Historique)" : section.titre}
              </button>
              <button
                type="button"
                onClick={() => handleToggleSection(section)}
                title={section.isActive ? "Masquer la section" : "Afficher la section"}
                className={`p-1.5 rounded-lg transition-all ${
                  section.isActive 
                    ? "text-[#D4A017] hover:bg-slate-800/20" 
                    : "text-slate-350 hover:bg-slate-200"
                }`}
              >
                {section.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
          ))}

          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 block mt-6 mb-2">
            Actualités & Blog
          </span>
          <button
            type="button"
            onClick={() => handleTabChange("blog")}
            className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-semibold tracking-tight transition-all duration-200 ${
              activeTab === "blog"
                ? "bg-[#0F172A] text-white"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            <Newspaper className="w-4 h-4" />
            <span>Gestion du Blog</span>
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="lg:col-span-3">
        {activeTab === "blog" ? (
          /* BLOG MANAGEMENT PANEL */
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Newspaper className="w-5 h-5 text-[#D4A017]" />
                  Gestion du Blog
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Rédigez les guides de procédures et les modifications annuelles de concours.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleOpenBlogModal()}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#D4A017] text-white hover:bg-yellow-600 rounded-xl text-xs font-bold shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                Créer un Article
              </button>
            </div>

            {articles.length === 0 ? (
              <div className="text-center p-12 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs">
                Aucun article rédigé. Cliquez sur "Créer un Article" pour publier votre première actualité.
              </div>
            ) : (
              <div className="border border-slate-150 rounded-2xl overflow-hidden shadow-sm bg-white">
                {/* Desktop view table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase">
                        <th className="p-3">Titre</th>
                        <th className="p-3">Concours</th>
                        <th className="p-3">Extrait</th>
                        <th className="p-3">Statut</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {articles.map((article) => (
                        <tr key={article.id} className="hover:bg-slate-50/50">
                          <td className="p-3 font-semibold text-slate-900">
                            {article.titre}
                          </td>
                          <td className="p-3 text-xs">
                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full uppercase font-bold text-[10px]">
                              {article.concours}
                            </span>
                          </td>
                          <td className="p-3 text-xs text-slate-500 max-w-[200px] truncate">
                            {article.extrait}
                          </td>
                          <td className="p-3">
                            <button
                              type="button"
                              onClick={() => handleToggleBlogPublish(article.id, !article.isPublished)}
                              className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border transition-all hover:scale-105 active:scale-95 ${
                                article.isPublished
                                  ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                                  : "bg-slate-550 border-slate-200 text-slate-500 hover:bg-slate-100"
                              }`}
                              title={article.isPublished ? "Désactiver (Passer en Brouillon)" : "Activer (Publier en ligne)"}
                            >
                              {article.isPublished ? (
                                <>
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Actif (Publié)</span>
                                </>
                              ) : (
                                <>
                                  <EyeOff className="w-3.5 h-3.5" />
                                  <span>Inactif (Brouillon)</span>
                                </>
                              )}
                            </button>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => handleOpenBlogModal(article)}
                                className="p-1 text-slate-500 hover:text-[#0F172A] hover:bg-slate-100 rounded-lg transition-all"
                                title="Modifier"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteBlog(article.id)}
                                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                                title="Supprimer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View: Stacked Cards (no horizontal scroll) */}
                <div className="sm:hidden divide-y divide-slate-100">
                  {articles.map((article) => (
                    <div key={article.id} className="p-4 space-y-3 font-semibold text-xs text-slate-700 bg-white">
                      <div className="space-y-1">
                        <p className="font-bold text-slate-900 text-sm leading-snug">{article.titre}</p>
                        {article.extrait && <p className="text-slate-500 font-medium text-xs leading-normal">{article.extrait}</p>}
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-50">
                        <div className="flex gap-2 items-center">
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full uppercase font-bold text-[9px]">
                            {article.concours}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleToggleBlogPublish(article.id, !article.isPublished)}
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all ${
                              article.isPublished
                                ? "bg-green-50 border-green-200 text-green-700"
                                : "bg-slate-550 border-slate-250 text-slate-500"
                            }`}
                            title={article.isPublished ? "Désactiver (Passer en Brouillon)" : "Activer (Publier en ligne)"}
                          >
                            {article.isPublished ? (
                              <>
                                <Eye className="w-3 h-3" />
                                <span>Actif</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3 h-3" />
                                <span>Inactif</span>
                              </>
                            )}
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenBlogModal(article)}
                            className="p-1.5 text-slate-500 hover:text-[#0F172A] hover:bg-slate-100 border border-slate-200 rounded-lg transition-all"
                            title="Modifier"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteBlog(article.id)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-lg transition-all"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* HOMEPAGE SECTIONS PANEL */
          activeSection && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                      {activeSection.cle === "historique" ? "Notre Histoire / Centres (Historique)" : activeSection.titre}
                    </h2>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        activeSection.isActive
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-slate-50 text-slate-500 border border-slate-200"
                      }`}
                    >
                      {activeSection.isActive ? "Active en ligne" : "Désactivée"}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleSection(activeSection)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    activeSection.isActive
                      ? "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
                      : "bg-[#D4A017] border-[#D4A017] text-white hover:bg-yellow-600"
                  }`}
                >
                  {activeSection.isActive ? "Masquer de l'accueil" : "Afficher sur l'accueil"}
                </button>
              </div>

              <form onSubmit={handleSaveSection} className="space-y-6">
                {activeTab === "hero" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Surligné / Badge</label>
                      <input
                        type="text"
                        value={formFields.badge || ""}
                        onChange={(e) => handleFieldChange("badge", e.target.value)}
                        className="w-full text-sm p-3 rounded-xl border border-slate-250 focus:ring-1 focus:ring-[#D4A017] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Titre Principal</label>
                      <input
                        type="text"
                        value={formFields.title || ""}
                        onChange={(e) => handleFieldChange("title", e.target.value)}
                        className="w-full text-sm p-3 rounded-xl border border-slate-250 focus:ring-1 focus:ring-[#D4A017] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Sous-titre / Description</label>
                      <textarea
                        rows={3}
                        value={formFields.subtitle || ""}
                        onChange={(e) => handleFieldChange("subtitle", e.target.value)}
                        className="w-full text-sm p-3 rounded-xl border border-slate-250 focus:ring-1 focus:ring-[#D4A017] outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Texte Bouton Principal</label>
                        <input
                          type="text"
                          value={formFields.cta_primary || ""}
                          onChange={(e) => handleFieldChange("cta_primary", e.target.value)}
                          className="w-full text-sm p-3 rounded-xl border border-slate-250"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Texte Bouton Secondaire</label>
                        <input
                          type="text"
                          value={formFields.cta_secondary || ""}
                          onChange={(e) => handleFieldChange("cta_secondary", e.target.value)}
                          className="w-full text-sm p-3 rounded-xl border border-slate-250"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Lien d'intégration Groupe WhatsApp</label>
                      <input
                        type="text"
                        value={formFields.whatsapp_group_link || ""}
                        onChange={(e) => handleFieldChange("whatsapp_group_link", e.target.value)}
                        className="w-full text-sm p-3 rounded-xl border border-slate-250 text-blue-600 font-mono"
                        placeholder="https://chat.whatsapp.com/..."
                      />
                    </div>
                  </div>
                )}

                {activeTab === "historique" && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Titre de la Section</label>
                      <input
                        type="text"
                        value={formFields.title || ""}
                        onChange={(e) => handleFieldChange("title", e.target.value)}
                        className="w-full text-sm p-3 rounded-xl border border-slate-250"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Texte Présentation narrative</label>
                      <textarea
                        rows={4}
                        value={formFields.text || ""}
                        onChange={(e) => handleFieldChange("text", e.target.value)}
                        className="w-full text-sm p-3 rounded-xl border border-slate-250"
                      />
                    </div>

                    {/* Physical Centers Title & Subtitle */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Titre de la section des Centres</label>
                        <input
                          type="text"
                          value={formFields.centers_title || ""}
                          onChange={(e) => handleFieldChange("centers_title", e.target.value)}
                          className="w-full text-sm p-3 rounded-xl border border-slate-250 focus:ring-1 focus:ring-[#D4A017] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Sous-titre de la section des Centres</label>
                        <input
                          type="text"
                          value={formFields.centers_subtitle || ""}
                          onChange={(e) => handleFieldChange("centers_subtitle", e.target.value)}
                          className="w-full text-sm p-3 rounded-xl border border-slate-250 focus:ring-1 focus:ring-[#D4A017] outline-none"
                        />
                      </div>
                    </div>

                    {/* Physical Centers List */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-800">
                          Centres d'Accompagnement & Contacts
                        </h3>
                        <button
                          type="button"
                          onClick={() => handleAddNestedItem("centers", { name: "", phone: "", address: "" })}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-250 text-slate-700 transition-all border"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Ajouter un Centre
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(formFields.centers || []).map((center: any, idx: number) => (
                          <div key={idx} className="p-4 border border-slate-200 rounded-2xl bg-slate-50/50 space-y-3 relative">
                            <button
                              type="button"
                              onClick={() => handleRemoveNestedItem("centers", idx)}
                              className="absolute top-2 right-2 text-xs font-bold text-red-500 hover:bg-red-50 p-1 rounded-lg"
                            >
                              Retirer
                            </button>
                            <span className="text-xs font-bold text-[#D4A017]">Centre #{idx + 1}</span>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Nom du Centre (ex: LYCÉE TECHNIQUE DE BOUAKÉ)</label>
                              <input
                                type="text"
                                value={center.name || ""}
                                onChange={(e) => handleNestedFieldChange("centers", idx, "name", e.target.value)}
                                className="w-full text-xs p-2 rounded-lg border border-slate-250 bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Téléphone à contacter</label>
                              <input
                                type="text"
                                value={center.phone || ""}
                                onChange={(e) => handleNestedFieldChange("centers", idx, "phone", e.target.value)}
                                className="w-full text-xs p-2 rounded-lg border border-slate-250 bg-white font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Lieu précis / Adresse</label>
                              <input
                                type="text"
                                value={center.address || ""}
                                onChange={(e) => handleNestedFieldChange("centers", idx, "address", e.target.value)}
                                className="w-full text-xs p-2 rounded-lg border border-slate-250 bg-white"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "formation" && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Titre de la Section</label>
                        <input
                          type="text"
                          value={formFields.title || ""}
                          onChange={(e) => handleFieldChange("title", e.target.value)}
                          className="w-full text-sm p-3 rounded-xl border border-slate-250"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Sous-titre / Intro</label>
                        <input
                          type="text"
                          value={formFields.subtitle || ""}
                          onChange={(e) => handleFieldChange("subtitle", e.target.value)}
                          className="w-full text-sm p-3 rounded-xl border border-slate-250"
                        />
                      </div>
                    </div>

                    {/* SCHOOL EDITORS */}
                    {["inphb", "esatic", "cme"].map((schoolCode) => {
                      const schoolData = formFields[schoolCode] || {};
                      const label = schoolCode.toUpperCase();
                      return (
                        <div key={schoolCode} className="p-6 border border-slate-200 rounded-3xl bg-slate-50/50 space-y-4">
                          <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2 text-[#D4A017]">
                            Fiche d'identité Concours : {label}
                          </h3>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Description d'introduction (Concours {label})</label>
                            <textarea
                              rows={2}
                              value={schoolData.description || ""}
                              onChange={(e) => handleSchoolFieldChange(schoolCode, "description", e.target.value)}
                              className="w-full text-xs p-2 rounded-lg border border-slate-250 bg-white"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">Nom Complet</label>
                              <input
                                type="text"
                                value={schoolData.nom_complet || ""}
                                onChange={(e) => handleSchoolFieldChange(schoolCode, "nom_complet", e.target.value)}
                                className="w-full text-xs p-2 rounded-lg border border-slate-250 bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">Localisation</label>
                              <input
                                type="text"
                                value={schoolData.localisation || ""}
                                onChange={(e) => handleSchoolFieldChange(schoolCode, "localisation", e.target.value)}
                                className="w-full text-xs p-2 rounded-lg border border-slate-250 bg-white"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">Statut / Système LMD</label>
                              <input
                                type="text"
                                value={schoolData.statut || schoolData.statut_systeme || ""}
                                onChange={(e) => handleSchoolFieldChange(schoolCode, "statut", e.target.value)}
                                className="w-full text-xs p-2 rounded-lg border border-slate-250 bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">Année Création</label>
                              <input
                                type="text"
                                value={schoolData.creation || ""}
                                onChange={(e) => handleSchoolFieldChange(schoolCode, "creation", e.target.value)}
                                className="w-full text-xs p-2 rounded-lg border border-slate-250 bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">Site Internet</label>
                              <input
                                type="text"
                                value={schoolData.site_internet || ""}
                                onChange={(e) => handleSchoolFieldChange(schoolCode, "site_internet", e.target.value)}
                                className="w-full text-xs p-2 rounded-lg border border-slate-250 bg-white text-blue-600"
                              />
                            </div>
                          </div>

                          {/* Specific configurations per school */}
                          {schoolCode === "inphb" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Hébergement / Chambres</label>
                                <input
                                  type="text"
                                  value={schoolData.hebergement || ""}
                                  onChange={(e) => handleSchoolFieldChange("inphb", "hebergement", e.target.value)}
                                  className="w-full text-xs p-2 rounded-lg border border-slate-250 bg-white"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Taux Insertion</label>
                                <input
                                  type="text"
                                  value={schoolData.insertion || ""}
                                  onChange={(e) => handleSchoolFieldChange("inphb", "insertion", e.target.value)}
                                  className="w-full text-xs p-2 rounded-lg border border-slate-250 bg-white"
                                />
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-700 mb-1">Cadre de Vie (Texte)</label>
                                <textarea
                                  rows={2}
                                  value={schoolData.cadre_vie || ""}
                                  onChange={(e) => handleSchoolFieldChange("inphb", "cadre_vie", e.target.value)}
                                  className="w-full text-xs p-2 rounded-lg border border-slate-250 bg-white"
                                />
                              </div>
                            </div>
                          )}

                          {schoolCode === "esatic" && (
                            <div className="space-y-3">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <label className="block text-xs font-bold text-slate-700 mb-1">Tutelle Ministérielle</label>
                                  <input
                                    type="text"
                                    value={schoolData.tutelle || ""}
                                    onChange={(e) => handleSchoolFieldChange("esatic", "tutelle", e.target.value)}
                                    className="w-full text-xs p-2 rounded-lg border border-slate-250 bg-white"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-bold text-slate-700 mb-1">Avantages (Bourse/Gratuité)</label>
                                  <input
                                    type="text"
                                    value={schoolData.avantages || ""}
                                    onChange={(e) => handleSchoolFieldChange("esatic", "avantages", e.target.value)}
                                    className="w-full text-xs p-2 rounded-lg border border-slate-250 bg-white"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-bold text-slate-700 mb-1">Téléphone de l'école</label>
                                  <input
                                    type="text"
                                    value={schoolData.telephone || ""}
                                    onChange={(e) => handleSchoolFieldChange("esatic", "telephone", e.target.value)}
                                    className="w-full text-xs p-2 rounded-lg border border-slate-250 bg-white font-mono"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Excellence / Prix Hackathon (Texte)</label>
                                <textarea
                                  rows={2}
                                  value={schoolData.excellence || ""}
                                  onChange={(e) => handleSchoolFieldChange("esatic", "excellence", e.target.value)}
                                  className="w-full text-xs p-2 rounded-lg border border-slate-250 bg-white"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Notre Programme de Prépa (ESATIC)</label>
                                <textarea
                                  rows={4}
                                  value={schoolData.programme || ""}
                                  onChange={(e) => handleSchoolFieldChange("esatic", "programme", e.target.value)}
                                  className="w-full text-xs p-2 rounded-lg border border-slate-250 bg-white font-mono"
                                />
                              </div>
                            </div>
                          )}

                          {schoolCode === "cme" && (
                            <div className="space-y-3">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <label className="block text-xs font-bold text-slate-700 mb-1">Opérateur (ex: CIE / ERANOVE)</label>
                                  <input
                                    type="text"
                                    value={schoolData.operateur || ""}
                                    onChange={(e) => handleSchoolFieldChange("cme", "operateur", e.target.value)}
                                    className="w-full text-xs p-2 rounded-lg border border-slate-250 bg-white"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-bold text-slate-700 mb-1">Frais d'Études / Scolarité</label>
                                  <input
                                    type="text"
                                    value={schoolData.frais_etudes || ""}
                                    onChange={(e) => handleSchoolFieldChange("cme", "frais_etudes", e.target.value)}
                                    className="w-full text-xs p-2 rounded-lg border border-slate-250 bg-white"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-bold text-slate-700 mb-1">Téléphone CME</label>
                                  <input
                                    type="text"
                                    value={schoolData.telephone || ""}
                                    onChange={(e) => handleSchoolFieldChange("cme", "telephone", e.target.value)}
                                    className="w-full text-xs p-2 rounded-lg border border-slate-250 bg-white font-mono"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-bold text-slate-700 mb-1">Certifications / Labels</label>
                                  <input
                                    type="text"
                                    value={schoolData.certifications || ""}
                                    onChange={(e) => handleSchoolFieldChange("cme", "certifications", e.target.value)}
                                    className="w-full text-xs p-2 rounded-lg border border-slate-250 bg-white"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-bold text-slate-700 mb-1">Engagement Mixité / Diversité (Texte)</label>
                                  <input
                                    type="text"
                                    value={schoolData.mixite || ""}
                                    onChange={(e) => handleSchoolFieldChange("cme", "mixite", e.target.value)}
                                    className="w-full text-xs p-2 rounded-lg border border-slate-250 bg-white"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Notre Accompagnement de Prépa (CME)</label>
                                <textarea
                                  rows={4}
                                  value={schoolData.accompagnement || ""}
                                  onChange={(e) => handleSchoolFieldChange("cme", "accompagnement", e.target.value)}
                                  className="w-full text-xs p-2 rounded-lg border border-slate-250 bg-white font-mono"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {activeTab === "resultats" && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Titre de la Section</label>
                      <input
                        type="text"
                        value={formFields.title || ""}
                        onChange={(e) => handleFieldChange("title", e.target.value)}
                        className="w-full text-sm p-3 rounded-xl border border-slate-250"
                      />
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
                        Statistiques Clés
                      </h3>
                      <div className="grid grid-cols-1 gap-4">
                        {(formFields.stats || []).map((stat: any, idx: number) => (
                          <div key={idx} className="p-4 border border-slate-200 rounded-2xl bg-slate-50/50 space-y-2">
                            <span className="text-xs font-bold text-[#D4A017]">Métrique #{idx + 1}</span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1">Chiffre / Valeur</label>
                                <input
                                  type="text"
                                  value={stat.value || ""}
                                  onChange={(e) => handleNestedFieldChange("stats", idx, "value", e.target.value)}
                                  className="w-full text-xs p-2 rounded-lg border border-slate-250 bg-white font-mono"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1">Libellé</label>
                                <input
                                  type="text"
                                  value={stat.label || ""}
                                  onChange={(e) => handleNestedFieldChange("stats", idx, "label", e.target.value)}
                                  className="w-full text-xs p-2 rounded-lg border border-slate-250 bg-white"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Success Percentages List */}
                    <div className="space-y-4 pt-6 border-t border-slate-150">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-800">
                          Taux de Réussite par École
                        </h3>
                        <button
                          type="button"
                          onClick={() => handleAddNestedItem("percentages", { year: "", inphb: "", cme: "", esatic: "" })}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-250 text-slate-700 transition-all border"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Ajouter une Année
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(formFields.percentages || []).map((row: any, idx: number) => (
                          <div key={idx} className="p-4 border border-slate-250 rounded-2xl bg-slate-50/50 space-y-3 relative">
                            <button
                              type="button"
                              onClick={() => handleRemoveNestedItem("percentages", idx)}
                              className="absolute top-2 right-2 text-xs font-bold text-red-500 hover:bg-red-50 p-1 rounded-lg"
                            >
                              Retirer
                            </button>
                            <span className="text-xs font-bold text-[#D4A017]">Ligne #{idx + 1}</span>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Année (ex: 2025)</label>
                                <input
                                  type="text"
                                  value={row.year || ""}
                                  onChange={(e) => handleNestedFieldChange("percentages", idx, "year", e.target.value)}
                                  className="w-full text-xs p-2 rounded-lg border border-slate-250 bg-white font-mono"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-bold text-slate-600 mb-0.5">INP-HB (ex: 98,60%)</label>
                                <input
                                  type="text"
                                  value={row.inphb || ""}
                                  onChange={(e) => handleNestedFieldChange("percentages", idx, "inphb", e.target.value)}
                                  className="w-full text-xs p-2 rounded-lg border border-slate-250 bg-white font-mono"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-bold text-slate-600 mb-0.5">CME (ex: 100%)</label>
                                <input
                                  type="text"
                                  value={row.cme || ""}
                                  onChange={(e) => handleNestedFieldChange("percentages", idx, "cme", e.target.value)}
                                  className="w-full text-xs p-2 rounded-lg border border-slate-250 bg-white font-mono"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-bold text-slate-600 mb-0.5">ESATIC (ex: 97,10%)</label>
                                <input
                                  type="text"
                                  value={row.esatic || ""}
                                  onChange={(e) => handleNestedFieldChange("percentages", idx, "esatic", e.target.value)}
                                  className="w-full text-xs p-2 rounded-lg border border-slate-250 bg-white font-mono"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "temoignages" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Titre Section</label>
                        <input
                          type="text"
                          value={formFields.title || ""}
                          onChange={(e) => handleFieldChange("title", e.target.value)}
                          className="w-full text-sm p-3 rounded-xl border border-slate-250"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Sous-titre</label>
                        <input
                          type="text"
                          value={formFields.subtitle || ""}
                          onChange={(e) => handleFieldChange("subtitle", e.target.value)}
                          className="w-full text-sm p-3 rounded-xl border border-slate-250"
                        />
                      </div>
                    </div>

                    {/* Testimonials List */}
                    <div className="space-y-4 pt-4 border-t border-slate-150">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-800">
                          Liste des Témoignages Candidats
                        </h3>
                        <button
                          type="button"
                          onClick={() => handleOpenTestimonialModal()}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#D4A017] text-white hover:bg-yellow-600 transition-all shadow-sm"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Ajouter
                        </button>
                      </div>

                      {testimonials.length === 0 ? (
                        <div className="text-center p-8 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs">
                          Aucun témoignage disponible.
                        </div>
                      ) : (
                        <div className="border border-slate-150 rounded-2xl overflow-hidden shadow-sm bg-white">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                                <th className="p-3">Auteur</th>
                                <th className="p-3">Détails</th>
                                <th className="p-3">Message</th>
                                <th className="p-3">Note</th>
                                <th className="p-3">Statut</th>
                                <th className="p-3 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {testimonials.map((testimonial) => (
                                <tr key={testimonial.id} className="hover:bg-slate-50/50">
                                  <td className="p-3 font-semibold text-slate-900">
                                    {testimonial.prenom} {testimonial.nom}
                                  </td>
                                  <td className="p-3 capitalize text-slate-500">
                                    {testimonial.zone || "-"} {testimonial.concours && `• ${testimonial.concours.toUpperCase()}`}
                                  </td>
                                  <td className="p-3 text-slate-500 max-w-[200px] truncate">
                                    {testimonial.message}
                                  </td>
                                  <td className="p-3">
                                    <div className="flex items-center text-amber-500">
                                      {Array.from({ length: testimonial.note }).map((_, i) => (
                                        <Star key={i} className="w-3 h-3 fill-current" />
                                      ))}
                                    </div>
                                  </td>
                                  <td className="p-3">
                                    <button
                                      type="button"
                                      onClick={() => handleToggleTestimonial(testimonial.id, !testimonial.isActive)}
                                      className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-bold ${
                                        testimonial.isActive
                                          ? "bg-green-50 border-green-200 text-green-700"
                                          : "bg-slate-50 border-slate-200 text-slate-500"
                                      }`}
                                    >
                                      {testimonial.isActive ? "Actif" : "Inactif"}
                                    </button>
                                  </td>
                                  <td className="p-3 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                      <button
                                        type="button"
                                        onClick={() => handleOpenTestimonialModal(testimonial)}
                                        className="p-1 text-slate-500 hover:text-slate-900 rounded"
                                      >
                                        <Edit className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteTestimonial(testimonial.id)}
                                        className="p-1 text-red-500 hover:text-red-700 rounded"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "inscription" && (
                  <div className="space-y-6">
                    <div className="bg-slate-50/50 p-6 border border-slate-200 rounded-3xl space-y-4">
                      <h3 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-2">
                        Section Inscription Standard
                      </h3>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Titre Principal</label>
                        <input
                          type="text"
                          value={formFields.title || ""}
                          onChange={(e) => handleFieldChange("title", e.target.value)}
                          className="w-full text-sm p-3 rounded-xl border border-slate-250 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Texte descriptif</label>
                        <textarea
                          rows={3}
                          value={formFields.subtitle || ""}
                          onChange={(e) => handleFieldChange("subtitle", e.target.value)}
                          className="w-full text-sm p-3 rounded-xl border border-slate-250 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Texte Bouton Appel à l'action</label>
                        <input
                          type="text"
                          value={formFields.cta_text || ""}
                          onChange={(e) => handleFieldChange("cta_text", e.target.value)}
                          className="w-full text-sm p-3 rounded-xl border border-slate-250 bg-white"
                        />
                      </div>
                    </div>

                    <div className="bg-slate-50/50 p-6 border border-slate-200 rounded-3xl space-y-4 pt-4">
                      <h3 className="text-sm font-bold text-slate-850 border-b border-slate-200 pb-2 text-[#D4A017] flex items-center gap-2">
                        <span>🚨 Section d'Urgence / Opportunité</span>
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Badge d'urgence (ex: 🚨 L'OPPORTUNITÉ D'UNE VIE)</label>
                          <input
                            type="text"
                            value={formFields.urgence_badge || ""}
                            onChange={(e) => handleFieldChange("urgence_badge", e.target.value)}
                            className="w-full text-sm p-3 rounded-xl border border-slate-250 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Titre d'urgence</label>
                          <input
                            type="text"
                            value={formFields.urgence_title || ""}
                            onChange={(e) => handleFieldChange("urgence_title", e.target.value)}
                            className="w-full text-sm p-3 rounded-xl border border-slate-250 bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Description longue d'urgence</label>
                        <textarea
                          rows={4}
                          value={formFields.urgence_description || ""}
                          onChange={(e) => handleFieldChange("urgence_description", e.target.value)}
                          className="w-full text-sm p-3 rounded-xl border border-slate-250 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Message d'avertissement final</label>
                        <input
                          type="text"
                          value={formFields.urgence_warning || ""}
                          onChange={(e) => handleFieldChange("urgence_warning", e.target.value)}
                          className="w-full text-sm p-3 rounded-xl border border-slate-250 bg-white"
                        />
                      </div>

                      {/* Urgence Cards List */}
                      <div className="space-y-4 pt-4 border-t border-slate-200">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                            Cartes d'Arguments Promotionnels (Urgence)
                          </h4>
                          <button
                            type="button"
                            onClick={() => handleAddNestedItem("urgence_cards", { title: "", text: "" })}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-200 hover:bg-slate-250 text-slate-750 transition-all border border-slate-300"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Ajouter un Argument
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {(formFields.urgence_cards || []).map((card: any, idx: number) => (
                            <div key={idx} className="p-4 border border-slate-200 rounded-2xl bg-white space-y-3 relative shadow-sm">
                              <button
                                type="button"
                                onClick={() => handleRemoveNestedItem("urgence_cards", idx)}
                                className="absolute top-2 right-2 text-xs font-bold text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-all"
                              >
                                Retirer
                              </button>
                              <span className="text-xs font-bold text-[#D4A017]">Métrique / Argument #{String(idx + 1).padStart(2, "0")}</span>
                              <div>
                                <label className="block text-[11px] font-bold text-slate-655 mb-0.5">Titre de l'Argument</label>
                                <input
                                  type="text"
                                  value={card.title || ""}
                                  onChange={(e) => handleNestedFieldChange("urgence_cards", idx, "title", e.target.value)}
                                  className="w-full text-xs p-2.5 rounded-lg border border-slate-250 bg-slate-50/30"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-bold text-slate-655 mb-0.5">Texte Descriptif</label>
                                <textarea
                                  rows={3}
                                  value={card.text || ""}
                                  onChange={(e) => handleNestedFieldChange("urgence_cards", idx, "text", e.target.value)}
                                  className="w-full text-xs p-2.5 rounded-lg border border-slate-250 bg-slate-50/30"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "footer" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Lien Facebook</label>
                        <input
                          type="text"
                          value={formFields.facebook || ""}
                          onChange={(e) => handleFieldChange("facebook", e.target.value)}
                          className="w-full text-sm p-3 rounded-xl border border-slate-250"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Lien WhatsApp</label>
                        <input
                          type="text"
                          value={formFields.whatsapp || ""}
                          onChange={(e) => handleFieldChange("whatsapp", e.target.value)}
                          className="w-full text-sm p-3 rounded-xl border border-slate-250"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Lien TikTok</label>
                        <input
                          type="text"
                          value={formFields.tiktok || ""}
                          onChange={(e) => handleFieldChange("tiktok", e.target.value)}
                          className="w-full text-sm p-3 rounded-xl border border-slate-250"
                        />
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-slate-800 pt-4 border-t border-slate-100">
                      Contacts & Coordonnées
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Email de contact</label>
                        <input
                          type="email"
                          value={formFields.email || ""}
                          onChange={(e) => handleFieldChange("email", e.target.value)}
                          className="w-full text-sm p-3 rounded-xl border border-slate-250"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Téléphone</label>
                        <input
                          type="text"
                          value={formFields.phone || ""}
                          onChange={(e) => handleFieldChange("phone", e.target.value)}
                          className="w-full text-sm p-3 rounded-xl border border-slate-250"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Adresse</label>
                      <input
                        type="text"
                        value={formFields.address || ""}
                        onChange={(e) => handleFieldChange("address", e.target.value)}
                        className="w-full text-sm p-3 rounded-xl border border-slate-250"
                      />
                    </div>
                  </div>
                )}

                {/* Submit Buttons */}
                <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-3 bg-[#D4A017] hover:bg-yellow-600 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl font-bold text-sm tracking-tight transition-all duration-200 shadow-md cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? "Enregistrement..." : "Enregistrer la section"}
                  </button>
                </div>
              </form>
            </div>
          )
        )}
      </div>

      {/* Testimonial Dialog Modal */}
      {isTestimonialModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                {editingTestimonial ? "Modifier le Témoignage" : "Ajouter un Témoignage"}
              </h3>
              <button
                type="button"
                onClick={() => setIsTestimonialModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
              >
                Fermer
              </button>
            </div>

            <form onSubmit={handleSaveTestimonial} className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Prénom</label>
                  <input
                    type="text"
                    required
                    value={testimonialForm.prenom}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, prenom: e.target.value })}
                    className="w-full text-sm p-2.5 rounded-lg border border-slate-250"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nom</label>
                  <input
                    type="text"
                    required
                    value={testimonialForm.nom}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, nom: e.target.value })}
                    className="w-full text-sm p-2.5 rounded-lg border border-slate-250"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Zone</label>
                  <select
                    value={testimonialForm.zone}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, zone: e.target.value })}
                    className="w-full text-sm p-2.5 rounded-lg border border-slate-250 bg-white"
                  >
                    {ZONES.map((z) => (
                      <option key={z.value} value={z.value}>{z.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Concours</label>
                  <select
                    value={testimonialForm.concours}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, concours: e.target.value })}
                    className="w-full text-sm p-2.5 rounded-lg border border-slate-250 bg-white"
                  >
                    {CONCOURS.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Note (1 à 5 étoiles)</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setTestimonialForm({ ...testimonialForm, note: star })}
                      className="p-1 transition-all"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= testimonialForm.note
                            ? "text-amber-500 fill-current"
                            : "text-slate-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Photo URL (optionnel)</label>
                <input
                  type="text"
                  placeholder="https://example.com/avatar.jpg"
                  value={testimonialForm.photoUrl}
                  onChange={(e) => setTestimonialForm({ ...testimonialForm, photoUrl: e.target.value })}
                  className="w-full text-sm p-2.5 rounded-lg border border-slate-250"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Message / Avis</label>
                <textarea
                  required
                  rows={4}
                  value={testimonialForm.message}
                  onChange={(e) => setTestimonialForm({ ...testimonialForm, message: e.target.value })}
                  className="w-full text-sm p-2.5 rounded-lg border border-slate-250"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTestimonialModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#D4A017] hover:bg-yellow-600 text-white rounded-lg text-sm font-bold shadow-sm"
                >
                  {editingTestimonial ? "Mettre à jour" : "Ajouter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Blog Article Dialog Modal */}
      {isBlogModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                {editingArticle ? "Modifier l'Article de Blog" : "Rédiger un nouvel Article"}
              </h3>
              <button
                type="button"
                onClick={() => setIsBlogModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
              >
                Fermer
              </button>
            </div>

            <form onSubmit={handleSaveBlog} className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Titre de l'Article</label>
                <input
                  type="text"
                  required
                  value={blogForm.titre}
                  onChange={(e) => setBlogForm({ ...blogForm, titre: e.target.value })}
                  className="w-full text-sm p-2.5 rounded-lg border border-slate-250 font-bold"
                  placeholder="ex: Ouverture des inscriptions INP-HB Session 2026"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Concours Associé</label>
                  <select
                    value={blogForm.concours}
                    onChange={(e) => setBlogForm({ ...blogForm, concours: e.target.value })}
                    className="w-full text-sm p-2.5 rounded-lg border border-slate-250 bg-white"
                  >
                    <option value="general">Général / Tous</option>
                    <option value="inphb">INP-HB</option>
                    <option value="esatic">ESATIC</option>
                    <option value="cme">CME</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Image URL (optionnel)</label>
                  <input
                    type="text"
                    value={blogForm.imageUrl}
                    onChange={(e) => setBlogForm({ ...blogForm, imageUrl: e.target.value })}
                    className="w-full text-sm p-2.5 rounded-lg border border-slate-250"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Extrait / Résumé Court (affiché sur la carte)</label>
                <input
                  type="text"
                  value={blogForm.extrait}
                  onChange={(e) => setBlogForm({ ...blogForm, extrait: e.target.value })}
                  className="w-full text-sm p-2.5 rounded-lg border border-slate-250"
                  placeholder="Court paragraphe d'introduction..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Contenu de l'Article</label>
                <textarea
                  required
                  rows={8}
                  value={blogForm.contenu}
                  onChange={(e) => setBlogForm({ ...blogForm, contenu: e.target.value })}
                  className="w-full text-sm p-2.5 rounded-lg border border-slate-250 font-mono text-xs"
                  placeholder="Écrivez le corps de votre article ici..."
                />
              </div>

              <div className="flex items-center gap-2 py-2">
                <input
                  type="checkbox"
                  id="isPublishedCheck"
                  checked={blogForm.isPublished}
                  onChange={(e) => setBlogForm({ ...blogForm, isPublished: e.target.checked })}
                  className="w-4 h-4 rounded text-[#D4A017] border-slate-350"
                />
                <label htmlFor="isPublishedCheck" className="text-xs font-bold text-slate-755 uppercase select-none cursor-pointer">
                  Publier immédiatement en ligne
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBlogModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#D4A017] hover:bg-yellow-600 text-white rounded-lg text-sm font-bold shadow-sm"
                >
                  {editingArticle ? "Mettre à jour" : "Publier l'Article"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
