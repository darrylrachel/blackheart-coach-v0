"use client"

import { useState } from "react"
import type { User } from "@supabase/supabase-js"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { WeightChart } from "@/components/progress/weight-chart"
import { PhotoGallery } from "@/components/progress/photo-gallery"
import { PhotoUpload } from "@/components/progress/photo-upload"
import { WorkoutHistory } from "@/components/progress/workout-history"
import { ProgressMetrics } from "@/components/progress/progress-metrics"
import type { Database } from "@/lib/supabase/database.types"
import { Camera, LineChart, Dumbbell, BarChart } from "lucide-react"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]
type WeightData = Pick<Database["public"]["Tables"]["daily_metrics"]["Row"], "date" | "weight">
type ProgressPhoto = Database["public"]["Tables"]["progress_photos"]["Row"]
type Workout = Database["public"]["Tables"]["workouts"]["Row"]

interface ProgressViewProps {
  user: User
  profile: Profile
  weightHistory: WeightData[]
  progressPhotos: ProgressPhoto[]
  workoutHistory: Workout[]
}

export function ProgressView({ user, profile, weightHistory, progressPhotos, workoutHistory }: ProgressViewProps) {
  const [activeTab, setActiveTab] = useState("weight")
  const [showUploadForm, setShowUploadForm] = useState(false)

  // Reverse the weight history to show oldest to newest for the chart
  const chartData = [...weightHistory].reverse()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Progress Tracking</h1>
        <p className="text-muted-foreground">Track your fitness journey and see your improvements over time</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="weight" className="flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            <span className="hidden sm:inline">Weight</span>
          </TabsTrigger>
          <TabsTrigger value="photos" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            <span className="hidden sm:inline">Photos</span>
          </TabsTrigger>
          <TabsTrigger value="workouts" className="flex items-center gap-2">
            <Dumbbell className="h-4 w-4" />
            <span className="hidden sm:inline">Workouts</span>
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            <span className="hidden sm:inline">Metrics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="weight" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weight Tracking</CardTitle>
              <CardDescription>Monitor your weight changes over time</CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <WeightChart data={chartData} weightUnit={profile.preferred_weight_unit} />
              ) : (
                <div className="flex flex-col items-center justify-center h-60 border-2 border-dashed rounded-md">
                  <p className="text-muted-foreground text-center">No weight data available yet</p>
                  <p className="text-muted-foreground text-center text-sm mt-1">
                    Log your weight daily on the dashboard to see your progress
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="photos" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Progress Photos</CardTitle>
                <CardDescription>Visual record of your transformation</CardDescription>
              </div>
              <Button onClick={() => setShowUploadForm(!showUploadForm)}>
                {showUploadForm ? "Cancel" : "Add Photo"}
              </Button>
            </CardHeader>
            <CardContent>
              {showUploadForm ? (
                <PhotoUpload userId={user.id} onComplete={() => setShowUploadForm(false)} />
              ) : progressPhotos.length > 0 ? (
                <PhotoGallery photos={progressPhotos} />
              ) : (
                <div className="flex flex-col items-center justify-center h-60 border-2 border-dashed rounded-md">
                  <Camera className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground text-center">No progress photos yet</p>
                  <Button variant="outline" className="mt-4" onClick={() => setShowUploadForm(true)}>
                    Upload Your First Photo
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workouts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workout History</CardTitle>
              <CardDescription>Review your past workouts and performance</CardDescription>
            </CardHeader>
            <CardContent>
              {workoutHistory.length > 0 ? (
                <WorkoutHistory workouts={workoutHistory} />
              ) : (
                <div className="flex flex-col items-center justify-center h-60 border-2 border-dashed rounded-md">
                  <Dumbbell className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground text-center">No workout history yet</p>
                  <Button variant="outline" className="mt-4" asChild>
                    <a href="/workouts/new">Log Your First Workout</a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Progress Metrics</CardTitle>
              <CardDescription>Key performance indicators and achievements</CardDescription>
            </CardHeader>
            <CardContent>
              <ProgressMetrics weightHistory={weightHistory} workoutHistory={workoutHistory} profile={profile} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
