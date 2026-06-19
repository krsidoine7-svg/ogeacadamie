"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { markNotificationAsRead, markAllNotificationsAsRead } from "@/app/(dashboard)/dashboard/actions";
import { toast } from "sonner";
import { Bell, Info, AlertTriangle, BookOpen, Check, CheckCheck, ArrowRight, Loader2, Calendar } from "lucide-react";

interface NotificationItem {
  id: string;
  titre: string;
  message: string;
  type: "info" | "alerte" | "cours" | null;
  lu: boolean | null;
  lien: string | null;
  createdAt: Date | null;
}

interface NotificationsClientProps {
  notifications: NotificationItem[];
}

export default function NotificationsClient({ notifications }: NotificationsClientProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isBulkLoading, setIsBulkLoading] = useState(false);

  const handleMarkAsRead = async (id: string) => {
    setLoadingId(id);
    try {
      const res = await markNotificationAsRead(id);
      if (!res.success) throw new Error(res.error);
      toast.success("Notification marquée comme lue");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Erreur de traitement");
    } finally {
      setLoadingId(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    setIsBulkLoading(true);
    try {
      const res = await markAllNotificationsAsRead();
      if (!res.success) throw new Error(res.error);
      toast.success("Toutes les notifications ont été marquées comme lues");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Erreur de traitement");
    } finally {
      setIsBulkLoading(false);
    }
  };

  const getNotifIcon = (type: string | null) => {
    switch (type) {
      case "alerte":
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case "cours":
        return <BookOpen className="w-4 h-4 text-amber-650" />;
      case "info":
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const getNotifIconBg = (type: string | null, lu: boolean | null) => {
    if (lu) return "bg-slate-100 border-slate-200 text-slate-400";
    
    switch (type) {
      case "alerte":
        return "bg-rose-50 border-rose-200/50 text-rose-600";
      case "cours":
        return "bg-amber-50 border-amber-200/50 text-[#D4A017]";
      case "info":
      default:
        return "bg-blue-50 border-blue-200/50 text-blue-600";
    }
  };

  const unreadCount = notifications.filter((n) => !n.lu).length;

  return (
    <div className="space-y-6">
      {/* Action panel */}
      <div className="flex items-center justify-between bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">
            {unreadCount} non lue(s)
          </span>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={isBulkLoading}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#D4A017] hover:text-[#B38612] disabled:opacity-50 transition-colors"
          >
            {isBulkLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CheckCheck className="w-4 h-4" />
            )}
            <span>Tout marquer comme lu</span>
          </button>
        )}
      </div>

      {/* Notifications list */}
      <div className="space-y-4">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`group relative bg-white border rounded-2xl p-5 transition-all duration-200 flex flex-col sm:flex-row gap-4 items-start justify-between ${
              notif.lu
                ? "border-slate-200/80 opacity-75 hover:opacity-100"
                : "border-slate-300 shadow-sm border-l-4 border-l-[#D4A017]"
            }`}
          >
            <div className="flex items-start gap-4 flex-1">
              {/* Type Icon */}
              <div className={`p-2.5 rounded-xl border flex items-center justify-center flex-shrink-0 ${getNotifIconBg(notif.type, notif.lu)}`}>
                {getNotifIcon(notif.type)}
              </div>

              {/* Title & Message */}
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1.5">
                  <h3 className={`font-bold text-sm tracking-tight ${notif.lu ? "text-slate-700" : "text-slate-900"}`}>
                    {notif.titre}
                  </h3>
                  {!notif.lu && (
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#D4A017] sm:ml-1 flex-shrink-0" />
                  )}
                </div>
                <p className={`text-sm leading-relaxed ${notif.lu ? "text-slate-400" : "text-slate-650"}`}>
                  {notif.message}
                </p>
                <div className="flex items-center gap-1 text-xs text-slate-400 font-semibold pt-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {notif.createdAt
                      ? new Date(notif.createdAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Date inconnue"}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 self-stretch sm:self-center justify-end sm:justify-start pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 w-full sm:w-auto">
              {!notif.lu && (
                <button
                  onClick={() => handleMarkAsRead(notif.id)}
                  disabled={loadingId === notif.id}
                  className="p-2 bg-slate-55 border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300 rounded-xl transition-all flex items-center justify-center disabled:opacity-50"
                  title="Marquer comme lu"
                >
                  {loadingId === notif.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                </button>
              )}

              {notif.lien && (
                <a
                  href={notif.lien}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-[#D4A017] text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-slate-900/5 hover:shadow-gold/10"
                >
                  <span>Voir</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        ))}

        {notifications.length === 0 && (
          /* Empty state */
          <div className="text-center py-16 px-4 bg-white border border-slate-200 rounded-3xl space-y-4 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-slate-150 flex items-center justify-center mx-auto text-slate-400">
              <Bell className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">Aucune notification</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Votre historique est vide pour le moment. Vous recevrez des alertes en cas de validation de cours, modification d'emploi du temps ou autre actualité.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
