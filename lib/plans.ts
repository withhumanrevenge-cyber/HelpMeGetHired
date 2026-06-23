import { Plan } from "@/types"

export interface PlanLimits {
  smart_apply: number
  tailor: number
  interview: number
  matchPerRun: number
  allSources: boolean
  allCountries: boolean
}

// Per-plan monthly limits. Infinity = unlimited. Free is the acquisition funnel;
// Smart Apply is the primary paywall (the tailored resume + cover letter).
export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free:     { smart_apply: 3,        tailor: 3,        interview: 1,        matchPerRun: 50,  allSources: false, allCountries: false },
  pro:      { smart_apply: Infinity, tailor: Infinity, interview: Infinity, matchPerRun: 150, allSources: true,  allCountries: true },
  lifetime: { smart_apply: Infinity, tailor: Infinity, interview: Infinity, matchPerRun: 150, allSources: true,  allCountries: true },
}

export const PLAN_LABEL: Record<Plan, string> = {
  free: "Free",
  pro: "Pro",
  lifetime: "Lifetime",
}

// A 'pro' subscription whose expiry has passed falls back to 'free'. 'lifetime' never expires.
export function effectivePlan(profile: { plan?: Plan | null; plan_expires_at?: string | null }): Plan {
  const plan = profile.plan ?? "free"
  if (plan === "pro" && profile.plan_expires_at && new Date(profile.plan_expires_at).getTime() < Date.now()) {
    return "free"
  }
  return plan
}
