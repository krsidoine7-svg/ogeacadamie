"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { managerCreateDocument, managerToggleDocumentActive, managerDeleteDocument } from "../actions";
import { Plus, Trash2, FileText, Check, X, Loader2, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

interface ZoneDocumentsClientProps {
  initialDocuments: any[];
  managerZone: string;
}

export default function ZoneDocumentsClient({ initialDocuments, managerZone }: ZoneDocumentsClientProps) {
  const [documentsList, setDocumentsList] = useState<any[]>(initialDocuments);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // Form State
  const [form, setForm] = useState({
    titre: "",
    description: "",
    type: "cours",
    concours: "tous",
    modeFormation: "tous",
    ordre: "0",
    fichierUrl: "",
  });

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: "deactivate" | "delete" | null;
    docId: string | null;
    docTitle: string;
  }>({
    isOpen: false,
    type: null,
    docId: null,
    docTitle: "",
  });

  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      const res = await managerToggleDocumentActive(id, active);
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
      const res = await managerDeleteDocument(id);
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

  const handleToggleClick = (id: string, titre: string, currentActive: boolean) => {
    if (currentActive) {
      setConfirmDialog({
        isOpen: true,
        type: "deactivate",
        docId: id,
        docTitle: titre,
      });
    } else {
      handleToggleActive(id, true);
    }
  };

  const handleDeleteClick = (id: string, titre: string) => {
    setConfirmDialog({
      isOpen: true,
      type: "delete",
      docId: id,
      docTitle: titre,
    });
  };

  const handleConfirmAction = async () => {
    const { type, docId } = confirmDialog;
    if (!docId) return;

    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));

    if (type === "deactivate") {
      await handleToggleActive(docId, false);
    } else if (type === "delete") {
      await executeDelete(docId);
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
    
    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null) return 0;
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 155);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Reuses the admin upload route (updated to support manager role)
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

    if (!form.fichierUrl) {
      toast.error("Veuillez téléverser un document PDF.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await managerCreateDocument({
        ...form,
        type: form.type as any,
      });
      if (res.success) {
        toast.success("Document de cours créé avec succès !");
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

  const formatZoneName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1).replace("-", " ");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#D4A017]" />
          Supports de la Zone : <span className="text-[#D4A017]">{formatZoneName(managerZone)}</span>
        </h2>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#D4A017] hover:bg-yellow-600 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Ajouter un Document PDF
        </button>
      </div>

      {/* CREATE MODAL */}
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
                  placeholder="ex: TD Géométrie dans l'espace"
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
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Ordre d'affichage</label>
                <input
                  type="number"
                  value={form.ordre}
                  onChange={(e) => setForm({ ...form, ordre: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-250 bg-white"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Fichier PDF *</label>
                <input
                  type="file"
                  accept=".pdf"
                  required
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
                  <p className="mt-1 text-xs text-green-705 font-mono font-bold">Fichier prêt : {form.fichierUrl.split("/").pop()}</p>
                )}
              </div>
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
          Aucun support de cours n'a été téléversé pour cette zone. Cliquez sur "Ajouter un Document PDF" pour commencer.
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
                  <th className="p-4">Mode Préparation</th>
                  <th className="p-4">Fichier</th>
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
                    <td className="p-4 text-xs font-semibold text-slate-600 capitalize">
                      {doc.modeFormation === "tous" ? "Tous modes" : doc.modeFormation === "presentiel" ? "Présentiel" : "En Ligne"}
                    </td>
                    <td className="p-4">
                      <span className="text-slate-400 font-medium font-mono text-[10px] truncate max-w-[120px] block" title={doc.fichierUrl}>
                        {doc.fichierUrl?.split("/").pop()}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* View PDF Button */}
                        <a
                          href={`/api/documents/${doc.id}/view`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 rounded-lg transition-all inline-flex items-center"
                          title="Consulter le document PDF"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </a>

                        {/* Toggle Active Button */}
                        <button
                          onClick={() => handleToggleClick(doc.id, doc.titre, doc.isActive)}
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
                          onClick={() => handleDeleteClick(doc.id, doc.titre)}
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

          {/* Mobile View: Stacked Cards */}
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
                    {doc.modeFormation === "tous" ? "Tous modes" : doc.modeFormation === "presentiel" ? "Présentiel" : "En Ligne"}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-50 flex items-center justify-between text-[11px] gap-2">
                  <div className="flex-1 min-w-0">
                    <span className="text-slate-400 font-medium font-mono text-[10px] truncate max-w-[130px] block" title={doc.fichierUrl}>
                      {doc.fichierUrl?.split("/").pop()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* View PDF Button */}
                    <a
                      href={`/api/documents/${doc.id}/view`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 rounded-lg transition-all inline-flex items-center"
                      title="Consulter le document PDF"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </a>

                    {/* Toggle Active Button */}
                    <button
                      onClick={() => handleToggleClick(doc.id, doc.titre, doc.isActive)}
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
                      onClick={() => handleDeleteClick(doc.id, doc.titre)}
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

      {/* CONFIRMATION DIALOG MODAL */}
      <Dialog 
        open={confirmDialog.isOpen} 
        onOpenChange={(open) => !open && setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      >
        <DialogContent className="sm:max-w-md bg-white p-6 rounded-2xl border border-slate-100 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              {confirmDialog.type === "deactivate" ? "Désactiver le document" : "Supprimer le document"}
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500 mt-2 leading-relaxed">
              {confirmDialog.type === "deactivate" ? (
                <>
                  Voulez-vous vraiment désactiver le support <span className="font-bold text-slate-800">"{confirmDialog.docTitle}"</span> ? Il ne sera plus visible ni accessible par les candidats de votre zone.
                </>
              ) : (
                <>
                  Voulez-vous vraiment supprimer définitivement le support <span className="font-bold text-slate-800">"{confirmDialog.docTitle}"</span> ? Cette action est irréversible.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Annuler
            </button>
            <button
              onClick={handleConfirmAction}
              className={`px-5 py-2.5 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer ${
                confirmDialog.type === "deactivate" 
                  ? "bg-amber-600 hover:bg-amber-700" 
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {confirmDialog.type === "deactivate" ? "Désactiver" : "Supprimer"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
