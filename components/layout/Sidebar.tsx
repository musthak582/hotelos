"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  BedDouble,
  CalendarDays,
  BookOpen,
  Users,
  BarChart3,
  Settings,
  Hotel,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const navItems = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/analytics", icon: BarChart3, label: "Analytics" },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/rooms", icon: BedDouble, label: "Rooms" },
      { href: "/bookings", icon: BookOpen, label: "Bookings", badge: "New" },
      { href: "/calendar", icon: CalendarDays, label: "Calendar" },
      { href: "/guests", icon: Users, label: "Guests" },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/settings", icon: Settings, label: "Settings" },
    ],
  },
];

interface SidebarProps {
  hotelName?: string;
}

export function Sidebar({ hotelName = "My Hotel" }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-[240px] min-h-screen bg-slate-950 border-r border-white/[0.06] fixed left-0 top-0 z-30">

      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-white/[0.06]">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-shadow">
            <Hotel className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-white text-sm tracking-tight">
            HotelOS
          </span>
        </Link>
      </div>

      {/* Hotel selector */}
      <div className="px-3 py-3 border-b border-white/[0.06]">
        <button className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/[0.05] transition-colors group">
          <div className="w-6 h-6 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-md flex-shrink-0" />
          <span className="text-sm text-slate-300 truncate flex-1 text-left font-medium">
            {hotelName}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto scrollbar-hide">
        {navItems.map((group) => (
          <div key={group.label}>
            <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-2.5 mb-1.5">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all duration-150 group relative",
                        isActive
                          ? "bg-indigo-500/10 text-indigo-400"
                          : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]"
                      )}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeNav"
                          className="absolute inset-0 bg-indigo-500/10 rounded-lg border border-indigo-500/20"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.35 }}
                        />
                      )}
                      <item.icon
                        className={cn(
                          "w-4 h-4 flex-shrink-0 relative z-10",
                          isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"
                        )}
                      />
                      <span className="relative z-10 flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="relative z-10 text-[10px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-1.5 py-0.5 rounded-full font-medium">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Upgrade nudge */}
      <div className="p-3 border-t border-white/[0.06]">
        <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl p-3.5">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-xs font-semibold text-white">Pro Plan</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed mb-2.5">
            Unlock multi-property, advanced reports & API access.
          </p>
          <button className="w-full text-xs bg-indigo-600 hover:bg-indigo-500 text-white py-1.5 rounded-lg transition-colors font-medium">
            Upgrade now
          </button>
        </div>
      </div>
    </aside>
  );
}