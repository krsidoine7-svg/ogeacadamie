"use client";

import React, { useState } from "react";
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Info, 
  Eye, 
  RefreshCw, 
  User, 
  Clock, 
  Code, 
  Layers, 
  X, 
  Loader2,
  FileWarning
} from "lucide-react";
import { toast } from "sonner";

interface LogItem {
  log: {
    id: string;
    level: string;
    source: string;
    endpoint: string | null;
    errorMessage: string;
    stackTrace: string | null;
    metadata: any;
    status: string;
    createdAt: string | Date;
  };
  user: {
    id: string;
    nom: string | null;
    prenom: string | null;
    email: string;
    role: string | null;
  } | null;
}

interface Stats {
  total: number;
  critical: number;
  unresolved: number;
  resolved: number;
}

interface ErrorLogsClientProps {
  initialLogs: LogItem[];
  stats: Stats;
}

export default function ErrorLogsClient({ initialLogs, stats }: ErrorLogsClientProps) {
  const [logs, setLogs] = useState<LogItem[]>(initialLogs);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState<LogItem | null>(null);
  const [isPurging, setIsPurging] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Filtrage des logs
  const filteredLogs = logs.filter((item) => {
    const matchesSearch = 
      item.log.errorMessage.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.log.endpoint && item.log.endpoint.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.user && item.user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.user && `${item.user.prenom || ""} ${item.user.nom || ""}`.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesLevel = levelFilter === "all" || item.log.level === levelFilter;
    const matchesSource = sourceFilter === "all" || item.log.source === sourceFilter;
    const matchesStatus = statusFilter === "all" || item.log.status === statusFilter;

    return matchesSearch && matchesLevel && matchesSource && matchesStatus;
  });

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      setUpdatingId(id);
      const res = await fetch("/api/admin/logs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (!res.ok) throw new Error("Erreur serveur lors de la mise à jour");

      setLogs((prev) =>
        prev.map((item) => (item.log.id === id ? { ...item, log: { ...item.log, status: newStatus } } : item))
      );
      toast.success("Statut de l'anomalie mis à jour.");
    } catch (err: any) {
      toast.error(err.message || "Impossible de modifier le statut.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteLog = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cet enregistrement d'erreur ?")) return;
    try {
      const res = await fetch(`/api/admin/logs?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erreur serveur");
      setLogs((prev) => prev.filter((item) => item.log.id !== id));
      toast.success("Log supprimé avec succès.");
      if (selectedLog?.log.id === id) setSelectedLog(null);
    } catch (err) {
      toast.error("Erreur lors de la suppression.");
    }
  };

  const handlePurge = async () => {
    if (!confirm("Voulez-vous purger (supprimer) tous les logs marqués 'Résolu' datant de plus de 30 jours ?")) return;
    try {
      setIsPurging(true);
      const res = await fetch("/api/admin/logs?action=purge", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur serveur");
      
      // Mettre à jour l'état local en supprimant ceux de > 30j et résolus
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      setLogs((prev) =>
        prev.filter((item) => {
          const logDate = new Date(item.log.createdAt);
          return !(item.log.status === "resolu" && logDate < thirtyDaysAgo);
        })
      );

      toast.success(data.message || "Purge effectuée avec succès.");
    } catch (err: any) {
      toast.error(err.message || "Impossible d'exécuter la purge.");
    } finally {
      setIsPurging(false);
    }
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case "critical":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200 shadow-sm animate-pulse">
            <XCircle className="w-3.5 h-3.5" /> CRITICAL
          </span>
        );
      case "error":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5" /> ERROR
          </span>
        );
      case "warning":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-200">
            <FileWarning className="w-3.5 h-3.5" /> WARNING
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <Info className="w-3.5 h-3.5" /> INFO
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "resolu":
        return <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Résolu</span>;
      case "en_cours":
        return <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">En cours</span>;
      case "ignore":
        return <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">Ignoré</span>;
      default:
        return <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-50 text-red-700 border border-red-200">Nouveau</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header et Titre */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#0F172A] text-[#D4A017] flex items-center justify-center shadow-md">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
                Journal des Erreurs & Supervision
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Console exclusive Super Admin : capture des échecs d&apos;upload (413), crashs API et surveillance temps réel.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handlePurge}
          disabled={isPurging}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-700 rounded-2xl font-bold text-xs transition-all duration-200 border border-slate-200 hover:border-red-200 cursor-pointer shadow-sm disabled:opacity-50"
        >
          {isPurging ? <Loader2 className="w-4 h-4 animate-spin text-red-600" /> : <RefreshCw className="w-4 h-4" />}
          <span>Purger les logs résolus (&gt; 30j)</span>
        </button>
      </div>

      {/* Cartes de Statistiques */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Anomalies</p>
            <p className="text-2xl font-extrabold text-[#0F172A] mt-1">{stats.total}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-red-200 shadow-sm flex items-center justify-between bg-gradient-to-br from-red-50/40 to-white">
          <div>
            <p className="text-[11px] font-bold text-red-600 uppercase tracking-wider">Critiques (Critical)</p>
            <p className="text-2xl font-extrabold text-red-700 mt-1">{stats.critical}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
            <XCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">À Traiter / En Cours</p>
            <p className="text-2xl font-extrabold text-amber-700 mt-1">{stats.unresolved}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Résolues</p>
            <p className="text-2xl font-extrabold text-emerald-700 mt-1">{stats.resolved}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Barre de Filtres et Recherche */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Recherche */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par message, URL, email utilisateur..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:bg-white transition-all"
            />
          </div>

          {/* Filtres */}
          <div className="md:col-span-8 flex flex-wrap items-center gap-3 justify-start md:justify-end">
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-500">Gravité:</span>
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="bg-transparent font-bold text-slate-700 outline-none cursor-pointer"
              >
                <option value="all">Tous niveaux</option>
                <option value="critical">Critical</option>
                <option value="error">Error</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-500">Source:</span>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="bg-transparent font-bold text-slate-700 outline-none cursor-pointer"
              >
                <option value="all">Toutes sources</option>
                <option value="upload">Upload (413)</option>
                <option value="api">API Backend</option>
                <option value="client">Client / UI</option>
                <option value="database">Base de données</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-500">Statut:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent font-bold text-slate-700 outline-none cursor-pointer"
              >
                <option value="all">Tous statuts</option>
                <option value="nouveau">Nouveau</option>
                <option value="en_cours">En cours</option>
                <option value="resolu">Résolu</option>
                <option value="ignore">Ignoré</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tableau des Erreurs */}
        <div className="overflow-x-auto border border-slate-200 rounded-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Gravité</th>
                <th className="py-3.5 px-4">Message / Endpoint</th>
                <th className="py-3.5 px-4">Utilisateur & Source</th>
                <th className="py-3.5 px-4">Date & Statut</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 font-bold">
                    Aucune anomalie ne correspond à vos critères de recherche.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((item) => (
                  <tr key={item.log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 whitespace-nowrap">
                      {getLevelBadge(item.log.level)}
                    </td>

                    <td className="py-4 px-4 max-w-md">
                      <div className="font-bold text-[#0F172A] line-clamp-2">
                        {item.log.errorMessage}
                      </div>
                      {item.log.endpoint && (
                        <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-mono mt-1">
                          <Code className="w-3 h-3 text-slate-400" />
                          <span>{item.log.endpoint}</span>
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      {item.user ? (
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-900 text-gold flex items-center justify-center font-bold text-[10px] uppercase">
                            {(item.user.prenom?.[0] || "") + (item.user.nom?.[0] || item.user.email[0])}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-[11px]">
                              {item.user.prenom ? `${item.user.prenom} ${item.user.nom || ""}` : item.user.email}
                            </p>
                            <span className="text-[10px] text-slate-400 uppercase font-extrabold bg-slate-100 px-1.5 py-0.5 rounded">
                              {item.user.role || "user"}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">Anonyme / Système</span>
                      )}
                      <div className="mt-1 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                        Source : {item.log.source}
                      </div>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap space-y-1.5">
                      <div className="flex items-center gap-1 text-[11px] text-slate-500">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{new Date(item.log.createdAt).toLocaleString("fr-FR")}</span>
                      </div>
                      <div>
                        <select
                          disabled={updatingId === item.log.id}
                          value={item.log.status}
                          onChange={(e) => handleStatusChange(item.log.id, e.target.value)}
                          className="text-[11px] font-bold bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 outline-none focus:ring-1 focus:ring-[#D4A017] cursor-pointer"
                        >
                          <option value="nouveau">Nouveau</option>
                          <option value="en_cours">En cours</option>
                          <option value="resolu">Résolu</option>
                          <option value="ignore">Ignoré</option>
                        </select>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedLog(item)}
                          className="p-2 hover:bg-slate-100 text-slate-600 hover:text-[#0F172A] rounded-xl transition-colors font-bold flex items-center gap-1 text-xs"
                          title="Inspecter la trace (Stack & JSON)"
                        >
                          <Eye className="w-4 h-4 text-[#D4A017]" />
                          <span className="hidden sm:inline">Détails</span>
                        </button>

                        <button
                          onClick={() => handleDeleteLog(item.log.id)}
                          className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl transition-colors"
                          title="Supprimer définitivement ce log"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modale d'Inspection Stack Trace & Métadonnées */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto overflow-x-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#0F172A] text-[#D4A017] flex items-center justify-center">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#0F172A]">
                    Inspection Technique de l&apos;Anomalie
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    ID: {selectedLog.log.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 text-xs">
              {/* Infos Résumé */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Niveau</span>
                  <div className="mt-1">{getLevelBadge(selectedLog.log.level)}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Source / Route</span>
                  <p className="font-bold text-[#0F172A] mt-1 font-mono text-[11px]">
                    {selectedLog.log.source} {selectedLog.log.endpoint ? `(${selectedLog.log.endpoint})` : ""}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Utilisateur</span>
                  <p className="font-bold text-[#0F172A] mt-1">
                    {selectedLog.user ? selectedLog.user.email : "Anonyme / Système"}
                  </p>
                </div>
              </div>

              {/* Message d'Erreur */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-700 uppercase">Message de l&apos;Erreur</label>
                <div className="p-4 rounded-2xl bg-red-50/70 border border-red-200 text-red-900 font-bold text-xs">
                  {selectedLog.log.errorMessage}
                </div>
              </div>

              {/* Stack Trace */}
              {selectedLog.log.stackTrace ? (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold text-slate-700 uppercase">Stack Trace</label>
                  <pre className="p-4 rounded-2xl bg-[#0F172A] text-slate-300 font-mono text-[11px] overflow-x-auto border border-slate-800 max-h-60 leading-relaxed whitespace-pre-wrap">
                    {selectedLog.log.stackTrace}
                  </pre>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 italic font-medium">
                  Aucune stack trace capturée pour cet événement.
                </div>
              )}

              {/* Métadonnées JSON */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-700 uppercase">Métadonnées Complémentaires (JSON)</label>
                <pre className="p-4 rounded-2xl bg-slate-100 text-slate-800 font-mono text-[11px] overflow-x-auto border border-slate-200">
                  {JSON.stringify(selectedLog.log.metadata || {}, null, 2)}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <span className="text-[11px] text-slate-400 font-medium">
                Enregistré le : {new Date(selectedLog.log.createdAt).toLocaleString("fr-FR")}
              </span>
              <button
                onClick={() => setSelectedLog(null)}
                className="px-6 py-2 bg-[#0F172A] hover:bg-[#D4A017] text-white font-bold rounded-xl text-xs transition-all"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
