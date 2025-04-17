import { redirect } from "next/navigation"
import { getSupabaseServer } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Dumbbell, Plus } from "lucide-react"

export default async function WorkoutsPage() {
  const supabase = await getSupabaseServer()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get the user's workouts
  const { data: workouts } = await supabase
    .from("workouts")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workouts</h1>
          <p className="text-muted-foreground">Create and track your workout sessions</p>
        </div>
        <Button asChild>
          <Link href="/workouts/new">
            <Plus className="mr-2 h-4 w-4" />
            New Workout
          </Link>
        </Button>
      </div>

      {workouts && workouts.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workouts.map((workout) => (
            <Card key={workout.id}>
              <CardHeader>
                <CardTitle>{workout.name}</CardTitle>
                <CardDescription>{new Date(workout.date).toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Dumbbell className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{workout.muscles_worked.join(", ")}</span>
                </div>
                {workout.notes && <p className="mt-2 text-sm">{workout.notes}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-60 border-2 border-dashed rounded-md">
          <Dumbbell className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-muted-foreground text-center">No workouts yet</p>
          <Button variant="outline" className="mt-4" asChild>
            <Link href="/workouts/new">Create Your First Workout</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
