import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { requireTeacher } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export async function POST() {
  const { school } = await requireTeacher();

  let accountId = school.stripeAccountId;

  // Create Stripe account if not exists
  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "standard",
      country: "JP",
      metadata: { schoolId: school.id },
    });
    accountId = account.id;
    await prisma.school.update({
      where: { id: school.id },
      data: { stripeAccountId: accountId },
    });
  }

  // Create account link for onboarding
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${baseUrl}/api/stripe/connect/callback?refresh=1`,
    return_url: `${baseUrl}/api/stripe/connect/callback`,
    type: "account_onboarding",
  });

  return NextResponse.json({ url: accountLink.url });
}
