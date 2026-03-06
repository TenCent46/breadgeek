import { NextRequest, NextResponse } from "next/server";
import { stripe, PLATFORM_FEE_PERCENT } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface CheckoutRequest {
  bookingId: string;
}

export async function POST(request: NextRequest) {
  const session = await auth();
  const body = (await request.json()) as CheckoutRequest;
  const { bookingId } = body;

  if (!bookingId) {
    return NextResponse.json({ error: "Missing bookingId" }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      service: {
        include: {
          school: { select: { stripeAccountId: true, stripeOnboarded: true, slug: true, name: true } },
        },
      },
      customer: { select: { email: true, name: true } },
    },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const school = booking.service.school;
  if (!school.stripeAccountId || !school.stripeOnboarded) {
    return NextResponse.json(
      { error: "This school has not set up payment processing" },
      { status: 400 }
    );
  }

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const platformFee = Math.round(booking.amount * (PLATFORM_FEE_PERCENT / 100));

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "jpy",
          product_data: {
            name: booking.service.title,
            description: `${school.name} - ${booking.participants}名`,
          },
          unit_amount: booking.amount,
        },
        quantity: 1,
      },
    ],
    payment_intent_data: {
      application_fee_amount: platformFee,
      transfer_data: {
        destination: school.stripeAccountId,
      },
    },
    customer_email: session?.user?.email || booking.customer.email,
    metadata: {
      bookingId: booking.id,
      schoolSlug: school.slug,
    },
    success_url: `${baseUrl}/p/${school.slug}/complete?bookingId=${booking.id}`,
    cancel_url: `${baseUrl}/p/${school.slug}/${booking.serviceId}`,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
