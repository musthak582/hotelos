"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ActionResult } from "./auth.actions";

const roomSchema = z.object({
  name: z.string().min(1, "Room name is required"),
  type: z.enum(["STANDARD", "DELUXE", "SUITE", "PENTHOUSE"]),
  price: z.coerce.number().min(1, "Price must be greater than 0"),
  capacity: z.coerce.number().min(1).max(20),
  floor: z.coerce.number().optional(),
  description: z.string().optional(),
  amenities: z.array(z.string()).optional(),
});

export type RoomActionResult = ActionResult & { roomId?: string };

// ─── Get all rooms for the current hotel ───
export async function getRoomsAction() {
  try {
    const session = await auth();
    if (!session?.user?.hotelId) return [];

    return await prisma.room.findMany({
      where: { hotelId: session.user.hotelId },
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
  } catch (error) {
    console.error("Get rooms error:", error);
    return [];
  }
}

// ─── Create room ───
export async function createRoomAction(
  values: z.infer<typeof roomSchema>
): Promise<RoomActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.hotelId) return { success: false, error: "Unauthorized" };

    const parsed = roomSchema.safeParse(values);
    if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

    // Check for duplicate room name in this hotel
    const existing = await prisma.room.findFirst({
      where: { hotelId: session.user.hotelId, name: parsed.data.name },
    });
    if (existing) return { success: false, error: "A room with this name already exists" };

    const room = await prisma.room.create({
      data: {
        ...parsed.data,
        amenities: parsed.data.amenities ?? [],
        hotelId: session.user.hotelId,
      },
    });

    revalidatePath("/rooms");
    revalidatePath("/dashboard");
    return { success: true, roomId: room.id };
  } catch (error) {
    console.error("Create room error:", error);
    return { success: false, error: "Failed to create room" };
  }
}

// ─── Update room ───
export async function updateRoomAction(
  roomId: string,
  values: z.infer<typeof roomSchema>
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.hotelId) return { success: false, error: "Unauthorized" };

    const parsed = roomSchema.safeParse(values);
    if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

    // Verify ownership
    const room = await prisma.room.findFirst({
      where: { id: roomId, hotelId: session.user.hotelId },
    });
    if (!room) return { success: false, error: "Room not found" };

    // Check duplicate name (excluding self)
    const duplicate = await prisma.room.findFirst({
      where: {
        hotelId: session.user.hotelId,
        name: parsed.data.name,
        NOT: { id: roomId },
      },
    });
    if (duplicate) return { success: false, error: "A room with this name already exists" };

    await prisma.room.update({
      where: { id: roomId },
      data: {
        ...parsed.data,
        amenities: parsed.data.amenities ?? [],
      },
    });

    revalidatePath("/rooms");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Update room error:", error);
    return { success: false, error: "Failed to update room" };
  }
}

// ─── Update room status only ───
export async function updateRoomStatusAction(
  roomId: string,
  status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE"
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.hotelId) return { success: false, error: "Unauthorized" };

    await prisma.room.update({
      where: { id: roomId, hotelId: session.user.hotelId },
      data: { status },
    });

    revalidatePath("/rooms");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update status" };
  }
}

// ─── Delete room ───
export async function deleteRoomAction(roomId: string): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.hotelId) return { success: false, error: "Unauthorized" };

    // Check for active bookings
    const activeBookings = await prisma.booking.count({
      where: {
        roomId,
        hotelId: session.user.hotelId,
        status: { in: ["PENDING", "CONFIRMED", "CHECKED_IN"] },
      },
    });

    if (activeBookings > 0) {
      return {
        success: false,
        error: `Cannot delete — this room has ${activeBookings} active booking(s)`,
      };
    }

    await prisma.room.delete({
      where: { id: roomId, hotelId: session.user.hotelId },
    });

    revalidatePath("/rooms");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Delete room error:", error);
    return { success: false, error: "Failed to delete room" };
  }
}