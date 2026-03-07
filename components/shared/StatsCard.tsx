"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  index?: number;
}

export function StatsCard({
  title,
  value,
  change,
  changeLabel = "vs last month",
  icon: Icon,
  iconColor = "text-indigo-400",
  iconBg = "bg-indigo-500/10",
  index = 0,
}: StatsCardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;
  const isNeutral = change === undefined || change === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.07 }}
      className="bg-slate-900/50 border border-white/[0.06] rounded-2xl p-5 hover:border-white/[0.12] transition-colors group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", iconBg)}>
          <Icon className={cn("w-5 h-5", iconColor)} />
        </div>
        {change !== undefined && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
            isPositive && "bg-emerald-500/10 text-emerald-400",
            isNegative && "bg-red-500/10 text-red-400",
            isNeutral && "bg-slate-500/10 text-slate-400",
          )}>
            {isPositive && <TrendingUp className="w-3 h-3" />}
            {isNegative && <TrendingDown className="w-3 h-3" />}
            {isNeutral && <Minus className="w-3 h-3" />}
            {change !== undefined ? `${isPositive ? "+" : ""}${change}%` : "—"}
          </div>
        )}
      </div>

      <div>
        <p className="text-2xl font-bold text-white tracking-tight mb-1">{value}</p>
        <p className="text-sm text-slate-500">{title}</p>
        {changeLabel && change !== undefined && (
          <p className="text-xs text-slate-600 mt-1">{changeLabel}</p>
        )}
      </div>
    </motion.div>
  );
}