"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  adminToggleContentActive, 
  adminUpdateUserProfile, 
  adminResetUserPassword 
} from "@/app/(admin)/admin/actions";
import { 
  FileText, 
  Newspaper, 
  MessageSquare, 
  Image, 
  Users, 
  Search, 
  Filter, 
  Check, 
  X, 
  Edit, 
  KeyRound, 
  RefreshCw, 
  UserCheck, 
  ShieldAlert, 
  Play, 
  Video, 
  AlertTriangle 
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface DocumentItem {
  id: string;
  titre: string;
  type: string;
  isActive: boolean;
  createdAt: Date | null;
  auteurId: string | null;
}

interface TestimonialItem {
  id: string;
  nom: string;
  prenom: string;
  message: string;
  isActive: boolean;
  createdAt: Date | null;
}

interface BlogArticleItem {
  id: string;
  titre: string;
  extrait: string;
  isPublished: boolean;
  createdAt: Date | null;
}

interface AfficheItem {
  id: string;
  url: string;
  title: string;
  type: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

interface UserItem {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  whatsapp: string;
  role: string;
  isActive: boolean;
  createdAt: Date | null;
  zone: string;
}

interface ModerationClientProps {
  documents: DocumentItem[];
  testimonials: TestimonialItem[];
  blogArticles: BlogArticleItem[];
  affiches: AfficheItem[];
  users: UserItem[];
}

export default function ModerationClient({
  documents,
  testimonials,
  blogArticles,
  affiches,
  users,
}: ModerationClientProps) {
  const router = useRouter();

  // Tabs
  const [activeTab, setActiveTab] = useState<"content" | "accounts">("content");
  const [activeContentSubTab, setActiveContentSubTab] = useState<"documents" | "testimonials" | "blog" | "affiches">("documents");

  // Loading states
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // User search/filter
  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  // Edit user state
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [editNom, setEditNom] = useState("");
  const [editPrenom, setEditPrenom] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editWhatsapp, setEditWhatsapp] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editZone, setEditZone] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [isSavingUser, setIsSavingUser] = useState(false);

  // Content toggle handlers
  const handleToggleContent = async (type: "document" | "blog" | "testimonial" | "affiche", id: string, active: boolean) => {
    setTogglingId(id);
    try {
      const res = await adminToggleContentActive(type, id, active);
      if (res.success) {
        toast.success("Statut mis à jour avec succès !");
        router.refresh();
      } else {
        toast.error(res.error || "Erreur de mise à jour.");
      }
    } catch (err) {
      toast.error("Erreur réseau.");
    } finally {
      setTogglingId(null);
    }
  };

  // User edit handlers
  const handleOpenEditUser = (user: UserItem) => {
    setEditingUser(user);
    setEditNom(user.nom);
    setEditPrenom(user.prenom);
    setEditEmail(user.email);
    setEditWhatsapp(user.whatsapp || "");
    setEditRole(user.role);
    setEditZone(user.zone || "");
    setEditPassword("");
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setIsSavingUser(true);
    try {
      // 1. Password reset check
      if (editPassword) {
        if (editPassword.length < 6) {
          toast.error("Le mot de passe doit faire au moins 6 caractères.");
          setIsSavingUser(false);
          return;
        }
        const passRes = await adminResetUserPassword(editingUser.id, editPassword);
        if (!passRes.success) throw new Error(passRes.error);
        toast.success("Mot de passe réinitialisé. Les sessions actives ont été déconnectées.");
      }

      // 2. Profile updates
      const details = {
        nom: editNom.trim(),
        prenom: editPrenom.trim(),
        email: editEmail.trim().toLowerCase(),
        whatsapp: editWhatsapp.trim() || undefined,
        role: editRole as any,
        zone: editRole === "manager_zone" ? editZone || null : null,
      };

      const res = await adminUpdateUserProfile(editingUser.id, details);
      if (!res.success) throw new Error(res.error);

      toast.success("Profil utilisateur mis à jour avec succès.");
      setEditingUser(null);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la sauvegarde.");
    } finally {
      setIsSavingUser(false);
    }
  };

  // Filtered users list
  const filteredUsers = users.filter((u) => {
    const searchString = `${u.prenom} ${u.nom} ${u.email}`.toLowerCase();
    const matchesSearch = searchString.includes(userSearch.toLowerCase());
    const matchesRole = roleFilter === "" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Global Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab("content")}
          className={`pb-3 text-sm font-bold transition-all relative cursor-pointer flex items-center gap-2 ${
            activeTab === "content" ? "text-slate-900" : "text-slate-450 hover:text-slate-700"
          }`}
        >
          <FileText className="w-4 h-4 text-slate-400" />
          <span>Audit de Contenus</span>
          {activeTab === "content" && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-red-650 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("accounts")}
          className={`pb-3 text-sm font-bold transition-all relative cursor-pointer flex items-center gap-2 ${
            activeTab === "accounts" ? "text-slate-900" : "text-slate-450 hover:text-slate-700"
          }`}
        >
          <Users className="w-4 h-4 text-slate-400" />
          <span>Gestion des Comptes</span>
          {activeTab === "accounts" && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-red-650 rounded-full" />
          )}
        </button>
      </div>

      {activeTab === "content" ? (
        /* AUDIT DE CONTENUS */
        <div className="space-y-6">
          {/* Subtabs content */}
          <div className="flex bg-slate-100 p-1 rounded-xl max-w-lg gap-2 text-xs font-bold text-slate-600">
            <button
              onClick={() => setActiveContentSubTab("documents")}
              className={`flex-1 py-1.5 px-3 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeContentSubTab === "documents" ? "bg-white text-slate-800 shadow-sm" : "hover:text-slate-800"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Supports</span>
            </button>
            <button
              onClick={() => setActiveContentSubTab("testimonials")}
              className={`flex-1 py-1.5 px-3 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeContentSubTab === "testimonials" ? "bg-white text-slate-800 shadow-sm" : "hover:text-slate-800"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Témoignages</span>
            </button>
            <button
              onClick={() => setActiveContentSubTab("blog")}
              className={`flex-1 py-1.5 px-3 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeContentSubTab === "blog" ? "bg-white text-slate-800 shadow-sm" : "hover:text-slate-800"
              }`}
            >
              <Newspaper className="w-3.5 h-3.5" />
              <span>Blog</span>
            </button>
            <button
              onClick={() => setActiveContentSubTab("affiches")}
              className={`flex-1 py-1.5 px-3 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeContentSubTab === "affiches" ? "bg-white text-slate-800 shadow-sm" : "hover:text-slate-800"
              }`}
            >
              <Image className="w-3.5 h-3.5" />
              <span>Affiches/Vidéo</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm overflow-hidden">
            {/* SUBTAB: DOCUMENTS */}
            {activeContentSubTab === "documents" && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-800 text-sm">Modération des Supports de Cours & Liens</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                        <th className="p-3">Titre / Type</th>
                        <th className="p-3">Créé le</th>
                        <th className="p-3">Statut</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {documents.map((doc) => (
                        <tr key={doc.id} className="hover:bg-slate-50/50">
                          <td className="p-3">
                            <p className="font-semibold text-slate-800">{doc.titre}</p>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-1.5 py-0.5 rounded">
                              {doc.type}
                            </span>
                          </td>
                          <td className="p-3 text-slate-500 font-medium">
                            {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString("fr-FR") : "-"}
                          </td>
                          <td className="p-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              doc.isActive ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"
                            }`}>
                              {doc.isActive ? "Actif (Visible)" : "Masqué (Inactif)"}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleToggleContent("document", doc.id, !doc.isActive)}
                              disabled={togglingId === doc.id}
                              className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold transition-all cursor-pointer ${
                                doc.isActive 
                                  ? "bg-red-50 border-red-200 text-red-700 hover:bg-red-100" 
                                  : "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                              }`}
                            >
                              {togglingId === doc.id ? "..." : doc.isActive ? "Masquer" : "Activer"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SUBTAB: TESTIMONIALS */}
            {activeContentSubTab === "testimonials" && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-800 text-sm">Modération des Témoignages Candidats</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                        <th className="p-3">Auteur</th>
                        <th className="p-3">Message</th>
                        <th className="p-3">Statut</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {testimonials.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50/50">
                          <td className="p-3">
                            <p className="font-semibold text-slate-800">{t.prenom} {t.nom}</p>
                          </td>
                          <td className="p-3 text-slate-500 max-w-sm truncate" title={t.message}>
                            {t.message}
                          </td>
                          <td className="p-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              t.isActive ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"
                            }`}>
                              {t.isActive ? "Actif (Visible)" : "Masqué (Inactif)"}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleToggleContent("testimonial", t.id, !t.isActive)}
                              disabled={togglingId === t.id}
                              className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold transition-all cursor-pointer ${
                                t.isActive 
                                  ? "bg-red-50 border-red-200 text-red-700 hover:bg-red-100" 
                                  : "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                              }`}
                            >
                              {togglingId === t.id ? "..." : t.isActive ? "Masquer" : "Activer"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SUBTAB: BLOG */}
            {activeContentSubTab === "blog" && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-800 text-sm">Modération des Articles de Blog</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                        <th className="p-3">Titre / Extrait</th>
                        <th className="p-3">Créé le</th>
                        <th className="p-3">Statut</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {blogArticles.map((b) => (
                        <tr key={b.id} className="hover:bg-slate-50/50">
                          <td className="p-3">
                            <p className="font-semibold text-slate-800">{b.titre}</p>
                            <p className="text-[10px] text-slate-400 truncate max-w-sm">{b.extrait}</p>
                          </td>
                          <td className="p-3 text-slate-500 font-medium">
                            {b.createdAt ? new Date(b.createdAt).toLocaleDateString("fr-FR") : "-"}
                          </td>
                          <td className="p-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              b.isPublished ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"
                            }`}>
                              {b.isPublished ? "Publié (Visible)" : "Brouillon (Masqué)"}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleToggleContent("blog", b.id, !b.isPublished)}
                              disabled={togglingId === b.id}
                              className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold transition-all cursor-pointer ${
                                b.isPublished 
                                  ? "bg-red-50 border-red-200 text-red-700 hover:bg-red-100" 
                                  : "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                              }`}
                            >
                              {togglingId === b.id ? "..." : b.isPublished ? "Masquer" : "Publier"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SUBTAB: AFFICHES / MEDIA */}
            {activeContentSubTab === "affiches" && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-800 text-sm">Modération de la Galerie Média (Actualités)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                        <th className="p-3">Média / Titre</th>
                        <th className="p-3">Planification</th>
                        <th className="p-3">Statut</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {affiches.map((img) => (
                        <tr key={img.id} className="hover:bg-slate-50/50">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-12 bg-slate-900 flex items-center justify-center rounded overflow-hidden flex-shrink-0">
                                {img.type === "video" ? (
                                  <Video className="w-4 h-4 text-white" />
                                ) : (
                                  <img src={img.url} alt="Mini" className="w-full h-full object-cover" />
                                )}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-850">{img.title}</p>
                                <span className="text-[8px] uppercase font-bold text-slate-400 bg-slate-100 px-1 py-0.5 rounded">
                                  {img.type}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 font-medium text-slate-500 space-y-0.5">
                            {img.startDate && <p>Début : <span className="font-bold text-slate-700">{img.startDate}</span></p>}
                            {img.endDate && <p>Fin : <span className="font-bold text-slate-700">{img.endDate}</span></p>}
                            {!img.startDate && !img.endDate && <p className="italic text-slate-400">Diffusion continue</p>}
                          </td>
                          <td className="p-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              img.isActive ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"
                            }`}>
                              {img.isActive ? "Actif (Visible)" : "Masqué (Inactif)"}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleToggleContent("affiche", img.id, !img.isActive)}
                              disabled={togglingId === img.id}
                              className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold transition-all cursor-pointer ${
                                img.isActive 
                                  ? "bg-red-50 border-red-200 text-red-700 hover:bg-red-100" 
                                  : "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                              }`}
                            >
                              {togglingId === img.id ? "..." : img.isActive ? "Masquer" : "Activer"}
                            </button>
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
      ) : (
        /* GESTION DES COMPTES */
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            {/* Search and filter bars */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, prénom ou email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="h-4 w-4 text-slate-400" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="p-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-800"
                >
                  <option value="">Tous les Rôles</option>
                  <option value="user">Candidats (User)</option>
                  <option value="manager_zone">Managers de Zone</option>
                  <option value="admin">Administrateurs</option>
                  <option value="super_admin">Super Admins</option>
                </select>
              </div>
            </div>

            {/* Users Table list */}
            <div className="overflow-x-auto border-t border-slate-100 pt-4">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                    <th className="p-3">Utilisateur</th>
                    <th className="p-3">Rôle</th>
                    <th className="p-3">Zone</th>
                    <th className="p-3">Rejoint le</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50">
                      <td className="p-3">
                        <p className="font-bold text-slate-900">{u.prenom} {u.nom}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{u.email}</p>
                        {u.whatsapp && <p className="text-[9px] text-slate-450 font-bold">WA : {u.whatsapp}</p>}
                      </td>
                      <td className="p-3 capitalize font-bold">
                        <span className={`px-2 py-0.5 rounded-full border text-[9px] ${
                          u.role === "super_admin" ? "bg-red-50 border-red-200 text-red-700" :
                          u.role === "admin" ? "bg-blue-50 border-blue-200 text-blue-700" :
                          u.role === "manager_zone" ? "bg-amber-50 border-amber-250 text-amber-900" :
                          "bg-slate-50 border-slate-200 text-slate-600"
                        }`}>
                          {u.role.replace("_", " ")}
                        </span>
                      </td>
                      <td className="p-3 capitalize font-semibold text-slate-500">
                        {u.zone ? u.zone.replace("-", " ") : <span className="italic text-slate-300">Aucune</span>}
                      </td>
                      <td className="p-3 text-slate-400">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString("fr-FR") : "-"}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleOpenEditUser(u)}
                          className="p-1.5 border border-slate-200 hover:border-red-200 text-slate-600 hover:text-red-600 bg-white hover:bg-red-50 rounded-xl transition-all inline-flex items-center gap-1 text-[10px] font-bold cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Modifier / Reset</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Account Modification Dialog */}
      <Dialog open={editingUser !== null} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="sm:max-w-md bg-white p-6 rounded-2xl border border-slate-100 shadow-2xl">
          <DialogHeader className="border-b border-slate-100 pb-4">
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-600" />
              <span>Contrôle de Sécurité de Compte</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 font-medium mt-1">
              Modifiez l'identité et les privilèges d'accès de ce compte. Modifier le mot de passe invalidera ses sessions actives immédiatement.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveUser} className="space-y-4 text-xs font-semibold pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="edP" className="text-[10px] font-bold text-slate-450 uppercase">Prénom</label>
                <input
                  id="edP"
                  type="text"
                  value={editPrenom}
                  onChange={(e) => setEditPrenom(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="edN" className="text-[10px] font-bold text-slate-450 uppercase">Nom</label>
                <input
                  id="edN"
                  type="text"
                  value={editNom}
                  onChange={(e) => setEditNom(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="edE" className="text-[10px] font-bold text-slate-450 uppercase">Email</label>
              <input
                id="edE"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="edW" className="text-[10px] font-bold text-slate-455 uppercase">Numéro WhatsApp</label>
              <input
                id="edW"
                type="text"
                value={editWhatsapp}
                onChange={(e) => setEditWhatsapp(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="edR" className="text-[10px] font-bold text-slate-450 uppercase">Privilège / Rôle</label>
                <select
                  id="edR"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 bg-white"
                >
                  <option value="user">Candidat (User)</option>
                  <option value="manager_zone">Manager de Zone</option>
                  <option value="admin">Administrateur</option>
                  <option value="super_admin">Super Administrateur</option>
                </select>
              </div>

              {editRole === "manager_zone" && (
                <div className="space-y-1.5">
                  <label htmlFor="edZ" className="text-[10px] font-bold text-slate-455 uppercase">Zone assignée</label>
                  <select
                    id="edZ"
                    value={editZone}
                    onChange={(e) => setEditZone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-850 bg-white"
                  >
                    <option value="">Non assigné</option>
                    <option value="yamoussoukro">Yamoussoukro</option>
                    <option value="yopougon">Yopougon</option>
                    <option value="abobo">Abobo</option>
                    <option value="cocody">Cocody</option>
                    <option value="port-bouet">Port-Bouët</option>
                    <option value="bouake">Bouaké</option>
                  </select>
                </div>
              )}
            </div>

            {/* Password Reset Field */}
            <div className="space-y-1.5 border-t border-slate-100 pt-3">
              <label htmlFor="edPass" className="text-[10px] font-bold text-slate-600 uppercase flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5 text-red-500" />
                <span>Réinitialiser le mot de passe (Force logout)</span>
              </label>
              <input
                id="edPass"
                type="password"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                placeholder="Laisser vide si inchangé"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500 bg-slate-50/50"
              />
              <p className="text-[9px] text-slate-400 font-medium">
                Si renseigné, l'utilisateur sera immédiatement déconnecté de toutes ses sessions et devra saisir un nouveau mot de passe lors de sa reconnexion.
              </p>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100 text-sm font-bold">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="flex-1 py-2 border border-slate-250 text-slate-650 hover:bg-slate-50 rounded-xl transition-all text-center cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSavingUser}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-450 text-white rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isSavingUser ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <span>Appliquer</span>
                )}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
