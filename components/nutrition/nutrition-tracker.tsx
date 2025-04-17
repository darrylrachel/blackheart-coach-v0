"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import type { Database } from "@/lib/supabase/database.types"
import { Utensils, Coffee, Sun, Pizza, Moon } from "lucide-react"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]
type NutritionLog = Database["public"]["Tables"]["nutrition_logs"]["Row"]

interface NutritionTrackerProps {
  profile: Profile
  nutritionLogs: NutritionLog[]
}

export function NutritionTracker({ profile, nutritionLogs }: NutritionTrackerProps) {
  // Group logs by meal type
  const mealGroups = {
    breakfast: nutritionLogs.filter((log) => log.meal_type === "breakfast"),
    lunch: nutritionLogs.filter((log) => log.meal_type === "lunch"),
    dinner: nutritionLogs.filter((log) => log.meal_type === "dinner"),
    snack: nutritionLogs.filter((log) => log.meal_type === "snack"),
  }

  // Calculate totals for each meal
  const mealTotals = {
    breakfast: calculateMealTotals(mealGroups.breakfast),
    lunch: calculateMealTotals(mealGroups.lunch),
    dinner: calculateMealTotals(mealGroups.dinner),
    snack: calculateMealTotals(mealGroups.snack),
  }

  // Calculate daily totals
  const dailyTotals = {
    calories: nutritionLogs.reduce((sum, log) => sum + log.calories, 0),
    protein: nutritionLogs.reduce((sum, log) => sum + log.protein, 0),
    carbs: nutritionLogs.reduce((sum, log) => sum + log.carbs, 0),
    fat: nutritionLogs.reduce((sum, log) => sum + log.fat, 0),
  }

  // Calculate progress percentages
  const progress = {
    calories: Math.min(100, (dailyTotals.calories / profile.calories_goal) * 100),
    protein: Math.min(100, (dailyTotals.protein / profile.protein_goal) * 100),
    carbs: Math.min(100, (dailyTotals.carbs / profile.carbs_goal) * 100),
    fat: Math.min(100, (dailyTotals.fat / profile.fat_goal) * 100),
  }

  function calculateMealTotals(logs: NutritionLog[]) {
    return {
      calories: logs.reduce((sum, log) => sum + log.calories, 0),
      protein: logs.reduce((sum, log) => sum + log.protein, 0),
      carbs: logs.reduce((sum, log) => sum + log.carbs, 0),
      fat: logs.reduce((sum, log) => sum + log.fat, 0),
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Daily Nutrition Summary</CardTitle>
          <CardDescription>Your macro progress for today</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Calories</span>
                <span>
                  {dailyTotals.calories} / {profile.calories_goal} kcal
                </span>
              </div>
              <Progress value={progress.calories} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Protein</span>
                <span>
                  {dailyTotals.protein} / {profile.protein_goal} g
                </span>
              </div>
              <Progress value={progress.protein} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Carbs</span>
                <span>
                  {dailyTotals.carbs} / {profile.carbs_goal} g
                </span>
              </div>
              <Progress value={progress.carbs} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Fat</span>
                <span>
                  {dailyTotals.fat} / {profile.fat_goal} g
                </span>
              </div>
              <Progress value={progress.fat} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all">
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="all">
            <Utensils className="h-4 w-4 mr-2" />
            All
          </TabsTrigger>
          <TabsTrigger value="breakfast">
            <Coffee className="h-4 w-4 mr-2" />
            Breakfast
          </TabsTrigger>
          <TabsTrigger value="lunch">
            <Sun className="h-4 w-4 mr-2" />
            Lunch
          </TabsTrigger>
          <TabsTrigger value="dinner">
            <Pizza className="h-4 w-4 mr-2" />
            Dinner
          </TabsTrigger>
          <TabsTrigger value="snack">
            <Moon className="h-4 w-4 mr-2" />
            Snack
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="space-y-4">
            {nutritionLogs.length > 0 ? (
              <>
                {mealGroups.breakfast.length > 0 && (
                  <MealSection
                    title="Breakfast"
                    icon={<Coffee className="h-5 w-5" />}
                    logs={mealGroups.breakfast}
                    totals={mealTotals.breakfast}
                  />
                )}
                {mealGroups.lunch.length > 0 && (
                  <MealSection
                    title="Lunch"
                    icon={<Sun className="h-5 w-5" />}
                    logs={mealGroups.lunch}
                    totals={mealTotals.lunch}
                  />
                )}
                {mealGroups.dinner.length > 0 && (
                  <MealSection
                    title="Dinner"
                    icon={<Pizza className="h-5 w-5" />}
                    logs={mealGroups.dinner}
                    totals={mealTotals.dinner}
                  />
                )}
                {mealGroups.snack.length > 0 && (
                  <MealSection
                    title="Snack"
                    icon={<Moon className="h-5 w-5" />}
                    logs={mealGroups.snack}
                    totals={mealTotals.snack}
                  />
                )}
              </>
            ) : (
              <EmptyState />
            )}
          </div>
        </TabsContent>

        <TabsContent value="breakfast">
          {mealGroups.breakfast.length > 0 ? (
            <MealSection
              title="Breakfast"
              icon={<Coffee className="h-5 w-5" />}
              logs={mealGroups.breakfast}
              totals={mealTotals.breakfast}
            />
          ) : (
            <EmptyState mealType="breakfast" />
          )}
        </TabsContent>

        <TabsContent value="lunch">
          {mealGroups.lunch.length > 0 ? (
            <MealSection
              title="Lunch"
              icon={<Sun className="h-5 w-5" />}
              logs={mealGroups.lunch}
              totals={mealTotals.lunch}
            />
          ) : (
            <EmptyState mealType="lunch" />
          )}
        </TabsContent>

        <TabsContent value="dinner">
          {mealGroups.dinner.length > 0 ? (
            <MealSection
              title="Dinner"
              icon={<Pizza className="h-5 w-5" />}
              logs={mealGroups.dinner}
              totals={mealTotals.dinner}
            />
          ) : (
            <EmptyState mealType="dinner" />
          )}
        </TabsContent>

        <TabsContent value="snack">
          {mealGroups.snack.length > 0 ? (
            <MealSection
              title="Snack"
              icon={<Moon className="h-5 w-5" />}
              logs={mealGroups.snack}
              totals={mealTotals.snack}
            />
          ) : (
            <EmptyState mealType="snack" />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface MealSectionProps {
  title: string
  icon: React.ReactNode
  logs: NutritionLog[]
  totals: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
}

function MealSection({ title, icon, logs, totals }: MealSectionProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
        <div className="text-sm text-muted-foreground">{totals.calories} kcal</div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {logs.map((log) => (
            <div key={log.id} className="flex justify-between items-center py-2 border-b last:border-0">
              <div>
                <p className="font-medium">{log.food_name}</p>
                <p className="text-sm text-muted-foreground">
                  {log.serving_size} {log.serving_unit}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">{log.calories} kcal</p>
                <p className="text-xs text-muted-foreground">
                  P: {log.protein}g | C: {log.carbs}g | F: {log.fat}g
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyState({ mealType }: { mealType?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-md">
      <Utensils className="h-10 w-10 text-muted-foreground mb-2" />
      <p className="text-muted-foreground text-center">
        {mealType ? `No ${mealType} logged for today` : "No meals logged for today"}
      </p>
    </div>
  )
}
