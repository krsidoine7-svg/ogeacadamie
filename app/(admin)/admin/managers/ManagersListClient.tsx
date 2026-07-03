"use client";

import React, { useState } from "react";
import {
  promoteUserToManager,
  assignZoneManager,
  submitManagerActionRequest,
  approveManagerAction,
  rejectManagerAction,
  adminResetUserPassword,
} from "@/app/(admin)/admin/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  UserCheck,
  ShieldAlert,
  UserPlus,
  MapPin,
  RefreshCw,
  UserMinus,
  Edit2,
  Ban,
  Play,
  UserX,
  Check,
  X,
  AlertTriangle,
  KeyRound,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ManagerProfile {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  zone: string | null;
  isActive: boolean;
  whatsapp: string;
  role?: string;
}

interface ZoneConfigItem {
  id: string;
  zone: "yamoussoukro" | "yopougon" | "abobo" | "cocody" | "port-bouet" | "bouake";
  managerId: string | null;
  telephone: string | null;
}

interface PendingActionItem {
  id: string;
  type: string;
  targetId: string;
  initiatedBy: string;
  details: any;
  statut: string;
  createdAt: Date | null;
  initiatorName: string;
  targetName: string;
}

interface SystemConfigItem {
  allow_manager_edit: boolean;
  enable_wave: boolean;
  enable_momo: boolean;
  enable_orange: boolean;
}

interface ManagersListClientProps {
  managers: ManagerProfile[];
  zones: ZoneConfigItem[];
  currentRole: string;
  currentUserId: string;
  pendingActions: PendingActionItem[];
  systemConfig: SystemConfigItem;
}

