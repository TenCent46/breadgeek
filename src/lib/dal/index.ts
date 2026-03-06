import { prisma } from "@/lib/prisma";
import type {
  Service, Booking, Customer, Contact, Review,
  DistributionMessage, MessageTemplate, SaleRecord, MonthlySales, MonthlyProfit,
  Ingredient, Recipe, KitchenSettings,
} from "@/lib/types";
import {
  mapServiceType, mapServiceStatus, mapBookingStatus, mapCustomerTier,
  mapMessageChannel, mapMessageStatus, mapPaymentMethod, mapSaleStatus,
  mapIngredientCategory, mapSkillLevel, dateStr,
} from "./mappers";

// ─── Services ───

export async function getServices(schoolId: string): Promise<Service[]> {
  const rows = await prisma.service.findMany({
    where: { schoolId },
    include: { schedules: true },
    orderBy: { createdAt: "desc" },
  });

  return rows.map((s) => ({
    id: s.id,
    type: mapServiceType[s.type],
    title: s.title,
    description: s.description,
    price: s.price,
    status: mapServiceStatus[s.status],
    images: s.images,
    capacity: s.capacity ?? undefined,
    duration: s.duration ?? undefined,
    location: s.location ?? undefined,
    category: s.category,
    linkedRecipeId: s.linkedRecipeId ?? undefined,
    schedules: s.schedules.map((sc) => ({
      id: sc.id,
      date: dateStr(sc.date),
      startTime: sc.startTime,
      endTime: sc.endTime,
      spotsTotal: sc.spotsTotal,
      spotsTaken: sc.spotsTaken,
    })),
    createdAt: dateStr(s.createdAt),
    updatedAt: dateStr(s.updatedAt),
  }));
}

export async function getServiceById(schoolId: string, serviceId: string): Promise<Service | null> {
  const s = await prisma.service.findFirst({
    where: { id: serviceId, schoolId },
    include: { schedules: true },
  });
  if (!s) return null;

  return {
    id: s.id,
    type: mapServiceType[s.type],
    title: s.title,
    description: s.description,
    price: s.price,
    status: mapServiceStatus[s.status],
    images: s.images,
    capacity: s.capacity ?? undefined,
    duration: s.duration ?? undefined,
    location: s.location ?? undefined,
    category: s.category,
    linkedRecipeId: s.linkedRecipeId ?? undefined,
    schedules: s.schedules.map((sc) => ({
      id: sc.id,
      date: dateStr(sc.date),
      startTime: sc.startTime,
      endTime: sc.endTime,
      spotsTotal: sc.spotsTotal,
      spotsTaken: sc.spotsTaken,
    })),
    createdAt: dateStr(s.createdAt),
    updatedAt: dateStr(s.updatedAt),
  };
}

// ─── Bookings ───

export async function getBookings(schoolId: string): Promise<Booking[]> {
  const rows = await prisma.booking.findMany({
    where: { service: { schoolId } },
    include: {
      service: true,
      customer: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return rows.map((b) => ({
    id: b.id,
    serviceId: b.serviceId,
    serviceName: b.service.title,
    serviceType: mapServiceType[b.service.type],
    customerId: b.customerId,
    customerName: b.customer.name,
    customerEmail: b.customer.email,
    date: dateStr(b.date),
    startTime: b.startTime,
    endTime: b.endTime,
    status: mapBookingStatus[b.status],
    amount: b.amount,
    notes: b.notes,
    paymentType: b.paymentType,
    participants: b.participants,
    createdAt: dateStr(b.createdAt),
  }));
}

// ─── Customers ───

export async function getCustomers(schoolId: string): Promise<Customer[]> {
  const rows = await prisma.customer.findMany({
    where: { schoolId },
    include: {
      bookings: {
        include: { service: true },
        orderBy: { date: "desc" },
      },
    },
    orderBy: { registeredAt: "desc" },
  });

  return rows.map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone ?? undefined,
    tier: mapCustomerTier[c.tier],
    totalSpent: c.totalSpent,
    visitCount: c.visitCount,
    lastVisit: dateStr(c.lastVisit),
    registeredAt: dateStr(c.registeredAt),
    tags: c.tags,
    notes: c.notes,
    repeatRate: c.repeatRate,
    favoriteClassTypes: c.favoriteClassTypes,
    skillLevel: mapSkillLevel[c.skillLevel],
    purchases: c.bookings
      .filter((b) => b.status === "CONFIRMED" || b.status === "COMPLETED")
      .map((b) => ({
        id: b.id,
        serviceName: b.service.title,
        amount: b.amount,
        date: dateStr(b.date),
        status: b.status === "COMPLETED" ? "completed" as const : "completed" as const,
      })),
  }));
}

