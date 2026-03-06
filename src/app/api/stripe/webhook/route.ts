import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.bookingId;
      if (!bookingId) break;

      // Update booking status to CONFIRMED
      const booking = await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: "CONFIRMED",
          paymentType: "stripe",
        },
        include: {
          service: {
            include: {
              school: { select: { id: true } },
              linkedRecipe: {
                select: { costPerServing: true, servings: true },
              },
            },
          },
          customer: { select: { name: true } },
        },
      });

      // Auto-create SaleRecord
      const amountReceived = session.amount_total || booking.amount;
      const fee = Math.round(amountReceived * 0.036); // platform fee
      const netAmount = amountReceived - fee;

      // Calculate ingredient cost from linked recipe
      let ingredientCost = 0;
      if (booking.service.linkedRecipe) {
        const recipe = booking.service.linkedRecipe;
        ingredientCost = Math.round(
          (recipe.costPerServing / recipe.servings) * booking.participants
        );
      }

      const profit = netAmount - ingredientCost;
      const profitMargin = netAmount > 0 ? profit / netAmount : 0;

      await prisma.saleRecord.create({
        data: {
          schoolId: booking.service.school.id,
          serviceId: booking.serviceId,
          date: booking.date,
          serviceName: booking.service.title,
          customerName: booking.customer.name,
          paymentMethod: "CREDIT_CARD",
          amount: amountReceived,
          fee,
          netAmount,
          ingredientCost,
          profit,
          profitMargin,
          status: "COMPLETED",
        },
      });

      break;
    }

    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      const paymentIntent = charge.payment_intent as string;
      if (!paymentIntent) break;

      // Find the checkout session by payment intent to get bookingId
      const sessions = await stripe.checkout.sessions.list({
        payment_intent: paymentIntent,
        limit: 1,
      });

      const bookingId = sessions.data[0]?.metadata?.bookingId;
      if (!bookingId) break;

      // Update booking to cancelled
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { service: { select: { school: { select: { id: true } } } } },
      });

      if (booking) {
        await prisma.booking.update({
          where: { id: bookingId },
          data: { status: "CANCELLED" },
        });

        // Restore spots
        if (booking.scheduleId) {
          await prisma.serviceSchedule.update({
            where: { id: booking.scheduleId },
            data: { spotsTaken: { decrement: booking.participants } },
          });
        }

        // Mark sale as refunded
        await prisma.saleRecord.updateMany({
          where: {
            schoolId: booking.service.school.id,
            serviceId: booking.serviceId,
            customerName: { not: "" },
            amount: booking.amount,
          },
          data: { status: "REFUNDED" },
        });
      }

      break;
    }
  }

  return NextResponse.json({ received: true });
}
