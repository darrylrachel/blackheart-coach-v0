import { redirect } from "next/navigation"
import { getSupabaseServer } from "@/lib/supabase/server"
import { DashboardView } from "@/components/dashboard/dashboard-view"

export default async function DashboardPage() {
  const supabase = await getSupabaseServer()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get the user's profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // If the user doesn't have a profile, redirect to onboarding
  if (!profile) {
    redirect("/onboarding")
  }

  // Get today's metrics
  const today = new Date().toISOString().split("T")[0]
  const { data: dailyMetrics } = await supabase
    .from("daily_metrics")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", today)
    .single()

  // Get today's nutrition logs
  const { data: nutritionLogs } = await supabase
    .from("nutrition_logs")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", today)

  return (
    <DashboardView
      user={user}
      profile={profile}
      dailyMetrics={dailyMetrics || null}
      nutritionLogs={nutritionLogs || []}
    />
  )
}
