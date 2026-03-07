"use client";

import { motion } from "framer-motion";
import { Crown } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { TopGuest } from "@/actions/analytics.actions";

const RANK_COLORS = [
  "from-amber-500/30 to-yellow-500/30 border-amber-500/30 text-amber-300",
  "from-slate-400/20 to-slate-500/20 border-slate-400/30 text-slate-300",
  "from-orange-500/20 to-amber-600/20 border-orange-500/30 text-orange-300",
];

export function TopGuests({ guests }: { guests: TopGuest[] }) {
  return (
    <div className="bg-slate-900/50 border border-white/[0.06] rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-5">
        <Crown className="w-4 h-4 text-amber-400" />
        <div>
          <h3 className="text-base font-semibold text-white">Top Guests</h3>
          <p className="text-sm text-slate-500 mt-0.5">By total spend</p>
        </div>
      </div>

      {guests.length === 0 ? (
        <div className="flex items-center justify-center py-10">
          <p className="text-slate-500 text-sm">No guest data yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {guests.map((guest, index) => (
            <motion.div
              key={guest.id}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.06 }}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors"
            >
              {/* Rank */}
              <div
                className={`w-7 h-7 rounded-lg bg-gradient-to-br border flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  RANK_COLORS[index] ?? "from-slate-800/50 to-slate-700/50 border-slate-700/50 text-slate-400"
                }`}
              >
                {index + 1}
              </div>

              {/* Guest info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{guest.name}</p>
                <p className="text-xs text-slate-500 truncate">{guest.email}</p>
              </div>

              {/* Stats */}
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-white">
                  {formatCurrency(guest.totalSpent)}
                </p>
                <p className="text-xs text-slate-500">
                  {guest.totalBookings} booking{guest.totalBookings !== 1 ? "s" : ""}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}