"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { createDocument, toggleDocumentActive, deleteDocument } from "../actions";
import { createClient } from "@/utils/supabase/client";
import { Plus, Trash2, Calendar, FileText, Globe, Check, X, ShieldAlert, AlertCircle, Video, Loader2 } from "lucide-react";

interface DocumentsManagerClientProps {
  initialDocuments: any[];
}

export default function DocumentsManagerClient({ initialDocuments }: DocumentsManagerClientProps) {
  const [documentsList, setDocumentsList] = useState<any[]>(initialDocuments);
  const [isOpen, setIsOpen] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // Form State
  const [form, setForm] = useState({
    titre: "",
    description: "",
    type: "cours",
    concours: "tous",
    ordre: "0",
    fichierUrl: "",
    scheduledAt: "",
    durationHours: "2",
  });

  const supabase = createClient();

  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      const res = await toggleDocumentActive(id, active);
      if (res.success) {
        setDocumentsList((prev) =>
          prev.map((d) => (d.id === id ? { ...d, isActive: active } : d))
        );
        toast.success(active ? "Support activé." : "Support désactivé.");
      } else {
        toast.error(res.error || "Une erreur est survenue.");
      }
    } catch (err) {
      toast.error("Erreur réseau.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer ce support ? Cela annulera également l'événement Google Calendar associé.")) return;

    try {
      const res = await deleteDocument(id);
      if (res.success) {
        setDocumentsList((prev) => prev.filter((d) => d.id !== id));
        toast.success("Support supprimé.");
      } else {
        toast.error(res.error || "Une erreur est survenue.");
      }
    } catch (err) {
      toast.error("Erreur réseau.");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Seuls les fichiers PDF sont autorisés.");
      return;
    }

    if (file.size > 15 * 1024 * 1024) { // 15MB
      toast.error("Le fichier ne doit pas dépasser 15 Mo.");
      return;
    }

    setUploadProgress(0);
    
    // Simulate upload progress since server-side encryption handles uploading
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null) return 0;
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 150);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/documents/upload", {
        method: "POST",
        body: formData,
      });

      const resData = await response.json();

      if (!response.ok || resData.error) {
        throw new Error(resData.error || "Une erreur est survenue lors du téléversement.");
      }

      clearInterval(progressInterval);
      setForm((prev) => ({ ...prev, fichierUrl: resData.filePath }));
      setUploadProgress(100);
      toast.success("Fichier PDF chiffré et téléversé avec succès.");
    } catch (err: any) {
      clearInterval(progressInterval);
      console.error("Upload error:", err);
      toast.error(err.message || "Erreur de téléversement.");
      setUploadProgress(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titre) {
      toast.error("Le titre est obligatoire.");
      return;
    }

    if (!isLive && !form.fichierUrl) {
      toast.error("Veuillez téléverser un document PDF ou cocher l'option Cours en Direct.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        scheduledAt: isLive ? form.scheduledAt : "",
      };

      const res = await createDocument(payload);
      if (res.success) {
        toast.success(isLive ? "Cours en direct programmé avec succès !" : "Document de cours créé avec succès !");
        window.location.reload();
      } else {
        toast.error(res.error || "Une erreur est survenue.");
      }
    } catch (err) {
      toast.error("Erreur réseau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#D4A017]" />
          Listing des supports
        </h2>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#D4A017] hover:bg-yellow-600 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Ajouter un Support / Direct
        </button>
      </div>

      {/* CREATE MODAL / DRAWER */}
      {isOpen && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md space-y-4 max-w-3xl animate-fade-in">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-slate-900">Ajouter un support d'étude</h3>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-650 text-xs font-bold">Fermer</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Titre du support *</label>
                <input
                  type="text"
                  required
                  value={form.titre}
                  onChange={(e) => setForm({ ...form, titre: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-250 bg-white"
                  placeholder="ex: TD Limites et Continuité"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Concours Visé</label>
                <select
                  value={form.concours}
                  onChange={(e) => setForm({ ...form, concours: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-250 bg-white"
                >
                  <option value="tous">Tous Concours</option>
                  <option value="inphb">INP-HB</option>
                  <option value="esatic">ESATIC</option>
                  <option value="cme">CME</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description (Facultatif)</label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-250 bg-white"
                placeholder="Indiquez brièvement le contenu de ce support..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Type de Document</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-250 bg-white"
                >
                  <option value="cours">Cours / Support principal</option>
                  <option value="exercice">Exercice / Fiche de TD</option>
                  <option value="corrige">Corrigé officiel</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Ordre d'affichage</label>
                <input
                  type="number"
                  value={form.ordre}
                  onChange={(e) => setForm({ ...form, ordre: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-250 bg-white"
                  placeholder="0"
                />
              </div>
            </div>

            {/* LIVE OPTION CHECKBOX */}
            <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl space-y-3">
              <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isLive}
                  onChange={(e) => {
                    setIsLive(e.target.checked);
                    if (e.target.checked) setForm((prev) => ({ ...prev, type: "cours" }));
                  }}
                  className="w-4 h-4 rounded border-slate-300 text-[#D4A017]"
                />
                Planifier comme un cours en direct (Google Meet)
              </label>

              {isLive ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Date et Heure de Début *</label>
                    <input
                      type="datetime-local"
                      required={isLive}
                      value={form.scheduledAt}
                      onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-250 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Durée estimée (Heures)</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={form.durationHours}
                      onChange={(e) => setForm({ ...form, durationHours: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-250 bg-white"
                      placeholder="2"
                    />
                  </div>
                </div>
              ) : (
                <div className="pt-2 border-t border-slate-200">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Document PDF *</label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#D4A017]/10 file:text-[#D4A017] hover:file:bg-[#D4A017]/20 file:cursor-pointer"
                  />
                  {uploadProgress !== null && (
                    <div className="mt-2 text-xs flex items-center gap-2">
                      <div className="w-full bg-slate-200 rounded-full h-1.5 max-w-[200px]">
                        <div className="bg-[#D4A017] h-1.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                      </div>
                      <span className="font-bold">{uploadProgress}%</span>
                    </div>
                  )}
                  {form.fichierUrl && (
                    <p className="mt-1 text-xs text-green-700 font-mono font-bold">Fichier prêt : {form.fichierUrl}</p>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 border border-slate-250 rounded-xl hover:bg-slate-50 text-xs font-bold cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-6 py-2.5 bg-[#D4A017] hover:bg-yellow-600 text-white rounded-xl text-xs font-bold shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  "Enregistrer"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DOCUMENTS LISTING TABLE */}
      {documentsList.length === 0 ? (
        <div className="text-center p-12 border border-dashed border-slate-200 rounded-3xl text-slate-400 text-xs">
          Aucun support d'étude n'a été publié. Cliquez sur "Ajouter un Support" pour commencer.
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider font-sans">
                  <th className="p-4">Ressource</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Concours</th>
                  <th className="p-4">Statut / Direct</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150">
                {documentsList.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/40">
                    <td className="p-4">
                      <div className="space-y-1">
                        <p className="font-bold text-slate-900 text-sm leading-snug">{doc.titre}</p>
                        {doc.description && <p className="text-slate-500 font-medium text-xs line-clamp-1">{doc.description}</p>}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="capitalize bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">
                        {doc.type === "cours" ? "Cours" : doc.type === "exercice" ? "Exercice" : "Corrigé"}
                      </span>
                    </td>
                    <td className="p-4 text-xs font-bold text-slate-700 uppercase">
                      {doc.concours === "tous" ? "Tous Concours" : doc.concours}
                    </td>
                    <td className="p-4">
                      {doc.scheduledAt ? (
                        <div className="space-y-1">
                          <span className="bg-red-50 border border-red-200 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1">
                            <Video className="w-3.5 h-3.5" />
                            Direct
                          </span>
                          <p className="text-[10px] text-slate-550 font-semibold font-mono">
                            {new Date(doc.scheduledAt).toLocaleString("fr-FR")}
                          </p>
                          {doc.meetingUrl && (
                            <a
                              href={doc.meetingUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-blue-600 hover:underline font-bold block truncate max-w-[150px]"
                              title={doc.meetingUrl}
                            >
                              Lien Meet ✓
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 font-medium font-mono text-[10px] truncate max-w-[120px] block" title={doc.fichierUrl}>
                          {doc.fichierUrl?.split("/").pop()}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Toggle Active Button */}
                        <button
                          onClick={() => handleToggleActive(doc.id, !doc.isActive)}
                          className={`p-1.5 rounded-lg border transition-all ${
                            doc.isActive
                              ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                              : "bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100"
                          }`}
                          title={doc.isActive ? "Masquer aux étudiants" : "Afficher aux étudiants"}
                        >
                          {doc.isActive ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="p-1.5 bg-red-55 border border-red-200 text-red-700 hover:bg-red-100 rounded-lg transition-all"
                          title="Supprimer définitivement"
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
            {documentsList.map((doc) => (
              <div key={doc.id} className="p-4 space-y-3 font-semibold text-xs text-slate-700 bg-white">
                <div className="space-y-1">
                  <p className="font-bold text-slate-900 text-sm leading-snug">{doc.titre}</p>
                  {doc.description && <p className="text-slate-500 font-medium text-xs leading-normal">{doc.description}</p>}
                </div>

                <div className="flex gap-2 flex-wrap items-center">
                  <span className="capitalize bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">
                    {doc.type === "cours" ? "Cours" : doc.type === "exercice" ? "Exercice" : "Corrigé"}
                  </span>
                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                    {doc.concours === "tous" ? "Tous Concours" : doc.concours}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-50 flex items-center justify-between text-[11px] gap-2">
                  <div className="flex-1 min-w-0">
                    {doc.scheduledAt ? (
                      <div className="space-y-1">
                        <span className="bg-red-50 border border-red-200 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1">
                          <Video className="w-3 h-3" />
                          Direct
                        </span>
                        <p className="text-[10px] text-slate-500 font-mono">
                          {new Date(doc.scheduledAt).toLocaleString("fr-FR")}
                        </p>
                        {doc.meetingUrl && (
                          <a
                            href={doc.meetingUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-blue-600 hover:underline font-bold block truncate max-w-[130px]"
                            title={doc.meetingUrl}
                          >
                            Lien Meet ✓
                          </a>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400 font-medium font-mono text-[10px] truncate max-w-[130px] block" title={doc.fichierUrl}>
                        {doc.fichierUrl?.split("/").pop()}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Toggle Active Button */}
                    <button
                      onClick={() => handleToggleActive(doc.id, !doc.isActive)}
                      className={`p-1.5 rounded-lg border transition-all ${
                        doc.isActive
                          ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                          : "bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100"
                      }`}
                      title={doc.isActive ? "Masquer aux étudiants" : "Afficher aux étudiants"}
                    >
                      {doc.isActive ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-1.5 bg-red-50 border border-red-250 text-red-700 hover:bg-red-100 rounded-lg transition-all"
                      title="Supprimer définitivement"
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
  );
}
