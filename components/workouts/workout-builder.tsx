"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, Save, X, Dumbbell } from "lucide-react"
import { v4 as uuidv4 } from "uuid"

// Mock exercise data (in a real app, this would come from an API)
const mockExercises = [
  { id: "ex1", name: "Bench Press", muscles: ["Chest", "Triceps", "Shoulders"] },
  { id: "ex2", name: "Squat", muscles: ["Quadriceps", "Hamstrings", "Glutes"] },
  { id: "ex3", name: "Deadlift", muscles: ["Back", "Hamstrings", "Glutes"] },
  { id: "ex4", name: "Pull-up", muscles: ["Back", "Biceps"] },
  { id: "ex5", name: "Shoulder Press", muscles: ["Shoulders", "Triceps"] },
]

interface ExerciseSet {
  id: string
  weight: number | null
  reps: number | null
  notes: string
}

interface WorkoutExercise {
  id: string
  exerciseId: string
  exerciseName: string
  muscles: string[]
  sets: ExerciseSet[]
}

export function WorkoutBuilder() {
  const router = useRouter()
  const supabase = getSupabaseClient()
  const [workoutName, setWorkoutName] = useState("My Workout")
  const [workoutNotes, setWorkoutNotes] = useState("")
  const [exercises, setExercises] = useState<WorkoutExercise[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredExercises = mockExercises.filter((exercise) =>
    exercise.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const addExercise = (exercise: { id: string; name: string; muscles: string[] }) => {
    const newExercise: WorkoutExercise = {
      id: uuidv4(),
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      muscles: exercise.muscles,
      sets: [
        {
          id: uuidv4(),
          weight: null,
          reps: null,
          notes: "",
        },
      ],
    }

    setExercises([...exercises, newExercise])
    setSearchTerm("")
  }

  const removeExercise = (exerciseId: string) => {
    setExercises(exercises.filter((ex) => ex.id !== exerciseId))
  }

  const addSet = (exerciseId: string) => {
    setExercises(
      exercises.map((ex) => {
        if (ex.id === exerciseId) {
          return {
            ...ex,
            sets: [
              ...ex.sets,
              {
                id: uuidv4(),
                weight: ex.sets[ex.sets.length - 1]?.weight || null,
                reps: ex.sets[ex.sets.length - 1]?.reps || null,
                notes: "",
              },
            ],
          }
        }
        return ex
      }),
    )
  }

  const removeSet = (exerciseId: string, setId: string) => {
    setExercises(
      exercises.map((ex) => {
        if (ex.id === exerciseId) {
          return {
            ...ex,
            sets: ex.sets.filter((set) => set.id !== setId),
          }
        }
        return ex
      }),
    )
  }

  const updateSet = (exerciseId: string, setId: string, field: "weight" | "reps" | "notes", value: number | string) => {
    setExercises(
      exercises.map((ex) => {
        if (ex.id === exerciseId) {
          return {
            ...ex,
            sets: ex.sets.map((set) => {
              if (set.id === setId) {
                return {
                  ...set,
                  [field]: field === "notes" ? value : Number(value) || null,
                }
              }
              return set
            }),
          }
        }
        return ex
      }),
    )
  }

  const saveWorkout = async () => {
    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("User not authenticated")
      }

      const today = new Date().toISOString().split("T")[0]
      const allMuscles = [...new Set(exercises.flatMap((ex) => ex.muscles))]

      // Create workout
      const { data: workout, error: workoutError } = await supabase
        .from("workouts")
        .insert({
          user_id: user.id,
          date: today,
          name: workoutName,
          notes: workoutNotes,
          muscles_worked: allMuscles,
        })
        .select()
        .single()

      if (workoutError || !workout) {
        throw workoutError || new Error("Failed to create workout")
      }

      // Create workout exercises and sets
      for (const exercise of exercises) {
        const { data: workoutExercise, error: exerciseError } = await supabase
          .from("workout_exercises")
          .insert({
            workout_id: workout.id,
            exercise_name: exercise.exerciseName,
            exercise_id: exercise.exerciseId,
            order: exercises.indexOf(exercise) + 1,
          })
          .select()
          .single()

        if (exerciseError || !workoutExercise) {
          throw exerciseError || new Error("Failed to create workout exercise")
        }

        // Create sets for this exercise
        const setsToInsert = exercise.sets.map((set, index) => ({
          workout_exercise_id: workoutExercise.id,
          set_number: index + 1,
          weight: set.weight,
          reps: set.reps,
          notes: set.notes,
        }))

        const { error: setsError } = await supabase.from("workout_sets").insert(setsToInsert)

        if (setsError) {
          throw setsError
        }
      }

      // Redirect to workouts page
      router.push("/workouts")
    } catch (error) {
      console.error("Error saving workout:", error)
      // Handle error (show toast, etc.)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Workout Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="workout-name">Workout Name</Label>
            <Input
              id="workout-name"
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              placeholder="Enter workout name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="workout-notes">Notes</Label>
            <Textarea
              id="workout-notes"
              value={workoutNotes}
              onChange={(e) => setWorkoutNotes(e.target.value)}
              placeholder="Add any notes about this workout"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add Exercises</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="exercise-search">Search Exercises</Label>
            <Input
              id="exercise-search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for exercises..."
            />
          </div>
          {searchTerm && (
            <div className="border rounded-md divide-y">
              {filteredExercises.length > 0 ? (
                filteredExercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    className="p-3 flex justify-between items-center hover:bg-accent cursor-pointer"
                    onClick={() => addExercise(exercise)}
                  >
                    <div>
                      <p className="font-medium">{exercise.name}</p>
                      <p className="text-sm text-muted-foreground">{exercise.muscles.join(", ")}</p>
                    </div>
                    <Plus className="h-5 w-5" />
                  </div>
                ))
              ) : (
                <div className="p-3 text-center text-muted-foreground">No exercises found</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {exercises.length > 0 ? (
        <div className="space-y-6">
          {exercises.map((exercise) => (
            <Card key={exercise.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl">{exercise.exerciseName}</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => removeExercise(exercise.id)}>
                  <Trash2 className="h-5 w-5 text-muted-foreground" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Dumbbell className="h-4 w-4" />
                    <span>{exercise.muscles.join(", ")}</span>
                  </div>
                  <div className="grid grid-cols-12 gap-2 font-medium text-sm mb-2">
                    <div className="col-span-1">Set</div>
                    <div className="col-span-3">Weight</div>
                    <div className="col-span-3">Reps</div>
                    <div className="col-span-4">Notes</div>
                    <div className="col-span-1"></div>
                  </div>
                  {exercise.sets.map((set, index) => (
                    <div key={set.id} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-1 text-sm font-medium">{index + 1}</div>
                      <div className="col-span-3">
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            value={set.weight || ""}
                            onChange={(e) => updateSet(exercise.id, set.id, "weight", e.target.value)}
                            placeholder="0"
                            className="h-8"
                          />
                        </div>
                      </div>
                      <div className="col-span-3">
                        <Input
                          type="number"
                          value={set.reps || ""}
                          onChange={(e) => updateSet(exercise.id, set.id, "reps", e.target.value)}
                          placeholder="0"
                          className="h-8"
                        />
                      </div>
                      <div className="col-span-4">
                        <Input
                          value={set.notes}
                          onChange={(e) => updateSet(exercise.id, set.id, "notes", e.target.value)}
                          placeholder="Notes"
                          className="h-8"
                        />
                      </div>
                      <div className="col-span-1">
                        {exercise.sets.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => removeSet(exercise.id, set.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => addSet(exercise.id)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Set
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-md">
          <p className="text-muted-foreground text-center">No exercises added yet. Search and add exercises above.</p>
        </div>
      )}

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => router.push("/workouts")}>
          Cancel
        </Button>
        <Button onClick={saveWorkout} disabled={loading || exercises.length === 0}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? "Saving..." : "Save Workout"}
        </Button>
      </div>
    </div>
  )
}
