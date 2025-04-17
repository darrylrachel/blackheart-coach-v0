"use client"

import { format, parseISO } from "date-fns"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dumbbell, Clock } from "lucide-react"
import type { Database } from "@/lib/supabase/database.types"

type Workout = Database["public"]["Tables"]["workouts"]["Row"]

interface WorkoutHistoryProps {
  workouts: Workout[]
}

export function WorkoutHistory({ workouts }: WorkoutHistoryProps) {
  return (
    <div className="space-y-4">
      {workouts.map((workout) => (
        <Card key={workout.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4 border-b bg-muted/50">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{workout.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {format(parseISO(workout.date), "EEEE, MMMM d, yyyy")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {workout.duration && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      {workout.duration} min
                    </div>
                  )}
                  <Dumbbell className="h-4 w-4 text-primary" />
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="flex flex-wrap gap-2 mb-2">
                {workout.muscles_worked.map((muscle) => (
                  <Badge key={muscle} variant="secondary">
                    {muscle}
                  </Badge>
                ))}
              </div>
              {workout.notes && <p className="text-sm mt-2">{workout.notes}</p>}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
