"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ActionResult } from "./auth.actions";

const hotelSchema = z.object({
  name: z.string().min(2),
  location: z.string().min(2),
  description: z.string().optional(),
});

export async function createHotelAction(
  values: z.infer<typeof hotelSchema>
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const existing = await prisma.hotel.findUnique({
      where: { ownerId: session.user.id },
    });
    if (existing) return { success: false, error: "Hotel already exists" };

    const parsed = hotelSchema.safeParse(values);
    if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

    await prisma.hotel.create({
      data: {
        name: parsed.data.name,
        location: parsed.data.location,
        description: parsed.data.description,
        ownerId: session.user.id,
      },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Create hotel error:", error);
    return { success: false, error: "Failed to create hotel" };
  }
}

export async function updateHotelAction(
  values: z.infer<typeof hotelSchema> & { phone?: string; email?: string }
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.hotelId) return { success: false, error: "Unauthorized" };

    await prisma.hotel.update({
      where: { id: session.user.hotelId },
      data: {
        name: values.name,
        location: values.location,
        description: values.description,
        phone: values.phone,
        email: values.email,
      },
    });

    revalidatePath("/settings");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Update hotel error:", error);
    return { success: false, error: "Failed to update hotel" };
  }
}