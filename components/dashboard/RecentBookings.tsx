"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BedDouble, CalendarDays } from "lucide-react";
import { formatDate, formatCurrency, calculateNights } from "@/lib/utils";
import { BookingStatusBadge } from "@/components/bookings/BookingStatusBadge";
import type { RecentBooking } from "@/actions/analytics.actions";
import type { BookingStatus } from "@/types";

export function RecentBookings({ bookings }: { bookings: RecentBooking[] }) {
  return (
    <div className="bg-slate-900/50 border border-white/[0.06] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-semibold text-white">Recent Bookings</h3>
          <p className="text-sm text-slate-500 mt-0.5">Latest activity</p>
        </div>
        <Link
          href="/bookings"
          className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
        >
          View all
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10">
          <p className="text-slate-500 text-sm">No bookings yet</p>
        </div>
      ) : (
        <div className="space-y-1">
          {bookings.map((booking, index) => {
            const nights = calculateNights(
              new Date(booking.checkIn),
              new Date(booking.checkOut)
            );
            return (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors"
              >
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-500/30 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-indigo-300">
                    {booking.guestName.charAt(0).toUpperCase()}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-white truncate">
                      {booking.guestName}
                    </p>
                    <p className="text-sm font-semibold text-white flex-shrink-0">
                      {formatCurrency(booking.totalPrice)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <BedDouble className="w-3 h-3" />
                      Room {booking.roomName}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <CalendarDays className="w-3 h-3" />
                      {nights}n · {formatDate(booking.checkIn)}
                    </span>
                    <BookingStatusBadge status={booking.status as BookingStatus} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}