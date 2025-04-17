"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import type { User } from "@supabase/supabase-js"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import {
  UserIcon,
  Edit,
  Camera,
  Dumbbell,
  Utensils,
  PenSquare,
  ImageIcon,
  Calendar,
  Weight,
  Ruler,
  Trophy,
  SettingsIcon,
} from "lucide-react"
import type { Database } from "@/lib/supabase/database.types"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]

interface ProfileViewProps {
  user: User
  profile: Profile
  stats: {
    workoutCount: number
    nutritionCount: number
    journalCount: number
    photoCount: number
  }
}

export function ProfileView({ user, profile, stats }: ProfileViewProps) {
  const router = useRouter()
  const supabase = getSupabaseClient()
  const [isEditing, setIsEditing] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  // Form states
  const [username, setUsername] = useState(profile.username)
  const [bio, setBio] = useState(profile.bio || "")
  const [fitnessGoal, setFitnessGoal] = useState(profile.fitness_goal)
  const [activityLevel, setActivityLevel] = useState(profile.activity_level)
  const [weight, setWeight] = useState(profile.current.weight?.toString() || "")
  const [height, setHeight] = useState(profile.height?.toString() || "")

  const updateProfile = async () => {
    setIsUpdating(true)
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          username,
          bio,
          fitness_goal: fitnessGoal,
          activity_level: activityLevel,
          current_weight: parseFloat(weight),
      height,
      preferred_weight_unit: preferredWeightUnit,
      preferred_volume_unit: preferredVolumeUnit,
        })
        .eq("id", user.id)

      if (error) throw error

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      })

      setIsEditing(false)
      router.refresh()
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "There was a problem updating your profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const formatFitnessGoal = (goal: string) => {
    switch (goal) {
      case "fat_loss":
        return "Fat Loss"
      case "muscle_gain":
        return "Muscle Gain"
      case "maintenance":
        return "Maintenance"
      case "general_fitness":
        return "General Fitness"
      default:
        return goal.replace("_", " ")
    }
  }

  const formatActivityLevel = (level: string) => {
    switch (level) {
      case "sedentary":
        return "Sedentary"
      case "lightly_active":
        return "Lightly Active"
      case "moderately_active":
        return "Moderately Active"
      case "very_active":
        return "Very Active"
      case "extremely_active":
        return "Extremely Active"
      default:
        return level.replace("_", " ")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">View and manage your personal profile</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Your personal information and fitness details</CardDescription>
              </div>
              {!isEditing && (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about yourself and your fitness journey"
                      className="min-h-[100px]"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fitness-goal">Fitness Goal</Label>
                      <Select value={fitnessGoal} onValueChange={setFitnessGoal}>
                        <SelectTrigger id="fitness-goal">
                          <SelectValue placeholder="Select fitness goal" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fat_loss">Fat Loss</SelectItem>
                          <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="general_fitness">General Fitness</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="activity-level">Activity Level</Label>
                      <Select value={activityLevel} onValueChange={setActivityLevel}>
                        <SelectTrigger id="activity-level">
                          <SelectValue placeholder="Select activity level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sedentary">Sedentary</SelectItem>
                          <SelectItem value="lightly_active">Lightly Active</SelectItem>
                          <SelectItem value="moderately_active">Moderately Active</SelectItem>
                          <SelectItem value="very_active">Very Active</SelectItem>
                          <SelectItem value="extremely_active">Extremely Active</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight ({profile.preferred_weight_unit})</Label>
                      <Input
                        id="weight"
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        placeholder={`Enter weight in ${profile.preferred_weight_unit}`}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="height">Height ({profile.preferred_height_unit})</Label>
                      <Input
                        id="height"
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        placeholder={`Enter height in ${profile.preferred_height_unit}`}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-muted-foreground">Username</h3>
                    <p>{profile.username}</p>
                  </div>
                  <Separator />
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-muted-foreground">Bio</h3>
                    <p>{profile.bio || "No bio provided"}</p>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-muted-foreground">Fitness Goal</h3>
                      <p>{formatFitnessGoal(profile.fitness_goal)}</p>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-muted-foreground">Activity Level</h3>
                      <p>{formatActivityLevel(profile.activity_level)}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-muted-foreground">Weight</h3>
                      <p>{profile.weight ? `${profile.weight} ${profile.preferred_weight_unit}` : "Not provided"}</p>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-muted-foreground">Height</h3>
                      <p>{profile.height ? `${profile.height} ${profile.preferred_height_unit}` : "Not provided"}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            {isEditing && (
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={updateProfile} disabled={isUpdating}>
                  {isUpdating ? "Saving..." : "Save changes"}
                </Button>
              </CardFooter>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activity Stats</CardTitle>
              <CardDescription>Your activity and engagement on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                  icon={<Dumbbell className="h-4 w-4" />}
                  title="Workouts"
                  value={stats.workoutCount.toString()}
                  description="Total logged"
                />
                <StatCard
                  icon={<Utensils className="h-4 w-4" />}
                  title="Meals"
                  value={stats.nutritionCount.toString()}
                  description="Total logged"
                />
                <StatCard
                  icon={<PenSquare className="h-4 w-4" />}
                  title="Journal Entries"
                  value={stats.journalCount.toString()}
                  description="Total written"
                />
                <StatCard
                  icon={<ImageIcon className="h-4 w-4" />}
                  title="Progress Photos"
                  value={stats.photoCount.toString()}
                  description="Total uploaded"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
              <CardDescription>Milestones and badges you've earned</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.workoutCount > 0 || stats.nutritionCount > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {stats.workoutCount >= 1 && (
                    <AchievementCard
                      icon={<Dumbbell className="h-5 w-5" />}
                      title="First Workout"
                      description="Completed your first workout"
                    />
                  )}
                  {stats.workoutCount >= 10 && (
                    <AchievementCard
                      icon={<Dumbbell className="h-5 w-5" />}
                      title="Workout Warrior"
                      description="Completed 10+ workouts"
                    />
                  )}
                  {stats.nutritionCount >= 1 && (
                    <AchievementCard
                      icon={<Utensils className="h-5 w-5" />}
                      title="Nutrition Tracker"
                      description="Logged your first meal"
                    />
                  )}
                  {stats.journalCount >= 1 && (
                    <AchievementCard
                      icon={<PenSquare className="h-5 w-5" />}
                      title="Reflective Mind"
                      description="Created your first journal entry"
                    />
                  )}
                  {stats.photoCount >= 1 && (
                    <AchievementCard
                      icon={<Camera className="h-5 w-5" />}
                      title="Progress Tracker"
                      description="Uploaded your first progress photo"
                    />
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No achievements yet</h3>
                  <p className="text-muted-foreground mt-1">Start logging workouts and meals to earn achievements</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>Your profile image</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="relative w-32 h-32 rounded-full overflow-hidden border mb-4">
                {profile.avatar_url ? (
                  <Image
                    src={profile.avatar_url || "/placeholder.svg"}
                    alt={profile.username}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <UserIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>
              <Button variant="outline" className="w-full">
                <Camera className="mr-2 h-4 w-4" />
                Change Picture
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                <p>{user.email}</p>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground">Member Since</h3>
                <p>{new Date(user.created_at).toLocaleDateString()}</p>
              </div>
              <Button variant="outline" className="w-full" onClick={() => router.push("/settings")}>
                <SettingsIcon className="mr-2 h-4 w-4" />
                Account Settings
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Body Metrics</CardTitle>
              <CardDescription>Your current body measurements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Weight className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Weight</p>
                  <p className="text-lg">
                    {profile.weight ? `${profile.weight} ${profile.preferred_weight_unit}` : "Not set"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Ruler className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Height</p>
                  <p className="text-lg">
                    {profile.height ? `${profile.height} ${profile.preferred_height_unit}` : "Not set"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Age</p>
                  <p className="text-lg">{profile.age ? `${profile.age} years` : "Not set"}</p>
                </div>
              </div>
              <Button variant="outline" className="w-full" onClick={() => router.push("/progress")}>
                View Progress
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

interface StatCardProps {
  icon: React.ReactNode
  title: string
  value: string
  description: string
}

function StatCard({ icon, title, value, description }: StatCardProps) {
  return (
    <div className="flex flex-col items-center justify-center p-4 bg-muted rounded-lg text-center">
      <div className="bg-primary/10 p-2 rounded-full mb-2">{icon}</div>
      <h3 className="text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  )
}

interface AchievementCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

function AchievementCard({ icon, title, description }: AchievementCardProps) {
  return (
    <div className="flex items-center gap-3 p-3 border rounded-lg">
      <div className="bg-primary/10 p-2 rounded-full">{icon}</div>
      <div>
        <h3 className="text-sm font-medium">{title}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
