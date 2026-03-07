import { auth } from "@/lib/auth";
import { CalendarClient } from "./CalendarClient";
import { getCalendarDataAction } from "@/actions/calendar.actions";

export default async function CalendarPage() {
  const session = await auth();
  if (!session?.user?.hotelId) return null;

  const now = new Date();
  const data = await getCalendarDataAction(
    now.getFullYear(),
    now.getMonth()
  );

  return <CalendarClient initialData={data} initialYear={now.getFullYear()} initialMonth={now.getMonth()} />;
}