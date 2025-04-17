"use client"

import { useState } from "react"
import type { User } from "@supabase/supabase-js"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Database } from "@/lib/supabase/database.types"
import { CalendarDays, Droplet, Smile, Dumbbell, Utensils, Brain, LineChart, PenSquare } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]
type DailyMetrics = Database["public"]["Tables"]["daily_metrics"]["Row"] | null
type NutritionLog = Database["public"]["Tables"]["nutrition_logs"]["Row"]

interface DashboardViewProps {
  user: User
  profile: Profile
  dailyMetrics: DailyMetrics
  nutritionLogs: NutritionLog[]
}

export function DashboardView({ user, profile, dailyMetrics, nutritionLogs }: DashboardViewProps) {
  const supabase = getSupabaseClient()
  const [weight, setWeight] = useState<number | null>(dailyMetrics?.weight || null)
  const [waterIntake, setWaterIntake] = useState<number | null>(dailyMetrics?.water_intake || null)
  const [mood, setMood] = useState<string>(dailyMetrics?.mood || "neutral")
  const [isUpdating, setIsUpdating] = useState(false)

  // Calculate total nutrition for the day
  const totalNutrition = nutritionLogs.reduce(
    (acc, log) => {
      acc.calories += log.calories
      acc.protein += log.protein
      acc.carbs += log.carbs
      acc.fat += log.fat
      return acc
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  )

  // Calculate progress percentages
  const calorieProgress = Math.min(100, (totalNutrition.calories / profile.calories_goal) * 100)
  const proteinProgress = Math.min(100, (totalNutrition.protein / profile.protein_goal) * 100)
  const carbsProgress = Math.min(100, (totalNutrition.carbs / profile.carbs_goal) * 100)
  const fatProgress = Math.min(100, (totalNutrition.fat / profile.fat_goal) * 100)

  const updateDailyMetrics = async () => {
    setIsUpdating(true)
    const today = new Date().toISOString().split("T")[0]

    try {
      if (dailyMetrics) {
        // Update existing metrics
        await supabase
          .from("daily_metrics")
          .update({
            weight,
            water_intake: waterIntake,
            mood,
          })
          .eq("id", dailyMetrics.id)
      } else {
        // Create new metrics
        await supabase.from("daily_metrics").insert({
          user_id: user.id,
          date: today,
          weight,
          water_intake: waterIntake,
          mood,
        })
      }
    } catch (error) {
      console.error("Error updating daily metrics:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {profile.username}!</h1>
        <p className="text-muted-foreground">
          Track your progress, log your workouts, and stay on top of your nutrition.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Weight Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weight</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={weight || ""}
                  onChange={(e) => setWeight(Number.parseFloat(e.target.value) || null)}
                  placeholder="Enter weight"
                  className="h-8"
                />
                <span className="text-sm font-medium">{profile.preferred_weight_unit}</span>
              </div>
              <Button size="sm" onClick={updateDailyMetrics} disabled={isUpdating}>
                Save
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Water Intake Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Water Intake</CardTitle>
            <Droplet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={waterIntake || ""}
                  onChange={(e) => setWaterIntake(Number.parseFloat(e.target.value) || null)}
                  placeholder="Enter water intake"
                  className="h-8"
                />
                <span className="text-sm font-medium">{profile.preferred_volume_unit}</span>
              </div>
              <Button size="sm" onClick={updateDailyMetrics} disabled={isUpdating}>
                Save
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Mood Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mood</CardTitle>
            <Smile className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Select value={mood} onValueChange={setMood}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select mood" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="terrible">Terrible</SelectItem>
                  <SelectItem value="bad">Bad</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="great">Great</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" onClick={updateDailyMetrics} disabled={isUpdating}>
                Save
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Nutrition Card */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="h-5 w-5" />
              Today's Nutrition
            </CardTitle>
            <CardDescription>Track your daily macro intake</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Calories</span>
                  <span>
                    {totalNutrition.calories} / {profile.calories_goal} kcal
                  </span>
                </div>
                <Progress value={calorieProgress} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Protein</span>
                  <span>
                    {totalNutrition.protein} / {profile.protein_goal} g
                  </span>
                </div>
                <Progress value={proteinProgress} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Carbs</span>
                  <span>
                    {totalNutrition.carbs} / {profile.carbs_goal} g
                  </span>
                </div>
                <Progress value={carbsProgress} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Fat</span>
                  <span>
                    {totalNutrition.fat} / {profile.fat_goal} g
                  </span>
                </div>
                <Progress value={fatProgress} className="h-2" />
              </div>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/nutrition">Log Food</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Workout Card */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5" />
              Today's Workout
            </CardTitle>
            <CardDescription>Your scheduled training for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-md">
              <Dumbbell className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-muted-foreground text-center">No workout scheduled for today</p>
              <Button variant="outline" className="mt-4" asChild>
                <Link href="/workouts/new">Create Workout</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Quick Access</CardTitle>
            <CardDescription>Shortcuts to your most used features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-24 flex flex-col gap-2" asChild>
                <Link href="/coach">
                  <Brain className="h-6 w-6" />
                  <span>Smart Coach</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col gap-2" asChild>
                <Link href="/workouts/history">
                  <Dumbbell className="h-6 w-6" />
                  <span>Workout History</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col gap-2" asChild>
                <Link href="/progress">
                  <LineChart className="h-6 w-6" />
                  <span>Progress</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col gap-2" asChild>
                <Link href="/journal">
                  <PenSquare className="h-6 w-6" />
                  <span>Journal</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
