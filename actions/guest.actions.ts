"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ActionResult } from "./auth.actions";

const guestSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  address: z.string().optional(),
  country: z.string().optional(),
  notes: z.string().optional(),
});

export async function getGuestsAction() {
  try {
    const session = await auth();
    if (!session?.user?.hotelId) return [];

    return await prisma.guest.findMany({
      where: { hotelId: session.user.hotelId },
      include: {
        _count: { select: { bookings: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
}

export async function findOrCreateGuestAction(values: {
  name: string;
  email: string;
  phone?: string;
  country?: string;
}): Promise<{ success: boolean; guestId?: string; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.hotelId) return { success: false, error: "Unauthorized" };

    // Try to find existing guest by email
    let guest = await prisma.guest.findUnique({
      where: {
        email_hotelId: {
          email: values.email,
          hotelId: session.user.hotelId,
        },
      },
    });

    // Create if not found
    if (!guest) {
      guest = await prisma.guest.create({
        data: {
          name: values.name,
          email: values.email,
          phone: values.phone,
          country: values.country,
          hotelId: session.user.hotelId,
        },
      });
    } else {
      // Update guest info if they already exist
      guest = await prisma.guest.update({
        where: { id: guest.id },
        data: {
          name: values.name,
          phone: values.phone ?? guest.phone,
          country: values.country ?? guest.country,
        },
      });
    }

    return { success: true, guestId: guest.id };
  } catch (error) {
    console.error("Find or create guest error:", error);
    return { success: false, error: "Failed to process guest" };
  }
}

export async function updateGuestAction(
  guestId: string,
  values: z.infer<typeof guestSchema>
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.hotelId) return { success: false, error: "Unauthorized" };

    await prisma.guest.update({
      where: { id: guestId, hotelId: session.user.hotelId },
      data: values,
    });

    revalidatePath("/guests");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update guest" };
  }
}

export async function deleteGuestAction(guestId: string): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.hotelId) return { success: false, error: "Unauthorized" };

    const activeBookings = await prisma.booking.count({
      where: {
        guestId,
        hotelId: session.user.hotelId,
        status: { in: ["PENDING", "CONFIRMED", "CHECKED_IN"] },
      },
    });

    if (activeBookings > 0) {
      return {
        success: false,
        error: `Cannot delete — guest has ${activeBookings} active booking(s)`,
      };
    }

    await prisma.guest.delete({
      where: { id: guestId, hotelId: session.user.hotelId },
    });

    revalidatePath("/guests");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete guest" };
  }
}