"use client";

import { useState, useTransition, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronLeft, ChevronRight, CalendarDays,
    BedDouble, RefreshCw,
} from "lucide-react";
import { format, isSameDay, isWithinInterval, startOfDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { getCalendarDataAction } from "@/actions/calendar.actions";
import type { CalendarData, CalendarBooking } from "@/actions/calendar.actions";

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

const STATUS_COLORS: Record<string, {
    bg: string; border: string; text: string; dot: string;
}> = {
    CONFIRMED: {
        bg: "bg-indigo-500/20",
        border: "border-indigo-500/40",
        text: "text-indigo-300",
        dot: "bg-indigo-400",
    },
    CHECKED_IN: {
        bg: "bg-emerald-500/20",
        border: "border-emerald-500/40",
        text: "text-emerald-300",
        dot: "bg-emerald-400",
    },
    PENDING: {
        bg: "bg-amber-500/20",
        border: "border-amber-500/40",
        text: "text-amber-300",
        dot: "bg-amber-400",
    },
    CHECKED_OUT: {
        bg: "bg-slate-500/20",
        border: "border-slate-500/30",
        text: "text-slate-400",
        dot: "bg-slate-400",
    },
};

const ROOM_TYPE_COLORS: Record<string, string> = {
    STANDARD: "text-slate-400",
    DELUXE: "text-indigo-400",
    SUITE: "text-purple-400",
    PENTHOUSE: "text-amber-400",
};

interface CalendarClientProps {
    initialData: CalendarData;
    initialYear: number;
    initialMonth: number;
}

interface TooltipData {
    booking: CalendarBooking;
    x: number;
    y: number;
}

export function CalendarClient({ initialData, initialYear, initialMonth }: CalendarClientProps) {
    const [year, setYear] = useState(initialYear);
    const [month, setMonth] = useState(initialMonth);
    const [data, setData] = useState<CalendarData>(initialData);
    const [tooltip, setTooltip] = useState<TooltipData | null>(null);
    const [isPending, startTransition] = useTransition();

    const navigate = useCallback((dir: 1 | -1) => {
        const newDate = new Date(year, month + dir);
        const newYear = newDate.getFullYear();
        const newMonth = newDate.getMonth();

        setYear(newYear);
        setMonth(newMonth);

        startTransition(async () => {
            const newData = await getCalendarDataAction(newYear, newMonth);
            setData(newData);
        });
    }, [year, month]);

    // Get booking for a specific room+day
    const getBookingForCell = useCallback((
        roomId: string,
        day: Date
    ): CalendarBooking | null => {
        const dayStart = startOfDay(day);
        return data.bookings.find((b) => {
            if (b.room.id !== roomId) return false;
            const checkIn = startOfDay(new Date(b.checkIn));
            const checkOut = startOfDay(new Date(b.checkOut));
            return dayStart >= checkIn && dayStart < checkOut;
        }) ?? null;
    }, [data.bookings]);

    // Is this day the first day of a booking span?
    const isCheckInDay = useCallback((booking: CalendarBooking, day: Date) => {
        return isSameDay(new Date(booking.checkIn), day);
    }, []);

    // Is this day the last occupied day of a booking span?
    const isLastOccupiedDay = useCallback((booking: CalendarBooking, day: Date) => {
        const checkOut = startOfDay(new Date(booking.checkOut));
        const tomorrow = startOfDay(new Date(day));
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.getTime() === checkOut.getTime();
    }, []);

    const today = startOfDay(new Date());

    return (
        <div>
            <PageHeader
                title="Booking Calendar"
                description={`${data.rooms.length} rooms · ${data.bookings.length} bookings this month`}
            />

            {/* Controls */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(-1)}
                        disabled={isPending}
                        className="text-slate-400 hover:text-white hover:bg-white/[0.05] h-9 w-9 p-0"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>

                    <div className="text-center min-w-[160px]">
                        <h2 className="text-lg font-bold text-white">
                            {MONTH_NAMES[month]} {year}
                        </h2>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(1)}
                        disabled={isPending}
                        className="text-slate-400 hover:text-white hover:bg-white/[0.05] h-9 w-9 p-0"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>

                    {isPending && (
                        <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin ml-1" />
                    )}
                </div>

                {/* Legend */}
                <div className="hidden sm:flex items-center gap-4">
                    {Object.entries(STATUS_COLORS).map(([status, colors]) => (
                        <div key={status} className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
                            <span className="text-xs text-slate-500 capitalize">
                                {status.replace("_", " ").toLowerCase()}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Calendar grid */}
            <div className="bg-slate-900/50 border border-white/[0.06] rounded-2xl overflow-hidden">
                {data.rooms.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-14 h-14 bg-slate-800 border border-white/[0.06] rounded-2xl flex items-center justify-center mb-4">
                            <CalendarDays className="w-7 h-7 text-slate-500" />
                        </div>
                        <p className="text-base font-semibold text-white mb-1">No rooms yet</p>
                        <p className="text-sm text-slate-500">Add rooms to see the availability calendar</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <div style={{ minWidth: `${180 + data.days.length * 36}px` }}>

                            {/* Day headers */}
                            <div className="flex border-b border-white/[0.06] bg-white/[0.02] sticky top-0 z-10">
                                {/* Room column header */}
                                <div className="w-[180px] flex-shrink-0 px-4 py-3 flex items-center gap-2">
                                    <BedDouble className="w-3.5 h-3.5 text-slate-500" />
                                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Room
                                    </span>
                                </div>

                                {/* Day cells */}
                                {data.days.map((day) => {
                                    const isToday = isSameDay(day, today);
                                    const isWeekend = [0, 6].includes(day.getDay());
                                    return (
                                        <div
                                            key={day.toISOString()}
                                            className={`w-9 flex-shrink-0 flex flex-col items-center py-2 ${isToday ? "bg-indigo-500/10" : ""
                                                }`}
                                        >
                                            <span className={`text-[10px] font-medium ${isWeekend ? "text-indigo-400" : "text-slate-500"
                                                }`}>
                                                {format(day, "EEE")[0]}
                                            </span>
                                            <span className={`text-xs font-bold mt-0.5 ${isToday
                                                    ? "text-indigo-400"
                                                    : isWeekend
                                                        ? "text-slate-300"
                                                        : "text-slate-400"
                                                }`}>
                                                {format(day, "d")}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Room rows */}
                            {data.rooms.map((room, roomIndex) => (
                                <motion.div
                                    key={room.id}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: roomIndex * 0.04 }}
                                    className="flex border-b border-white/[0.04] last:border-0 hover:bg-white/[0.01] transition-colors"
                                >
                                    {/* Room label */}
                                    <div className="w-[180px] flex-shrink-0 px-4 py-3 flex items-center gap-2.5 border-r border-white/[0.04]">
                                        <div className="w-7 h-7 bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <BedDouble className="w-3.5 h-3.5 text-slate-400" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-white truncate">
                                                Room {room.name}
                                            </p>
                                            <p className={`text-[11px] font-medium ${ROOM_TYPE_COLORS[room.type] ?? "text-slate-500"}`}>
                                                {room.type.charAt(0) + room.type.slice(1).toLowerCase()}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Day cells */}
                                    {data.days.map((day) => {
                                        const booking = getBookingForCell(room.id, day);
                                        const isToday = isSameDay(day, today);
                                        const colors = booking ? STATUS_COLORS[booking.status] ?? STATUS_COLORS.CONFIRMED : null;
                                        const checkIn = booking ? isCheckInDay(booking, day) : false;
                                        const lastDay = booking ? isLastOccupiedDay(booking, day) : false;

                                        return (
                                            <div
                                                key={day.toISOString()}
                                                className={`w-9 flex-shrink-0 h-14 flex items-center justify-center relative ${isToday ? "bg-indigo-500/5" : ""
                                                    }`}
                                            >
                                                {booking && colors ? (
                                                    <div
                                                        className={`
                              absolute inset-y-1.5 cursor-pointer transition-opacity hover:opacity-80
                              ${colors.bg} border-y ${colors.border}
                              ${checkIn
                                                                ? "left-1 rounded-l-lg border-l"
                                                                : "left-0 border-l-0"
                                                            }
                              ${lastDay
                                                                ? "right-1 rounded-r-lg border-r"
                                                                : "right-0 border-r-0"
                                                            }
                            `}
                                                        onMouseEnter={(e) => {
                                                            const rect = e.currentTarget.getBoundingClientRect();
                                                            setTooltip({
                                                                booking,
                                                                x: rect.left + rect.width / 2,
                                                                y: rect.top,
                                                            });
                                                        }}
                                                        onMouseLeave={() => setTooltip(null)}
                                                    >
                                                        {/* Show guest initial only on check-in day */}
                                                        {checkIn && (
                                                            <div className="absolute inset-0 flex items-center pl-2">
                                                                <span className={`text-[10px] font-bold truncate ${colors.text}`}>
                                                                    {booking.guest.name.split(" ")[0]}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    /* Empty cell */
                                                    <div className={`w-1 h-1 rounded-full ${isToday ? "bg-indigo-500/40" : "bg-white/[0.04]"
                                                        }`} />
                                                )}
                                            </div>
                                        );
                                    })}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Booking tooltip */}
            <AnimatePresence>
                {tooltip && (
                    <BookingTooltip tooltip={tooltip} />
                )}
            </AnimatePresence>

            {/* Monthly summary */}
            <MonthlySummary data={data} />
        </div>
    );
}

// ─────────────────────────────────────────
// Tooltip component (portal-style fixed position)
// ─────────────────────────────────────────

function BookingTooltip({ tooltip }: { tooltip: TooltipData }) {
    const { booking, x, y } = tooltip;
    const colors = STATUS_COLORS[booking.status] ?? STATUS_COLORS.CONFIRMED;
    const nights = Math.ceil(
        (new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="fixed z-50 pointer-events-none"
            style={{
                left: x,
                top: y - 8,
                transform: "translate(-50%, -100%)",
            }}
        >
            <div className="bg-slate-900 border border-white/15 rounded-xl shadow-2xl shadow-black/60 p-3.5 min-w-[200px]">
                {/* Guest */}
                <div className="flex items-center gap-2 mb-2.5">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${colors.bg} ${colors.text}`}>
                        {booking.guest.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-white leading-none">
                            {booking.guest.name}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                            {booking.guest.email}
                        </p>
                    </div>
                </div>

                <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                        <span className="text-slate-500">Check-in</span>
                        <span className="text-slate-300 font-medium">
                            {format(new Date(booking.checkIn), "MMM d, yyyy")}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500">Check-out</span>
                        <span className="text-slate-300 font-medium">
                            {format(new Date(booking.checkOut), "MMM d, yyyy")}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500">Duration</span>
                        <span className="text-slate-300 font-medium">
                            {nights} night{nights !== 1 ? "s" : ""}
                        </span>
                    </div>
                    <div className="flex justify-between border-t border-white/[0.06] pt-1.5 mt-1.5">
                        <span className="text-slate-500">Total</span>
                        <span className="text-white font-bold">
                            ${booking.totalPrice.toLocaleString()}
                        </span>
                    </div>
                </div>

                {/* Status badge */}
                <div className={`mt-2.5 flex items-center gap-1.5 px-2 py-1 rounded-lg ${colors.bg} border ${colors.border}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                    <span className={`text-[11px] font-medium capitalize ${colors.text}`}>
                        {booking.status.replace("_", " ").toLowerCase()}
                    </span>
                </div>

                {/* Tooltip arrow */}
                <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-full w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-slate-900" />
            </div>
        </motion.div>
    );
}

// ─────────────────────────────────────────
// Monthly summary bar at the bottom
// ─────────────────────────────────────────

function MonthlySummary({ data }: { data: CalendarData }) {
    const confirmed = data.bookings.filter((b) => b.status === "CONFIRMED").length;
    const checkedIn = data.bookings.filter((b) => b.status === "CHECKED_IN").length;
    const pending = data.bookings.filter((b) => b.status === "PENDING").length;
    const checkedOut = data.bookings.filter((b) => b.status === "CHECKED_OUT").length;
    const revenue = data.bookings
        .filter((b) => b.status !== "CANCELLED")
        .reduce((s, b) => s + b.totalPrice, 0);

    // Occupancy: bookings that are active / total rooms
    const activeBookings = confirmed + checkedIn;
    const occupancyRate = data.rooms.length > 0
        ? Math.round((activeBookings / data.rooms.length) * 100)
        : 0;

    const cards = [
        {
            label: "Active Bookings",
            value: activeBookings,
            sub: `${confirmed} confirmed · ${checkedIn} in-house`,
            color: "text-indigo-400",
            bg: "bg-indigo-500/10 border-indigo-500/20",
        },
        {
            label: "Pending Review",
            value: pending,
            sub: "Awaiting confirmation",
            color: "text-amber-400",
            bg: "bg-amber-500/10 border-amber-500/20",
        },
        {
            label: "Checked Out",
            value: checkedOut,
            sub: "Completed this month",
            color: "text-slate-400",
            bg: "bg-slate-500/10 border-slate-500/20",
        },
        {
            label: "Occupancy Rate",
            value: `${occupancyRate}%`,
            sub: `${activeBookings} of ${data.rooms.length} rooms`,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10 border-emerald-500/20",
        },
        {
            label: "Month Revenue",
            value: `$${revenue.toLocaleString()}`,
            sub: "Excluding cancellations",
            color: "text-purple-400",
            bg: "bg-purple-500/10 border-purple-500/20",
        },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-6">
            {cards.map((card, i) => (
                <motion.div
                    key={card.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.06 }}
                    className={`border rounded-xl p-4 ${card.bg}`}
                >
                    <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
                    <p className="text-sm text-white font-medium mt-0.5">{card.label}</p>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{card.sub}</p>
                </motion.div>
            ))}
        </div>
    );
}