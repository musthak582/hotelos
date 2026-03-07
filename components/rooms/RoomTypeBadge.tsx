import { cn } from "@/lib/utils";
import type { RoomType } from "@/types";

const typeConfig: Record<RoomType, { label: string; className: string }> = {
  STANDARD: {
    label: "Standard",
    className: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  },
  DELUXE: {
    label: "Deluxe",
    className: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  },
  SUITE: {
    label: "Suite",
    className: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  },
  PENTHOUSE: {
    label: "Penthouse",
    className: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
};

export function RoomTypeBadge({ type }: { type: RoomType }) {
  const config = typeConfig[type];
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}