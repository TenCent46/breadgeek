import { z } from "zod/v4";

export const registerSchema = z.object({
  email: z.email("有効なメールアドレスを入力してください"),
  password: z.string().min(8, "パスワードは8文字以上で入力してください"),
  name: z.string().min(1, "名前を入力してください").max(100),
  role: z.enum(["TEACHER", "STUDENT"]),
});

export const bookingSchema = z.object({
  serviceId: z.string().min(1),
  scheduleId: z.string().min(1),
  participants: z.number().int().min(1).max(50),
  paymentType: z.enum(["on_site", "stripe"]).optional().default("on_site"),
  guestName: z.string().max(100).optional(),
  guestEmail: z.email().optional(),
  guestPhone: z.string().max(20).optional(),
});

export const reviewSchema = z.object({
  serviceId: z.string().min(1),
  customerId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional().default(""),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
});

export const bookingCancelSchema = z.object({
  bookingId: z.string().min(1),
});

export const checkoutSchema = z.object({
  bookingId: z.string().min(1),
});
