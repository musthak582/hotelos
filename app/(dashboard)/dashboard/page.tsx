import { auth } from "@/lib/auth";
import { getAnalyticsAction } from "@/actions/analytics.actions";
import { DashboardClient } from "./DashboardClient";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.hotelId) redirect("/onboarding");

  const data = await getAnalyticsAction();

  return (
    <DashboardClient
      data={data}
      userName={session.user.name ?? "there"}
    />
  );
}