"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Users, Mail, Phone, Globe, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatCurrency } from "@/lib/utils";

interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  country: string | null;
  createdAt: Date;
  _count: { bookings: number };
  bookings: { totalPrice: number; status: string }[];
}

export function GuestsClient({ guests }: { guests: Guest[] }) {
  const [search, setSearch] = useState("");

  const filtered = guests.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.email.toLowerCase().includes(search.toLowerCase()) ||
      g.country?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Guest Directory"
        description={`${guests.length} guests in your database`}
      />

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <Input
          placeholder="Search guests..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-slate-500 h-9"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title={guests.length === 0 ? "No guests yet" : "No guests match your search"}
          description={
            guests.length === 0
              ? "Guests are automatically added when you create bookings."
              : "Try a different search term."
          }
        />
      ) : (
        <div className="bg-slate-900/50 border border-white/[0.06] rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3.5 border-b border-white/[0.06] bg-white/[0.02]">
            <div className="col-span-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Guest</div>
            <div className="col-span-2 text-xs font-medium text-slate-500 uppercase tracking-wider">Contact</div>
            <div className="col-span-2 text-xs font-medium text-slate-500 uppercase tracking-wider">Country</div>
            <div className="col-span-2 text-xs font-medium text-slate-500 uppercase tracking-wider">Bookings</div>
            <div className="col-span-2 text-xs font-medium text-slate-500 uppercase tracking-wider">Total Spent</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-white/[0.04]">
            {filtered.map((guest, index) => {
              const totalSpent = guest.bookings.reduce((s, b) => s + b.totalPrice, 0);
              return (
                <motion.div
                  key={guest.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors items-center"
                >
                  {/* Guest */}
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-500/30 border border-white/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-indigo-300">
                        {guest.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{guest.name}</p>
                      <p className="text-xs text-slate-500 truncate">{guest.email}</p>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="col-span-2">
                    {guest.phone ? (
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Phone className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{guest.phone}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-600">—</span>
                    )}
                  </div>

                  {/* Country */}
                  <div className="col-span-2">
                    {guest.country ? (
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Globe className="w-3 h-3 flex-shrink-0" />
                        {guest.country}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-600">—</span>
                    )}
                  </div>

                  {/* Bookings */}
                  <div className="col-span-2">
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-sm text-white font-medium">
                        {guest._count.bookings}
                      </span>
                      <span className="text-xs text-slate-500">
                        booking{guest._count.bookings !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  {/* Spent */}
                  <div className="col-span-2">
                    <p className="text-sm font-semibold text-white">
                      {totalSpent > 0 ? formatCurrency(totalSpent) : "—"}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}