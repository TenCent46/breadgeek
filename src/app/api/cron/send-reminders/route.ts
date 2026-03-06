import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendBookingReminderEmail } from "@/lib/mail";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find bookings for tomorrow
  const now = new Date();
  const tomorrowStart = new Date(now);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  tomorrowStart.setHours(0, 0, 0, 0);

  const tomorrowEnd = new Date(tomorrowStart);
  tomorrowEnd.setHours(23, 59, 59, 999);

  const bookings = await prisma.booking.findMany({
    where: {
      date: { gte: tomorrowStart, lte: tomorrowEnd },
      status: { in: ["CONFIRMED", "PENDING"] },
    },
    include: {
      customer: { select: { name: true, email: true } },
      service: {
        select: {
          title: true,
          location: true,
          school: { select: { name: true, slug: true, location: true } },
        },
      },
    },
  });

  let sent = 0;
  const errors: string[] = [];

  for (const booking of bookings) {
    if (!booking.customer.email) continue;

    try {
      await sendBookingReminderEmail(booking.customer.email, {
        customerName: booking.customer.name,
        lessonTitle: booking.service.title,
        date: booking.date.toLocaleDateString("ja-JP"),
        time: booking.startTime,
        schoolName: booking.service.school.name,
        schoolSlug: booking.service.school.slug,
        location: booking.service.location || booking.service.school.location || "",
      });
      sent++;
    } catch (e) {
      errors.push(`${booking.id}: ${e instanceof Error ? e.message : "unknown"}`);
    }
  }

  return NextResponse.json({ sent, total: bookings.length, errors });
}
