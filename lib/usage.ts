import { createServiceClient } from "@/lib/supabase/server"
import { UsageAction } from "@/types"
import { PLAN_LIMITS, effectivePlan } from "@/lib/plans"

// Start of the current calendar month (UTC) — the window quotas reset on.
function startOfMonthISO(): string {
  const d = new Date()
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString()
}

// How many times the user has performed `action` this calendar month.
export async function monthlyCount(userId: string, action: UsageAction): Promise<number> {
  const svc = createServiceClient()
  const { count } = await svc
    .from("usage_events")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("action", action)
    .gte("created_at", startOfMonthISO())
  return count ?? 0
}

// Record one metered (gated) action. Counts toward the user's plan limit.
export async function logUsage(userId: string, action: UsageAction, tokens = 0, model: string | null = null): Promise<void> {
  const svc = createServiceClient()
  const { error } = await svc.from("usage_events").insert({ user_id: userId, action, tokens, model })
  if (error) console.error("Failed to log usage event:", error.message)
}

// Record raw AI token consumption for cost accounting (action 'ai_call' — NOT a gated action,
// so it never affects quota counts). Fire-and-forget from the Groq layer.
export async function logTokens(userId: string, tokens: number, model: string): Promise<void> {
  if (!userId || !tokens) return
  const svc = createServiceClient()
  const { error } = await svc.from("usage_events").insert({ user_id: userId, action: "ai_call", tokens, model })
  if (error) console.error("Failed to log token usage:", error.message)
}

export interface QuotaResult {
  ok: boolean
  used: number
  limit: number
}

// Check whether the user is within their monthly limit for `action`. Infinity limit always passes.
export async function checkQuota(userId: string, action: UsageAction, limit: number): Promise<QuotaResult> {
  if (!isFinite(limit)) return { ok: true, used: 0, limit }
  const used = await monthlyCount(userId, action)
  return { ok: used < limit, used, limit }
}

// Standard upgrade message for a hit limit.
export function quotaMessage(action: UsageAction, limit: number): string {
  const label = action === "smart_apply" ? "Smart Applies" : action === "tailor" ? "resume tailors" : "interview preps"
  return `You've used all ${limit} free ${label} this month. Upgrade to Pro for unlimited.`
}

// Loads the user's plan and checks their quota for `action` in one call.
// Returns { allowed, message } — routes return 402 with `message` when not allowed.
export async function gateAction(userId: string, action: UsageAction): Promise<{ allowed: boolean; message?: string }> {
  const svc = createServiceClient()
  const { data: profile } = await svc
    .from("profiles")
    .select("plan, plan_expires_at")
    .eq("user_id", userId)
    .single()

  const plan = effectivePlan(profile ?? {})
  const limit = PLAN_LIMITS[plan][action]
  const { ok } = await checkQuota(userId, action, limit)
  return ok ? { allowed: true } : { allowed: false, message: quotaMessage(action, limit) }
}
