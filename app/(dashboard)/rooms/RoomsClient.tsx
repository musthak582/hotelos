"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, BedDouble, CheckCircle, XCircle, Wrench, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/PageHeader";
import { RoomsTable } from "@/components/rooms/RoomsTable";
import { RoomFormModal } from "@/components/rooms/RoomFormModal";
import { EmptyState } from "@/components/shared/EmptyState";
import type { RoomStatus, RoomType } from "@/types";

interface Room {
  id: string;
  name: string;
  type: string;
  price: number;
  capacity: number;
  floor: number | null;
  description: string | null;
  amenities: string[];
  status: string;
  _count: { bookings: number };
  bookings: { id: string; checkIn: Date; checkOut: Date; status: string }[];
}

interface Stats {
  total: number;
  available: number;
  occupied: number;
  maintenance: number;
}

const statCards = (stats: Stats) => [
  {
    label: "Total Rooms",
    value: stats.total,
    icon: BedDouble,
    color: "text-indigo-400",
    bg: "bg-indigo-500/10 border-indigo-500/20",
  },
  {
    label: "Available",
    value: stats.available,
    icon: CheckCircle,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
  {
    label: "Occupied",
    value: stats.occupied,
    icon: XCircle,
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
  },
  {
    label: "Maintenance",
    value: stats.maintenance,
    icon: Wrench,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
];

type FilterStatus = "ALL" | RoomStatus;
type FilterType = "ALL" | RoomType;

export function RoomsClient({ rooms, stats }: { rooms: Room[]; stats: Stats }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("ALL");
  const [filterType, setFilterType] = useState<FilterType>("ALL");

  const filtered = rooms.filter((room) => {
    const matchesSearch =
      room.name.toLowerCase().includes(search.toLowerCase()) ||
      room.type.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "ALL" || room.status === filterStatus;
    const matchesType = filterType === "ALL" || room.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <>
      <PageHeader
        title="Rooms"
        description={`${stats.total} rooms · ${stats.available} available`}
      >
        <Button
          onClick={() => setModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Room
        </Button>
      </PageHeader>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards(stats).map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-slate-900/50 border border-white/[0.06] rounded-xl p-4 flex items-center gap-3"
          >
            <div className={`w-9 h-9 rounded-lg border flex items-center justify-center flex-shrink-0 ${card.bg}`}>
              <card.icon className={`w-4.5 h-4.5 ${card.color}`} />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{card.value}</p>
              <p className="text-xs text-slate-500">{card.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            placeholder="Search rooms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-slate-500 h-9"
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1.5">
          {(["ALL", "AVAILABLE", "OCCUPIED", "MAINTENANCE"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterStatus === s
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                  : "text-slate-400 hover:text-slate-200 border border-transparent hover:border-white/10"
              }`}
            >
              {s === "ALL" ? "All Status" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Type filter */}
        <div className="flex items-center gap-1.5">
          {(["ALL", "STANDARD", "DELUXE", "SUITE", "PENTHOUSE"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterType === t
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                  : "text-slate-400 hover:text-slate-200 border border-transparent hover:border-white/10"
              }`}
            >
              {t === "ALL" ? "All Types" : t.charAt(0) + t.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table or empty */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={BedDouble}
          title={rooms.length === 0 ? "No rooms yet" : "No rooms match your filters"}
          description={
            rooms.length === 0
              ? "Add your first room to start managing availability and bookings."
              : "Try adjusting your search or filter criteria."
          }
          action={
            rooms.length === 0
              ? { label: "Add First Room", onClick: () => setModalOpen(true) }
              : undefined
          }
        />
      ) : (
        <RoomsTable rooms={filtered} />
      )}

      {/* Add modal */}
      <RoomFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}