import { headers } from "next/headers"
import type { Currency } from "./pricing"

export async function detectCurrency(): Promise<Currency> {
  const h = await headers()
  const country = (h.get("x-vercel-ip-country") || h.get("cf-ipcountry") || "").toUpperCase()
  return country === "IN" ? "INR" : "USD"
}
