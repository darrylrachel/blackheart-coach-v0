import { WorkoutBuilder } from "@/components/workouts/workout-builder"

export default function NewWorkoutPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Workout</h1>
        <p className="text-muted-foreground">Build your workout by adding exercises, sets, and reps</p>
      </div>

      <WorkoutBuilder />
    </div>
  )
}
