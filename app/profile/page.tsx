import { redirect } from "next/navigation"
import { getSupabaseServer } from "@/lib/supabase/server"
import { ProfileView } from "@/components/profile/profile-view"

export default async function ProfilePage() {
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

  // Get user's stats
  const { data: workoutCount } = await supabase.from("workouts").select("id", { count: "exact" }).eq("user_id", user.id)

  const { data: nutritionCount } = await supabase
    .from("nutrition_logs")
    .select("id", { count: "exact" })
    .eq("user_id", user.id)

  const { data: journalCount } = await supabase
    .from("journal_entries")
    .select("id", { count: "exact" })
    .eq("user_id", user.id)

  const { data: photoCount } = await supabase
    .from("progress_photos")
    .select("id", { count: "exact" })
    .eq("user_id", user.id)

  return (
    <ProfileView
      user={user}
      profile={profile}
      stats={{
        workoutCount: workoutCount?.length || 0,
        nutritionCount: nutritionCount?.length || 0,
        journalCount: journalCount?.length || 0,
        photoCount: photoCount?.length || 0,
      }}
    />
  )
}
