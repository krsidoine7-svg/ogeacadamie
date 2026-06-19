"use client";

import React, { useState } from "react";
import { promoteUserToManager, assignZoneManager } from "@/app/(admin)/admin/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { UserCheck, ShieldAlert, CheckCircle2, UserPlus, MapPin, RefreshCw, UserMinus } from "lucide-react";

interface ManagerProfile {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  zone: string | null;
}

interface ZoneConfigItem {
  id: string;
  zone: "yamoussoukro" | "yopougon" | "abobo" | "cocody" | "port-bouet" | "bouake";
  managerId: string | null;
  telephone: string | null;
}

interface ManagersListClientProps {
  managers: ManagerProfile[];
  zones: ZoneConfigItem[];
  currentRole: string;
}

export default function ManagersListClient({ managers, zones, currentRole }: ManagersListClientProps) {
  const router = useRouter();
  const isSuperAdmin = currentRole === "super_admin";

  // Promotion Form state
  const [promoEmail, setPromoEmail] = useState("");
  const [promoZone, setPromoZone] = useState<"yamoussoukro" | "yopougon" | "abobo" | "cocody" | "port-bouet" | "bouake">("yamoussoukro");
  const [isPromoting, setIsPromoting] = useState(false);

  // Assignment states
  const [updatingZone, setUpdatingZone] = useState<string | null>(null);

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

  const getZoneLabel = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1).replace("-", " ");
  };

  return (
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
                <label htmlFor="pEmail" className="text-xs font-bold text-slate-400 uppercase tracking-wide">
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
                <label htmlFor="pZone" className="text-xs font-bold text-slate-400 uppercase tracking-wide">
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
                className="w-full py-2 bg-slate-900 hover:bg-[#D4A017] disabled:bg-slate-400 text-white rounded-xl font-bold transition-all shadow-md shadow-slate-900/5 flex items-center justify-center gap-1.5"
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
              <p className="text-xs text-slate-455 leading-relaxed">
                Seuls les comptes **Super Administrateur** peuvent promouvoir ou créer des comptes de Responsables de zone.
              </p>
            </div>
          )}
        </div>

        {/* Managers index */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-sm">Index des Responsables</h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {managers.map((m) => (
              <div key={m.id} className="text-xs p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-0.5">
                <p className="font-bold text-slate-850">
                  {m.prenom} {m.nom}
                </p>
                <p className="text-xs text-slate-400 font-medium truncate">{m.email}</p>
                {m.zone && (
                  <span className="inline-block mt-1 text-[10px] font-bold bg-gold/15 text-gold-950 px-1.5 py-0.5 rounded uppercase">
                    Rattaché à : {getZoneLabel(m.zone)}
                  </span>
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
            <p className="text-xs text-slate-400 font-medium">
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
                  className="bg-slate-50/50 border border-slate-200/90 p-5 rounded-2xl space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4.5 h-4.5 text-[#D4A017]" />
                      <h4 className="font-bold text-slate-850 text-xs sm:text-sm">
                        {getZoneLabel(zoneItem.zone)}
                      </h4>
                    </div>

                    <div className="text-xs space-y-0.5">
                      <p className="text-xs font-bold text-slate-405 uppercase">Responsable affecté</p>
                      {currentManager ? (
                        <div className="pt-1">
                          <p className="font-bold text-slate-800">
                            {currentManager.prenom} {currentManager.nom}
                          </p>
                          <p className="text-xs text-slate-400 font-medium">{currentManager.email}</p>
                        </div>
                      ) : (
                        <p className="text-slate-455 italic pt-1 text-xs">Aucun responsable assigné</p>
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
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 bg-white"
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
                          className="text-[11px] font-bold text-rose-600 hover:underline flex items-center justify-center gap-0.5 border border-rose-200/50 hover:bg-rose-50/50 py-1 rounded-lg"
                        >
                          <UserMinus className="w-3 h-3" />
                          <span>Retirer le responsable</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="pt-3 border-t border-slate-100/50 text-xs text-slate-400 italic">
                      Modifications désactivées pour votre rôle.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
