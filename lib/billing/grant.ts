import { createServiceClient } from "@/lib/supabase/server"
import { Plan } from "@/types"

type Provider = "razorpay" | "lemonsqueezy"

interface GrantArgs {
  userId: string
  plan: Plan
  provider: Provider
  customerId?: string | null
  subscriptionId?: string | null
  expiresAt?: string | null
}

export async function applyPlan({ userId, plan, provider, customerId, subscriptionId, expiresAt }: GrantArgs): Promise<void> {
  const svc = createServiceClient()
  const { error } = await svc
    .from("profiles")
    .update({
      plan,
      plan_expires_at: expiresAt ?? null,
      billing_provider: provider,
      billing_customer_id: customerId ?? null,
      billing_subscription_id: subscriptionId ?? null,
    })
    .eq("user_id", userId)
  if (error) console.error("applyPlan failed:", error.message)
}

export async function revokeBySubscription(subscriptionId: string): Promise<void> {
  const svc = createServiceClient()
  const { error } = await svc
    .from("profiles")
    .update({ plan: "free", plan_expires_at: null })
    .eq("billing_subscription_id", subscriptionId)
  if (error) console.error("revokeBySubscription failed:", error.message)
}
