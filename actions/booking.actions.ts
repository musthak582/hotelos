"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { calculateTotalPrice } from "@/lib/utils";
import { findOrCreateGuestAction } from "./guest.actions";
import type { ActionResult } from "./auth.actions";

const bookingSchema = z.object({
  guestName: z.string().min(2, "Guest name is required"),
  guestEmail: z.string().email("Valid email is required"),
  guestPhone: z.string().optional(),
  guestCountry: z.string().optional(),
  roomId: z.string().min(1, "Please select a room"),
  checkIn: z.coerce.date({ required_error: "Check-in date is required" }),
  checkOut: z.coerce.date({ required_error: "Check-out date is required" }),
  adults: z.coerce.number().min(1).default(1),
  children: z.coerce.number().min(0).default(0),
  notes: z.string().optional(),
  source: z.string().optional(),
}).refine((data) => data.checkOut > data.checkIn, {
  message: "Check-out must be after check-in",
  path: ["checkOut"],
});

export type CreateBookingInput = z.infer<typeof bookingSchema>;

// ─── Check room availability ───
export async function checkRoomAvailabilityAction(
  roomId: string,
  checkIn: Date,
  checkOut: Date,
  excludeBookingId?: string
): Promise<{ available: boolean; conflictDates?: string }> {
  try {
    const conflict = await prisma.booking.findFirst({
      where: {
        roomId,
        status: { notIn: ["CANCELLED", "CHECKED_OUT"] },
        id: excludeBookingId ? { not: excludeBookingId } : undefined,
        OR: [
          { checkIn: { lt: checkOut }, checkOut: { gt: checkIn } },
        ],
      },
      select: { checkIn: true, checkOut: true },
    });

    if (conflict) {
      const conflictDates = `${conflict.checkIn.toLocaleDateString()} – ${conflict.checkOut.toLocaleDateString()}`;
      return { available: false, conflictDates };
    }

    return { available: true };
  } catch {
    return { available: false };
  }
}

// ─── Get all bookings ───
export async function getBookingsAction(filters?: {
  status?: string;
  search?: string;
}) {
  try {
    const session = await auth();
    if (!session?.user?.hotelId) return [];

    return await prisma.booking.findMany({
      where: {
        hotelId: session.user.hotelId,
        ...(filters?.status && filters.status !== "ALL"
          ? { status: filters.status as any }
          : {}),
        ...(filters?.search
          ? {
              OR: [
                { guest: { name: { contains: filters.search, mode: "insensitive" } } },
                { guest: { email: { contains: filters.search, mode: "insensitive" } } },
                { room: { name: { contains: filters.search, mode: "insensitive" } } },
              ],
            }
          : {}),
      },
      include: {
        room: true,
        guest: true,
      },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
}

// ─── Create booking ───
export async function createBookingAction(
  values: CreateBookingInput
): Promise<ActionResult & { bookingId?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.hotelId) return { success: false, error: "Unauthorized" };

    const parsed = bookingSchema.safeParse(values);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message };
    }

    const { guestName, guestEmail, guestPhone, guestCountry,
            roomId, checkIn, checkOut, adults, children, notes, source } = parsed.data;

    // Validate dates
    if (checkIn < new Date(new Date().setHours(0, 0, 0, 0))) {
      return { success: false, error: "Check-in date cannot be in the past" };
    }

    // Check room exists and belongs to this hotel
    const room = await prisma.room.findFirst({
      where: { id: roomId, hotelId: session.user.hotelId },
    });
    if (!room) return { success: false, error: "Room not found" };

    // Check availability (prevent double booking)
    const availability = await checkRoomAvailabilityAction(roomId, checkIn, checkOut);
    if (!availability.available) {
      return {
        success: false,
        error: `Room is already booked for ${availability.conflictDates}`,
      };
    }

    // Find or create guest
    const guestResult = await findOrCreateGuestAction({
      name: guestName,
      email: guestEmail,
      phone: guestPhone,
      country: guestCountry,
    });
    if (!guestResult.success || !guestResult.guestId) {
      return { success: false, error: guestResult.error };
    }

    // Calculate total price
    const totalPrice = calculateTotalPrice(room.price, checkIn, checkOut);

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        hotelId: session.user.hotelId,
        roomId,
        guestId: guestResult.guestId,
        checkIn,
        checkOut,
        totalPrice,
        adults,
        children,
        notes,
        source: source || "direct",
        status: "CONFIRMED",
      },
    });

    // Update room status to OCCUPIED if checking in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkInDate = new Date(checkIn);
    checkInDate.setHours(0, 0, 0, 0);

    if (checkInDate.getTime() === today.getTime()) {
      await prisma.room.update({
        where: { id: roomId },
        data: { status: "OCCUPIED" },
      });
    }

    revalidatePath("/bookings");
    revalidatePath("/dashboard");
    revalidatePath("/calendar");
    revalidatePath("/rooms");

    return { success: true, bookingId: booking.id };
  } catch (error) {
    console.error("Create booking error:", error);
    return { success: false, error: "Failed to create booking" };
  }
}

// ─── Update booking status ───
export async function updateBookingStatusAction(
  bookingId: string,
  status: "PENDING" | "CONFIRMED" | "CHECKED_IN" | "CHECKED_OUT" | "CANCELLED"
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.hotelId) return { success: false, error: "Unauthorized" };

    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, hotelId: session.user.hotelId },
      include: { room: true },
    });
    if (!booking) return { success: false, error: "Booking not found" };

    await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    });

    // Sync room status
    if (status === "CHECKED_IN") {
      await prisma.room.update({
        where: { id: booking.roomId },
        data: { status: "OCCUPIED" },
      });
    } else if (status === "CHECKED_OUT" || status === "CANCELLED") {
      // Check if room has other active bookings
      const otherActive = await prisma.booking.count({
        where: {
          roomId: booking.roomId,
          status: { in: ["CONFIRMED", "CHECKED_IN"] },
          id: { not: bookingId },
        },
      });
      if (otherActive === 0) {
        await prisma.room.update({
          where: { id: booking.roomId },
          data: { status: "AVAILABLE" },
        });
      }
    }

    revalidatePath("/bookings");
    revalidatePath("/dashboard");
    revalidatePath("/calendar");
    revalidatePath("/rooms");

    return { success: true };
  } catch (error) {
    console.error("Update booking status error:", error);
    return { success: false, error: "Failed to update status" };
  }
}

// ─── Delete booking ───
export async function deleteBookingAction(bookingId: string): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.hotelId) return { success: false, error: "Unauthorized" };

    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, hotelId: session.user.hotelId },
    });
    if (!booking) return { success: false, error: "Booking not found" };

    if (booking.status === "CHECKED_IN") {
      return { success: false, error: "Cannot delete an active check-in" };
    }

    await prisma.booking.delete({ where: { id: bookingId } });

    revalidatePath("/bookings");
    revalidatePath("/dashboard");
    revalidatePath("/calendar");

    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete booking" };
  }
}