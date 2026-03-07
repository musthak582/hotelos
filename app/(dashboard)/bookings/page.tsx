import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BookingsClient } from "./BookingsClient";

async function getData(hotelId: string) {
  const [bookings, rooms, stats] = await Promise.all([
    prisma.booking.findMany({
      where: { hotelId },
      include: { room: true, guest: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.room.findMany({
      where: { hotelId, status: { not: "MAINTENANCE" } },
      orderBy: { name: "asc" },
    }),
    prisma.booking.groupBy({
      by: ["status"],
      where: { hotelId },
      _count: true,
    }),
  ]);

  const statusCounts = Object.fromEntries(
    stats.map((s) => [s.status, s._count])
  );

  return { bookings, rooms, statusCounts };
}

export default async function BookingsPage() {
  const session = await auth();
  if (!session?.user?.hotelId) return null;

  const { bookings, rooms, statusCounts } = await getData(session.user.hotelId);

  return <BookingsClient bookings={bookings} rooms={rooms} statusCounts={statusCounts} />;
}