import { auth } from "@/lib/auth";
import { getAnalyticsAction } from "@/actions/analytics.actions";
import { PageHeader } from "@/components/shared/PageHeader";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { OccupancyChart } from "@/components/dashboard/OccupancyChart";
import { RoomTypeChart } from "@/components/dashboard/RoomTypeChart";
import { TopGuests } from "@/components/dashboard/TopGuests";
import { formatCurrency } from "@/lib/utils";
import { redirect } from "next/navigation";

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user?.hotelId) redirect("/onboarding");

  const data = await getAnalyticsAction();
  const { stats, monthlyData, roomTypeData, topGuests, occupancyTrend } = data;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Analytics"
        description="Revenue trends, occupancy, and performance insights"
      />

      {/* Summary bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue",    value: formatCurrency(stats.totalRevenue),   sub: "This year" },
          { label: "Total Bookings",   value: stats.totalBookings.toString(),        sub: "This year" },
          { label: "Avg Nightly Rate", value: formatCurrency(stats.avgNightlyRate),  sub: "Across all rooms" },
          { label: "Occupancy Rate",   value: `${stats.occupancyRate}%`,             sub: "Current" },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-slate-900/50 border border-white/[0.06] rounded-2xl p-5"
          >
            <p className="text-2xl font-bold text-white">{item.value}</p>
            <p className="text-sm text-slate-300 mt-1">{item.label}</p>
            <p className="text-xs text-slate-500 mt-0.5">{item.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart data={monthlyData} />
        </div>
        <OccupancyChart data={occupancyTrend} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RoomTypeChart data={roomTypeData} />
        <TopGuests guests={topGuests} />
      </div>
    </div>
  );
}