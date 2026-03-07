"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MoreHorizontal, CheckCircle, LogIn,
  LogOut, XCircle, Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { updateBookingStatusAction, deleteBookingAction } from "@/actions/booking.actions";
import type { BookingStatus } from "@/types";

interface BookingActionsMenuProps {
  bookingId: string;
  currentStatus: BookingStatus;
}

export function BookingActionsMenu({ bookingId, currentStatus }: BookingActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAction = async (
    action: () => Promise<{ success: boolean; error?: string }>,
    successMsg: string
  ) => {
    setLoading(true);
    setOpen(false);
    try {
      const result = await action();
      if (result.success) toast.success(successMsg);
      else toast.error(result.error || "Action failed");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const actions: {
    show: boolean;
    icon: React.ElementType;
    label: string;
    color: string;
    action: () => Promise<{ success: boolean; error?: string }>;
    msg: string;
  }[] = [
    {
      show: currentStatus === "PENDING",
      icon: CheckCircle,
      label: "Confirm",
      color: "text-indigo-400 hover:bg-indigo-500/10",
      action: () => updateBookingStatusAction(bookingId, "CONFIRMED"),
      msg: "Booking confirmed",
    },
    {
      show: currentStatus === "CONFIRMED",
      icon: LogIn,
      label: "Check In",
      color: "text-emerald-400 hover:bg-emerald-500/10",
      action: () => updateBookingStatusAction(bookingId, "CHECKED_IN"),
      msg: "Guest checked in",
    },
    {
      show: currentStatus === "CHECKED_IN",
      icon: LogOut,
      label: "Check Out",
      color: "text-blue-400 hover:bg-blue-500/10",
      action: () => updateBookingStatusAction(bookingId, "CHECKED_OUT"),
      msg: "Guest checked out",
    },
    {
      show: ["PENDING", "CONFIRMED"].includes(currentStatus),
      icon: XCircle,
      label: "Cancel",
      color: "text-red-400 hover:bg-red-500/10",
      action: () => updateBookingStatusAction(bookingId, "CANCELLED"),
      msg: "Booking cancelled",
    },
    {
      show: ["CHECKED_OUT", "CANCELLED"].includes(currentStatus),
      icon: Trash2,
      label: "Delete",
      color: "text-red-400 hover:bg-red-500/10",
      action: () => deleteBookingAction(bookingId),
      msg: "Booking deleted",
    },
  ].filter((a) => a.show);

  return (
    <div className="relative">
      <button
        disabled={loading}
        onClick={() => setOpen(!open)}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06] transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-1 w-44 bg-slate-900 border border-white/10 rounded-xl shadow-xl z-20 py-1 overflow-hidden"
            >
              {actions.length === 0 ? (
                <p className="px-3.5 py-2 text-xs text-slate-500">No actions available</p>
              ) : (
                actions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => handleAction(action.action, action.msg)}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm transition-colors ${action.color}`}
                  >
                    <action.icon className="w-3.5 h-3.5" />
                    {action.label}
                  </button>
                ))
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}