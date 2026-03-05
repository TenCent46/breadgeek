"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireTeacher } from "@/lib/auth-helpers";
import {
  reverseServiceType, reverseServiceStatus, reverseBookingStatus,
  reverseIngredientCategory,
} from "@/lib/dal/mappers";
import type {
  Service, Booking, Review, Customer, Contact,
  DistributionMessage, Recipe, Ingredient, KitchenSettings,
} from "@/lib/types";
import type { CustomerTier } from "@/generated/prisma/client";

// ─── Services ───

export async function addService(data: Omit<Service, "id" | "createdAt" | "updatedAt">) {
  const { school } = await requireTeacher();

  await prisma.service.create({
    data: {
      schoolId: school.id,
      type: reverseServiceType[data.type],
      title: data.title,
      description: data.description,
      price: data.price,
      status: reverseServiceStatus[data.status],
      images: data.images,
      capacity: data.capacity ?? null,
      duration: data.duration ?? null,
      location: data.location ?? null,
      category: data.category,
      linkedRecipeId: data.linkedRecipeId ?? null,
      schedules: {
        create: data.schedules.map((s) => ({
          date: new Date(s.date),
          startTime: s.startTime,
          endTime: s.endTime,
          spotsTotal: s.spotsTotal,
          spotsTaken: s.spotsTaken,
        })),
      },
    },
  });

  revalidatePath("/dashboard/services");
}

export async function updateService(id: string, data: Partial<Service>) {
  const { school } = await requireTeacher();

  await prisma.service.update({
    where: { id, schoolId: school.id },
    data: {
      ...(data.type && { type: reverseServiceType[data.type] }),
      ...(data.title && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.price !== undefined && { price: data.price }),
      ...(data.status && { status: reverseServiceStatus[data.status] }),
      ...(data.images && { images: data.images }),
      ...(data.capacity !== undefined && { capacity: data.capacity ?? null }),
      ...(data.duration !== undefined && { duration: data.duration ?? null }),
      ...(data.location !== undefined && { location: data.location ?? null }),
      ...(data.category && { category: data.category }),
      ...(data.linkedRecipeId !== undefined && { linkedRecipeId: data.linkedRecipeId ?? null }),
    },
  });

  revalidatePath("/dashboard/services");
  revalidatePath(`/dashboard/services/${id}`);
}

export async function deleteService(id: string) {
  const { school } = await requireTeacher();

  await prisma.service.delete({
    where: { id, schoolId: school.id },
  });

  revalidatePath("/dashboard/services");
}

// ─── Bookings ───

export async function updateBooking(id: string, data: Partial<Pick<Booking, "status" | "notes">>) {
  const { school } = await requireTeacher();

  // Verify booking belongs to this school's service
  const booking = await prisma.booking.findFirst({
    where: { id, service: { schoolId: school.id } },
  });
  if (!booking) return;

  await prisma.booking.update({
    where: { id },
    data: {
      ...(data.status && { status: reverseBookingStatus[data.status] }),
      ...(data.notes !== undefined && { notes: data.notes }),
    },
  });

  revalidatePath("/dashboard/bookings");
}

// ─── Customers ───

export async function updateCustomer(id: string, data: Partial<Pick<Customer, "notes" | "tags">>) {
  const { school } = await requireTeacher();

  await prisma.customer.update({
    where: { id, schoolId: school.id },
    data: {
      ...(data.notes !== undefined && { notes: data.notes }),
      ...(data.tags && { tags: data.tags }),
    },
  });

  revalidatePath("/dashboard/customers");
}

// ─── Reviews ───

export async function updateReview(id: string, data: Pick<Review, "reply">) {
  const { school } = await requireTeacher();

  const review = await prisma.review.findFirst({
    where: { id, service: { schoolId: school.id } },
  });
  if (!review) return;

  await prisma.review.update({
    where: { id },
    data: {
      reply: data.reply,
      repliedAt: new Date(),
    },
  });

  revalidatePath("/dashboard/reviews");
}

// ─── Contacts ───

export async function addContact(data: Omit<Contact, "id">) {
  const { school } = await requireTeacher();

  await prisma.contact.create({
    data: {
      schoolId: school.id,
      name: data.name,
      email: data.email,
      source: data.source,
      tags: data.tags,
    },
  });

  revalidatePath("/dashboard/customers/contacts");
}

export async function deleteContact(id: string) {
  const { school } = await requireTeacher();

  await prisma.contact.delete({
    where: { id, schoolId: school.id },
  });

  revalidatePath("/dashboard/customers/contacts");
}

// ─── Messages ───

interface SendMessageData {
  channel: "email" | "line";
  subject: string;
  content: string;
  status: "sent" | "scheduled" | "draft";
  target: "all" | "repeater" | "trial" | "dormant" | "regular";
  scheduledAt?: string;
}

