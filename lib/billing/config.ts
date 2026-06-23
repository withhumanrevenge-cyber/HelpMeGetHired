import { Plan } from "@/types"

// Prices shown in the UI. Pro is a recurring subscription; Lifetime is one-time.
export const PRICING = {
  proMonthlyUsd: 12,
  proYearlyUsd: 99,
  lifetimeUsd: 149,
  // Razorpay charges in INR. Approximate INR prices (adjust to your conversion).
  proMonthlyInrPaise: 99900,   // ₹999.00
  lifetimeInrPaise: 1199900,   // ₹11,999.00
}

// Maps a Lemon Squeezy variant id (from the webhook payload) back to our plan.
export function planFromLemonVariant(variantId: string | number | undefined): Plan | null {
  const id = String(variantId ?? "")
  if (id && id === process.env.LEMONSQUEEZY_PRO_VARIANT_ID) return "pro"
  if (id && id === process.env.LEMONSQUEEZY_LIFETIME_VARIANT_ID) return "lifetime"
  return null
}

export function lemonVariantForPlan(plan: Plan): string | undefined {
  if (plan === "pro") return process.env.LEMONSQUEEZY_PRO_VARIANT_ID
  if (plan === "lifetime") return process.env.LEMONSQUEEZY_LIFETIME_VARIANT_ID
  return undefined
}
