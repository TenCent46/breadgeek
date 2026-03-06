import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { reviewSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = reviewSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { serviceId, customerId, rating, comment } = parsed.data;

  // Verify the customer belongs to this user
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
  });

  if (!customer || customer.userId !== session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Check for duplicate review
  const existing = await prisma.review.findFirst({
    where: { serviceId, customerId },
  });

  if (existing) {
    return NextResponse.json({ error: "Already reviewed" }, { status: 409 });
  }

  const review = await prisma.review.create({
    data: {
      serviceId,
      customerId,
      rating,
      comment: comment || "",
    },
  });

  return NextResponse.json({ reviewId: review.id });
}
