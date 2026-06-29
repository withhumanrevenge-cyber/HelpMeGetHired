import { Plan, UsageAction } from "@/types"

export interface PlanConfig {
  credits: number
  matchPerRun: number
  maxVisibleMatches: number
  allSources: boolean
  allCountries: boolean
  label: string
  priceUsd: number
}

export const PLAN_CONFIG: Record<Plan, PlanConfig> = {
  free:    { credits: 15,  matchPerRun: 50,  maxVisibleMatches: 25,   allSources: false, allCountries: false, label: "Free",    priceUsd: 0 },
  pro:     { credits: 100, matchPerRun: 150, maxVisibleMatches: 150,  allSources: true,  allCountries: true,  label: "Pro",     priceUsd: 12 },
  premium: { credits: 300, matchPerRun: 300, maxVisibleMatches: 2000, allSources: true,  allCountries: true,  label: "Premium", priceUsd: 24 },
}

export const CREDIT_COST: Record<UsageAction, number> = {
  smart_apply: 3,
  tailor: 2,
  interview: 2,
}

export const ACTION_LABEL: Record<UsageAction, string> = {
  smart_apply: "Smart Apply",
  tailor: "Resume tailor",
  interview: "Interview prep",
}

export const PLAN_LABEL: Record<Plan, string> = {
  free: "Free",
  pro: "Pro",
  premium: "Premium",
}

export function effectivePlan(profile: { plan?: string | null; plan_expires_at?: string | null }): Plan {
  const raw = profile.plan
  const plan: Plan = raw === "pro" ? "pro" : raw === "premium" || raw === "lifetime" ? "premium" : "free"
  if (plan !== "free" && profile.plan_expires_at && new Date(profile.plan_expires_at).getTime() < Date.now()) {
    return "free"
  }
  return plan
}
