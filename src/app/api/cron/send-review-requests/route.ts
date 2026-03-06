import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendReviewRequestEmail } from "@/lib/mail";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find bookings that happened yesterday and are COMPLETED, with no existing review
  const now = new Date();
  const yesterdayStart = new Date(now);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  yesterdayStart.setHours(0, 0, 0, 0);

  const yesterdayEnd = new Date(yesterdayStart);
  yesterdayEnd.setHours(23, 59, 59, 999);

  const bookings = await prisma.booking.findMany({
    where: {
      date: { gte: yesterdayStart, lte: yesterdayEnd },
      status: "COMPLETED",
    },
    include: {
      customer: { select: { id: true, name: true, email: true } },
      service: {
        select: {
          id: true,
          title: true,
          school: { select: { name: true, slug: true } },
        },
      },
    },
  });

  let sent = 0;
  const errors: string[] = [];

  for (const booking of bookings) {
    if (!booking.customer.email) continue;

    // Check if review already exists for this customer+service
    const existingReview = await prisma.review.findFirst({
      where: {
        customerId: booking.customer.id,
        serviceId: booking.service.id,
      },
    });
    if (existingReview) continue;

    try {
      await sendReviewRequestEmail(booking.customer.email, {
        customerName: booking.customer.name,
        lessonTitle: booking.service.title,
        schoolName: booking.service.school.name,
        reviewUrl: `${BASE_URL}/student/reviews`,
      });
      sent++;
    } catch (e) {
      errors.push(`${booking.id}: ${e instanceof Error ? e.message : "unknown"}`);
    }
  }

  return NextResponse.json({ sent, total: bookings.length, errors });
}
