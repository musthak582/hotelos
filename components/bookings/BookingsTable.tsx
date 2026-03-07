"use client";

import { motion } from "framer-motion";
import { formatDate, formatCurrency, calculateNights } from "@/lib/utils";
import { BookingStatusBadge } from "./BookingStatusBadge";
import { BookingActionsMenu } from "./BookingActionsMenu";
import { CalendarDays, BedDouble, User, DollarSign, Moon } from "lucide-react";
import type { BookingStatus } from "@/types";

interface Booking {
  id: string;
  checkIn: Date;
  checkOut: Date;
  totalPrice: number;
  status: string;
  adults: number;
  children: number;
  source: string | null;
  room: { id: string; name: string; type: string };
  guest: { id: string; name: string; email: string; phone: string | null };
}

export function BookingsTable({ bookings }: { bookings: Booking[] }) {
  return (
    <div className="bg-slate-900/50 border border-white/[0.06] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-12 gap-3 px-6 py-3.5 border-b border-white/[0.06] bg-white/[0.02]">
        <div className="col-span-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Guest</div>
        <div className="col-span-2 text-xs font-medium text-slate-500 uppercase tracking-wider">Room</div>
        <div className="col-span-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Dates</div>
        <div className="col-span-2 text-xs font-medium text-slate-500 uppercase tracking-wider">Total</div>
        <div className="col-span-1 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</div>
        <div className="col-span-1" />
      </div>

      {/* Rows */}
      <div className="divide-y divide-white/[0.04]">
        {bookings.map((booking, index) => {
          const nights = calculateNights(booking.checkIn, booking.checkOut);
          return (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
              className="grid grid-cols-12 gap-3 px-6 py-4 hover:bg-white/[0.02] transition-colors group items-center"
            >
              {/* Guest */}
              <div className="col-span-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500/30 to-purple-500/30 border border-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-semibold text-indigo-300">
                      {booking.guest.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {booking.guest.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {booking.guest.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Room */}
              <div className="col-span-2">
                <div className="flex items-center gap-1.5">
                  <BedDouble className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-white">Room {booking.room.name}</p>
                    <p className="text-xs text-slate-500 capitalize">
                      {booking.room.type.toLowerCase()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="col-span-3">
                <div className="flex items-start gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-white">
                      {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Moon className="w-3 h-3 text-slate-500" />
                      <p className="text-xs text-slate-500">
                        {nights} night{nights !== 1 ? "s" : ""}
                        {(booking.adults + booking.children) > 0 && (
                          <> · {booking.adults} adult{booking.adults !== 1 ? "s" : ""}</>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total */}
              <div className="col-span-2">
                <p className="text-sm font-semibold text-white">
                  {formatCurrency(booking.totalPrice)}
                </p>
                {booking.source && (
                  <p className="text-xs text-slate-500 capitalize">{booking.source}</p>
                )}
              </div>

              {/* Status */}
              <div className="col-span-1">
                <BookingStatusBadge status={booking.status as BookingStatus} />
              </div>

              {/* Actions */}
              <div className="col-span-1 flex justify-end">
                <BookingActionsMenu
                  bookingId={booking.id}
                  currentStatus={booking.status as BookingStatus}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}