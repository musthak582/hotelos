import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/PageHeader";
import { RoomsClient } from "./RoomsClient";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { BedDouble, Plus } from "lucide-react";

async function getRooms(hotelId: string) {
  return prisma.room.findMany({
    where: { hotelId },
    include: {
      _count: { select: { bookings: true } },
      bookings: {
        where: {
          checkOut: { gte: new Date() },
          status: { notIn: ["CANCELLED", "CHECKED_OUT"] },
        },
        select: { id: true, checkIn: true, checkOut: true, status: true },
        orderBy: { checkIn: "asc" },
        take: 1,
      },
    },
    orderBy: [{ floor: "asc" }, { name: "asc" }],
  });
}

async function getRoomStats(hotelId: string) {
  const [total, available, occupied, maintenance] = await Promise.all([
    prisma.room.count({ where: { hotelId } }),
    prisma.room.count({ where: { hotelId, status: "AVAILABLE" } }),
    prisma.room.count({ where: { hotelId, status: "OCCUPIED" } }),
    prisma.room.count({ where: { hotelId, status: "MAINTENANCE" } }),
  ]);
  return { total, available, occupied, maintenance };
}

export default async function RoomsPage() {
  const session = await auth();
  if (!session?.user?.hotelId) return null;

  const [rooms, stats] = await Promise.all([
    getRooms(session.user.hotelId),
    getRoomStats(session.user.hotelId),
  ]);

  return (
    <div>
      <RoomsClient rooms={rooms} stats={stats} />
    </div>
  );
}