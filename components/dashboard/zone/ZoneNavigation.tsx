"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, FileCheck, Settings, FileText } from "lucide-react";

export function ZoneSidebarNav() {
  const pathname = usePathname();

  const links = [
    {
      href: "/zone",
      label: "Tableau de Bord",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      href: "/zone/candidats",
      label: "Candidats",
      icon: Users,
    },
    {
      href: "/zone/paiements",
      label: "Paiements",
      icon: FileCheck,
    },
    {
      href: "/zone/documents",
      label: "Documents",
      icon: FileText,
    },
    {
      href: "/zone/parametres",
      label: "Paramètres",
      icon: Settings,
    },
  ];

  return (
    <nav className="space-y-1">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = link.exact
          ? pathname === link.href
          : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm tracking-tight transition-all duration-200 ${
              isActive
                ? "bg-[#0F172A] text-white shadow-sm"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-medium"
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? "text-[#D4A017]" : "text-slate-400"}`} />
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function ZoneMobileNav() {
  const pathname = usePathname();

  const links = [
    {
      href: "/zone",
      label: "Dashboard",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      href: "/zone/candidats",
      label: "Candidats",
      icon: Users,
    },
    {
      href: "/zone/paiements",
      label: "Paiements",
      icon: FileCheck,
    },
    {
      href: "/zone/documents",
      label: "Documents",
      icon: FileText,
    },
    {
      href: "/zone/parametres",
      label: "Paramètres",
      icon: Settings,
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-slate-200/80 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] h-16 flex items-center justify-around px-2 pb-safe">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = link.exact
          ? pathname === link.href
          : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all duration-200 relative ${
              isActive ? "text-[#D4A017]" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-bold tracking-tight mt-0.5">
              {link.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
