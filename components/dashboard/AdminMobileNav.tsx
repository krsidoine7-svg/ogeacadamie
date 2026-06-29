"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  UserCheck, 
  MapPin, 
  Send, 
  Globe, 
  FileText, 
  Settings, 
  ShieldCheck, 
  Menu, 
  X,
  LineChart
} from "lucide-react";

interface AdminMobileNavProps {
  profile: {
    nom: string;
    prenom: string;
    email: string;
    role: string;
  };
}

export default function AdminMobileNav({ profile }: AdminMobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
    { href: "/admin/candidats", label: "Gestion Candidats", icon: Users },
    { href: "/admin/paiements", label: "Suivi Paiements", icon: CreditCard },
    { href: "/admin/managers", label: "Responsables de Zone", icon: UserCheck },
    { href: "/admin/zones", label: "Configurations Zone", icon: MapPin },
    { href: "/admin/notifications", label: "Annonces Groupées", icon: Send },
    { href: "/admin/contenu", label: "Éditeur Accueil", icon: Globe },
    { href: "/admin/documents", label: "Supports & Directs", icon: FileText },
    ...(profile.role === "super_admin"
      ? [{ href: "/admin/analytics", label: "Statistiques", icon: LineChart }]
      : []),
    { href: "/admin/parametres", label: "Paramètres", icon: Settings },
  ];

  // Prevent background scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Close drawer on path change during render phase
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setIsOpen(false);
  }

  const isActive = (item: typeof menuItems[0]) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  const getActiveTitle = () => {
    const currentItem = menuItems.find(item => isActive(item));
    return currentItem ? currentItem.label : "Administration";
  };

  return (
    <>
      {/* Sticky Mobile Sub-Header for Navigation triggers */}
      <div className="md:hidden sticky top-16 z-30 flex items-center justify-between bg-white border-b border-slate-200 px-4 py-3 shadow-sm flex-shrink-0">
        <div className="flex items-center gap-2 max-w-[70%]">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Admin</span>
          <span className="text-xs font-bold text-slate-800 truncate bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-lg">
            {getActiveTitle()}
          </span>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-[#D4A017] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-slate-900/5 cursor-pointer"
        >
          <Menu className="w-3.5 h-3.5" />
          <span>Menu</span>
        </button>
      </div>

      {/* Drawer Overlay Menu */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop with backdrop blur */}
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative flex flex-col w-full max-w-[280px] bg-white h-full shadow-2xl p-6 overflow-y-auto border-r border-slate-200 animate-slide-right">
            {/* Header Area */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-6">
              <div className="space-y-0.5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  Console Centrale
                </span>
                <span className="font-bold text-slate-900 text-sm block">
                  Menu de Navigation
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-950 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all"
                title="Fermer le menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation List */}
            <nav className="flex-1 space-y-1">
              {menuItems.map((item) => {
                const active = isActive(item);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs tracking-tight transition-all duration-200 border ${
                      active
                        ? "bg-slate-900 border-slate-800 text-white shadow-sm"
                        : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? "text-[#D4A017]" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Bottom Status Panel */}
            <div className="pt-6 border-t border-slate-100 mt-6">
              <div className="bg-slate-950 border border-slate-900 rounded-2xl p-4 space-y-2 text-white">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#D4A017]">
                  <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>SESSION SÉCURISÉE</span>
                </div>
                <p className="text-[10px] font-semibold text-slate-400 leading-relaxed">
                  Rôle : <span className="font-extrabold text-[#D4A017] uppercase">{profile.role.replace("_", " ")}</span>
                </p>
                <p className="text-[9px] font-medium text-slate-500 truncate leading-tight">
                  {profile.prenom} {profile.nom}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
