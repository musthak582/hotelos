"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  MoreHorizontal, Pencil, Trash2,
  Users, DollarSign, BedDouble,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { RoomStatusBadge } from "./RoomStatusBadge";
import { RoomTypeBadge } from "./RoomTypeBadge";
import { RoomFormModal } from "./RoomFormModal";
import { DeleteRoomDialog } from "./DeleteRoomDialog";
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

interface RoomsTableProps {
  rooms: Room[];
}

export function RoomsTable({ rooms }: RoomsTableProps) {
  const [editRoom, setEditRoom] = useState<Room | null>(null);
  const [deleteRoom, setDeleteRoom] = useState<Room | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  return (
    <>
      <div className="bg-slate-900/50 border border-white/[0.06] rounded-2xl overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-3.5 border-b border-white/[0.06] bg-white/[0.02]">
          <div className="col-span-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
            Room
          </div>
          <div className="col-span-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
            Type
          </div>
          <div className="col-span-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
            Price
          </div>
          <div className="col-span-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
            Capacity
          </div>
          <div className="col-span-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
            Status
          </div>
          <div className="col-span-1" />
        </div>

        {/* Table rows */}
        <div className="divide-y divide-white/[0.04]">
          {rooms.map((room, index) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.04 }}
              className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors group items-center"
            >
              {/* Room name */}
              <div className="col-span-3 flex items-center gap-3">
                <div className="w-9 h-9 bg-slate-800 border border-white/[0.06] rounded-xl flex items-center justify-center flex-shrink-0">
                  <BedDouble className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    Room {room.name}
                  </p>
                  {room.floor && (
                    <p className="text-xs text-slate-500">Floor {room.floor}</p>
                  )}
                </div>
              </div>

              {/* Type */}
              <div className="col-span-2">
                <RoomTypeBadge type={room.type as RoomType} />
              </div>

              {/* Price */}
              <div className="col-span-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-white">
                    {formatCurrency(room.price)}
                  </span>
                  <span className="text-xs text-slate-500">/night</span>
                </div>
              </div>

              {/* Capacity */}
              <div className="col-span-2">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Users className="w-3.5 h-3.5" />
                  <span className="text-sm">{room.capacity} guests</span>
                </div>
              </div>

              {/* Status */}
              <div className="col-span-2">
                <RoomStatusBadge status={room.status as RoomStatus} />
              </div>

              {/* Actions */}
              <div className="col-span-1 flex justify-end relative">
                <button
                  onClick={() => setOpenMenu(openMenu === room.id ? null : room.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06] transition-colors opacity-0 group-hover:opacity-100"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>

                {openMenu === room.id && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setOpenMenu(null)}
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      className="absolute right-0 top-full mt-1 w-40 bg-slate-900 border border-white/10 rounded-xl shadow-xl z-20 overflow-hidden py-1"
                    >
                      <button
                        onClick={() => {
                          setEditRoom(room);
                          setOpenMenu(null);
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit room
                      </button>
                      <button
                        onClick={() => {
                          setDeleteRoom(room);
                          setOpenMenu(null);
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete room
                      </button>
                    </motion.div>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <RoomFormModal
        open={!!editRoom}
        onClose={() => setEditRoom(null)}
        room={editRoom}
      />
      <DeleteRoomDialog
        open={!!deleteRoom}
        onClose={() => setDeleteRoom(null)}
        roomId={deleteRoom?.id ?? ""}
        roomName={deleteRoom?.name ?? ""}
      />
    </>
  );
}