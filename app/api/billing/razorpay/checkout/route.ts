import { NextResponse } from "next/server"
import Razorpay from "razorpay"
import { createClient } from "@/lib/supabase/server"
import { PRICING } from "@/lib/billing/config"
import { Plan } from "@/types"

// Creates a Razorpay subscription (Pro) or order (Lifetime). Returns the ids the client needs
// to open Razorpay Checkout. user_id is stored in `notes` so the webhook can map it back.
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { plan } = await request.json() as { plan: Plan }
    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET
    if (!keyId || !keySecret) {
      return NextResponse.json({ error: "Razorpay is not configured." }, { status: 503 })
    }

    const rzp = new Razorpay({ key_id: keyId, key_secret: keySecret })

    if (plan === "pro") {
      const planId = process.env.RAZORPAY_PRO_PLAN_ID
      if (!planId) return NextResponse.json({ error: "Razorpay Pro plan not configured." }, { status: 503 })
      const sub = await rzp.subscriptions.create({
        plan_id: planId,
        total_count: 12,
        customer_notify: 1,
        notes: { user_id: user.id, plan: "pro" },
      })
      return NextResponse.json({ provider: "razorpay", type: "subscription", subscription_id: sub.id, key_id: keyId })
    }

    if (plan === "lifetime") {
      const order = await rzp.orders.create({
        amount: PRICING.lifetimeInrPaise,
        currency: "INR",
        notes: { user_id: user.id, plan: "lifetime" },
      })
      return NextResponse.json({ provider: "razorpay", type: "order", order_id: order.id, amount: order.amount, key_id: keyId })
    }

    return NextResponse.json({ error: "Invalid plan." }, { status: 400 })
  } catch (err: unknown) {
    console.error("Razorpay checkout error:", err)
    const msg = err instanceof Error ? err.message : "Checkout failed."
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