export default function ManagersListClient({
  managers,
  zones,
  currentRole,
  currentUserId,
  pendingActions,
  systemConfig,
}: ManagersListClientProps) {
  const router = useRouter();
  const isSuperAdmin = currentRole === "super_admin";
  const showActions = isSuperAdmin || systemConfig.allow_manager_edit;

  // Promotion Form state
  const [promoEmail, setPromoEmail] = useState("");
  const [promoZone, setPromoZone] = useState<"yamoussoukro" | "yopougon" | "abobo" | "cocody" | "port-bouet" | "bouake">("yamoussoukro");
  const [isPromoting, setIsPromoting] = useState(false);

  // Assignment states
  const [updatingZone, setUpdatingZone] = useState<string | null>(null);

  // Manager Edit State
  const [editingManager, setEditingManager] = useState<ManagerProfile | null>(null);
  const [editNom, setEditNom] = useState("");
  const [editPrenom, setEditPrenom] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editWhatsapp, setEditWhatsapp] = useState("");
  const [editZone, setEditZone] = useState<string>("");
  const [editPassword, setEditPassword] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Loading States for Actions
  const [processingActionId, setProcessingActionId] = useState<string | null>(null);
  const [processingPendingId, setProcessingPendingId] = useState<string | null>(null);

  const handlePromote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      toast.error("Action réservée aux super-administrateurs.");
      return;
    }

    if (!promoEmail.trim()) {
      toast.error("Veuillez saisir une adresse e-mail valide.");
      return;
    }

    setIsPromoting(true);
    try {
      const res = await promoteUserToManager(promoEmail.trim(), promoZone);
      if (!res.success) throw new Error(res.error);

      toast.success("Utilisateur promu manager de zone avec succès.");
      setPromoEmail("");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Erreur de promotion.");
    } finally {
      setIsPromoting(false);
    }
  };

  const handleAssign = async (zone: any, managerId: string | null) => {
    if (!isSuperAdmin) {
      toast.error("Action réservée aux super-administrateurs.");
      return;
    }

    setUpdatingZone(zone);
    try {
      const res = await assignZoneManager(zone, managerId);
      if (!res.success) throw new Error(res.error);

      toast.success(
        managerId 
          ? "Manager affecté à la zone avec succès." 
          : "Affectation du manager retirée."
      );
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'affectation.");
    } finally {
      setUpdatingZone(null);
    }
  };

  const handleStartEdit = (m: ManagerProfile) => {
    setEditingManager(m);
    setEditNom(m.nom);
    setEditPrenom(m.prenom);
    setEditEmail(m.email);
    setEditWhatsapp(m.whatsapp || "");
    setEditZone(m.zone || "");
    setEditPassword("");
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingManager) return;
    
    setIsSavingEdit(true);
    try {
      const details = {
        nom: editNom.trim(),
        prenom: editPrenom.trim(),
        email: editEmail.trim().toLowerCase(),
        whatsapp: editWhatsapp.trim(),
        zone: editZone || null,
      };

      // 1. If Super Admin changes password, run it directly
      if (isSuperAdmin && editPassword) {
        const passRes = await adminResetUserPassword(editingManager.id, editPassword);
        if (!passRes.success) throw new Error(passRes.error);
        toast.success("Mot de passe du manager réinitialisé et sessions expirées !");
      }

      // 2. Submit details modification request
      const res = (await submitManagerActionRequest("edit_manager", editingManager.id, details)) as any;
      if (!res.success) throw new Error(res.error);

      if (isSuperAdmin) {
        toast.success("Informations du manager modifiées avec succès.");
      } else {
        toast.success("Demande de modification soumise à la confirmation d'un autre administrateur.");
      }
      setEditingManager(null);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la modification.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleAction = async (
    type: "block_manager" | "activate_manager" | "deactivate_manager",
    managerId: string
  ) => {
    let actionLabel = "bloquer";
    if (type === "activate_manager") actionLabel = "réactiver";
    if (type === "deactivate_manager") actionLabel = "désactiver (repasser candidat)";

    const confirmMsg = `Êtes-vous sûr de vouloir ${actionLabel} ce manager ?${
      !isSuperAdmin ? " Cette action devra être validée par un autre administrateur." : ""
    }`;

    if (!window.confirm(confirmMsg)) return;

    setProcessingActionId(managerId);
    try {
      const res = (await submitManagerActionRequest(type, managerId, {})) as any;
      if (!res.success) throw new Error(res.error);

      if (isSuperAdmin) {
        toast.success(`Action de ${actionLabel} effectuée avec succès.`);
      } else {
        toast.success(`Demande de ${actionLabel} soumise pour double confirmation.`);
      }
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la soumission de l'action.");
    } finally {
      setProcessingActionId(null);
    }
  };

  const handleApprovePending = async (requestId: string) => {
    setProcessingPendingId(requestId);
    try {
      const res = await approveManagerAction(requestId);
      if (!res.success) throw new Error(res.error);

      toast.success("Demande approuvée avec succès.");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'approbation.");
    } finally {
      setProcessingPendingId(null);
    }
  };

  const handleRejectPending = async (requestId: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir rejeter/annuler cette demande ?")) return;

    setProcessingPendingId(requestId);
    try {
      const res = await rejectManagerAction(requestId);
      if (!res.success) throw new Error(res.error);

      toast.success("Demande rejetée avec succès.");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Erreur lors du rejet.");
    } finally {
      setProcessingPendingId(null);
    }
  };

  const getZoneLabel = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1).replace("-", " ");
  };

  return (
    <div className="space-y-8">
      {/* 1. Pending Approvals list for dual confirmation */}
      {pendingActions.length > 0 && (
        <div className="bg-amber-50/50 border border-amber-250/60 rounded-3xl p-6 shadow-sm space-y-4 animate-fade-in">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-4.5 h-4.5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm sm:text-base">
                Demandes d'approbation en attente ({pendingActions.length})
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Conformément au principe du double contrôle, ces actions nécessitent la validation d'un deuxième administrateur.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingActions.map((req) => {
              const isInitiator = req.initiatedBy === currentUserId;
              const typeLabel = 
                req.type === "edit_manager" ? "Modification d'infos" :
                req.type === "block_manager" ? "Blocage de compte" :
                req.type === "activate_manager" ? "Réactivation de compte" :
                "Désactivation complète";

              return (
                <div key={req.id} className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition-all">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        req.type === "edit_manager" ? "bg-blue-50 text-blue-700 border border-blue-100" :
                        req.type === "block_manager" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                        req.type === "activate_manager" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                        "bg-rose-50 text-rose-700 border border-rose-100"
                      }`}>
                        {typeLabel}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        {req.createdAt ? new Date(req.createdAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit"
                        }) : ""}
                      </span>
                    </div>

                    <div className="text-xs space-y-1.5 text-slate-700">
                      <p className="font-semibold text-slate-800">
                        Cible : <span className="font-extrabold">{req.targetName}</span>
                      </p>
                      <p className="text-slate-500">
                        Demandeur : <span className="font-bold text-slate-700">{req.initiatorName}</span>
                      </p>

                      {req.type === "edit_manager" && req.details && (
                        <div className="mt-2 bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-[11px] font-medium space-y-1 text-slate-650">
                          <p className="font-bold text-slate-500 mb-1 border-b border-slate-200 pb-1">Modifications proposées :</p>
                          <p>• Nom : {req.details.nom}</p>
                          <p>• Prénom : {req.details.prenom}</p>
                          <p>• Email : {req.details.email}</p>
                          <p>• WhatsApp : {req.details.whatsapp || "Aucun"}</p>
                          <p>• Zone : {req.details.zone ? getZoneLabel(req.details.zone) : "Non assigné"}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-slate-100 text-xs font-bold">
                    {isInitiator ? (
                      <div className="w-full flex flex-col gap-1.5">
                        <button
                          onClick={() => handleRejectPending(req.id)}
                          disabled={processingPendingId !== null}
                          className="w-full py-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl transition-all flex items-center justify-center gap-1.5"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Annuler ma demande</span>
                        </button>
                        <p className="text-[10px] text-slate-400 font-semibold text-center italic leading-tight">
                          En attente de validation par un autre admin.
                        </p>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => handleApprovePending(req.id)}
                          disabled={processingPendingId !== null}
                          className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-350 text-white rounded-xl transition-all shadow-md flex items-center justify-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approuver</span>
                        </button>
                        <button
                          onClick={() => handleRejectPending(req.id)}
                          disabled={processingPendingId !== null}
                          className="px-3 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl transition-all flex items-center justify-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Rejeter</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left side: Promotion form & Managers index */}
        <div className="lg:col-span-1 space-y-6">
          {/* Promotion Form (Super Admin only) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gold/10 text-gold flex items-center justify-center flex-shrink-0">
                <UserPlus className="w-4 h-4 text-[#D4A017]" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Promouvoir un Responsable</h3>
            </div>

            {isSuperAdmin ? (
              <form onSubmit={handlePromote} className="space-y-4 text-sm font-semibold">
                <div className="space-y-1.5">
                  <label htmlFor="pEmail" className="text-xs font-bold text-slate-405 uppercase tracking-wide">
                    Adresse Email de l'utilisateur
                  </label>
                  <input
                    id="pEmail"
                    type="email"
                    placeholder="Ex : candidat.abobo@oge-academie.ci"
                    value={promoEmail}
                    onChange={(e) => setPromoEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 bg-slate-50/50"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="pZone" className="text-xs font-bold text-slate-405 uppercase tracking-wide">
                    Zone de Rattachement
                  </label>
                  <select
                    id="pZone"
                    value={promoZone}
                    onChange={(e) => setPromoZone(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 bg-white"
                  >
                    <option value="yamoussoukro">Yamoussoukro</option>
                    <option value="yopougon">Yopougon</option>
                    <option value="abobo">Abobo</option>
                    <option value="cocody">Cocody</option>
                    <option value="port-bouet">Port-Bouët</option>
                    <option value="bouake">Bouaké</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isPromoting}
                  className="w-full py-2 bg-slate-900 hover:bg-[#D4A017] disabled:bg-slate-450 text-white rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  {isPromoting ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <UserCheck className="w-4 h-4" />
                  )}
                  <span>Nommer Responsable</span>
                </button>
              </form>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center space-y-2">
                <ShieldAlert className="w-5 h-5 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-500 leading-relaxed">
                  Seuls les comptes **Super Administrateur** peuvent promouvoir ou créer des comptes de Responsables de zone.
                </p>
              </div>
            )}
          </div>

          {/* Managers index */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">Index des Responsables</h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {managers.map((m) => (
                <div key={m.id} className="text-xs p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-slate-850 text-xs">
                        {m.prenom} {m.nom}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium truncate max-w-[150px] sm:max-w-[180px]" title={m.email}>{m.email}</p>
                      {m.whatsapp && (
                        <p className="text-[10px] text-slate-405 font-semibold truncate">WA: {m.whatsapp}</p>
                      )}
                    </div>
                    {m.role === "user" ? (
                      <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                        Désactivé (Candidat)
                      </span>
                    ) : !m.isActive ? (
                      <span className="bg-rose-50 text-rose-600 border border-rose-100 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                        Bloqué
                      </span>
                    ) : null}
                  </div>
                  {m.zone && (
                    <span className="inline-block text-[10px] font-bold bg-gold/15 text-gold-950 px-1.5 py-0.5 rounded uppercase">
                      Rattaché à : {getZoneLabel(m.zone)}
                    </span>
                  )}

                  {showActions && (
                    <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-100 flex-wrap">
                      <button
                        onClick={() => handleStartEdit(m)}
                        disabled={processingActionId !== null}
                        className="p-1 text-slate-650 hover:text-slate-900 bg-white border border-slate-200 rounded-lg transition-colors inline-flex items-center justify-center"
                        title="Modifier"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {m.isActive ? (
                        <button
                          onClick={() => handleAction("block_manager", m.id)}
                          disabled={processingActionId !== null}
                          className="px-2 py-1 text-amber-600 hover:text-amber-950 hover:bg-amber-50 bg-white border border-amber-200 rounded-lg transition-colors inline-flex items-center gap-1 text-[10px] font-bold"
                          title="Bloquer"
                        >
                          <Ban className="w-3 h-3" />
                          <span>Bloquer</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAction("activate_manager", m.id)}
                          disabled={processingActionId !== null}
                          className="px-2 py-1 text-emerald-600 hover:text-emerald-950 hover:bg-emerald-50 bg-white border border-emerald-200 rounded-lg transition-colors inline-flex items-center gap-1 text-[10px] font-bold"
                          title="Réactiver"
                        >
                          <Play className="w-3 h-3" />
                          <span>Réactiver</span>
                        </button>
                      )}
                      {m.role !== "user" && (
                        <button
                          onClick={() => handleAction("deactivate_manager", m.id)}
                          disabled={processingActionId !== null}
                          className="px-2 py-1 text-rose-600 hover:text-rose-950 hover:bg-rose-50 bg-white border border-rose-200 rounded-lg transition-colors inline-flex items-center gap-1 text-[10px] font-bold"
                          title="Désactiver"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          <span>Désactiver</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {managers.length === 0 && (
                <p className="text-xs text-slate-450 text-center py-4">Aucun manager enregistré.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right side: Zones allocations */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h3 className="font-extrabold text-slate-800 text-base">Rattachements Géographiques</h3>
              <p className="text-xs text-slate-500 font-medium">
                Affectez les responsables aux différentes zones de formation pour gérer les reçus.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {zones.map((zoneItem) => {
                const currentManager = managers.find((m) => m.id === zoneItem.managerId);
                const otherManagers = managers.filter(
                  (m) => m.id !== zoneItem.managerId && (m.zone === null || m.zone === zoneItem.zone)
                );

                return (
                  <div
                    key={zoneItem.id}
                    className="bg-slate-50/50 border border-slate-200 p-5 rounded-2xl space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4.5 h-4.5 text-[#D4A017]" />
                        <h4 className="font-bold text-slate-805 text-sm">
                          {getZoneLabel(zoneItem.zone)}
                        </h4>
                      </div>

                      <div className="text-xs space-y-0.5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Responsable affecté</p>
                        {currentManager ? (
                          <div className="pt-1">
                            <p className="font-bold text-slate-800">
                              {currentManager.prenom} {currentManager.nom}
                            </p>
                            <p className="text-xs text-slate-400 font-medium">{currentManager.email}</p>
                          </div>
                        ) : (
                          <p className="text-slate-450 italic pt-1 text-xs">Aucun responsable assigné</p>
                        )}
                      </div>
                    </div>

                    {/* Super Admin selector */}
                    {isSuperAdmin ? (
                      <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                        <div className="relative">
                          <select
                            disabled={updatingZone === zoneItem.zone}
                            value={zoneItem.managerId || ""}
                            onChange={(e) => handleAssign(zoneItem.zone, e.target.value || null)}
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white"
                          >
                            <option value="">-- Choisir un manager --</option>
                            {currentManager && (
                              <option value={currentManager.id}>
                                {currentManager.prenom} {currentManager.nom}
                              </option>
                            )}
                            {otherManagers.map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.prenom} {m.nom} ({m.email})
                              </option>
                            ))}
                          </select>
                          {updatingZone === zoneItem.zone && (
                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                              <RefreshCw className="w-3.5 h-3.5 text-slate-400 animate-spin" />
                            </div>
                          )}
                        </div>

                        {zoneItem.managerId && (
                          <button
                            onClick={() => handleAssign(zoneItem.zone, null)}
                            disabled={updatingZone === zoneItem.zone}
                            className="text-[11px] font-bold text-rose-600 hover:underline flex items-center justify-center gap-0.5 border border-rose-100 hover:bg-rose-50 py-1 rounded-lg"
                          >
                            <UserMinus className="w-3 h-3" />
                            <span>Retirer le responsable</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="pt-3 border-t border-slate-150 text-xs text-slate-400 italic">
                        Modifications d'affectation réservées au Super Admin.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Dialog de Modification */}
      <Dialog open={editingManager !== null} onOpenChange={(open) => !open && setEditingManager(null)}>
        <DialogContent className="sm:max-w-md bg-white p-6 rounded-2xl border border-slate-100 shadow-2xl">
          <DialogHeader className="border-b border-slate-100 pb-4">
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Edit2 className="w-4.5 h-4.5 text-[#D4A017]" />
              <span>Modifier le manager</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 font-medium mt-1">
              Modifiez les détails de ce manager. {!isSuperAdmin && "L'action devra être confirmée par un autre admin."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveEdit} className="space-y-4 text-xs font-semibold pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="editPrenom" className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  Prénom
                </label>
                <input
                  id="editPrenom"
                  type="text"
                  value={editPrenom}
                  onChange={(e) => setEditPrenom(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 bg-slate-50/50"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="editNom" className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  Nom
                </label>
                <input
                  id="editNom"
                  type="text"
                  value={editNom}
                  onChange={(e) => setEditNom(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 bg-slate-50/50"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="editEmail" className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                Email
              </label>
              <input
                id="editEmail"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 bg-slate-50/50"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="editWhatsapp" className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                Numéro WhatsApp
              </label>
              <input
                id="editWhatsapp"
                type="text"
                placeholder="Ex : +225 07 00 00 00 00"
                value={editWhatsapp}
                onChange={(e) => setEditWhatsapp(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 bg-slate-50/50"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="editZone" className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                Zone Affectée
              </label>
              <select
                id="editZone"
                value={editZone}
                onChange={(e) => setEditZone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 bg-white"
              >
                <option value="">Aucune (Non affecté)</option>
                <option value="yamoussoukro">Yamoussoukro</option>
                <option value="yopougon">Yopougon</option>
                <option value="abobo">Abobo</option>
                <option value="cocody">Cocody</option>
                <option value="port-bouet">Port-Bouët</option>
                <option value="bouake">Bouaké</option>
              </select>
            </div>

            {isSuperAdmin && (
              <div className="space-y-1.5 border-t border-slate-100 pt-3">
                <label htmlFor="editPassword" className="text-[10px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                  <span>Modifier le mot de passe (Changement immédiat)</span>
                </label>
                <input
                  id="editPassword"
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Laisser vide si inchangé"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 bg-slate-50/50"
                />
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-slate-100 text-sm font-bold">
              <button
                type="button"
                onClick={() => setEditingManager(null)}
                className="flex-1 py-2 border border-slate-250 text-slate-650 hover:bg-slate-50 rounded-xl transition-all text-center"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSavingEdit}
                className="flex-1 py-2 bg-slate-900 hover:bg-[#D4A017] disabled:bg-slate-450 text-white rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                {isSavingEdit ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <span>Enregistrer</span>
                )}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
