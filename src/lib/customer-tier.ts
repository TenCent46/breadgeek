import { prisma } from "@/lib/prisma";
import type { CustomerTier } from "@/generated/prisma/client";

/**
 * Auto-update customer tier based on visit count and last visit.
 * - visitCount >= 5 → REPEATER
 * - visitCount >= 2 → REGULAR
 * - 90+ days since last visit → DORMANT
 * - else → TRIAL
 */
export async function updateCustomerTier(customerId: string) {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: { visitCount: true, lastVisit: true, tier: true },
  });

  if (!customer) return;

  let newTier: CustomerTier;

  const daysSinceLastVisit = customer.lastVisit
    ? Math.floor((Date.now() - customer.lastVisit.getTime()) / (1000 * 60 * 60 * 24))
    : Infinity;

  if (daysSinceLastVisit >= 90 && customer.visitCount >= 1) {
    newTier = "DORMANT";
  } else if (customer.visitCount >= 5) {
    newTier = "REPEATER";
  } else if (customer.visitCount >= 2) {
    newTier = "REGULAR";
  } else {
    newTier = "TRIAL";
  }

  if (newTier !== customer.tier) {
    await prisma.customer.update({
      where: { id: customerId },
      data: { tier: newTier },
    });
  }
}
