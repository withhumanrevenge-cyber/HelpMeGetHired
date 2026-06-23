import { createClient } from "@/lib/supabase/server"
import type { User } from "@supabase/supabase-js"

// Returns the calling user IF they are an admin, else null.
// Used by every /api/admin/* route as a server-side gate (defense in depth — the /admin layout also checks).
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
