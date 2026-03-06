import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { requireTeacher } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { school } = await requireTeacher();
  const refresh = request.nextUrl.searchParams.get("refresh");

  if (!school.stripeAccountId) {
    return NextResponse.redirect(new URL("/dashboard/settings", request.url));
  }

  // If refresh, the user needs to redo onboarding
  if (refresh) {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const accountLink = await stripe.accountLinks.create({
      account: school.stripeAccountId,
      refresh_url: `${baseUrl}/api/stripe/connect/callback?refresh=1`,
      return_url: `${baseUrl}/api/stripe/connect/callback`,
      type: "account_onboarding",
    });
    return NextResponse.redirect(accountLink.url);
  }

  // Check if onboarding is complete
  const account = await stripe.accounts.retrieve(school.stripeAccountId);
  const isOnboarded = account.charges_enabled && account.payouts_enabled;

  if (isOnboarded && !school.stripeOnboarded) {
    await prisma.school.update({
      where: { id: school.id },
      data: { stripeOnboarded: true },
    });
  }

  return NextResponse.redirect(new URL("/dashboard/settings?tab=payment", request.url));
}
