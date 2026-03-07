import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if (!session.user.hotelId) redirect("/onboarding");

  const hotel = await prisma.hotel.findUnique({
    where: { id: session.user.hotelId },
    select: { name: true },
  });

  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar hotelName={hotel?.name} />
      <Navbar hotelName={hotel?.name} />
      <main className="lg:pl-[240px] pt-16">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}