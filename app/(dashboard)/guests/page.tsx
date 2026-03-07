import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GuestsClient } from "./GuestsClient";

export default async function GuestsPage() {
  const session = await auth();
  if (!session?.user?.hotelId) return null;

  const guests = await prisma.guest.findMany({
    where: { hotelId: session.user.hotelId },
    include: {
      _count: { select: { bookings: true } },
      bookings: {
        select: { totalPrice: true, status: true },
        where: { status: { notIn: ["CANCELLED"] } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return <GuestsClient guests={guests} />;
}