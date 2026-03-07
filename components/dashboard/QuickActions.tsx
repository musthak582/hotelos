"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Plus, CalendarDays, BedDouble,
  Users, BarChart3, Settings,
} from "lucide-react";

const ACTIONS = [
  {
    href:  "/bookings",
    icon:  Plus,
    label: "New Booking",
    desc:  "Create a reservation",
    color: "from-indigo-500/20 to-indigo-600/20 border-indigo-500/20 hover:border-indigo-500/40",
    iconColor: "text-indigo-400",
  },
  {
    href:  "/calendar",
    icon:  CalendarDays,
    label: "View Calendar",
    desc:  "Check availability",
    color: "from-purple-500/20 to-purple-600/20 border-purple-500/20 hover:border-purple-500/40",
    iconColor: "text-purple-400",
  },
  {
    href:  "/rooms",
    icon:  BedDouble,
    label: "Manage Rooms",
    desc:  "Add or edit rooms",
    color: "from-emerald-500/20 to-emerald-600/20 border-emerald-500/20 hover:border-emerald-500/40",
    iconColor: "text-emerald-400",
  },
  {
    href:  "/guests",
    icon:  Users,
    label: "Guest Directory",
    desc:  "Browse all guests",
    color: "from-blue-500/20 to-blue-600/20 border-blue-500/20 hover:border-blue-500/40",
    iconColor: "text-blue-400",
  },
  {
    href:  "/analytics",
    icon:  BarChart3,
    label: "Analytics",
    desc:  "Revenue insights",
    color: "from-amber-500/20 to-amber-600/20 border-amber-500/20 hover:border-amber-500/40",
    iconColor: "text-amber-400",
  },
  {
    href:  "/settings",
    icon:  Settings,
    label: "Settings",
    desc:  "Hotel preferences",
    color: "from-slate-500/20 to-slate-600/20 border-slate-500/20 hover:border-slate-500/40",
    iconColor: "text-slate-400",
  },
];

export function QuickActions() {
  return (
    <div className="bg-slate-900/50 border border-white/[0.06] rounded-2xl p-6">
      <h3 className="text-base font-semibold text-white mb-5">Quick Actions</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {ACTIONS.map((action, i) => (
          <motion.div
            key={action.href}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              href={action.href}
              className={`flex flex-col items-start gap-2.5 p-3.5 rounded-xl border bg-gradient-to-br transition-all duration-200 group ${action.color}`}
            >
              <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center ${action.iconColor}`}>
                <action.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-white leading-none mb-1">
                  {action.label}
                </p>
                <p className="text-xs text-slate-500 leading-none">{action.desc}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}