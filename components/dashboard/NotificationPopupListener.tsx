"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Bell, Lock, Volume2, Check, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { markNotificationAsRead } from "@/app/(dashboard)/dashboard/actions";
import { toast } from "sonner";

interface NotificationItem {
  id: string;
  titre: string;
  message: string;
  createdAt: string;
  lu: boolean | null;
}

// Pure Web Audio API synthesized arpeggio - simple, warm and royalty-free
const playPopupChime = () => {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const audioCtx = new AudioContextClass();
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    // Warm, positive arpeggio: C5 (523.25 Hz) -> E5 (659.25 Hz) -> G5 (783.99 Hz) -> C6 (1046.50 Hz)
    const notes = [523.25, 659.25, 783.99, 1046.50];
    const delays = [0, 0.08, 0.16, 0.24];
    const durations = [0.3, 0.3, 0.3, 0.5];

    notes.forEach((freq, index) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime + delays[index]);

      gain.gain.setValueAtTime(0, audioCtx.currentTime);
      gain.gain.setValueAtTime(0, audioCtx.currentTime + delays[index]);
      gain.gain.linearRampToValueAtTime(0.25, audioCtx.currentTime + delays[index] + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + delays[index] + durations[index]);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(audioCtx.currentTime + delays[index]);
      osc.stop(audioCtx.currentTime + delays[index] + durations[index] + 0.1);
    });
  } catch (e) {
    console.warn("Web Audio API blocked or not supported:", e);
  }
};

export default function NotificationPopupListener() {
  const router = useRouter();
  const [activeNotif, setActiveNotif] = useState<NotificationItem | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const isFirstLoadRef = useRef<boolean>(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Load seen IDs from sessionStorage on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("seen_notification_ids");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          parsed.forEach((id) => seenIdsRef.current.add(id));
        }
      }
    } catch (e) {
      console.warn("Failed to load seen notification IDs:", e);
    }
  }, []);

  // Save seen IDs to sessionStorage
  const saveSeenIds = (ids: Set<string>) => {
    try {
      sessionStorage.setItem("seen_notification_ids", JSON.stringify(Array.from(ids)));
    } catch (e) {
      console.warn("Failed to save seen notification IDs:", e);
    }
  };

  // Fetch unread notifications from API
  const checkNotifications = async () => {
    try {
      const res = await fetch("/api/notifications/unread");
      if (!res.ok) return;

      const data = await res.json();
      if (!data.success || !Array.isArray(data.notifications)) return;

      const unreadNotifs: NotificationItem[] = data.notifications;
      if (unreadNotifs.length === 0) return;

      // Identify any new notifications (not in seenIds)
      const newNotifs = unreadNotifs.filter((n) => !seenIdsRef.current.has(n.id));

      if (newNotifs.length > 0) {
        // If it's the very first load and there are already unread notifications,
        // we show the most recent one instead of playing multiple alerts.
        // If it's not the first load, we play sound and pop up the latest one.
        const targetNotif = newNotifs[0];

        // Add all fetched unread notification IDs to seen set to avoid duplicate alerts
        unreadNotifs.forEach((n) => seenIdsRef.current.add(n.id));
        saveSeenIds(seenIdsRef.current);

        setActiveNotif(targetNotif);
        setIsOpen(true);

        if (!isFirstLoadRef.current) {
          playPopupChime();
        } else {
          // Play sound on first load if user clicked something or we try to play it
          playPopupChime();
        }
      }

      isFirstLoadRef.current = false;
    } catch (error) {
      console.error("Error in checkNotifications:", error);
    }
  };

  useEffect(() => {
    // Initial check on mount
    checkNotifications();

    // Check periodically every 20 seconds
    const interval = setInterval(checkNotifications, 20000);

    return () => clearInterval(interval);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      setActiveNotif(null);
    }, 150);
  };

  const handleMarkAsRead = async () => {
    if (!activeNotif) return;
    setActionLoading(true);

    try {
      const res = await markNotificationAsRead(activeNotif.id);
      if (res.success) {
        toast.success("Notification marquée comme lue");
        handleClose();
        router.refresh();
      } else {
        toast.error(res.error || "Impossible de marquer comme lu");
      }
    } catch (err) {
      toast.error("Une erreur est survenue.");
    } finally {
      setActionLoading(false);
    }
  };

  if (!activeNotif) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent 
        className="bg-slate-950/95 dark:bg-slate-950/95 border border-slate-800 text-white rounded-2xl shadow-2xl p-6 max-w-md w-full backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200 outline-none"
        showCloseButton={false}
      >
        <DialogHeader className="space-y-3">
          {/* Glowing Animated Bell Icon */}
          <div className="mx-auto w-12 h-12 bg-amber-500/10 rounded-full border border-amber-500/30 flex items-center justify-center text-amber-500 animate-pulse">
            <Bell className="w-6 h-6 animate-bounce" />
          </div>

          <DialogTitle className="text-center font-extrabold text-base tracking-tight text-slate-100 flex flex-col gap-1">
            <span className="text-[10px] text-amber-500 font-extrabold uppercase tracking-widest">
              Nouvelle Notification
            </span>
            <span className="mt-1 leading-snug">{activeNotif.titre}</span>
          </DialogTitle>

          <DialogDescription className="text-center text-xs text-slate-300 font-normal leading-relaxed mt-2 bg-slate-900/40 p-4 rounded-xl border border-slate-800/50">
            {activeNotif.message}
          </DialogDescription>

          <div className="text-center text-[10px] text-slate-500 font-mono mt-1">
            Reçu le {new Date(activeNotif.createdAt).toLocaleString("fr-FR", {
              dateStyle: "short",
              timeStyle: "short"
            })}
          </div>
        </DialogHeader>

        <DialogFooter className="mt-6 flex flex-row items-center gap-2 justify-center w-full bg-transparent p-0 border-none">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1 rounded-xl py-2.5 text-xs font-semibold border-slate-800 bg-slate-900 text-slate-350 hover:bg-slate-800 hover:text-white transition-all active:scale-95"
            disabled={actionLoading}
          >
            <X className="w-3.5 h-3.5 mr-1" />
            Fermer
          </Button>
          
          <Button
            onClick={handleMarkAsRead}
            className="flex-1 rounded-xl py-2.5 text-xs font-extrabold bg-amber-500 hover:bg-amber-600 text-slate-950 transition-all active:scale-95 shadow-lg shadow-amber-500/10"
            disabled={actionLoading}
          >
            <Check className="w-3.5 h-3.5 mr-1 stroke-[3]" />
            Marquer comme lu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
