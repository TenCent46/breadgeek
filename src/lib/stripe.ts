import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
  typescript: true,
});

// Platform fee percentage (e.g., 3.6%)
export const PLATFORM_FEE_PERCENT = 3.6;
