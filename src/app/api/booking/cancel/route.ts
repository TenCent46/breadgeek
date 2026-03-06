import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { bookingId } = (await request.json()) as { bookingId: string };
  if (!bookingId) {
    return NextResponse.json({ error: "Missing bookingId" }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { customer: { select: { userId: true } } },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  // Verify the booking belongs to this user
  if (booking.customer.userId !== session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  if (booking.status === "CANCELLED") {
    return NextResponse.json({ error: "Already cancelled" }, { status: 400 });
  }

  // Cancel booking and restore spots
  await prisma.$transaction(async (tx) => {
    await tx.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" },
    });

    if (booking.scheduleId) {
      await tx.serviceSchedule.update({
        where: { id: booking.scheduleId },
        data: { spotsTaken: { decrement: booking.participants } },
      });
    }

    // Decrement customer stats
    await tx.customer.update({
      where: { id: booking.customerId },
      data: {
        visitCount: { decrement: 1 },
        totalSpent: { decrement: booking.amount },
      },
    });
  });

  return NextResponse.json({ status: "cancelled" });
}