const TIER_MAP: Record<string, CustomerTier> = {
  repeater: "REPEATER",
  regular: "REGULAR",
  trial: "TRIAL",
  dormant: "DORMANT",
};

async function getTargetCustomers(schoolId: string, target: string) {
  return prisma.customer.findMany({
    where: {
      schoolId,
      email: { not: "" },
      ...(target !== "all" && TIER_MAP[target] ? { tier: TIER_MAP[target] } : {}),
    },
    select: { name: true, email: true },
  });
}

function renderTemplate(template: string, vars: Record<string, string>) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? "");
}

export async function addMessage(data: SendMessageData) {
  const { school } = await requireTeacher();

  // Get target recipients
  const customers = await getTargetCustomers(school.id, data.target);
  const recipientCount = customers.length;

  // Save to DB
  const message = await prisma.distributionMessage.create({
    data: {
      schoolId: school.id,
      subject: data.subject,
      content: data.content,
      channel: data.channel === "email" ? "EMAIL" : "LINE",
      status: data.status === "sent" ? "SENT" : data.status === "scheduled" ? "SCHEDULED" : "DRAFT",
      recipientCount,
      sentAt: data.status === "sent" ? new Date() : null,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
    },
  });

  // Send emails immediately if status is "sent" and channel is "email"
  if (data.status === "sent" && data.channel === "email" && customers.length > 0) {
    const { sendDistributionEmail } = await import("@/lib/mail");
    const results = await Promise.allSettled(
      customers.map((c) => {
        const personalizedContent = renderTemplate(data.content, { name: c.name });
        const personalizedSubject = renderTemplate(data.subject, { name: c.name });
        return sendDistributionEmail(c.email, personalizedSubject, personalizedContent, school.name);
      })
    );

    const successCount = results.filter((r) => r.status === "fulfilled").length;

    // Update actual sent count
    await prisma.distributionMessage.update({
      where: { id: message.id },
      data: { recipientCount: successCount },
    });
  }

  revalidatePath("/dashboard/customers/messages");
  return { recipientCount };
}

export async function updateMessage(id: string, data: Partial<SendMessageData>) {
  const { school } = await requireTeacher();

  await prisma.distributionMessage.update({
    where: { id, schoolId: school.id },
    data: {
      ...(data.subject !== undefined && { subject: data.subject }),
      ...(data.content !== undefined && { content: data.content }),
      ...(data.channel && { channel: data.channel === "email" ? "EMAIL" as const : "LINE" as const }),
      ...(data.status && {
        status: data.status === "sent" ? "SENT" as const : data.status === "scheduled" ? "SCHEDULED" as const : "DRAFT" as const,
      }),
    },
  });

  revalidatePath("/dashboard/customers/messages");
}

export async function deleteMessage(id: string) {
  const { school } = await requireTeacher();

  await prisma.distributionMessage.delete({
    where: { id, schoolId: school.id },
  });

  revalidatePath("/dashboard/customers/messages");
}

// ─── Recipes ───

export async function addRecipe(data: Omit<Recipe, "id" | "createdAt" | "updatedAt">) {
  const { school } = await requireTeacher();

  await prisma.recipe.create({
    data: {
      schoolId: school.id,
      name: data.name,
      description: data.description,
      servings: data.servings,
      totalCost: data.totalCost,
      costPerServing: data.costPerServing,
      imageUrl: data.imageUrl ?? null,
      notes: data.notes,
      ingredients: {
        create: data.ingredients.map((ri) => ({
          ingredientId: ri.ingredientId,
          quantityGrams: ri.quantityGrams,
        })),
      },
    },
  });

  revalidatePath("/dashboard/recipes");
}

export async function updateRecipe(id: string, data: Partial<Recipe>) {
  const { school } = await requireTeacher();

  await prisma.recipe.update({
    where: { id, schoolId: school.id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.servings !== undefined && { servings: data.servings }),
      ...(data.totalCost !== undefined && { totalCost: data.totalCost }),
      ...(data.costPerServing !== undefined && { costPerServing: data.costPerServing }),
      ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl ?? null }),
      ...(data.notes !== undefined && { notes: data.notes }),
    },
  });

  // If ingredients changed, update them
  if (data.ingredients) {
    await prisma.recipeIngredient.deleteMany({ where: { recipeId: id } });
    await prisma.recipeIngredient.createMany({
      data: data.ingredients.map((ri) => ({
        recipeId: id,
        ingredientId: ri.ingredientId,
        quantityGrams: ri.quantityGrams,
      })),
    });
  }

  revalidatePath("/dashboard/recipes");
  revalidatePath(`/dashboard/recipes/${id}`);
}

export async function deleteRecipe(id: string) {
  const { school } = await requireTeacher();

  await prisma.recipe.delete({
    where: { id, schoolId: school.id },
  });

  revalidatePath("/dashboard/recipes");
}

// ─── Ingredients ───

