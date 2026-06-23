import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { getAdminUser } from "@/lib/admin"

const PRO_PRICE = 12 // USD/mo — used for the MRR estimate.

export async function GET() {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const svc = createServiceClient()
  const monthStart = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1)).toISOString()

  const { data: profiles } = await svc.from("profiles").select("plan, created_at")
  const all = profiles ?? []
  const byPlan = { free: 0, pro: 0, lifetime: 0 }
  for (const p of all) {
    const plan = (p.plan as keyof typeof byPlan) ?? "free"
    if (plan in byPlan) byPlan[plan]++
  }

  // Tokens consumed this month + distinct active users.
  const { data: usage } = await svc
    .from("usage_events")
    .select("user_id, action, tokens, created_at")
    .gte("created_at", monthStart)
  const events = usage ?? []
  const tokensThisMonth = events.reduce((sum, e) => sum + (e.tokens ?? 0), 0)
  const activeUsers = new Set(events.map((e) => e.user_id)).size
  const smartAppliesThisMonth = events.filter((e) => e.action === "smart_apply").length

  // New signups in the last 7 days.
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const newThisWeek = all.filter((p) => p.created_at && p.created_at >= weekAgo).length

  return NextResponse.json({
    totalUsers: all.length,
    byPlan,
    activeUsers,
    newThisWeek,
    tokensThisMonth,
    smartAppliesThisMonth,
    mrr: byPlan.pro * PRO_PRICE,
  })
}