// ─── Contacts ───

export async function getContacts(schoolId: string): Promise<Contact[]> {
  const rows = await prisma.contact.findMany({
    where: { schoolId },
    orderBy: { subscribedAt: "desc" },
  });

  return rows.map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    source: c.source,
    tags: c.tags,
    subscribedAt: dateStr(c.subscribedAt),
    lastOpened: dateStr(c.lastOpened) || undefined,
  }));
}

// ─── Reviews ───

export async function getReviews(schoolId: string): Promise<Review[]> {
  const rows = await prisma.review.findMany({
    where: { service: { schoolId } },
    include: {
      service: true,
      customer: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return rows.map((r) => ({
    id: r.id,
    serviceId: r.serviceId,
    serviceName: r.service.title,
    customerId: r.customerId,
    customerName: r.customer.name,
    rating: r.rating,
    comment: r.comment,
    reply: r.reply ?? undefined,
    repliedAt: r.repliedAt ? dateStr(r.repliedAt) : undefined,
    createdAt: dateStr(r.createdAt),
  }));
}

// ─── Messages ───

export async function getMessages(schoolId: string): Promise<DistributionMessage[]> {
  const rows = await prisma.distributionMessage.findMany({
    where: { schoolId },
    orderBy: { createdAt: "desc" },
  });

  return rows.map((m) => ({
    id: m.id,
    subject: m.subject,
    content: m.content,
    channel: mapMessageChannel[m.channel],
    status: mapMessageStatus[m.status],
    recipientCount: m.recipientCount,
    openRate: m.openRate ?? undefined,
    clickRate: m.clickRate ?? undefined,
    sentAt: m.sentAt ? dateStr(m.sentAt) : undefined,
    scheduledAt: m.scheduledAt ? dateStr(m.scheduledAt) : undefined,
    createdAt: dateStr(m.createdAt),
  }));
}

export async function getMessageTemplates(schoolId: string): Promise<MessageTemplate[]> {
  const rows = await prisma.messageTemplate.findMany({
    where: { schoolId },
  });

  return rows.map((t) => ({
    id: t.id,
    type: t.type as MessageTemplate["type"],
    name: t.name,
    subject: t.subject,
    content: t.content,
    channel: mapMessageChannel[t.channel],
  }));
}

// ─── Sales ───

export async function getSales(schoolId: string): Promise<SaleRecord[]> {
  const rows = await prisma.saleRecord.findMany({
    where: { schoolId },
    orderBy: { date: "desc" },
  });

  return rows.map((s) => ({
    id: s.id,
    date: dateStr(s.date),
    serviceName: s.serviceName,
    customerName: s.customerName,
    paymentMethod: mapPaymentMethod[s.paymentMethod],
    amount: s.amount,
    fee: s.fee,
    netAmount: s.netAmount,
    ingredientCost: s.ingredientCost,
    profit: s.profit,
    profitMargin: s.profitMargin,
    status: mapSaleStatus[s.status],
  }));
}

export async function getMonthlySales(schoolId: string): Promise<MonthlySales[]> {
  const rows = await prisma.saleRecord.findMany({
    where: { schoolId, status: "COMPLETED" },
    orderBy: { date: "asc" },
  });

  const byMonth = new Map<string, { revenue: number; transactions: number }>();
  for (const s of rows) {
    const month = s.date.toISOString().slice(0, 7);
    const entry = byMonth.get(month) || { revenue: 0, transactions: 0 };
    entry.revenue += s.amount;
    entry.transactions += 1;
    byMonth.set(month, entry);
  }

  return Array.from(byMonth.entries()).map(([month, data]) => ({
    month,
    revenue: data.revenue,
    transactions: data.transactions,
  }));
}

export async function getMonthlyProfit(schoolId: string): Promise<MonthlyProfit[]> {
  const sales = await prisma.saleRecord.findMany({
    where: { schoolId, status: "COMPLETED" },
    orderBy: { date: "asc" },
  });

  const settings = await prisma.kitchenSettings.findFirst({
    where: { schoolId },
  });
  const overhead = settings?.defaultOverheadPerLesson ?? 2500;

  const byMonth = new Map<string, {
    revenue: number; ingredientCost: number; platformFees: number; count: number;
  }>();
  for (const s of sales) {
    const month = s.date.toISOString().slice(0, 7);
    const entry = byMonth.get(month) || { revenue: 0, ingredientCost: 0, platformFees: 0, count: 0 };
    entry.revenue += s.amount;
    entry.ingredientCost += s.ingredientCost;
    entry.platformFees += s.fee;
    entry.count += 1;
    byMonth.set(month, entry);
  }

  return Array.from(byMonth.entries()).map(([month, data]) => ({
    month,
    revenue: data.revenue,
    ingredientCost: data.ingredientCost,
    platformFees: data.platformFees,
    overhead: overhead * data.count,
    profit: data.revenue - data.ingredientCost - data.platformFees - overhead * data.count,
  }));
}

// ─── Recipes ───

export async function getRecipes(schoolId: string): Promise<Recipe[]> {
  const rows = await prisma.recipe.findMany({
    where: { schoolId },
    include: {
      ingredients: { include: { ingredient: true } },
      linkedServices: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    servings: r.servings,
    totalCost: r.totalCost,
    costPerServing: r.costPerServing,
    linkedServiceId: r.linkedServices[0]?.id ?? undefined,
    imageUrl: r.imageUrl ?? undefined,
    notes: r.notes,
    ingredients: r.ingredients.map((ri) => ({
      ingredientId: ri.ingredientId,
      ingredientName: ri.ingredient.name,
      quantityGrams: ri.quantityGrams,
    })),
    createdAt: dateStr(r.createdAt),
    updatedAt: dateStr(r.updatedAt),
  }));
}

export async function getRecipeById(schoolId: string, recipeId: string): Promise<Recipe | null> {
  const r = await prisma.recipe.findFirst({
    where: { id: recipeId, schoolId },
    include: {
      ingredients: { include: { ingredient: true } },
      linkedServices: { select: { id: true } },
    },
  });
  if (!r) return null;

  return {
    id: r.id,
    name: r.name,
    description: r.description,
    servings: r.servings,
    totalCost: r.totalCost,
    costPerServing: r.costPerServing,
    linkedServiceId: r.linkedServices[0]?.id ?? undefined,
    imageUrl: r.imageUrl ?? undefined,
    notes: r.notes,
    ingredients: r.ingredients.map((ri) => ({
      ingredientId: ri.ingredientId,
      ingredientName: ri.ingredient.name,
      quantityGrams: ri.quantityGrams,
    })),
    createdAt: dateStr(r.createdAt),
    updatedAt: dateStr(r.updatedAt),
  };
}

// ─── Ingredients ───

export async function getIngredients(schoolId: string): Promise<Ingredient[]> {
  const rows = await prisma.ingredient.findMany({
    where: { schoolId },
    orderBy: { name: "asc" },
  });

  return rows.map((i) => ({
    id: i.id,
    name: i.name,
    currentStockGrams: i.currentStockGrams,
    unitCostPerKg: i.unitCostPerKg,
    supplier: i.supplier,
    reorderThresholdGrams: i.reorderThresholdGrams,
    category: mapIngredientCategory[i.category] as Ingredient["category"],
    lastPurchasedAt: i.lastPurchasedAt ? dateStr(i.lastPurchasedAt) : undefined,
    costHistory: i.costHistory as { date: string; unitCostPerKg: number }[],
    createdAt: dateStr(i.createdAt),
    updatedAt: dateStr(i.updatedAt),
  }));
}

// ─── Kitchen Settings ───

export async function getKitchenSettings(schoolId: string): Promise<KitchenSettings> {
  const row = await prisma.kitchenSettings.findFirst({
    where: { schoolId },
  });

  if (!row) {
    return {
      maxCapacity: 8,
      defaultLessonDuration: 150,
      ingredientReorderLeadDays: 3,
      defaultOverheadPerLesson: 2500,
      platformFeePercent: 3.6,
    };
  }

  return {
    maxCapacity: row.maxCapacity,
    defaultLessonDuration: row.defaultLessonDuration,
    ingredientReorderLeadDays: row.ingredientReorderLeadDays,
    defaultOverheadPerLesson: row.defaultOverheadPerLesson,
    platformFeePercent: row.platformFeePercent,
  };
}

// ─── School Info ───

export async function getSchoolBySlug(slug: string) {
  return prisma.school.findUnique({
    where: { slug },
    include: { owner: { select: { name: true, image: true } } },
  });
}
