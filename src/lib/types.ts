// ─── Service ───
export type ServiceType = "group-lesson" | "master-course" | "trial-lesson";
export type ServiceStatus = "published" | "draft" | "archived";

export interface ServiceSchedule {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  spotsTotal: number;
  spotsTaken: number;
}

export interface Service {
  id: string;
  type: ServiceType;
  title: string;
  description: string;
  price: number;
  status: ServiceStatus;
  images: string[];
  capacity?: number;
  duration?: number;
  location?: string;
  schedules: ServiceSchedule[];
  category: string;
  linkedRecipeId?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Booking ───
export type BookingStatus = "confirmed" | "pending" | "cancelled" | "completed";

export interface Booking {
  id: string;
  serviceId: string;
  serviceName: string;
  serviceType: ServiceType;
  customerId: string;
  customerName: string;
  customerEmail: string;
  date: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  amount: number;
  notes: string;
  createdAt: string;
}

// ─── Customer ───
export type CustomerTier = "repeater" | "regular" | "trial" | "dormant";

export interface Purchase {
  id: string;
  serviceName: string;
  amount: number;
  date: string;
  status: "completed" | "refunded";
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  tier: CustomerTier;
  totalSpent: number;
  visitCount: number;
  lastVisit: string;
  registeredAt: string;
  tags: string[];
  notes: string;
  purchases: Purchase[];
  repeatRate: number;
  favoriteClassTypes: string[];
  skillLevel: "beginner" | "intermediate" | "advanced";
}

// ─── Contact ───
export interface Contact {
  id: string;
  name: string;
  email: string;
  source: string;
  tags: string[];
  subscribedAt: string;
  lastOpened?: string;
}

// ─── Review ───
export interface Review {
  id: string;
  serviceId: string;
  serviceName: string;
  customerId: string;
  customerName: string;
  rating: number;
  comment: string;
  reply?: string;
  repliedAt?: string;
  createdAt: string;
}

// ─── Message ───
export type MessageChannel = "email" | "line";
export type MessageStatus = "sent" | "scheduled" | "draft";
export type MessageTemplateType = "post-lesson-followup" | "next-booking-nudge" | "announcement";

export interface DistributionMessage {
  id: string;
  subject: string;
  content: string;
  channel: MessageChannel;
  status: MessageStatus;
  recipientCount: number;
  openRate?: number;
  clickRate?: number;
  sentAt?: string;
  scheduledAt?: string;
  createdAt: string;
}

export interface MessageTemplate {
  id: string;
  type: MessageTemplateType;
  name: string;
  subject: string;
  content: string;
  channel: MessageChannel;
}

// ─── Sales ───
export interface SaleRecord {
  id: string;
  date: string;
  serviceName: string;
  customerName: string;
  paymentMethod: "credit_card" | "bank_transfer" | "convenience_store";
  amount: number;
  fee: number;
  netAmount: number;
  ingredientCost: number;
  profit: number;
  profitMargin: number;
  status: "completed" | "refunded" | "pending";
}

export interface MonthlySales {
  month: string;
  revenue: number;
  transactions: number;
}

export interface MonthlyProfit {
  month: string;
  revenue: number;
  ingredientCost: number;
  platformFees: number;
  overhead: number;
  profit: number;
}

// ─── Ingredient ───
export interface Ingredient {
  id: string;
  name: string;
  currentStockGrams: number;
  unitCostPerKg: number;
  supplier: string;
  reorderThresholdGrams: number;
  category: "粉類" | "乳製品" | "油脂" | "酵母" | "糖類" | "副材料" | "その他";
  lastPurchasedAt?: string;
  costHistory: { date: string; unitCostPerKg: number }[];
  createdAt: string;
  updatedAt: string;
}

// ─── Recipe ───
export interface RecipeIngredient {
  ingredientId: string;
  ingredientName: string;
  quantityGrams: number;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  servings: number;
  ingredients: RecipeIngredient[];
  totalCost: number;
  costPerServing: number;
  linkedServiceId?: string;
  imageUrl?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Profit ───
export interface LessonProfitCalc {
  serviceId: string;
  serviceName: string;
  price: number;
  capacity: number;
  attendees: number;
  recipeId?: string;
  ingredientCostPerPerson: number;
  platformFeePercent: number;
  estimatedOverhead: number;
  revenue: number;
  totalCost: number;
  profit: number;
  profitMargin: number;
  breakEvenAttendees: number;
}

// ─── Analytics ───
export interface LessonUtilization {
  serviceId: string;
  serviceName: string;
  capacity: number;
  actualAttendees: number;
  utilizationPercent: number;
  totalRevenue: number;
  perSeatRevenue: number;
}

export interface StudentAnalytics {
  customerId: string;
  customerName: string;
  totalLessons: number;
  repeatBookings: number;
  repeatRate30: number;
  repeatRate60: number;
  repeatRate90: number;
  ltv: number;
  favoriteClassTypes: string[];
  skillLevel: "beginner" | "intermediate" | "advanced";
}

// ─── Kitchen Settings ───
export interface KitchenSettings {
  maxCapacity: number;
  defaultLessonDuration: number;
  ingredientReorderLeadDays: number;
  defaultOverheadPerLesson: number;
  platformFeePercent: number;
}

// ─── Settings ───
export interface NotificationPreference {
  email: boolean;
  push: boolean;
  line: boolean;
}
