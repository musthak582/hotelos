"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, BedDouble, CalendarDays,
  BookOpen, Users, BarChart3, Settings,
  Hotel, X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/rooms", icon: BedDouble, label: "Rooms" },
  { href: "/bookings", icon: BookOpen, label: "Bookings" },
  { href: "/calendar", icon: CalendarDays, label: "Calendar" },
  { href: "/guests", icon: Users, label: "Guests" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
  hotelName?: string;
}

export function MobileSidebar({ open, onClose, hotelName = "My Hotel" }: MobileSidebarProps) {
  const pathname = usePathname();

  // Close on route change
  useEffect(() => { onClose(); }, [pathname]);

  // Lock scroll
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.35 }}
            className="fixed inset-y-0 left-0 w-72 bg-slate-950 border-r border-white/[0.06] z-50 flex flex-col lg:hidden"
          >
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-5 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                  <Hotel className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-white text-sm">HotelOS</span>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Hotel name */}
            <div className="px-3 py-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5 px-2.5 py-2">
                <div className="w-6 h-6 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-md" />
                <span className="text-sm text-slate-300 font-medium truncate">{hotelName}</span>
              </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-0.5">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg text-sm transition-all",
                      isActive
                        ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                        : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]"
                    )}
                  >
                    <item.icon className={cn("w-4 h-4", isActive ? "text-indigo-400" : "text-slate-500")} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}