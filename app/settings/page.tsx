import { redirect } from "next/navigation"
import { getSupabaseServer } from "@/lib/supabase/server"
import { SettingsView } from "@/components/settings/settings-view"

export default async function SettingsPage() {
  const supabase = getSupabaseServer()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get the user's profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile) {
    redirect("/onboarding")
  }

  // Get user's subscription status
  const { data: subscription } = await supabase.from("subscriptions").select("*").eq("user_id", user.id).single()

  return <SettingsView user={user} profile={profile} subscription={subscription || null} />
}
