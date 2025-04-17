import { redirect } from "next/navigation"
import { getSupabaseServer } from "@/lib/supabase/server"
import { CoachView } from "@/components/coach/coach-view"

export default async function CoachPage() {
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

  // Get AI usage data
  const { data: aiUsage } = await supabase
    .from("ai_usage")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10)

  // Get user's subscription status
  const { data: subscription } = await supabase.from("subscriptions").select("*").eq("user_id", user.id).single()

  return <CoachView user={user} profile={profile} aiUsage={aiUsage || []} subscription={subscription || null} />
}
