"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, UserCircle, CreditCard, Bell } from "lucide-react";

interface CandidatMobileNavProps {
  profile: {
    nom: string;
    prenom: string;
    email: string;
    role: string;
  };
  unreadNotifCount: number;
}

export default function CandidatMobileNav({ unreadNotifCount }: CandidatMobileNavProps) {
  const pathname = usePathname();

  const menuItems = [
    { href: "/dashboard", label: "Accueil", icon: LayoutDashboard, exact: true },
    { href: "/dashboard/documents", label: "Cours", icon: BookOpen },
    { href: "/dashboard/paiement", label: "Paiement", icon: CreditCard },
    { href: "/dashboard/profil", label: "Profil", icon: UserCircle },
    { href: "/dashboard/notifications", label: "Notifs", icon: Bell, hasBadge: true },
  ];

  const isActive = (item: typeof menuItems[0]) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-slate-200/80 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] h-16 flex items-center justify-around px-2 pb-safe">
      {menuItems.map((item) => {
        const active = isActive(item);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all duration-200 relative ${
              active ? "text-[#D4A017]" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <div className="relative p-1">
              <Icon className="w-5.5 h-5.5 transition-transform duration-200" />
              {item.hasBadge && unreadNotifCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-extrabold text-[9px] min-w-[15px] h-[15px] rounded-full flex items-center justify-center border border-white animate-pulse">
                  {unreadNotifCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold tracking-tight mt-0.5">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
