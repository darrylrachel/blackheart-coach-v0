"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { differenceInDays } from "date-fns"
import type { Database } from "@/lib/supabase/database.types"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]
type WeightData = Pick<Database["public"]["Tables"]["daily_metrics"]["Row"], "date" | "weight">
type Workout = Database["public"]["Tables"]["workouts"]["Row"]

interface ProgressMetricsProps {
  weightHistory: WeightData[]
  workoutHistory: Workout[]
  profile: Profile
}

export function ProgressMetrics({ weightHistory, workoutHistory, profile }: ProgressMetricsProps) {
  // Calculate weight change
  const filteredWeights = weightHistory.filter((entry) => entry.weight !== null) as {
    date: string
    weight: number
  }[]

  const sortedWeights = [...filteredWeights].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const startWeight = sortedWeights.length > 0 ? sortedWeights[0].weight : null
  const currentWeight = sortedWeights.length > 0 ? sortedWeights[sortedWeights.length - 1].weight : null
  const weightChange = startWeight && currentWeight ? currentWeight - startWeight : null
  const weightChangePercent = startWeight && weightChange ? (weightChange / startWeight) * 100 : null

  // Calculate workout metrics
  const totalWorkouts = workoutHistory.length
  const totalWorkoutMinutes = workoutHistory.reduce((sum, workout) => sum + (workout.duration || 0), 0)

  // Calculate streak (consecutive days with workouts)
  let currentStreak = 0
  if (workoutHistory.length > 0) {
    const sortedWorkouts = [...workoutHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let lastDate = today

    for (const workout of sortedWorkouts) {
      const workoutDate = new Date(workout.date)
      workoutDate.setHours(0, 0, 0, 0)

      const dayDiff = differenceInDays(lastDate, workoutDate)

      if (dayDiff <= 1) {
        currentStreak++
        lastDate = workoutDate
      } else {
        break
      }
    }
  }

  // Calculate progress towards goal
  let goalProgress = 0
  let goalMetric = ""

  if (profile.fitness_goal === "fat_loss" && startWeight && currentWeight) {
    // Assume goal is to lose 10% of starting weight
    const targetWeight = startWeight * 0.9
    const totalToLose = startWeight - targetWeight
    const lost = startWeight - currentWeight
    goalProgress = Math.min(100, Math.max(0, (lost / totalToLose) * 100))
    goalMetric = "Weight Loss"
  } else if (profile.fitness_goal === "muscle_gain") {
    // For muscle gain, use workout frequency as a proxy
    // Assume goal is 4 workouts per week = ~16 per month
    goalProgress = Math.min(100, (totalWorkouts / 16) * 100)
    goalMetric = "Workout Frequency"
  } else {
    // For maintenance, use consistency as a metric
    // Assume goal is to maintain weight within 2% of target
    if (startWeight && currentWeight) {
      const percentChange = Math.abs((currentWeight - startWeight) / startWeight) * 100
      goalProgress = Math.min(100, Math.max(0, ((2 - percentChange) / 2) * 100))
      goalMetric = "Weight Stability"
    } else {
      goalProgress = 50 // Default if no weight data
      goalMetric = "Consistency"
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Weight Change"
          value={
            weightChange !== null
              ? `${weightChange > 0 ? "+" : ""}${weightChange.toFixed(1)} ${profile.preferred_weight_unit}`
              : "N/A"
          }
          subtitle={
            weightChangePercent !== null
              ? `${weightChangePercent > 0 ? "+" : ""}${weightChangePercent.toFixed(1)}%`
              : "No data"
          }
          color={
            profile.fitness_goal === "fat_loss"
              ? weightChange && weightChange < 0
                ? "green"
                : "red"
              : profile.fitness_goal === "muscle_gain"
                ? weightChange && weightChange > 0
                  ? "green"
                  : "red"
                : weightChangePercent && Math.abs(weightChangePercent) < 2
                  ? "green"
                  : "yellow"
          }
        />
        <MetricCard
          title="Total Workouts"
          value={totalWorkouts.toString()}
          subtitle="Completed sessions"
          color="blue"
        />
        <MetricCard
          title="Workout Minutes"
          value={totalWorkoutMinutes.toString()}
          subtitle="Total training time"
          color="purple"
        />
        <MetricCard
          title="Current Streak"
          value={currentStreak.toString()}
          subtitle={currentStreak === 1 ? "day" : "days"}
          color="orange"
        />
      </div>

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-2">Progress Toward {profile.fitness_goal.replace("_", " ")} Goal</h3>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{goalMetric}</span>
              <span>{Math.round(goalProgress)}%</span>
            </div>
            <Progress value={goalProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: string
  subtitle: string
  color: "green" | "red" | "blue" | "purple" | "orange" | "yellow"
}

function MetricCard({ title, value, subtitle, color }: MetricCardProps) {
  const colorClasses = {
    green: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
    red: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
    blue: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
    purple: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
    orange: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
    yellow: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-sm font-medium text-muted-foreground">{title}</div>
        <div className="text-2xl font-bold mt-1">{value}</div>
        <div className="flex items-center mt-1">
          <span className={`text-xs px-2 py-0.5 rounded-full ${colorClasses[color]}`}>{subtitle}</span>
        </div>
      </CardContent>
    </Card>
  )
}
