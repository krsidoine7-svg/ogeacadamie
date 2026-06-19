"use client";

import React, { useState } from "react";
import { sendGroupNotification } from "@/app/(admin)/admin/actions";
import { toast } from "sonner";
import { Send, Bell, Info, AlertTriangle, BookOpen, MapPin, Award, Loader2 } from "lucide-react";

export default function GroupNotificationsClient() {
  // Notification fields
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"info" | "alerte" | "cours">("info");

  // Filtering targets
  const [zone, setZone] = useState("all");
  const [concours, setConcours] = useState("all");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !message.trim()) {
      toast.error("Le titre et le message de l'annonce sont obligatoires.");
      return;
    }

    const confirm = window.confirm(
      "Êtes-vous sûr de vouloir diffuser cette annonce à tous les candidats ciblés ?"
    );
    if (!confirm) return;

    setIsSubmitting(true);
    try {
      const filters: any = {};
      if (zone !== "all") filters.zone = zone;
      if (concours !== "all") filters.concours = concours;
      if (zone === "all" && concours === "all") filters.all = true;

      const res = await sendGroupNotification(filters, title.trim(), message.trim(), type);
      if (!res.success) throw new Error(res.error);

      toast.success(
        res.count && res.count > 0
          ? `Annonce diffusée avec succès à ${res.count} candidat(s).`
          : "Annonce enregistrée (aucun candidat ne correspond aux filtres de ciblage)."
      );

      // Reset form
      setTitle("");
      setMessage("");
      setType("info");
      setZone("all");
      setConcours("all");
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la diffusion de l'annonce.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getNotifIconBg = (t: string) => {
    switch (t) {
      case "alerte":
        return "bg-rose-50 border-rose-200 text-rose-600";
      case "cours":
        return "bg-amber-50 border-amber-200 text-[#D4A017]";
      case "info":
      default:
        return "bg-blue-50 border-blue-200 text-blue-600";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left side form: Compose Notification (2/3 width) */}
      <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="space-y-1">
          <h3 className="font-extrabold text-slate-800 text-base">Rédiger un Message</h3>
          <p className="text-sm text-slate-400 font-medium">
            Rédigez l'annonce et définissez le niveau de priorité ou d'alerte pour les destinataires.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-sm font-semibold text-slate-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Title */}
            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="nTitle" className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                Titre de l'annonce
              </label>
              <input
                id="nTitle"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex : Rappel de cours blanc / Disponibilité d'un nouveau corrigé"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-850 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 bg-slate-55/40"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Type */}
            <div className="space-y-1.5">
              <label htmlFor="nType" className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                Catégorie visuelle
              </label>
              <select
                id="nType"
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 bg-white font-bold"
              >
                <option value="info">Informations générales (Bleu)</option>
                <option value="alerte">Urgent / Alerte (Rouge)</option>
                <option value="cours">Supports de cours (Or)</option>
              </select>
            </div>
          </div>

          {/* Message Body */}
          <div className="space-y-1.5">
            <label htmlFor="nMessage" className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              Contenu détaillé de l'annonce
            </label>
            <textarea
              id="nMessage"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Saisissez le corps du message ici..."
              className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-slate-850 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 bg-slate-55/40"
              rows={6}
              required
            />
          </div>

          {/* Target audience filtering section */}
          <div className="pt-5 border-t border-slate-100 space-y-4">
            <div className="space-y-1">
              <h4 className="font-bold text-slate-850 text-sm">Ciblage des Destinataires</h4>
              <p className="text-xs text-slate-400 font-medium">
                Filtrez les candidats qui recevront cette notification dans leur espace.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Zone filtering */}
              <div className="space-y-1.5">
                <label htmlFor="tZone" className="text-xs font-bold text-slate-450 uppercase flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Zone Géographique</span>
                </label>
                <select
                  id="tZone"
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 bg-white"
                >
                  <option value="all">Tous les centres (Toutes zones)</option>
                  <option value="yamoussoukro">Yamoussoukro</option>
                  <option value="yopougon">Yopougon</option>
                  <option value="abobo">Abobo</option>
                  <option value="cocody">Cocody</option>
                  <option value="port-bouet">Port-Bouët</option>
                  <option value="bouake">Bouaké</option>
                </select>
              </div>

              {/* Contest filtering */}
              <div className="space-y-1.5">
                <label htmlFor="tConcours" className="text-xs font-bold text-slate-455 uppercase flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-slate-400" />
                  <span>Concours préparé</span>
                </label>
                <select
                  id="tConcours"
                  value={concours}
                  onChange={(e) => setConcours(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 bg-white"
                >
                  <option value="all">Tous les concours</option>
                  <option value="inphb">INP-HB uniquement</option>
                  <option value="esatic">ESATIC uniquement</option>
                  <option value="cme">CME uniquement</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-3 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-[#D4A017] disabled:bg-slate-400 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-slate-900/5 hover:shadow-gold/15"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Diffusion en cours...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Diffuser l'annonce</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Right Column: Live preview & help tips (1/3 width) */}
      <div className="lg:col-span-1 space-y-6">
        {/* Preview Panel */}
        <div className="bg-[#0B0F19] text-white border border-slate-850 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Bell className="w-4.5 h-4.5 text-[#D4A017]" />
            <h3 className="font-bold text-slate-100 text-sm">Aperçu candidat</h3>
          </div>

          <div className="space-y-3">
            <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 space-y-2">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg border flex items-center justify-center flex-shrink-0 text-sm ${getNotifIconBg(type)}`}>
                  {type === "alerte" ? (
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                  ) : type === "cours" ? (
                    <BookOpen className="w-4 h-4 text-[#D4A017]" />
                  ) : (
                    <Info className="w-4 h-4 text-blue-500" />
                  )}
                </div>

                <div className="space-y-1 flex-1">
                  <h4 className="font-bold text-sm text-slate-100 truncate">
                    {title || "Titre de l'annonce"}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed break-words whitespace-pre-wrap">
                    {message || "Corps du message..."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
