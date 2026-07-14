"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { createDocument, toggleDocumentActive, deleteDocument } from "../actions";
import { createClient } from "@/utils/supabase/client";
import { Plus, Trash2, Calendar, FileText, Globe, Check, X, ShieldAlert, AlertCircle, Video, Loader2, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface DocumentsManagerClientProps {
  initialDocuments: any[];
}

export default function DocumentsManagerClient({ initialDocuments }: DocumentsManagerClientProps) {
  const [documentsList, setDocumentsList] = useState<any[]>(initialDocuments);
  const [isOpen, setIsOpen] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // Confirm Modal State
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    type: "deactivate" | "delete" | null;
    docId: string | null;
    docTitle: string | null;
    isLive: boolean;
  }>({
    isOpen: false,
    type: null,
    docId: null,
    docTitle: null,
    isLive: false,
  });

  // Form State
  const [form, setForm] = useState({
    titre: "",
    description: "",
    type: "cours",
    concours: "tous",
    modeFormation: "tous",
    zone: "tous",
    ordre: "0",
    fichierUrl: "",
    scheduledAt: "",
    durationHours: "2",
  });

  const supabase = createClient();

  const executeToggleActive = async (id: string, active: boolean) => {
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

  const executeDelete = async (id: string) => {
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

  const handleToggleActive = (id: string, active: boolean, titre: string, isLiveCourse: boolean) => {
    if (!active) {
      setConfirmState({
        isOpen: true,
        type: "deactivate",
        docId: id,
        docTitle: titre,
        isLive: isLiveCourse,
      });
    } else {
      executeToggleActive(id, true);
    }
  };

  const handleDelete = (id: string, titre: string, isLiveCourse: boolean) => {
    setConfirmState({
      isOpen: true,
      type: "delete",
      docId: id,
      docTitle: titre,
      isLive: isLiveCourse,
    });
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

      if (!response.ok) {
        let errorMessage = "Erreur lors du téléversement du support.";
        if (response.status === 413) {
          errorMessage = "Le fichier PDF est trop volumineux pour le serveur proxy (Erreur 413 : Request Entity Too Large). Limite Vercel/Cloud : < 4.5 Mo.";
        } else {
          try {
            const errJson = await response.json();
            if (errJson.error) errorMessage = errJson.error;
          } catch (e) {
            const errText = await response.text();
            if (errText) errorMessage = `Erreur ${response.status} : ${errText.slice(0, 120)}`;
          }
        }

        // Envoi automatique de l'anomalie au Journal des Erreurs & Webhook Make (Super Admin)
        await fetch("/api/logs/error", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            level: response.status === 413 ? "error" : "critical",
            source: "upload",
            endpoint: "/api/admin/documents/upload",
            errorMessage: errorMessage,
            metadata: {
              fileSize: file.size,
              fileName: file.name,
              fileType: file.type,
              httpStatus: response.status,
            },
          }),
        }).catch(() => {});

        throw new Error(errorMessage);
      }

      const resData = await response.json();

      if (resData.error) {
        throw new Error(resData.error || "Une erreur est survenue lors du téléversement.");
      }

      clearInterval(progressInterval);
      setForm((prev) => ({ ...prev, fichierUrl: resData.filePath }));
      setUploadProgress(100);
      toast.success("Fichier PDF chiffré et téléversé avec succès.");
    } catch (err: any) {
      clearInterval(progressInterval);
      console.error("Upload error:", err);
      let userMsg = err.message || "Erreur de téléversement.";
      if (userMsg.includes("is not valid JSON") || userMsg.includes("Unexpected token")) {
        userMsg = "Le fichier PDF est probablement trop volumineux ou le serveur a expiré (Réponse non-JSON interceptée).";
        fetch("/api/logs/error", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            level: "error",
            source: "upload",
            endpoint: "/api/admin/documents/upload",
            errorMessage: userMsg,
            metadata: { fileSize: file.size, fileName: file.name },
          }),
        }).catch(() => {});
      }
      toast.error(userMsg);
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Mode de Préparation</label>
                <select
                  value={form.modeFormation}
                  onChange={(e) => setForm({ ...form, modeFormation: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-250 bg-white"
                >
                  <option value="tous">Tous Modes (Présentiel & En ligne)</option>
                  <option value="presentiel">Présentiel uniquement</option>
                  <option value="en_ligne">En ligne uniquement</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Zone Cible</label>
                <select
                  value={form.zone}
                  onChange={(e) => setForm({ ...form, zone: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-250 bg-white"
                >
                  <option value="tous">Toutes les zones (Global)</option>
                  <option value="yamoussoukro">Yamoussoukro</option>
                  <option value="yopougon">Yopougon</option>
                  <option value="abobo">Abobo</option>
                  <option value="cocody">Cocody</option>
                  <option value="port-bouet">Port-Bouët</option>
                  <option value="bouake">Bouaké</option>
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
            <div className={`p-4 border rounded-2xl transition-all duration-300 ${
              isLive 
                ? "bg-red-50/70 border-red-200 shadow-sm" 
                : "bg-slate-50 border-slate-200 hover:border-slate-300"
            }`}>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isLive}
                  onChange={(e) => {
                    setIsLive(e.target.checked);
                    if (e.target.checked) setForm((prev) => ({ ...prev, type: "cours" }));
                  }}
                  className="mt-1 w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer shrink-0"
                />
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-800 text-sm">
                      Planifier une Visioconférence en direct (Google Meet)
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-700 border border-red-200 uppercase tracking-wider">
                      <Video className="w-3 h-3" /> Classe Virtuelle
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    <strong>Remplace le fichier PDF.</strong> Crée automatiquement une réunion officielle dans le Google Agenda de l&apos;académie, génère le lien Meet et envoie une invitation par e-mail aux étudiants du concours sélectionné.
                  </p>
                </div>
              </label>

              {isLive ? (
                <div className="mt-4 pt-4 border-t border-red-200/80 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 uppercase mb-1 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-red-600" />
                        Date et Heure de Début *
                      </label>
                      <input
                        type="datetime-local"
                        required={isLive}
                        value={form.scheduledAt}
                        onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-red-200 bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                      />
                      <p className="mt-1 text-[11px] text-slate-500">
                        À cette heure exacte, le bouton &quot;Rejoindre&quot; clignotera en rouge pour les candidats.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 uppercase mb-1 flex items-center gap-1.5">
                        <Video className="w-3.5 h-3.5 text-red-600" />
                        Durée estimée (Heures)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={form.durationHours}
                        onChange={(e) => setForm({ ...form, durationHours: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-red-200 bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                        placeholder="2"
                      />
                      <p className="mt-1 text-[11px] text-slate-500">
                        Durée réservée dans l&apos;agenda des étudiants invités (par défaut : 2h).
                      </p>
                    </div>
                  </div>
                  <div className="p-3 bg-white/90 rounded-xl border border-red-200 flex items-start gap-2.5 text-xs text-red-800 font-medium shadow-2xs">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Action immédiate :</strong> Dès le clic sur &quot;Publier&quot;, l&apos;API Google crée la réunion et expédie le lien de visio sur l&apos;e-mail de chaque candidat inscrit à ce concours.
                    </span>
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
                      <div className="space-y-0.5">
                        <span className="block">{doc.concours === "tous" ? "Tous Concours" : doc.concours}</span>
                        <span className="block text-[10px] font-medium text-slate-500 lowercase italic">
                          {doc.modeFormation === "tous" ? "tous modes" : doc.modeFormation === "presentiel" ? "présentiel" : "en ligne"}
                          {" • "}
                          {doc.zone === "tous" ? "toutes zones" : doc.zone}
                        </span>
                      </div>
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
                        {/* View PDF Button (only for non-scheduled docs) */}
                        {!doc.scheduledAt && (
                          <a
                            href={`/api/documents/${doc.id}/view`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 rounded-lg transition-all inline-flex items-center"
                            title="Consulter le document PDF"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </a>
                        )}

                        {/* Toggle Active Button */}
                        <button
                          onClick={() => handleToggleActive(doc.id, !doc.isActive, doc.titre, !!doc.scheduledAt)}
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
                          onClick={() => handleDelete(doc.id, doc.titre, !!doc.scheduledAt)}
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
                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold capitalize">
                    {doc.modeFormation === "tous" ? "Tous Modes" : doc.modeFormation === "presentiel" ? "Présentiel" : "En Ligne"}
                  </span>
                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold capitalize">
                    {doc.zone === "tous" ? "Toutes Zones" : doc.zone}
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
                    {/* View PDF Button (only for non-scheduled docs) */}
                    {!doc.scheduledAt && (
                      <a
                        href={`/api/documents/${doc.id}/view`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 rounded-lg transition-all inline-flex items-center"
                        title="Consulter le document PDF"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </a>
                    )}

                    {/* Toggle Active Button */}
                    <button
                      onClick={() => handleToggleActive(doc.id, !doc.isActive, doc.titre, !!doc.scheduledAt)}
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
                      onClick={() => handleDelete(doc.id, doc.titre, !!doc.scheduledAt)}
                      className="p-1.5 bg-red-50 border border-red-255 text-red-700 hover:bg-red-100 rounded-lg transition-all"
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

      {/* CONFIRMATION DIALOG (PREMIUM & IMPACT MAPPING) */}
      <Dialog
        open={confirmState.isOpen}
        onOpenChange={(open) => !open && setConfirmState(prev => ({ ...prev, isOpen: false }))}
      >
        <DialogContent className="max-w-md bg-white border border-slate-200 shadow-2xl rounded-3xl p-6 md:p-8" showCloseButton={false}>
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                confirmState.type === "delete" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
              }`}>
                {confirmState.type === "delete" ? (
                  <Trash2 className="w-5 h-5" />
                ) : (
                  <ShieldAlert className="w-5 h-5" />
                )}
              </div>
              <DialogTitle className="text-lg font-extrabold text-slate-900 tracking-tight leading-none">
                {confirmState.type === "delete" ? "Supprimer le support ?" : "Désactiver le support ?"}
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-slate-500 font-medium leading-relaxed pt-1">
              Vous êtes sur le point de {confirmState.type === "delete" ? "supprimer" : "désactiver"} le support d'étude :
              <strong className="block text-slate-805 text-sm mt-1 font-bold">{confirmState.docTitle}</strong>
            </DialogDescription>
          </DialogHeader>

          {/* IMPACT MAPPING SECTION (PREMIUM DESIGN) */}
          <div className="my-5 p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
            <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-slate-450" />
              Cartographie d'Impact & Conséquences
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-600 leading-normal font-medium">
              {confirmState.type === "deactivate" ? (
                <>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                    <span>Les candidats ne verront plus ce support dans leur espace.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                    <span>L'historique et le fichier PDF chiffré restent stockés de manière sécurisée et pourront être réactivés à tout moment.</span>
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                    <span>Les candidats perdront <strong>définitivement</strong> l'accès à ce cours/exercice.</span>
                  </li>
                  {confirmState.isLive ? (
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                      <span className="text-red-700 font-semibold">
                        L'événement programmé et le lien Google Calendar associé seront annulés et supprimés.
                      </span>
                    </li>
                  ) : (
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                      <span>Le fichier PDF chiffré sur le serveur sera rendu inaccessible.</span>
                    </li>
                  )}
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                    <span>Cette suppression est irréversible (soft delete appliqué).</span>
                  </li>
                </>
              )}
            </ul>
          </div>

          <DialogFooter className="flex flex-row items-center gap-3 justify-end pt-2 border-t border-slate-100">
            <button
              onClick={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
              className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer transition-all"
            >
              Annuler
            </button>
            <button
              onClick={() => {
                if (confirmState.type === "delete") {
                  executeDelete(confirmState.docId!);
                } else {
                  executeToggleActive(confirmState.docId!, false);
                }
                setConfirmState(prev => ({ ...prev, isOpen: false }));
              }}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold text-white cursor-pointer transition-all shadow-sm ${
                confirmState.type === "delete"
                  ? "bg-red-600 hover:bg-red-700 shadow-red-100"
                  : "bg-amber-600 hover:bg-amber-700 shadow-amber-100"
              }`}
            >
              Confirmer
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
