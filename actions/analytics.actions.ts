"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  startOfMonth, endOfMonth, subMonths,
  startOfYear, format, eachMonthOfInterval,
} from "date-fns";

export interface DashboardStats {
  totalBookings: number;
  totalRevenue: number;
  occupancyRate: number;
  availableRooms: number;
  totalRooms: number;
  avgNightlyRate: number;
  bookingsChange: number;
  revenueChange: number;
  occupancyChange: number;
}

export interface MonthlyData {
  month: string;
  revenue: number;
  bookings: number;
}

export interface RoomTypeData {
  type: string;
  bookings: number;
  revenue: number;
  fill: string;
}

export interface RecentBooking {
  id: string;
  guestName: string;
  guestEmail: string;
  roomName: string;
  roomType: string;
  checkIn: Date;
  checkOut: Date;
  totalPrice: number;
  status: string;
  createdAt: Date;
}

export interface TopGuest {
  id: string;
  name: string;
  email: string;
  totalBookings: number;
  totalSpent: number;
}

export interface AnalyticsData {
  stats: DashboardStats;
  monthlyData: MonthlyData[];
  roomTypeData: RoomTypeData[];
  recentBookings: RecentBooking[];
  topGuests: TopGuest[];
  occupancyTrend: { month: string; rate: number }[];
}

const ROOM_TYPE_COLORS: Record<string, string> = {
  STANDARD:  "#6366f1",
  DELUXE:    "#8b5cf6",
  SUITE:     "#a78bfa",
  PENTHOUSE: "#f59e0b",
};

