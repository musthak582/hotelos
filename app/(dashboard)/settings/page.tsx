import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SettingsClient } from "./SettingsClient";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.hotelId) redirect("/onboarding");

  const [hotel, user] = await Promise.all([
    prisma.hotel.findUnique({
      where: { id: session.user.hotelId },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, image: true, role: true, createdAt: true },
    }),
  ]);

  if (!hotel || !user) redirect("/onboarding");

  return <SettingsClient hotel={hotel} user={user} />;
}