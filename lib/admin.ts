import { createClient } from "@/lib/supabase/server"
import type { User } from "@supabase/supabase-js"

export async function getAdminUser(): Promise<User | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("user_id", user.id)
    .single()
  return profile?.is_admin ? user : null
}
