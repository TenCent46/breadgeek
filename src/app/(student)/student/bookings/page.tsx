import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { BookingsClient } from "./client";

export default async function StudentBookingsPage() {
  const session = await requireAuth();

  // Find all customer records for this user
  const customers = await prisma.customer.findMany({
    where: { userId: session.user!.id },
    select: { id: true },
  });

  const customerIds = customers.map((c) => c.id);

  const bookings = await prisma.booking.findMany({
    where: { customerId: { in: customerIds } },
    include: {
      service: {
        include: {
          school: { select: { name: true, slug: true, location: true } },
        },
      },
    },
    orderBy: { date: "desc" },
  });

  const now = new Date();
  const upcoming = bookings
    .filter((b) => b.date >= now && b.status !== "CANCELLED")
    .map((b) => ({
      id: b.id,
      lessonTitle: b.service.title,
      schoolName: b.service.school.name,
      schoolSlug: b.service.school.slug,
      location: b.service.school.location || "",
      date: b.date.toISOString(),
      startTime: b.startTime,
      endTime: b.endTime,
      participants: b.participants,
      amount: b.amount,
      status: b.status,
      paymentType: b.paymentType,
      serviceId: b.serviceId,
    }));

  const past = bookings
    .filter((b) => b.date < now || b.status === "CANCELLED")
    .map((b) => ({
      id: b.id,
      lessonTitle: b.service.title,
      schoolName: b.service.school.name,
      schoolSlug: b.service.school.slug,
      location: b.service.school.location || "",
      date: b.date.toISOString(),
      startTime: b.startTime,
      endTime: b.endTime,
      participants: b.participants,
      amount: b.amount,
      status: b.status,
      paymentType: b.paymentType,
      serviceId: b.serviceId,
    }));

  return <BookingsClient upcoming={upcoming} past={past} />;
}
