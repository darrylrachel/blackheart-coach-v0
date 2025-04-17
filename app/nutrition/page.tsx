import { redirect } from "next/navigation"
import { getSupabaseServer } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import { NutritionTracker } from "@/components/nutrition/nutrition-tracker"

export default async function NutritionPage() {
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

  // Get today's nutrition logs
  const today = new Date().toISOString().split("T")[0]
  const { data: nutritionLogs } = await supabase
    .from("nutrition_logs")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", today)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nutrition</h1>
          <p className="text-muted-foreground">Track your daily food intake and macros</p>
        </div>
        <Button asChild>
          <Link href="/nutrition/log">
            <Plus className="mr-2 h-4 w-4" />
            Log Food
          </Link>
        </Button>
      </div>

      <NutritionTracker profile={profile} nutritionLogs={nutritionLogs || []} />
    </div>
  )
}
