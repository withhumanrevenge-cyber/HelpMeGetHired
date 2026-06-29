import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { getAdminUser } from "@/lib/admin"
import { Plan } from "@/types"

const VALID: Plan[] = ["free", "pro", "premium"]

export async function POST(request: Request) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { user_id, plan } = await request.json()
  if (!user_id || !VALID.includes(plan)) {
    return NextResponse.json({ error: "user_id and a valid plan are required." }, { status: 400 })
  }

  const plan_expires_at =
    plan === "free" ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

  const svc = createServiceClient()
  const { error } = await svc
    .from("profiles")
    .update({ plan, plan_expires_at })
    .eq("user_id", user_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, plan, plan_expires_at })
}
