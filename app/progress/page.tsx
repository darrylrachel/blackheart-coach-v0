import { redirect } from "next/navigation"
import { getSupabaseServer } from "@/lib/supabase/server"
import { ProgressView } from "@/components/progress/progress-view"

export default async function ProgressPage() {
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

  if (!profile) {
    redirect("/onboarding")
  }

  // Get weight history (last 30 entries)
  const { data: weightHistory } = await supabase
    .from("daily_metrics")
    .select("date, weight")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .limit(30)

  // Get progress photos (last 12)
  const { data: progressPhotos } = await supabase
    .from("progress_photos")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .limit(12)

  // Get workout history (last 10)
  const { data: workoutHistory } = await supabase
    .from("workouts")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .limit(10)

  return (
    <ProgressView
      user={user}
      profile={profile}
      weightHistory={weightHistory || []}
      progressPhotos={progressPhotos || []}
      workoutHistory={workoutHistory || []}
    />
  )
}
