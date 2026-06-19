"use client";

import React, { useState } from "react";
import { toggleUserActive, softDeleteUser, updateCandidateProfile } from "@/app/(admin)/admin/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Search, Phone, ShieldAlert, CheckCircle2, XCircle, Trash2, Download, AlertCircle, RefreshCw, Pencil, X, Loader2 } from "lucide-react";

interface Candidate {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  whatsapp: string | null;
  zone: string | null;
  modeFormation: string | null;
  isActive: boolean | null;
  createdAt: Date | null;
  registeredConcours: string[];
  paymentStatus: string;
}

interface CandidatsListClientProps {
  candidates: Candidate[];
}

export default function CandidatsListClient({ candidates }: CandidatsListClientProps) {
  const router = useRouter();

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [zoneFilter, setZoneFilter] = useState("all");
  const [concoursFilter, setConcoursFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Loading States
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Edit Modal State
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [editForm, setEditForm] = useState({ nom: "", prenom: "", whatsapp: "", zone: "", modeFormation: "" });
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);

  // Filter Candidates
  const filteredCandidates = candidates.filter((cand) => {
    const matchesSearch =
      cand.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cand.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cand.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesZone = zoneFilter === "all" || cand.zone === zoneFilter;

    const matchesConcours =
      concoursFilter === "all" || cand.registeredConcours.includes(concoursFilter);

    const matchesPayment = paymentFilter === "all" || cand.paymentStatus === paymentFilter;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && cand.isActive) ||
      (statusFilter === "inactive" && !cand.isActive);

    return matchesSearch && matchesZone && matchesConcours && matchesPayment && matchesStatus;
  });

  // Toggle activation status
  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    setProcessingId(userId);
    try {
      const res = await toggleUserActive(userId, !currentStatus);
      if (!res.success) throw new Error(res.error);
      
      toast.success(
        `Candidat ${!currentStatus ? "activé" : "désactivé"} avec succès.`
      );
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la mise à jour.");
    } finally {
      setProcessingId(null);
    }
  };

  // Soft delete candidate
  const handleDeleteCandidate = async (userId: string, name: string) => {
    const confirm = window.confirm(
      `Êtes-vous sûr de vouloir supprimer définitivement le compte de ${name} ?`
    );
    if (!confirm) return;

    setProcessingId(userId);
    try {
      const res = await softDeleteUser(userId);
      if (!res.success) throw new Error(res.error);

      toast.success("Compte candidat supprimé avec succès.");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la suppression.");
    } finally {
      setProcessingId(null);
    }
  };

  // Open edit modal
  const openEditModal = (cand: Candidate) => {
    setEditingCandidate(cand);
    setEditForm({
      nom: cand.nom,
      prenom: cand.prenom,
      whatsapp: cand.whatsapp || "",
      zone: cand.zone || "",
      modeFormation: cand.modeFormation || "",
    });
  };

  // Submit edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCandidate || isEditSubmitting) return;

    setIsEditSubmitting(true);
    try {
      const res = await updateCandidateProfile(editingCandidate.id, editForm);
      if (!res.success) throw new Error(res.error);

      toast.success(`Profil de ${editForm.prenom} ${editForm.nom} mis à jour.`);
      setEditingCandidate(null);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la modification.");
    } finally {
      setIsEditSubmitting(false);
    }
  };

  // Export filtered candidates to CSV
  const handleExportCSV = () => {
    if (filteredCandidates.length === 0) {
      toast.warning("Aucun candidat à exporter.");
      return;
    }

    const headers = "Prenom,Nom,Email,WhatsApp,Zone,Mode Formation,Concours,Statut Paiement,Compte Actif,Date Inscription\n";
    
    const rows = filteredCandidates
      .map((c) => {
        const formattedDate = c.createdAt
          ? new Date(c.createdAt).toLocaleDateString("fr-FR")
          : "";
        return `"${c.prenom}","${c.nom}","${c.email}","${c.whatsapp || ""}","${c.zone || ""}","${
          c.modeFormation || ""
        }","${c.registeredConcours.join("/")}","${c.paymentStatus}","${
          c.isActive ? "Actif" : "Inactif"
        }","${formattedDate}"`;
      })
      .join("\n");

    const blob = new Blob(["\uFEFF" + headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `candidates_export_${Date.now()}.csv`);
    link.click();
    
    toast.success("Exportation CSV lancée avec succès.");
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "valide":
        return "bg-emerald-50 text-emerald-800 border-emerald-250";
      case "en_cours":
        return "bg-amber-50 text-[#D4A017] border-amber-200";
      case "rejete":
        return "bg-rose-50 text-rose-800 border-rose-250";
      case "non_soumis":
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case "valide":
        return "Validé";
      case "en_cours":
        return "Vérification";
      case "rejete":
        return "Rejeté";
      case "non_soumis":
      default:
        return "Non soumis";
    }
  };

  const getZoneLabel = (name: string | null) => {
    if (!name) return "Non définie";
    return name.charAt(0).toUpperCase() + name.slice(1).replace("-", " ");
  };

  return (
    <div className="space-y-6">
      {/* Filtering header panel */}
      <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, prénom, e-mail..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 bg-slate-55/40"
            />
          </div>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-[#D4A017] text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-slate-900/5 hover:shadow-gold/15"
          >
            <Download className="w-4 h-4" />
            <span>Exporter CSV ({filteredCandidates.length})</span>
          </button>
        </div>

        {/* Dropdown Filters Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-slate-100">
          {/* Zone filter */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-450 uppercase tracking-wide">Zone</label>
            <select
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 bg-white"
            >
              <option value="all">Toutes les zones</option>
              <option value="yamoussoukro">Yamoussoukro</option>
              <option value="yopougon">Yopougon</option>
              <option value="abobo">Abobo</option>
              <option value="cocody">Cocody</option>
              <option value="port-bouet">Port-Bouët</option>
              <option value="bouake">Bouaké</option>
            </select>
          </div>

          {/* Contest filter */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-455 uppercase tracking-wide">Concours</label>
            <select
              value={concoursFilter}
              onChange={(e) => setConcoursFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 bg-white"
            >
              <option value="all">Tous les concours</option>
              <option value="inphb">INP-HB</option>
              <option value="esatic">ESATIC</option>
              <option value="cme">CME</option>
            </select>
          </div>

          {/* Payment filter */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-455 uppercase tracking-wide">Paiement</label>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 bg-white"
            >
              <option value="all">Tous les statuts</option>
              <option value="valide">Validé</option>
              <option value="en_cours">En cours (Vérification)</option>
              <option value="rejete">Rejeté</option>
              <option value="non_soumis">Non soumis</option>
            </select>
          </div>

          {/* Activation status filter */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-455 uppercase tracking-wide">Compte Actif</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 bg-white"
            >
              <option value="all">Tous</option>
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
            </select>
          </div>
        </div>
      </div>

      {/* Candidate Database Tables */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        {filteredCandidates.length > 0 ? (
          <>
            {/* Desktop view table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">Nom & Prénom</th>
                    <th className="px-6 py-4">Zone</th>
                    <th className="px-6 py-4">Concours</th>
                    <th className="px-6 py-4">Paiement</th>
                    <th className="px-6 py-4">Compte</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {filteredCandidates.map((cand) => (
                    <tr key={cand.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 space-y-0.5">
                        <p className="font-bold text-slate-800">
                          {cand.prenom} {cand.nom}
                        </p>
                        <p className="text-xs text-slate-400 font-medium">{cand.email}</p>
                      </td>
                      <td className="px-6 py-4">{getZoneLabel(cand.zone)}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1.5 flex-wrap">
                          {cand.registeredConcours.map((c) => (
                            <span
                              key={c}
                              className="px-2 py-0.5 rounded bg-slate-105 text-slate-700 text-xs uppercase font-bold border border-slate-200/80"
                            >
                              {c}
                            </span>
                          ))}
                          {cand.registeredConcours.length === 0 && (
                            <span className="text-xs text-slate-400">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 border rounded-full text-xs font-bold ${getPaymentStatusBadge(cand.paymentStatus)}`}>
                          {getPaymentStatusLabel(cand.paymentStatus)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleActive(cand.id, !!cand.isActive)}
                          disabled={processingId === cand.id}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 border rounded-full text-xs font-bold transition-all ${
                            cand.isActive
                              ? "bg-emerald-50 hover:bg-rose-50 text-emerald-700 hover:text-rose-700 border-emerald-250 hover:border-rose-250"
                              : "bg-amber-50 hover:bg-emerald-50 text-[#D4A017] hover:text-emerald-700 border-amber-200 hover:border-emerald-250"
                          }`}
                        >
                          {processingId === cand.id ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : cand.isActive ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5" />
                          )}
                          <span>{cand.isActive ? "Actif" : "Inactif"}</span>
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {/* Edit candidate */}
                          <button
                            onClick={() => openEditModal(cand)}
                            className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg border border-blue-200 transition-all flex items-center justify-center"
                            title="Modifier le candidat"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          {/* WhatsApp contact */}
                          {cand.whatsapp ? (
                            <a
                              href={`https://wa.me/${cand.whatsapp.replace(/[^0-9]/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white rounded-lg border border-[#25D366]/20 transition-all flex items-center justify-center"
                              title="Contacter sur WhatsApp"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                          ) : (
                            <div className="w-7 h-7" />
                          )}

                          {/* Soft Delete candidate */}
                          <button
                            onClick={() => handleDeleteCandidate(cand.id, `${cand.prenom} ${cand.nom}`)}
                            disabled={processingId === cand.id}
                            className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg border border-rose-200 transition-all flex items-center justify-center disabled:opacity-50"
                            title="Supprimer le candidat"
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

            {/* Mobile Adaptative Cards list */}
            <div className="sm:hidden divide-y divide-slate-100">
              {filteredCandidates.map((cand) => (
                <div key={cand.id} className="p-4 space-y-4 font-semibold text-sm text-slate-700">
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-slate-800">
                        {cand.prenom} {cand.nom}
                      </h4>
                      <p className="text-xs text-slate-400 font-medium">{cand.email}</p>
                    </div>

                    <span className={`px-2.5 py-0.5 border rounded-full text-xs font-bold ${getPaymentStatusBadge(cand.paymentStatus)}`}>
                      {getPaymentStatusLabel(cand.paymentStatus)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div>
                      <p className="text-slate-405 font-bold uppercase tracking-wider text-[9px]">Zone</p>
                      <p className="text-slate-800 mt-0.5">{getZoneLabel(cand.zone)}</p>
                    </div>
                    <div>
                      <p className="text-slate-405 font-bold uppercase tracking-wider text-[9px]">Concours</p>
                      <p className="text-slate-800 mt-0.5">{cand.registeredConcours.join(", ") || "-"}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-slate-50/70">
                    <button
                      onClick={() => handleToggleActive(cand.id, !!cand.isActive)}
                      disabled={processingId === cand.id}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 border rounded-full text-xs font-bold transition-all ${
                        cand.isActive
                          ? "bg-emerald-50 text-emerald-700 border-emerald-250"
                          : "bg-amber-50 text-[#D4A017] border-amber-200"
                      }`}
                    >
                      {cand.isActive ? "Actif" : "Inactif"}
                    </button>

                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(cand)}
                        className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-200 transition-all flex items-center justify-center"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      {cand.whatsapp && (
                        <a
                          href={`https://wa.me/${cand.whatsapp.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-[#25D366]/10 text-[#25D366] rounded-xl border border-[#25D366]/20 transition-all flex items-center justify-center"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        onClick={() => handleDeleteCandidate(cand.id, `${cand.prenom} ${cand.nom}`)}
                        disabled={processingId === cand.id}
                        className="p-2 bg-rose-50 text-rose-600 rounded-xl border border-rose-200 transition-all flex items-center justify-center"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* Empty state */
          <div className="text-center py-16 px-4 space-y-4 max-w-sm mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-bold text-slate-800 text-sm">Aucun candidat</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Aucun dossier candidat ne correspond aux filtres de recherche actuels.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Edit Candidate Modal */}
      {editingCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full overflow-hidden shadow-xl">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="space-y-0.5">
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                  Modifier le Profil
                </h3>
                <p className="text-xs text-slate-400 font-semibold">
                  {editingCandidate.email}
                </p>
              </div>
              <button
                onClick={() => setEditingCandidate(null)}
                className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleEditSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Prénom</label>
                  <input
                    type="text"
                    value={editForm.prenom}
                    onChange={(e) => setEditForm({ ...editForm, prenom: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Nom</label>
                  <input
                    type="text"
                    value={editForm.nom}
                    onChange={(e) => setEditForm({ ...editForm, nom: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">WhatsApp</label>
                <input
                  type="text"
                  value={editForm.whatsapp}
                  onChange={(e) => setEditForm({ ...editForm, whatsapp: e.target.value })}
                  placeholder="+225 07 XX XX XX XX"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Zone</label>
                  <select
                    value={editForm.zone}
                    onChange={(e) => setEditForm({ ...editForm, zone: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 bg-white"
                  >
                    <option value="">Non définie</option>
                    <option value="yamoussoukro">Yamoussoukro</option>
                    <option value="yopougon">Yopougon</option>
                    <option value="abobo">Abobo</option>
                    <option value="cocody">Cocody</option>
                    <option value="port-bouet">Port-Bouët</option>
                    <option value="bouake">Bouaké</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Mode formation</label>
                  <select
                    value={editForm.modeFormation}
                    onChange={(e) => setEditForm({ ...editForm, modeFormation: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 bg-white"
                  >
                    <option value="">Non défini</option>
                    <option value="en_ligne">En ligne</option>
                    <option value="presentiel">Présentiel</option>
                    <option value="hybride">Hybride</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingCandidate(null)}
                  className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-sm font-bold text-slate-600 transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isEditSubmitting}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-slate-900 hover:bg-[#D4A017] text-white rounded-xl text-sm font-bold transition-all shadow-md disabled:opacity-50"
                >
                  {isEditSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Pencil className="w-3.5 h-3.5" />
                  )}
                  <span>Enregistrer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