export async function addIngredient(data: Omit<Ingredient, "id" | "createdAt" | "updatedAt" | "costHistory">) {
  const { school } = await requireTeacher();

  await prisma.ingredient.create({
    data: {
      schoolId: school.id,
      name: data.name,
      currentStockGrams: data.currentStockGrams,
      unitCostPerKg: data.unitCostPerKg,
      supplier: data.supplier,
      reorderThresholdGrams: data.reorderThresholdGrams,
      category: reverseIngredientCategory[data.category],
      costHistory: [{ date: new Date().toISOString().slice(0, 10), unitCostPerKg: data.unitCostPerKg }],
    },
  });

  revalidatePath("/dashboard/ingredients");
}

export async function updateIngredient(id: string, data: Partial<Ingredient>) {
  const { school } = await requireTeacher();

  await prisma.ingredient.update({
    where: { id, schoolId: school.id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.currentStockGrams !== undefined && { currentStockGrams: data.currentStockGrams }),
      ...(data.unitCostPerKg !== undefined && { unitCostPerKg: data.unitCostPerKg }),
      ...(data.supplier && { supplier: data.supplier }),
      ...(data.reorderThresholdGrams !== undefined && { reorderThresholdGrams: data.reorderThresholdGrams }),
      ...(data.category && { category: reverseIngredientCategory[data.category] }),
      ...(data.costHistory && { costHistory: data.costHistory }),
    },
  });

  revalidatePath("/dashboard/ingredients");
}

export async function deleteIngredient(id: string) {
  const { school } = await requireTeacher();

  await prisma.ingredient.delete({
    where: { id, schoolId: school.id },
  });

  revalidatePath("/dashboard/ingredients");
}

// ─── Kitchen Settings ───

export async function updateKitchenSettings(data: KitchenSettings) {
  const { school } = await requireTeacher();

  await prisma.kitchenSettings.upsert({
    where: { schoolId: school.id },
    update: {
      maxCapacity: data.maxCapacity,
      defaultLessonDuration: data.defaultLessonDuration,
      ingredientReorderLeadDays: data.ingredientReorderLeadDays,
      defaultOverheadPerLesson: data.defaultOverheadPerLesson,
      platformFeePercent: data.platformFeePercent,
    },
    create: {
      schoolId: school.id,
      maxCapacity: data.maxCapacity,
      defaultLessonDuration: data.defaultLessonDuration,
      ingredientReorderLeadDays: data.ingredientReorderLeadDays,
      defaultOverheadPerLesson: data.defaultOverheadPerLesson,
      platformFeePercent: data.platformFeePercent,
    },
  });

  revalidatePath("/dashboard/settings");
}

// ─── Slug Check ───

export async function checkSlugAvailability(slug: string): Promise<boolean> {
  const existing = await prisma.school.findUnique({
    where: { slug },
    select: { id: true },
  });
  return !existing;
}

// ─── Onboarding ───

interface OnboardingData {
  url: string;
  activityName: string;
  title: string;
  imageUrl: string | null;
  themeType: string;
  themeColor: string;
  socialLinks: { platform: string; username: string }[];
}

export async function saveOnboarding(data: OnboardingData) {
  const { school } = await requireTeacher();

  const snsMap: Record<string, string> = {};
  for (const link of data.socialLinks) {
    snsMap[link.platform] = link.username;
  }

  await prisma.school.update({
    where: { id: school.id },
    data: {
      slug: data.url,
      name: data.activityName || school.name,
      title: data.title,
      imageUrl: data.imageUrl,
      themeType: data.themeType,
      themeColor: data.themeColor,
      instagram: snsMap["instagram"] || "",
      x: snsMap["x"] || "",
      youtube: snsMap["youtube"] || "",
      line: snsMap["line"] || "",
      tiktok: snsMap["tiktok"] || "",
    },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/p/${data.url}`);
}

// ─── School Profile ───

interface SchoolProfileData {
  name: string;
  description: string;
  location: string;
  imageUrl: string | null;
  title: string;
  features: string;
  category: string;
  tags: string[];
  phone: string;
  instagram: string;
  x: string;
  youtube: string;
  line: string;
  tiktok: string;
}

export async function updateSchoolProfile(data: Partial<SchoolProfileData>) {
  const { school } = await requireTeacher();

  await prisma.school.update({
    where: { id: school.id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.location !== undefined && { location: data.location }),
      ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
      ...(data.title !== undefined && { title: data.title }),
      ...(data.features !== undefined && { features: data.features }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.tags !== undefined && { tags: data.tags }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.instagram !== undefined && { instagram: data.instagram }),
      ...(data.x !== undefined && { x: data.x }),
      ...(data.youtube !== undefined && { youtube: data.youtube }),
      ...(data.line !== undefined && { line: data.line }),
      ...(data.tiktok !== undefined && { tiktok: data.tiktok }),
    },
  });

  revalidatePath("/dashboard/profile/edit");
  revalidatePath(`/p/${school.slug}`);
}
