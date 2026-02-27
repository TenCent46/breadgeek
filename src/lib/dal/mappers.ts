import type {
  ServiceType, ServiceStatus, BookingStatus, CustomerTier,
  MessageChannel, MessageStatus,
} from "@/lib/types";
import type {
  ServiceType as PServiceType,
  ServiceStatus as PServiceStatus,
  BookingStatus as PBookingStatus,
  CustomerTier as PCustomerTier,
  MessageChannel as PMessageChannel,
  MessageStatus as PMessageStatus,
  PaymentMethod as PPaymentMethod,
  SaleStatus as PSaleStatus,
  IngredientCategory as PIngredientCategory,
  SkillLevel as PSkillLevel,
} from "@/generated/prisma/client";

// ─── Prisma → Frontend mappers ───

export const mapServiceType: Record<PServiceType, ServiceType> = {
  GROUP_LESSON: "group-lesson",
  MASTER_COURSE: "master-course",
  TRIAL_LESSON: "trial-lesson",
};

export const mapServiceStatus: Record<PServiceStatus, ServiceStatus> = {
  PUBLISHED: "published",
  DRAFT: "draft",
  ARCHIVED: "archived",
};

export const mapBookingStatus: Record<PBookingStatus, BookingStatus> = {
  CONFIRMED: "confirmed",
  PENDING: "pending",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
};

export const mapCustomerTier: Record<PCustomerTier, CustomerTier> = {
  REPEATER: "repeater",
  REGULAR: "regular",
  TRIAL: "trial",
  DORMANT: "dormant",
};

export const mapMessageChannel: Record<PMessageChannel, MessageChannel> = {
  EMAIL: "email",
  LINE: "line",
};

export const mapMessageStatus: Record<PMessageStatus, MessageStatus> = {
  SENT: "sent",
  SCHEDULED: "scheduled",
  DRAFT: "draft",
};

export const mapPaymentMethod: Record<PPaymentMethod, "credit_card" | "bank_transfer" | "convenience_store"> = {
  CREDIT_CARD: "credit_card",
  BANK_TRANSFER: "bank_transfer",
  CONVENIENCE_STORE: "convenience_store",
};

export const mapSaleStatus: Record<PSaleStatus, "completed" | "refunded" | "pending"> = {
  COMPLETED: "completed",
  REFUNDED: "refunded",
  PENDING: "pending",
};

export const mapIngredientCategory: Record<PIngredientCategory, string> = {
  FLOUR: "粉類",
  DAIRY: "乳製品",
  FAT: "油脂",
  YEAST: "酵母",
  SUGAR: "糖類",
  SUB: "副材料",
  OTHER: "その他",
};

export const mapSkillLevel: Record<PSkillLevel, "beginner" | "intermediate" | "advanced"> = {
  BEGINNER: "beginner",
  INTERMEDIATE: "intermediate",
  ADVANCED: "advanced",
};

// ─── Frontend → Prisma reverse mappers ───

export const reverseServiceType: Record<ServiceType, PServiceType> = {
  "group-lesson": "GROUP_LESSON",
  "master-course": "MASTER_COURSE",
  "trial-lesson": "TRIAL_LESSON",
};

export const reverseServiceStatus: Record<ServiceStatus, PServiceStatus> = {
  published: "PUBLISHED",
  draft: "DRAFT",
  archived: "ARCHIVED",
};

export const reverseBookingStatus: Record<BookingStatus, PBookingStatus> = {
  confirmed: "CONFIRMED",
  pending: "PENDING",
  cancelled: "CANCELLED",
  completed: "COMPLETED",
};

export const reverseIngredientCategory: Record<string, PIngredientCategory> = {
  "粉類": "FLOUR",
  "乳製品": "DAIRY",
  "油脂": "FAT",
  "酵母": "YEAST",
  "糖類": "SUGAR",
  "副材料": "SUB",
  "その他": "OTHER",
};

// ─── Date helpers ───

export function dateStr(d: Date | null | undefined): string {
  if (!d) return "";
  return d.toISOString().slice(0, 10);
}
