import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  sendBookingConfirmationEmail,
  sendBookingNotificationToTeacher,
} from "@/lib/mail";
import { updateCustomerTier } from "@/lib/customer-tier";
import { bookingSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = bookingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { serviceId, scheduleId, participants, paymentType, guestName, guestEmail, guestPhone } = parsed.data;

  // Fetch service with schedule and school info
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: {
      school: {
        include: { owner: { select: { email: true } } },
      },
    },
  });

  if (!service || service.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  const schedule = await prisma.serviceSchedule.findUnique({
    where: { id: scheduleId },
  });

  if (!schedule || schedule.serviceId !== serviceId) {
    return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
  }

  // Check availability
  const remaining = schedule.spotsTotal - schedule.spotsTaken;
  if (participants > remaining) {
    return NextResponse.json(
      { error: "Not enough spots available" },
      { status: 409 }
    );
  }

  // Determine customer
  const session = await auth();
  let customerId: string;
  let customerName: string;
  let customerEmail: string;

  if (session?.user) {
    // Logged-in user: find or create customer for this school
    const existing = await prisma.customer.findFirst({
      where: {
        schoolId: service.schoolId,
        userId: session.user.id,
      },
    });

    if (existing) {
      customerId = existing.id;
      customerName = existing.name;
      customerEmail = existing.email;
    } else {
      const customer = await prisma.customer.create({
        data: {
          schoolId: service.schoolId,
          userId: session.user.id,
          name: session.user.name || "ゲスト",
          email: session.user.email || "",
          tier: "TRIAL",
        },
      });
      customerId = customer.id;
      customerName = customer.name;
      customerEmail = customer.email;
    }
  } else {
    // Guest booking
    if (!service.school.allowGuestBooking) {
      return NextResponse.json(
        { error: "Guest booking not allowed. Please log in." },
        { status: 401 }
      );
    }

    if (!guestName || !guestEmail) {
      return NextResponse.json(
        { error: "Name and email are required for guest booking" },
        { status: 400 }
      );
    }

    // Find or create guest customer
    const existing = await prisma.customer.findUnique({
      where: {
        schoolId_email: {
          schoolId: service.schoolId,
          email: guestEmail,
        },
      },
    });

    if (existing) {
      customerId = existing.id;
      customerName = existing.name;
      customerEmail = existing.email;
    } else {
      const customer = await prisma.customer.create({
        data: {
          schoolId: service.schoolId,
          name: guestName,
          email: guestEmail,
          phone: guestPhone || null,
          tier: "TRIAL",
        },
      });
      customerId = customer.id;
      customerName = customer.name;
      customerEmail = customer.email;
    }
  }

  const amount = service.price * participants;

  // Create booking + update schedule in transaction
  const booking = await prisma.$transaction(async (tx) => {
    // Re-check availability inside transaction
    const freshSchedule = await tx.serviceSchedule.findUniqueOrThrow({
      where: { id: scheduleId },
    });
    const freshRemaining = freshSchedule.spotsTotal - freshSchedule.spotsTaken;
    if (participants > freshRemaining) {
      throw new Error("SPOTS_UNAVAILABLE");
    }

    // Update schedule spots
    await tx.serviceSchedule.update({
      where: { id: scheduleId },
      data: { spotsTaken: { increment: participants } },
    });

    // Update customer stats
    await tx.customer.update({
      where: { id: customerId },
      data: {
        visitCount: { increment: 1 },
        totalSpent: { increment: amount },
        lastVisit: new Date(),
      },
    });

    // Create booking (Stripe = PENDING until payment, on_site = CONFIRMED immediately)
    return tx.booking.create({
      data: {
        serviceId,
        customerId,
        scheduleId,
        participants,
        paymentType,
        date: freshSchedule.date,
        startTime: freshSchedule.startTime,
        endTime: freshSchedule.endTime,
        status: paymentType === "stripe" ? "PENDING" : "CONFIRMED",
        amount,
      },
    });
  });

  // Update customer tier (fire and forget)
  updateCustomerTier(customerId).catch(() => {});

  // Format date for emails
  const d = schedule.date;
  const dateStr =
    d instanceof Date
      ? `${d.getMonth() + 1}月${d.getDate()}日`
      : String(d).slice(0, 10);

  // Send emails (fire and forget)
  const emailData = {
    customerName,
    lessonTitle: service.title,
    date: dateStr,
    time: `${schedule.startTime}〜${schedule.endTime}`,
    participants,
    amount,
    schoolName: service.school.name,
    schoolSlug: service.school.slug,
    paymentType,
  };

  // For on_site bookings, create a pending SaleRecord
  if (paymentType === "on_site") {
    const fee = 0; // no platform fee for on-site
    prisma.saleRecord.create({
      data: {
        schoolId: service.schoolId,
        serviceId,
        date: schedule.date,
        serviceName: service.title,
        customerName,
        paymentMethod: "BANK_TRANSFER", // closest to cash/on-site
        amount,
        fee,
        netAmount: amount,
        ingredientCost: 0,
        profit: amount,
        profitMargin: 1,
        status: "PENDING",
      },
    }).catch(() => {}); // fire and forget

  }

  Promise.allSettled([
    sendBookingConfirmationEmail(customerEmail, emailData),
    sendBookingNotificationToTeacher(service.school.owner.email, {
      customerName,
      customerEmail,
      lessonTitle: service.title,
      date: dateStr,
      time: `${schedule.startTime}〜${schedule.endTime}`,
      participants,
      amount,
    }),
  ]).catch(() => {});

  return NextResponse.json({
    bookingId: booking.id,
    status: booking.status,
  });
}
