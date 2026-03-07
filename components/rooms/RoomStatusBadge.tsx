import { cn } from "@/lib/utils";
import type { RoomStatus } from "@/types";

const statusConfig: Record<
  RoomStatus,
  { label: string; dot: string; badge: string }
> = {
  AVAILABLE: {
    label: "Available",
    dot: "bg-emerald-400",
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  OCCUPIED: {
    label: "Occupied",
    dot: "bg-blue-400",
    badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  MAINTENANCE: {
    label: "Maintenance",
    dot: "bg-amber-400",
    badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
};

interface RoomStatusBadgeProps {
  status: RoomStatus;
  showDot?: boolean;
}

export function RoomStatusBadge({ status, showDot = true }: RoomStatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
        config.badge
      )}
    >
      {showDot && (
        <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", config.dot)} />
      )}
      {config.label}
    </span>
  );
}