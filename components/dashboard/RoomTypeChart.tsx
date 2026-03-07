"use client";

import {
  PieChart, Pie, Cell, Tooltip,
  ResponsiveContainer, TooltipProps,
} from "recharts";
import type { RoomTypeData } from "@/actions/analytics.actions";

function CustomTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as RoomTypeData;
  return (
    <div className="bg-slate-900 border border-white/10 rounded-xl px-4 py-3 shadow-xl">
      <p className="text-sm font-semibold text-white mb-1">{d.type}</p>
      <p className="text-xs text-slate-400">{d.bookings} bookings</p>
      <p className="text-xs text-slate-400">${d.revenue.toLocaleString()} revenue</p>
    </div>
  );
}

export function RoomTypeChart({ data }: { data: RoomTypeData[] }) {
  const total = data.reduce((s, d) => s + d.bookings, 0);

  return (
    <div className="bg-slate-900/50 border border-white/[0.06] rounded-2xl p-6">
      <div className="mb-6">
        <h3 className="text-base font-semibold text-white">Bookings by Room Type</h3>
        <p className="text-sm text-slate-500 mt-0.5">Distribution this year</p>
      </div>

      {data.length === 0 ? (
        <div className="flex items-center justify-center h-[200px]">
          <p className="text-slate-500 text-sm">No data yet</p>
        </div>
      ) : (
        <div className="flex items-center gap-6">
          <ResponsiveContainer width={160} height={160}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={72}
                paddingAngle={3}
                dataKey="bookings"
                strokeWidth={0}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="flex-1 space-y-3">
            {data.map((d) => (
              <div key={d.type} className="flex items-center gap-2.5">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: d.fill }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">{d.type}</span>
                    <span className="text-sm font-semibold text-white">
                      {total > 0 ? Math.round((d.bookings / total) * 100) : 0}%
                    </span>
                  </div>
                  <div className="mt-1 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width:  `${total > 0 ? (d.bookings / total) * 100 : 0}%`,
                        backgroundColor: d.fill,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}