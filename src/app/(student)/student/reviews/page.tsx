import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { ReviewsClient } from "./client";

export default async function StudentReviewsPage() {
  const session = await requireAuth();

  const customers = await prisma.customer.findMany({
    where: { userId: session.user!.id },
    select: { id: true },
  });
  const customerIds = customers.map((c) => c.id);

  // Get existing reviews
  const reviews = await prisma.review.findMany({
    where: { customerId: { in: customerIds } },
    include: {
      service: {
        select: { title: true, school: { select: { name: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Get completed bookings that don't have reviews yet
  const reviewedServiceIds = reviews.map((r) => r.serviceId);
  const reviewableBookings = await prisma.booking.findMany({
    where: {
      customerId: { in: customerIds },
      date: { lt: new Date() },
      status: { in: ["CONFIRMED", "COMPLETED"] },
      serviceId: { notIn: reviewedServiceIds },
    },
    include: {
      service: {
        select: {
          id: true,
          title: true,
          school: { select: { name: true, slug: true } },
        },
      },
    },
    distinct: ["serviceId"],
    orderBy: { date: "desc" },
  });

  return (
    <ReviewsClient
      reviews={reviews.map((r) => ({
        id: r.id,
        lessonTitle: r.service.title,
        schoolName: r.service.school.name,
        rating: r.rating,
        comment: r.comment,
        reply: r.reply,
        createdAt: r.createdAt.toISOString(),
      }))}
      reviewable={reviewableBookings.map((b) => ({
        serviceId: b.service.id,
        customerId: b.customerId,
        lessonTitle: b.service.title,
        schoolName: b.service.school.name,
      }))}
    />
  );
}
