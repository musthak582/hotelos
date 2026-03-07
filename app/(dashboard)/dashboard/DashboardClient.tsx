"use client";

import { motion } from "framer-motion";
import {
  BookOpen, DollarSign, BedDouble,
  TrendingUp, Users, BarChart3,
} from "lucide-react";
import { StatsCard } from "@/components/shared/StatsCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { OccupancyChart } from "@/components/dashboard/OccupancyChart";
import { RoomTypeChart } from "@/components/dashboard/RoomTypeChart";
import { RecentBookings } from "@/components/dashboard/RecentBookings";
import { TopGuests } from "@/components/dashboard/TopGuests";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { formatCurrency } from "@/lib/utils";
import type { AnalyticsData } from "@/actions/analytics.actions";

interface DashboardClientProps {
  data: AnalyticsData;
  userName: string;
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function DashboardClient({ data, userName }: DashboardClientProps) {
  const { stats, monthlyData, roomTypeData, recentBookings, topGuests, occupancyTrend } = data;

  const firstName = userName.split(" ")[0];

  return (
    <div className="space-y-8">

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold text-white tracking-tight">
          {getGreeting()}, {firstName} 👋
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Here&apos;s what&apos;s happening at your hotel today.
        </p>
      </motion.div>

      {/* ── KPI Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatsCard
          title="Total Bookings"
          value={stats.totalBookings.toString()}
          change={stats.bookingsChange}
          icon={BookOpen}
          iconColor="text-indigo-400"
          iconBg="bg-indigo-500/10"
          index={0}
        />
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          change={stats.revenueChange}
          icon={DollarSign}
          iconColor="text-emerald-400"
          iconBg="bg-emerald-500/10"
          index={1}
        />
        <StatsCard
          title="Occupancy Rate"
          value={`${stats.occupancyRate}%`}
          change={stats.occupancyChange}
          icon={TrendingUp}
          iconColor="text-purple-400"
          iconBg="bg-purple-500/10"
          index={2}
        />
        <StatsCard
          title="Available Rooms"
          value={`${stats.availableRooms} / ${stats.totalRooms}`}
          icon={BedDouble}
          iconColor="text-blue-400"
          iconBg="bg-blue-500/10"
          index={3}
        />
        <StatsCard
          title="Avg Nightly Rate"
          value={formatCurrency(stats.avgNightlyRate)}
          icon={BarChart3}
          iconColor="text-amber-400"
          iconBg="bg-amber-500/10"
          index={4}
        />
        <StatsCard
          title="Total Guests"
          value={topGuests.length.toString()}
          icon={Users}
          iconColor="text-rose-400"
          iconBg="bg-rose-500/10"
          index={5}
        />
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart data={monthlyData} />
        </div>
        <div>
          <OccupancyChart data={occupancyTrend} />
        </div>
      </div>

      {/* ── Room type + Quick actions row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RoomTypeChart data={roomTypeData} />
        <QuickActions />
      </div>

      {/* ── Recent bookings + Top guests ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentBookings bookings={recentBookings} />
        </div>
        <div>
          <TopGuests guests={topGuests} />
        </div>
      </div>

    </div>
  );
}