export async function getAnalyticsAction(): Promise<AnalyticsData> {
  try {
    const session = await auth();
    if (!session?.user?.hotelId) return emptyAnalytics();

    const hotelId   = session.user.hotelId;
    const now       = new Date();
    const thisMonth = { start: startOfMonth(now), end: endOfMonth(now) };
    const lastMonth = {
      start: startOfMonth(subMonths(now, 1)),
      end:   endOfMonth(subMonths(now, 1)),
    };
    const yearStart = startOfYear(now);

    // ── Parallel fetches ──────────────────────────────────────────
    const [
      allBookings,
      thisMonthBookings,
      lastMonthBookings,
      rooms,
      guests,
    ] = await Promise.all([
      // All non-cancelled bookings from start of year
      prisma.booking.findMany({
        where: {
          hotelId,
          status: { notIn: ["CANCELLED"] },
          createdAt: { gte: yearStart },
        },
        include: {
          room:  { select: { name: true, type: true, price: true } },
          guest: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      // This month
      prisma.booking.aggregate({
        where: {
          hotelId,
          status: { notIn: ["CANCELLED"] },
          createdAt: { gte: thisMonth.start, lte: thisMonth.end },
        },
        _count: true,
        _sum: { totalPrice: true },
      }),
      // Last month (for change %)
      prisma.booking.aggregate({
        where: {
          hotelId,
          status: { notIn: ["CANCELLED"] },
          createdAt: { gte: lastMonth.start, lte: lastMonth.end },
        },
        _count: true,
        _sum: { totalPrice: true },
      }),
      // Rooms
      prisma.room.findMany({
        where: { hotelId },
        select: { id: true, type: true, price: true, status: true },
      }),
      // All guests
      prisma.guest.findMany({
        where: { hotelId },
        include: {
          bookings: {
            where: { status: { notIn: ["CANCELLED"] } },
            select: { totalPrice: true },
          },
        },
      }),
    ]);

    // ── Stats ─────────────────────────────────────────────────────
    const totalRevenue   = allBookings.reduce((s, b) => s + b.totalPrice, 0);
    const totalBookings  = allBookings.length;
    const availableRooms = rooms.filter((r) => r.status === "AVAILABLE").length;
    const occupiedRooms  = rooms.filter((r) => r.status === "OCCUPIED").length;
    const occupancyRate  = rooms.length > 0
      ? Math.round((occupiedRooms / rooms.length) * 100)
      : 0;
    const avgNightlyRate = rooms.length > 0
      ? Math.round(rooms.reduce((s, r) => s + r.price, 0) / rooms.length)
      : 0;

    // Change calculations (vs last month)
    const thisRevenue  = thisMonthBookings._sum.totalPrice ?? 0;
    const lastRevenue  = lastMonthBookings._sum.totalPrice ?? 0;
    const thisCount    = thisMonthBookings._count ?? 0;
    const lastCount    = lastMonthBookings._count ?? 0;

    const revenueChange  = lastRevenue > 0
      ? Math.round(((thisRevenue - lastRevenue) / lastRevenue) * 100)
      : thisRevenue > 0 ? 100 : 0;
    const bookingsChange = lastCount > 0
      ? Math.round(((thisCount - lastCount) / lastCount) * 100)
      : thisCount > 0 ? 100 : 0;
    const occupancyChange = 0; // Would need historical data

    // ── Monthly revenue (last 6 months) ───────────────────────────
    const last6Months = eachMonthOfInterval({
      start: subMonths(now, 5),
      end:   now,
    });

    const monthlyData: MonthlyData[] = last6Months.map((monthDate) => {
      const mStart = startOfMonth(monthDate);
      const mEnd   = endOfMonth(monthDate);
      const mBookings = allBookings.filter((b) => {
        const d = new Date(b.createdAt);
        return d >= mStart && d <= mEnd;
      });
      return {
        month:    format(monthDate, "MMM"),
        revenue:  mBookings.reduce((s, b) => s + b.totalPrice, 0),
        bookings: mBookings.length,
      };
    });

    // ── Occupancy trend (last 6 months) ───────────────────────────
    const occupancyTrend = last6Months.map((monthDate) => {
      const mStart = startOfMonth(monthDate);
      const mEnd   = endOfMonth(monthDate);
      const mBookings = allBookings.filter((b) => {
        const checkIn = new Date(b.checkIn);
        return checkIn >= mStart && checkIn <= mEnd;
      });
      const rate = rooms.length > 0
        ? Math.min(100, Math.round((mBookings.length / rooms.length) * 100))
        : 0;
      return { month: format(monthDate, "MMM"), rate };
    });

    // ── Room type breakdown ────────────────────────────────────────
    const typeMap = new Map<string, { bookings: number; revenue: number }>();
    for (const b of allBookings) {
      const type = b.room.type;
      const curr = typeMap.get(type) ?? { bookings: 0, revenue: 0 };
      typeMap.set(type, {
        bookings: curr.bookings + 1,
        revenue:  curr.revenue + b.totalPrice,
      });
    }
    const roomTypeData: RoomTypeData[] = Array.from(typeMap.entries()).map(
      ([type, data]) => ({
        type:     type.charAt(0) + type.slice(1).toLowerCase(),
        bookings: data.bookings,
        revenue:  data.revenue,
        fill:     ROOM_TYPE_COLORS[type] ?? "#6366f1",
      })
    );

    // ── Recent bookings (last 8) ───────────────────────────────────
    const recentBookings: RecentBooking[] = allBookings.slice(0, 8).map((b) => ({
      id:          b.id,
      guestName:   b.guest.name,
      guestEmail:  b.guest.email,
      roomName:    b.room.name,
      roomType:    b.room.type,
      checkIn:     b.checkIn,
      checkOut:    b.checkOut,
      totalPrice:  b.totalPrice,
      status:      b.status,
      createdAt:   b.createdAt,
    }));

    // ── Top guests ────────────────────────────────────────────────
    const topGuests: TopGuest[] = guests
      .filter((g) => g.bookings.length > 0)
      .map((g) => ({
        id:            g.id,
        name:          g.name,
        email:         g.email,
        totalBookings: g.bookings.length,
        totalSpent:    g.bookings.reduce((s, b) => s + b.totalPrice, 0),
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5);

    return {
      stats: {
        totalBookings,
        totalRevenue,
        occupancyRate,
        availableRooms,
        totalRooms:    rooms.length,
        avgNightlyRate,
        bookingsChange,
        revenueChange,
        occupancyChange,
      },
      monthlyData,
      roomTypeData,
      recentBookings,
      topGuests,
      occupancyTrend,
    };
  } catch (error) {
    console.error("Analytics error:", error);
    return emptyAnalytics();
  }
}

function emptyAnalytics(): AnalyticsData {
  return {
    stats: {
      totalBookings: 0, totalRevenue: 0,  occupancyRate: 0,
      availableRooms: 0, totalRooms: 0,  avgNightlyRate: 0,
      bookingsChange: 0, revenueChange: 0, occupancyChange: 0,
    },
    monthlyData:    [],
    roomTypeData:   [],
    recentBookings: [],
    topGuests:      [],
    occupancyTrend: [],
  };
}