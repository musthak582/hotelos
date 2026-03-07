"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";

export interface CalendarBooking {
  id: string;
  checkIn: Date;
  checkOut: Date;
  status: string;
  totalPrice: number;
  guest: { name: string; email: string };
  room: { id: string; name: string; type: string };
}

export interface CalendarRoom {
  id: string;
  name: string;
  type: string;
  price: number;
  status: string;
}

export interface CalendarData {
  rooms: CalendarRoom[];
  bookings: CalendarBooking[];
  days: Date[];
}

export async function getCalendarDataAction(
  year: number,
  month: number // 0-indexed
): Promise<CalendarData> {
  try {
    const session = await auth();
    if (!session?.user?.hotelId) return { rooms: [], bookings: [], days: [] };

    const monthStart = startOfMonth(new Date(year, month));
    const monthEnd = endOfMonth(new Date(year, month));
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const [rooms, bookings] = await Promise.all([
      prisma.room.findMany({
        where: { hotelId: session.user.hotelId },
        orderBy: [{ floor: "asc" }, { name: "asc" }],
        select: { id: true, name: true, type: true, price: true, status: true },
      }),
      prisma.booking.findMany({
        where: {
          hotelId: session.user.hotelId,
          status: { notIn: ["CANCELLED"] },
          OR: [
            { checkIn: { gte: monthStart, lte: monthEnd } },
            { checkOut: { gte: monthStart, lte: monthEnd } },
            { checkIn: { lte: monthStart }, checkOut: { gte: monthEnd } },
          ],
        },
        include: {
          guest: { select: { name: true, email: true } },
          room: { select: { id: true, name: true, type: true } },
        },
        orderBy: { checkIn: "asc" },
      }),
    ]);

    return { rooms, bookings, days };
  } catch (error) {
    console.error("Calendar data error:", error);
    return { rooms: [], bookings: [], days: [] };
  }
}