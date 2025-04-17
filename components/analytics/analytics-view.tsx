"use client"

import type React from "react"

import { useState } from "react"
import type { User } from "@supabase/supabase-js"
import { format, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Activity, BarChart2, LineChartIcon, PieChartIcon, Calendar } from "lucide-react"
import type { Database } from "@/lib/supabase/database.types"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]
type WeightData = Pick<Database["public"]["Tables"]["daily_metrics"]["Row"], "date" | "weight">
type Workout = Database["public"]["Tables"]["workouts"]["Row"]
type NutritionLog = Database["public"]["Tables"]["nutrition_logs"]["Row"]

interface AnalyticsViewProps {
  user: User
  profile: Profile
  weightHistory: WeightData[]
  workoutHistory: Workout[]
  nutritionLogs: NutritionLog[]
}

export function AnalyticsView({ user, profile, weightHistory, workoutHistory, nutritionLogs }: AnalyticsViewProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [timeRange, setTimeRange] = useState("30days")

  // Filter data based on time range
  const filterDataByTimeRange = (data: any[]) => {
    const now = new Date()
    const startDate = new Date()

    if (timeRange === "7days") {
      startDate.setDate(now.getDate() - 7)
    } else if (timeRange === "30days") {
      startDate.setDate(now.getDate() - 30)
    } else if (timeRange === "90days") {
      startDate.setDate(now.getDate() - 90)
    }

    return data.filter((item) => {
      const itemDate = new Date(item.date)
      return itemDate >= startDate && itemDate <= now
    })
  }

  // Prepare weight data for chart
  const filteredWeightHistory = filterDataByTimeRange(weightHistory)
  const weightChartData = filteredWeightHistory
    .filter((entry) => entry.weight !== null)
    .map((entry) => ({
      date: format(parseISO(entry.date), "MMM d"),
      weight: entry.weight,
    }))

  // Prepare workout data for charts
  const filteredWorkoutHistory = filterDataByTimeRange(workoutHistory)

  // Workout frequency by day of week
  const workoutsByDayOfWeek = [0, 0, 0, 0, 0, 0, 0] // Sun, Mon, Tue, Wed, Thu, Fri, Sat
  filteredWorkoutHistory.forEach((workout) => {
    const date = new Date(workout.date)
    workoutsByDayOfWeek[date.getDay()]++
  })

  const workoutFrequencyData = [
    { name: "Sun", count: workoutsByDayOfWeek[0] },
    { name: "Mon", count: workoutsByDayOfWeek[1] },
    { name: "Tue", count: workoutsByDayOfWeek[2] },
    { name: "Wed", count: workoutsByDayOfWeek[3] },
    { name: "Thu", count: workoutsByDayOfWeek[4] },
    { name: "Fri", count: workoutsByDayOfWeek[5] },
    { name: "Sat", count: workoutsByDayOfWeek[6] },
  ]

  // Workout types distribution
  const workoutTypeCount: Record<string, number> = {}
  filteredWorkoutHistory.forEach((workout) => {
    const type = workout.workout_type || "other"
    workoutTypeCount[type] = (workoutTypeCount[type] || 0) + 1
  })

  const workoutTypeData = Object.entries(workoutTypeCount).map(([name, value]) => ({
    name: name.replace("_", " "),
    value,
  }))

  // Prepare nutrition data for charts
  const filteredNutritionLogs = filterDataByTimeRange(nutritionLogs)

  // Aggregate nutrition data by day
  const nutritionByDay: Record<string, { calories: number; protein: number; carbs: number; fat: number }> = {}

  filteredNutritionLogs.forEach((log) => {
    const day = log.date
    if (!nutritionByDay[day]) {
      nutritionByDay[day] = { calories: 0, protein: 0, carbs: 0, fat: 0 }
    }
    nutritionByDay[day].calories += log.calories
    nutritionByDay[day].protein += log.protein
    nutritionByDay[day].carbs += log.carbs
    nutritionByDay[day].fat += log.fat
  })

  const nutritionChartData = Object.entries(nutritionByDay).map(([date, values]) => ({
    date: format(parseISO(date), "MMM d"),
    calories: values.calories,
    protein: values.protein,
    carbs: values.carbs,
    fat: values.fat,
  }))

  // Calculate weekly workout consistency
  const calculateWeeklyConsistency = () => {
    if (filteredWorkoutHistory.length === 0) return 0

    const now = new Date()
    const startOfCurrentWeek = startOfWeek(now, { weekStartsOn: 0 })
    const endOfCurrentWeek = endOfWeek(now, { weekStartsOn: 0 })

    const daysInWeek = eachDayOfInterval({
      start: startOfCurrentWeek,
      end: endOfCurrentWeek,
    })

    let daysWorkedOut = 0
    daysInWeek.forEach((day) => {
      const hasWorkout = filteredWorkoutHistory.some((workout) => isSameDay(parseISO(workout.date), day))
      if (hasWorkout) daysWorkedOut++
    })

    return Math.round((daysWorkedOut / 7) * 100)
  }

  // Calculate average workout duration
  const calculateAvgWorkoutDuration = () => {
    if (filteredWorkoutHistory.length === 0) return 0

    const totalDuration = filteredWorkoutHistory.reduce((sum, workout) => sum + (workout.duration || 0), 0)

    return Math.round(totalDuration / filteredWorkoutHistory.length)
  }

  // Calculate average daily calories
  const calculateAvgDailyCalories = () => {
    if (Object.keys(nutritionByDay).length === 0) return 0

    const totalCalories = Object.values(nutritionByDay).reduce((sum, day) => sum + day.calories, 0)

    return Math.round(totalCalories / Object.keys(nutritionByDay).length)
  }

  // Calculate macro distribution
  const calculateMacroDistribution = () => {
    let totalProtein = 0
    let totalCarbs = 0
    let totalFat = 0

    Object.values(nutritionByDay).forEach((day) => {
      totalProtein += day.protein
      totalCarbs += day.carbs
      totalFat += day.fat
    })

    const total = totalProtein + totalCarbs + totalFat

    if (total === 0) return [33, 34, 33] // Default even split

    return [
      Math.round((totalProtein / total) * 100),
      Math.round((totalCarbs / total) * 100),
      Math.round((totalFat / total) * 100),
    ]
  }

  const macroDistribution = calculateMacroDistribution()
  const macroData = [
    { name: "Protein", value: macroDistribution[0] },
    { name: "Carbs", value: macroDistribution[1] },
    { name: "Fat", value: macroDistribution[2] },
  ]

  const COLORS = ["#BFA85D", "#8884d8", "#82ca9d"]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Detailed insights into your fitness and nutrition progress</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 Days</SelectItem>
            <SelectItem value="30days">Last 30 Days</SelectItem>
            <SelectItem value="90days">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="weight" className="flex items-center gap-2">
            <LineChartIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Weight</span>
          </TabsTrigger>
          <TabsTrigger value="workouts" className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            <span className="hidden sm:inline">Workouts</span>
          </TabsTrigger>
          <TabsTrigger value="nutrition" className="flex items-center gap-2">
            <PieChartIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Nutrition</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Weekly Consistency"
              value={`${calculateWeeklyConsistency()}%`}
              description="Workout days this week"
              icon={<Calendar className="h-4 w-4" />}
            />
            <MetricCard
              title="Avg. Workout Duration"
              value={`${calculateAvgWorkoutDuration()} min`}
              description="Per session"
              icon={<Activity className="h-4 w-4" />}
            />
            <MetricCard
              title="Avg. Daily Calories"
              value={`${calculateAvgDailyCalories()} kcal`}
              description="Caloric intake"
              icon={<PieChartIcon className="h-4 w-4" />}
            />
            <MetricCard
              title="Total Workouts"
              value={filteredWorkoutHistory.length.toString()}
              description={`In the last ${timeRange === "7days" ? "7" : timeRange === "30days" ? "30" : "90"} days`}
              icon={<BarChart2 className="h-4 w-4" />}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Weight Trend</CardTitle>
                <CardDescription>Your weight changes over time</CardDescription>
              </CardHeader>
              <CardContent>
                {weightChartData.length > 1 ? (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={weightChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={["auto", "auto"]} />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="weight"
                          stroke="#BFA85D"
                          activeDot={{ r: 8 }}
                          name={`Weight (${profile.preferred_weight_unit})`}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[300px] text-center">
                    <p className="text-muted-foreground">Not enough weight data to display chart</p>
                    <p className="text-xs text-muted-foreground mt-1">Log your weight regularly to see trends</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Workout Frequency</CardTitle>
                <CardDescription>Days of the week you work out most</CardDescription>
              </CardHeader>
              <CardContent>
                {filteredWorkoutHistory.length > 0 ? (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={workoutFrequencyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#BFA85D" name="Workouts" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[300px] text-center">
                    <p className="text-muted-foreground">No workout data to display</p>
                    <p className="text-xs text-muted-foreground mt-1">Log your workouts to see frequency patterns</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Workout Types</CardTitle>
                <CardDescription>Distribution of your workout types</CardDescription>
              </CardHeader>
              <CardContent>
                {workoutTypeData.length > 0 ? (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={workoutTypeData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {workoutTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[300px] text-center">
                    <p className="text-muted-foreground">No workout type data to display</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Log workouts with different types to see distribution
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Macro Distribution</CardTitle>
                <CardDescription>Average macronutrient breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                {Object.keys(nutritionByDay).length > 0 ? (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={macroData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, value }) => `${name} ${value}%`}
                        >
                          <Cell fill="#BFA85D" /> {/* Protein */}
                          <Cell fill="#8884d8" /> {/* Carbs */}
                          <Cell fill="#82ca9d" /> {/* Fat */}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[300px] text-center">
                    <p className="text-muted-foreground">No nutrition data to display</p>
                    <p className="text-xs text-muted-foreground mt-1">Log your meals to see macro distribution</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="weight" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weight Tracking</CardTitle>
              <CardDescription>Detailed view of your weight changes</CardDescription>
            </CardHeader>
            <CardContent>
              {weightChartData.length > 1 ? (
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weightChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={["auto", "auto"]} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="#BFA85D"
                        activeDot={{ r: 8 }}
                        name={`Weight (${profile.preferred_weight_unit})`}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[400px] text-center">
                  <p className="text-muted-foreground">Not enough weight data to display chart</p>
                  <p className="text-xs text-muted-foreground mt-1">Log your weight regularly to see trends</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              title="Starting Weight"
              value={
                weightChartData.length > 0 ? `${weightChartData[0].weight} ${profile.preferred_weight_unit}` : "N/A"
              }
              description={weightChartData.length > 0 ? weightChartData[0].date : "No data"}
              icon={<LineChartIcon className="h-4 w-4" />}
            />
            <MetricCard
              title="Current Weight"
              value={
                weightChartData.length > 0
                  ? `${weightChartData[weightChartData.length - 1].weight} ${profile.preferred_weight_unit}`
                  : "N/A"
              }
              description={weightChartData.length > 0 ? weightChartData[weightChartData.length - 1].date : "No data"}
              icon={<LineChartIcon className="h-4 w-4" />}
            />
            <MetricCard
              title="Weight Change"
              value={
                weightChartData.length > 1
                  ? `${(weightChartData[weightChartData.length - 1].weight - weightChartData[0].weight).toFixed(1)} ${profile.preferred_weight_unit}`
                  : "N/A"
              }
              description="Total change in period"
              icon={<Activity className="h-4 w-4" />}
            />
          </div>
        </TabsContent>

        <TabsContent value="workouts" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Workout Frequency</CardTitle>
                <CardDescription>Days of the week you work out most</CardDescription>
              </CardHeader>
              <CardContent>
                {filteredWorkoutHistory.length > 0 ? (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={workoutFrequencyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#BFA85D" name="Workouts" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[300px] text-center">
                    <p className="text-muted-foreground">No workout data to display</p>
                    <p className="text-xs text-muted-foreground mt-1">Log your workouts to see frequency patterns</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Workout Types</CardTitle>
                <CardDescription>Distribution of your workout types</CardDescription>
              </CardHeader>
              <CardContent>
                {workoutTypeData.length > 0 ? (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={workoutTypeData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {workoutTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[300px] text-center">
                    <p className="text-muted-foreground">No workout type data to display</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Log workouts with different types to see distribution
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Workouts</CardTitle>
              <CardDescription>Your most recent training sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredWorkoutHistory.length > 0 ? (
                <div className="space-y-4">
                  {filteredWorkoutHistory.slice(0, 5).map((workout) => (
                    <div key={workout.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
                      <div className="bg-muted rounded-full p-2">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{workout.name}</p>
                          <Badge variant="outline">{workout.duration} min</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {format(parseISO(workout.date), "EEEE, MMMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-muted-foreground">No workout data to display</p>
                  <p className="text-xs text-muted-foreground mt-1">Log your workouts to see them here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nutrition" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Calorie Intake</CardTitle>
              <CardDescription>Your daily caloric consumption</CardDescription>
            </CardHeader>
            <CardContent>
              {nutritionChartData.length > 1 ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={nutritionChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="calories"
                        stroke="#BFA85D"
                        activeDot={{ r: 8 }}
                        name="Calories (kcal)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] text-center">
                  <p className="text-muted-foreground">Not enough nutrition data to display chart</p>
                  <p className="text-xs text-muted-foreground mt-1">Log your meals regularly to see trends</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Macronutrient Breakdown</CardTitle>
              <CardDescription>Your protein, carbs, and fat intake</CardDescription>
            </CardHeader>
            <CardContent>
              {nutritionChartData.length > 1 ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={nutritionChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="protein" fill="#BFA85D" name="Protein (g)" />
                      <Bar dataKey="carbs" fill="#8884d8" name="Carbs (g)" />
                      <Bar dataKey="fat" fill="#82ca9d" name="Fat (g)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] text-center">
                  <p className="text-muted-foreground">Not enough nutrition data to display chart</p>
                  <p className="text-xs text-muted-foreground mt-1">Log your meals regularly to see trends</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              title="Avg. Daily Calories"
              value={`${calculateAvgDailyCalories()} kcal`}
              description="Average intake"
              icon={<PieChartIcon className="h-4 w-4" />}
            />
            <MetricCard
              title="Macro Distribution"
              value={`${macroDistribution[0]}/${macroDistribution[1]}/${macroDistribution[2]}`}
              description="Protein/Carbs/Fat %"
              icon={<PieChartIcon className="h-4 w-4" />}
            />
            <MetricCard
              title="Days Tracked"
              value={Object.keys(nutritionByDay).length.toString()}
              description="Complete nutrition logs"
              icon={<Calendar className="h-4 w-4" />}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: string
  description: string
  icon: React.ReactNode
}

function MetricCard({ title, value, description, icon }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-muted-foreground">{title}</span>
            <span className="text-2xl font-bold">{value}</span>
            <span className="text-xs text-muted-foreground">{description}</span>
          </div>
          <div className="bg-primary/10 p-2 rounded-full">{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}
