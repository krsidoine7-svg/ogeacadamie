"use client";

import React, { useState } from "react";
import { adminApprovePayment, adminRejectPayment } from "@/app/(admin)/admin/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Search, MapPin, CreditCard, Check, X, Eye, Download, Clock, AlertCircle, Loader2, FileSpreadsheet } from "lucide-react";

interface PaymentItem {
  id: string;
  userId: string;
  candidateName: string;
  candidateEmail: string;
  zone: string;
  montant: number | null;
  statut: string | null;
  captureUrl: string | null;
  signedCaptureUrl: string | null;
  notes: string | null;
  createdAt: Date | null;
}

interface PaiementsListClientProps {
  payments: PaymentItem[];
}

export default function PaiementsListClient({ payments }: PaiementsListClientProps) {
  const router = useRouter();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [zoneFilter, setZoneFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Selection/Modal state
  const [selectedPayment, setSelectedPayment] = useState<PaymentItem | null>(null);
  const [rejectionNotes, setRejectionNotes] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.candidateEmail.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesZone = zoneFilter === "all" || p.zone === zoneFilter;
    const matchesStatus = statusFilter === "all" || p.statut === statusFilter;

    return matchesSearch && matchesZone && matchesStatus;
  });

  const handleApprove = async (paymentId: string, candidateId: string) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await adminApprovePayment(paymentId, candidateId);
      if (!res.success) throw new Error(res.error);
      
      toast.success("Paiement validé et compte candidat activé.");
      setSelectedPayment(null);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la validation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayment || isSubmitting) return;

    if (!rejectionNotes.trim()) {
      toast.error("Veuillez saisir le motif du rejet.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await adminRejectPayment(selectedPayment.id, rejectionNotes.trim());
      if (!res.success) throw new Error(res.error);

      toast.success("Paiement rejeté avec succès.");
      setSelectedPayment(null);
      setRejectionNotes("");
      setShowRejectForm(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Erreur lors du rejet.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // CSV Export for bookkeeping
  const handleExportCSV = () => {
    if (filteredPayments.length === 0) {
      toast.warning("Aucun paiement à exporter.");
      return;
    }

    const headers = "Date Soumission,Candidat,Email,Zone,Montant FCFA,Statut,Motif Rejet\n";
    const rows = filteredPayments
      .map((p) => {
        const formattedDate = p.createdAt
          ? new Date(p.createdAt).toLocaleDateString("fr-FR")
          : "";
        return `"${formattedDate}","${p.candidateName}","${p.candidateEmail}","${p.zone}","${
          p.montant || 15000
        }","${p.statut || "en_attente"}","${p.notes || ""}"`;
      })
      .join("\n");

    const blob = new Blob(["\uFEFF" + headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `comptabilite_export_${Date.now()}.csv`);
    link.click();
    toast.success("Exportation comptable CSV réussie.");
  };

  // Excel Export (XML Spreadsheet format — no external dependency)
  const handleExportExcel = () => {
    if (filteredPayments.length === 0) {
      toast.warning("Aucun paiement à exporter.");
      return;
    }

    const escapeXml = (s: string) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

    const headerRow = `<Row>
      <Cell><Data ss:Type="String">Date Soumission</Data></Cell>
      <Cell><Data ss:Type="String">Candidat</Data></Cell>
      <Cell><Data ss:Type="String">Email</Data></Cell>
      <Cell><Data ss:Type="String">Zone</Data></Cell>
      <Cell><Data ss:Type="String">Montant FCFA</Data></Cell>
      <Cell><Data ss:Type="String">Statut</Data></Cell>
      <Cell><Data ss:Type="String">Motif Rejet</Data></Cell>
    </Row>`;

    const dataRows = filteredPayments
      .map((p) => {
        const formattedDate = p.createdAt
          ? new Date(p.createdAt).toLocaleDateString("fr-FR")
          : "";
        return `<Row>
          <Cell><Data ss:Type="String">${escapeXml(formattedDate)}</Data></Cell>
          <Cell><Data ss:Type="String">${escapeXml(p.candidateName)}</Data></Cell>
          <Cell><Data ss:Type="String">${escapeXml(p.candidateEmail)}</Data></Cell>
          <Cell><Data ss:Type="String">${escapeXml(p.zone)}</Data></Cell>
          <Cell><Data ss:Type="Number">${p.montant || 15000}</Data></Cell>
          <Cell><Data ss:Type="String">${escapeXml(p.statut || "en_attente")}</Data></Cell>
          <Cell><Data ss:Type="String">${escapeXml(p.notes || "")}</Data></Cell>
        </Row>`;
      })
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Worksheet ss:Name="Comptabilité">
    <Table>
      ${headerRow}
      ${dataRows}
    </Table>
  </Worksheet>
</Workbook>`;

    const blob = new Blob([xml], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `comptabilite_export_${Date.now()}.xls`);
    link.click();
    toast.success("Exportation Excel réussie.");
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "valide":
        return "bg-emerald-100 text-emerald-800 border-emerald-200/80";
      case "en_cours":
      case "en_attente":
        return "bg-amber-100 text-amber-800 border-amber-300/80";
      case "rejete":
        return "bg-rose-100 text-rose-800 border-rose-200/80";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  const getStatusLabel = (status: string | null) => {
    switch (status) {
      case "valide":
        return "Validé";
      case "en_cours":
      case "en_attente":
        return "À vérifier";
      case "rejete":
        return "Rejeté";
      default:
        return status;
    }
  };

  const getZoneLabel = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1).replace("-", " ");
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un candidat, un e-mail..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 bg-slate-55/40"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-[#D4A017] text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-slate-900/5 hover:shadow-gold/15"
            >
              <Download className="w-4 h-4" />
              <span>CSV ({filteredPayments.length})</span>
            </button>
            <button
              onClick={handleExportExcel}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-emerald-700/10"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Excel</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
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

          {/* Status filter */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-450 uppercase tracking-wide">Statut</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 bg-white"
            >
              <option value="all">Tous les statuts</option>
              <option value="en_cours">À vérifier (Reçus soumis)</option>
              <option value="valide">Validés (Inscriptions actives)</option>
              <option value="rejete">Rejetés</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        {filteredPayments.length > 0 ? (
          <>
            {/* Desktop view table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">Candidat</th>
                    <th className="px-6 py-4">Zone</th>
                    <th className="px-6 py-4">Montant</th>
                    <th className="px-6 py-4">Date soumission</th>
                    <th className="px-6 py-4">Statut</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {filteredPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 space-y-0.5">
                        <p className="font-bold text-slate-800">{p.candidateName}</p>
                        <p className="text-xs text-slate-400 font-medium">{p.candidateEmail}</p>
                      </td>
                      <td className="px-6 py-4">{getZoneLabel(p.zone)}</td>
                      <td className="px-6 py-4">{(p.montant || 15000).toLocaleString("fr-FR")} FCFA</td>
                      <td className="px-6 py-4">
                        {p.createdAt
                          ? new Date(p.createdAt).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "-"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 border rounded-full text-xs font-bold tracking-wide whitespace-nowrap ${getStatusBadge(p.statut)}`}>
                          {getStatusLabel(p.statut)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedPayment(p);
                            setShowRejectForm(false);
                            setRejectionNotes("");
                          }}
                          className="p-1.5 bg-slate-50 hover:bg-slate-900 border border-slate-200 text-slate-500 hover:text-white rounded-lg transition-all inline-flex items-center justify-center gap-1 font-bold text-xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspecter</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View: Stacked Cards (no horizontal scroll) */}
            <div className="sm:hidden divide-y divide-slate-100">
              {filteredPayments.map((p) => (
                <div key={p.id} className="p-4 space-y-3 font-semibold text-xs text-slate-700 bg-white">
                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-0.5 max-w-[65%]">
                      <p className="font-bold text-slate-800 text-sm truncate">{p.candidateName}</p>
                      <p className="text-xs text-slate-400 font-medium truncate">{p.candidateEmail}</p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 border rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${getStatusBadge(p.statut)}`}>
                      {getStatusLabel(p.statut)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] border-t border-slate-50">
                    <div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">Zone</p>
                      <p className="text-slate-800 font-bold mt-0.5">{getZoneLabel(p.zone)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">Montant</p>
                      <p className="text-slate-800 font-bold mt-0.5">{(p.montant || 15000).toLocaleString("fr-FR")} F</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[9px] text-slate-400 font-bold uppercase">Soumis le</p>
                      <p className="text-slate-800 font-bold mt-0.5">
                        {p.createdAt
                          ? new Date(p.createdAt).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })
                          : "-"}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setSelectedPayment(p);
                        setShowRejectForm(false);
                        setRejectionNotes("");
                      }}
                      className="w-full py-2 bg-slate-50 hover:bg-slate-900 border border-slate-200 text-slate-500 hover:text-white rounded-xl transition-all flex items-center justify-center gap-1 font-bold text-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspecter le reçu</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* Empty state */
          <div className="text-center py-16 px-4 space-y-4 max-w-sm mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <CreditCard className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-bold text-slate-800 text-sm">Aucun reçu de paiement</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Aucun paiement n'a été trouvé correspondant à vos critères de recherche.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Verification modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-250/70 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-xl">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="space-y-0.5">
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                  Inspecter le Reçu de Paiement
                </h3>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">
                  {selectedPayment.candidateName} • {getZoneLabel(selectedPayment.zone)}
                </p>
              </div>
              <button
                onClick={() => setSelectedPayment(null)}
                className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Info Details */}
              <div className="grid grid-cols-2 gap-4 text-sm font-semibold bg-slate-50 p-4 rounded-2xl border border-slate-150/40">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase">Montant</span>
                  <p className="text-slate-800 mt-0.5">
                    {(selectedPayment.montant || 15000).toLocaleString("fr-FR")} FCFA
                  </p>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase">Statut Actuel</span>
                  <p className="text-slate-800 mt-0.5 flex items-center gap-1.5">
                    <span className={`inline-block w-2.5 h-2.5 rounded-full ${
                      selectedPayment.statut === "valide" ? "bg-emerald-500" : selectedPayment.statut === "rejete" ? "bg-rose-500" : "bg-amber-400 animate-pulse"
                    }`} />
                    {getStatusLabel(selectedPayment.statut)}
                  </p>
                </div>
              </div>

              {/* Receipt Preview */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-405 uppercase">Image du justificatif</span>
                {selectedPayment.signedCaptureUrl ? (
                  <div className="relative border border-slate-200 rounded-2xl overflow-hidden bg-slate-950 aspect-video flex items-center justify-center group shadow-inner">
                    <img
                      src={selectedPayment.signedCaptureUrl}
                      alt="Reçu de paiement"
                      className="max-h-[300px] w-auto object-contain transition-transform duration-300"
                    />
                    <a
                      href={selectedPayment.signedCaptureUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute bottom-3 right-3 bg-white/90 hover:bg-white text-slate-900 font-bold text-xs px-3 py-1.5 rounded-xl border border-slate-200 shadow-md flex items-center gap-1 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Ouvrir en grand</span>
                    </a>
                  </div>
                ) : (
                  <div className="border border-dashed border-slate-350 p-8 rounded-2xl text-center text-slate-400 flex flex-col items-center gap-2">
                    <AlertCircle className="w-8 h-8 text-slate-350" />
                    <p className="text-xs font-semibold">Aucun justificatif téléversé.</p>
                  </div>
                )}
              </div>

              {/* Rejection Motif display */}
              {selectedPayment.statut === "rejete" && selectedPayment.notes && (
                <div className="bg-rose-50 border border-rose-205 text-rose-800 text-sm p-4 rounded-xl space-y-1">
                  <p className="font-bold">Motif du rejet précédent :</p>
                  <p className="italic">{selectedPayment.notes}</p>
                </div>
              )}

              {/* Rejection input form */}
              {showRejectForm && (
                <form onSubmit={handleReject} className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="space-y-1.5">
                    <label htmlFor="notes" className="text-xs font-bold text-slate-450 uppercase">
                      Motif du rejet (Sera envoyé par e-mail au candidat)
                    </label>
                    <textarea
                      id="notes"
                      value={rejectionNotes}
                      onChange={(e) => setRejectionNotes(e.target.value)}
                      placeholder="Ex : Reçu de paiement flou / Montant insuffisant..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-250 text-sm font-semibold text-slate-850 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30"
                      rows={3}
                      required
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setShowRejectForm(false)}
                      className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-sm font-bold text-slate-650 transition-all"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-rose-600/10"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <X className="w-3.5 h-3.5" />
                      )}
                      <span>Confirmer le Rejet</span>
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Modal Actions Footer */}
            {!showRejectForm && (
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-3 justify-end items-stretch sm:items-center">
                {selectedPayment.statut !== "valide" && (
                  <>
                    <button
                      onClick={() => setShowRejectForm(true)}
                      disabled={isSubmitting}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 border border-rose-250 hover:bg-rose-50 text-rose-600 rounded-xl text-sm font-bold transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Rejeter le reçu</span>
                    </button>
                    <button
                      onClick={() => handleApprove(selectedPayment.id, selectedPayment.userId)}
                      disabled={isSubmitting}
                      className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-slate-900 hover:bg-[#D4A017] text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-slate-900/5 hover:shadow-gold/15"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      <span>Approuver & Activer</span>
                    </button>
                  </>
                )}
                {selectedPayment.statut === "valide" && (
                  <div className="flex-1 text-center sm:text-left text-xs text-slate-400 font-semibold flex items-center justify-center sm:justify-start gap-1">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Ce reçu a déjà été validé et archivé par l'administration.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
