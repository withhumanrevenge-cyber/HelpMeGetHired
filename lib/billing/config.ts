import { Plan } from "@/types"
import { PLAN_CONFIG } from "@/lib/plans"

export const PRICING = {
  proUsd: PLAN_CONFIG.pro.priceUsd,
  premiumUsd: PLAN_CONFIG.premium.priceUsd,
  proInrPaise: 99900,
  premiumInrPaise: 199900,
}

export function planFromLemonVariant(variantId: string | number | undefined): Plan | null {
  const id = String(variantId ?? "")
  if (id && id === process.env.LEMONSQUEEZY_PRO_VARIANT_ID) return "pro"
  if (id && id === process.env.LEMONSQUEEZY_PREMIUM_VARIANT_ID) return "premium"
  return null
}

export function lemonVariantForPlan(plan: Plan): string | undefined {
  if (plan === "pro") return process.env.LEMONSQUEEZY_PRO_VARIANT_ID
  if (plan === "premium") return process.env.LEMONSQUEEZY_PREMIUM_VARIANT_ID
  return undefined
}

export function razorpayPlanId(plan: Plan): string | undefined {
  if (plan === "pro") return process.env.RAZORPAY_PRO_PLAN_ID
  if (plan === "premium") return process.env.RAZORPAY_PREMIUM_PLAN_ID
  return undefined
}
