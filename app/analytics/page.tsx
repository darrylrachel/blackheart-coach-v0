import { redirect } from "next/navigation"
import { getSupabaseServer } from "@/lib/supabase/server"
import { AnalyticsView } from "@/components/analytics/analytics-view"

export default async function AnalyticsPage() {
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

  // Get weight history (last 90 days)
  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
  const ninetyDaysAgoStr = ninetyDaysAgo.toISOString().split("T")[0]

  const { data: weightHistory } = await supabase
    .from("daily_metrics")
    .select("date, weight")
    .eq("user_id", user.id)
    .gte("date", ninetyDaysAgoStr)
    .order("date", { ascending: true })

  // Get workout history (last 90 days)
  const { data: workoutHistory } = await supabase
    .from("workouts")
    .select("*")
    .eq("user_id", user.id)
    .gte("date", ninetyDaysAgoStr)
    .order("date", { ascending: true })

  // Get nutrition logs (last 90 days)
  const { data: nutritionLogs } = await supabase
    .from("nutrition_logs")
    .select("*")
    .eq("user_id", user.id)
    .gte("date", ninetyDaysAgoStr)
    .order("date", { ascending: true })

  return (
    <AnalyticsView
      user={user}
      profile={profile}
      weightHistory={weightHistory || []}
      workoutHistory={workoutHistory || []}
      nutritionLogs={nutritionLogs || []}
    />
  )
}
