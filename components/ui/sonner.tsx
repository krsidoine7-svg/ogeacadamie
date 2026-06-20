"use client"

import { useEffect, useRef } from "react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

// Pure Web Audio API synthesized iOS-like notification sound
const playNotificationChime = () => {
  if (typeof window === "undefined") return
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContextClass) return
    
    const audioCtx = new AudioContextClass()
    
    // First chime note (crisp and high)
    const osc1 = audioCtx.createOscillator()
    const gain1 = audioCtx.createGain()
    osc1.type = "sine"
    osc1.frequency.setValueAtTime(880, audioCtx.currentTime) // A5 note
    
    gain1.gain.setValueAtTime(0, audioCtx.currentTime)
    gain1.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + 0.04)
    gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.28)
    
    osc1.connect(gain1)
    gain1.connect(audioCtx.destination)
    
    // Second higher chime note (iOS classic double-chime spacing)
    const osc2 = audioCtx.createOscillator()
    const gain2 = audioCtx.createGain()
    osc2.type = "sine"
    osc2.frequency.setValueAtTime(1174.66, audioCtx.currentTime + 0.08) // D6 note
    
    gain2.gain.setValueAtTime(0, audioCtx.currentTime)
    gain2.gain.setValueAtTime(0, audioCtx.currentTime + 0.08)
    gain2.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.12)
    gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.38)
    
    osc2.connect(gain2)
    gain2.connect(audioCtx.destination)
    
    osc1.start(audioCtx.currentTime)
    osc1.stop(audioCtx.currentTime + 0.3)
    
    osc2.start(audioCtx.currentTime + 0.08)
    osc2.stop(audioCtx.currentTime + 0.4)
  } catch (e) {
    console.warn("Web Audio API blocked or not supported:", e)
  }
}

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()
  const lastPlayedRef = useRef<number>(0)

  useEffect(() => {
    // MutationObserver to listen to toast DOM insertions and play the sound
    const handleMutation = (mutations: MutationRecord[]) => {
      let shouldPlay = false
      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          shouldPlay = true
          break
        }
      }
      if (shouldPlay) {
        const now = Date.now()
        // Throttling to prevent playing multiple sounds for simultaneous toast batches
        if (now - lastPlayedRef.current > 400) {
          lastPlayedRef.current = now
          playNotificationChime()
        }
      }
    }

    const observer = new MutationObserver(handleMutation)
    const container = document.querySelector("[data-sonner-toaster]")
    if (container) {
      observer.observe(container, { childList: true, subtree: true })
    }

    return () => observer.disconnect()
  }, [])

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4 text-emerald-500" />
        ),
        info: (
          <InfoIcon className="size-4 text-blue-500" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4 text-amber-500" />
        ),
        error: (
          <OctagonXIcon className="size-4 text-rose-500" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin text-slate-500" />
        ),
      }}
      toastOptions={{
        classNames: {
          // iOS-style premium glassmorphism card styling
          toast: "group-[.toaster]:bg-white/80 group-[.toaster]:dark:bg-slate-900/85 group-[.toaster]:backdrop-blur-xl group-[.toaster]:text-slate-900 group-[.toaster]:dark:text-slate-100 group-[.toaster]:border group-[.toaster]:border-slate-200/50 group-[.toaster]:dark:border-slate-800/40 group-[.toaster]:shadow-[0_12px_38px_rgba(0,0,0,0.08)] group-[.toaster]:dark:shadow-[0_12px_38px_rgba(0,0,0,0.4)] group-[.toaster]:rounded-2xl group-[.toaster]:p-4 group-[.toaster]:font-sans group-[.toaster]:items-start group-[.toaster]:gap-3 group-[.toaster]:transition-all group-[.toaster]:duration-300",
          title: "group-[.toast]:font-semibold group-[.toast]:text-xs group-[.toast]:text-slate-900 group-[.toast]:dark:text-slate-100 group-[.toast]:leading-tight",
          description: "group-[.toast]:text-[11px] group-[.toast]:text-slate-500 group-[.toast]:dark:text-slate-400 group-[.toast]:font-light group-[.toast]:leading-normal",
          actionButton: "group-[.toast]:bg-[#D4A017] group-[.toast]:text-white group-[.toast]:font-medium group-[.toast]:text-xs group-[.toast]:rounded-xl group-[.toast]:px-3 group-[.toast]:py-1.5",
          cancelButton: "group-[.toast]:bg-slate-100 group-[.toast]:dark:bg-slate-800 group-[.toast]:text-slate-500 group-[.toast]:dark:text-slate-400 group-[.toast]:font-medium group-[.toast]:text-xs group-[.toast]:rounded-xl group-[.toast]:px-3 group-[.toast]:py-1.5",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
