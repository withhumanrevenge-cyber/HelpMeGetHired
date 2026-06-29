import { createServiceClient } from "@/lib/supabase/server"
import { UsageAction, Plan } from "@/types"
import { PLAN_CONFIG, CREDIT_COST, effectivePlan } from "@/lib/plans"

function startOfMonthISO(): string {
  const d = new Date()
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString()
}

export async function creditsUsedThisMonth(userId: string): Promise<number> {
  const svc = createServiceClient()
  const { data } = await svc
    .from("usage_events")
    .select("credits")
    .eq("user_id", userId)
    .gte("created_at", startOfMonthISO())
  return (data ?? []).reduce((sum, e) => sum + (e.credits ?? 0), 0)
}

export interface CreditState {
  plan: Plan
  allotment: number
  used: number
  remaining: number
}

export async function getCreditState(userId: string): Promise<CreditState> {
  const svc = createServiceClient()
  const { data: profile } = await svc
    .from("profiles")
    .select("plan, plan_expires_at")
    .eq("user_id", userId)
    .single()
  const plan = effectivePlan(profile ?? {})
  const allotment = PLAN_CONFIG[plan].credits
  const used = await creditsUsedThisMonth(userId)
  return { plan, allotment, used, remaining: Math.max(0, allotment - used) }
}

export async function logUsage(userId: string, action: UsageAction, credits: number, tokens = 0, model: string | null = null): Promise<void> {
  const svc = createServiceClient()
  const { error } = await svc.from("usage_events").insert({ user_id: userId, action, credits, tokens, model })
  if (error) console.error("Failed to log usage event:", error.message)
}

export async function logTokens(userId: string, tokens: number, model: string): Promise<void> {
  if (!userId || !tokens) return
  const svc = createServiceClient()
  const { error } = await svc.from("usage_events").insert({ user_id: userId, action: "ai_call", tokens, model, credits: 0 })
  if (error) console.error("Failed to log token usage:", error.message)
}

function creditMessage(plan: Plan): string {
  return plan === "free"
    ? "You're out of credits this month. Upgrade to Pro or Premium for more."
    : "You're out of credits this month. They reset next month — or upgrade your plan for more."
}

export async function gateAction(userId: string, action: UsageAction): Promise<{ allowed: boolean; message?: string }> {
  const svc = createServiceClient()
  const { data: profile } = await svc
    .from("profiles")
    .select("plan, plan_expires_at")
    .eq("user_id", userId)
    .single()

  const plan = effectivePlan(profile ?? {})
  const allotment = PLAN_CONFIG[plan].credits
  const cost = CREDIT_COST[action]

  const { data, error } = await svc.rpc("consume_credits", {
    p_user_id: userId,
    p_action: action,
    p_cost: cost,
    p_allotment: allotment,
  })

  if (error) {
    console.warn("consume_credits RPC unavailable, falling back:", error.message)
    const used = await creditsUsedThisMonth(userId)
    if (used + cost > allotment) return { allowed: false, message: creditMessage(plan) }
    await logUsage(userId, action, cost)
    return { allowed: true }
  }

  return data === true ? { allowed: true } : { allowed: false, message: creditMessage(plan) }
}

export async function refundUsage(userId: string, action: UsageAction): Promise<void> {
  const svc = createServiceClient()
  const { data } = await svc
    .from("usage_events")
    .select("id")
    .eq("user_id", userId)
    .eq("action", action)
    .gte("created_at", startOfMonthISO())
    .order("created_at", { ascending: false })
    .limit(1)
  const id = data?.[0]?.id
  if (id) await svc.from("usage_events").delete().eq("id", id)
}
