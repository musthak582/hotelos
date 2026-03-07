"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Plus, Search, BookOpen, CheckCircle,
  Clock, LogIn, LogOut, XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/PageHeader";
import { BookingsTable } from "@/components/bookings/BookingsTable";
import { BookingFormModal } from "@/components/bookings/BookingFormModal";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatCurrency } from "@/lib/utils";
import type { BookingStatus } from "@/types";

const STATUS_TABS = [
  { value: "ALL", label: "All", icon: BookOpen },
  { value: "PENDING", label: "Pending", icon: Clock },
  { value: "CONFIRMED", label: "Confirmed", icon: CheckCircle },
  { value: "CHECKED_IN", label: "Checked In", icon: LogIn },
  { value: "CHECKED_OUT", label: "Checked Out", icon: LogOut },
  { value: "CANCELLED", label: "Cancelled", icon: XCircle },
] as const;

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

interface Room {
  id: string;
  name: string;
  type: string;
  price: number;
  capacity: number;
  status: string;
}

interface BookingsClientProps {
  bookings: Booking[];
  rooms: Room[];
  statusCounts: Record<string, number>;
}

export function BookingsClient({ bookings, rooms, statusCounts }: BookingsClientProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"ALL" | BookingStatus>("ALL");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      const matchesTab = activeTab === "ALL" || b.status === activeTab;
      const matchesSearch =
        !search ||
        b.guest.name.toLowerCase().includes(search.toLowerCase()) ||
        b.guest.email.toLowerCase().includes(search.toLowerCase()) ||
        b.room.name.toLowerCase().includes(search.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [bookings, activeTab, search]);

  const totalRevenue = bookings
    .filter((b) => !["CANCELLED"].includes(b.status))
    .reduce((sum, b) => sum + b.totalPrice, 0);

  return (
    <>
      <PageHeader
        title="Bookings"
        description={`${bookings.length} total · ${formatCurrency(totalRevenue)} revenue`}
      >
        <Button
          onClick={() => setModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 gap-2"
        >
          <Plus className="w-4 h-4" />
          New Booking
        </Button>
      </PageHeader>

      {/* Status tabs */}
      <div className="flex items-center gap-1 mb-5 overflow-x-auto scrollbar-hide">
        {STATUS_TABS.map((tab) => {
          const count = tab.value === "ALL"
            ? bookings.length
            : statusCounts[tab.value] ?? 0;
          const isActive = activeTab === tab.value;

          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                isActive
                  ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]"
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  isActive
                    ? "bg-indigo-500/20 text-indigo-300"
                    : "bg-white/[0.06] text-slate-500"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <Input
          placeholder="Search guest, email, room..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-slate-500 h-9"
        />
      </div>

      {/* Table or empty */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={bookings.length === 0 ? "No bookings yet" : "No matching bookings"}
          description={
            bookings.length === 0
              ? "Create your first booking to start tracking guests and revenue."
              : "Try adjusting your search or status filter."
          }
          action={
            bookings.length === 0
              ? { label: "Create First Booking", onClick: () => setModalOpen(true) }
              : undefined
          }
        />
      ) : (
        <BookingsTable bookings={filtered} />
      )}

      <BookingFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        rooms={rooms}
      />
    </>
  );
}