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

export async function addMessage(data: Omit<DistributionMessage, "id" | "createdAt">) {
  const { school } = await requireTeacher();

  await prisma.distributionMessage.create({
    data: {
      schoolId: school.id,
      subject: data.subject,
      content: data.content,
      channel: data.channel === "email" ? "EMAIL" : "LINE",
      status: data.status === "sent" ? "SENT" : data.status === "scheduled" ? "SCHEDULED" : "DRAFT",
      recipientCount: data.recipientCount,
      openRate: data.openRate ?? null,
      clickRate: data.clickRate ?? null,
      sentAt: data.sentAt ? new Date(data.sentAt) : null,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
    },
  });

  revalidatePath("/dashboard/customers/messages");
}

export async function updateMessage(id: string, data: Partial<DistributionMessage>) {
  const { school } = await requireTeacher();

  await prisma.distributionMessage.update({
    where: { id, schoolId: school.id },
    data: {
      ...(data.subject && { subject: data.subject }),
      ...(data.content && { content: data.content }),
      ...(data.channel && { channel: data.channel === "email" ? "EMAIL" as const : "LINE" as const }),
      ...(data.status && {
        status: data.status === "sent" ? "SENT" as const : data.status === "scheduled" ? "SCHEDULED" as const : "DRAFT" as const,
      }),
      ...(data.recipientCount !== undefined && { recipientCount: data.recipientCount }),
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
