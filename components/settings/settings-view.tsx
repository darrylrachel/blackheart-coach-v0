"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { UserIcon, SettingsIcon, Bell, Shield, CreditCard, LogOut, Sparkles, Check, X } from "lucide-react"
import type { Database } from "@/lib/supabase/database.types"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]
type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"] | null

interface SettingsViewProps {
  user: User
  profile: Profile
  subscription: Subscription
}

export function SettingsView({ user, profile, subscription }: SettingsViewProps) {
  const router = useRouter()
  const supabase = getSupabaseClient()
  const [activeTab, setActiveTab] = useState("account")
  const [isUpdating, setIsUpdating] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Form states
  const [username, setUsername] = useState(profile.username)
  const [email, setEmail] = useState(user.email || "")
  const [weightUnit, setWeightUnit] = useState(profile.preferred_weight_unit)
  const [heightUnit, setHeightUnit] = useState(profile.preferred_height_unit)
  const [volumeUnit, setVolumeUnit] = useState(profile.preferred_volume_unit)
  const [emailNotifications, setEmailNotifications] = useState(profile.email_notifications)
  const [pushNotifications, setPushNotifications] = useState(profile.push_notifications)
  const [workoutReminders, setWorkoutReminders] = useState(profile.workout_reminders)
  const [nutritionReminders, setNutritionReminders] = useState(profile.nutrition_reminders)

  const updateProfile = async () => {
    setIsUpdating(true)
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          username,
          preferred_weight_unit: weightUnit,
          preferred_height_unit: heightUnit,
          preferred_volume_unit: volumeUnit,
          email_notifications: emailNotifications,
          push_notifications: pushNotifications,
          workout_reminders: workoutReminders,
          nutrition_reminders: nutritionReminders,
        })
        .eq("id", user.id)

      if (error) throw error

      toast({
        title: "Settings updated",
        description: "Your settings have been successfully updated.",
      })

      router.refresh()
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "There was a problem updating your settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await supabase.auth.signOut()
      router.push("/login")
    } catch (error) {
      console.error("Error logging out:", error)
      toast({
        title: "Error",
        description: "There was a problem logging out. Please try again.",
        variant: "destructive",
      })
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-5">
          <TabsTrigger value="account" className="flex items-center gap-2">
            <UserIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Account</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Preferences</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Privacy</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Billing</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Update your account details and personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground">
                  Email changes are managed through authentication settings
                </p>
              </div>
              <div className="space-y-2">
                <Label>Account Type</Label>
                <div className="flex items-center gap-2">
                  {subscription?.is_active ? (
                    <Badge className="bg-primary/10 text-primary">
                      <Sparkles className="mr-1 h-3 w-3" /> Premium
                    </Badge>
                  ) : (
                    <Badge variant="outline">Free</Badge>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleLogout} disabled={isLoggingOut}>
                <LogOut className="mr-2 h-4 w-4" />
                {isLoggingOut ? "Logging out..." : "Log out"}
              </Button>
              <Button onClick={updateProfile} disabled={isUpdating}>
                {isUpdating ? "Saving..." : "Save changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Units of Measurement</CardTitle>
              <CardDescription>Set your preferred units for weight, height, and volume</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="weight-unit">Weight Unit</Label>
                <Select value={weightUnit} onValueChange={setWeightUnit}>
                  <SelectTrigger id="weight-unit">
                    <SelectValue placeholder="Select weight unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">Kilograms (kg)</SelectItem>
                    <SelectItem value="lb">Pounds (lb)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="height-unit">Height Unit</Label>
                <Select value={heightUnit} onValueChange={setHeightUnit}>
                  <SelectTrigger id="height-unit">
                    <SelectValue placeholder="Select height unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cm">Centimeters (cm)</SelectItem>
                    <SelectItem value="ft">Feet/Inches (ft)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="volume-unit">Volume Unit</Label>
                <Select value={volumeUnit} onValueChange={setVolumeUnit}>
                  <SelectTrigger id="volume-unit">
                    <SelectValue placeholder="Select volume unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ml">Milliliters (ml)</SelectItem>
                    <SelectItem value="oz">Fluid Ounces (oz)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={updateProfile} disabled={isUpdating}>
                {isUpdating ? "Saving..." : "Save preferences"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure how and when you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Notification Channels</h3>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-notifications">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications on your device</p>
                  </div>
                  <Switch id="push-notifications" checked={pushNotifications} onCheckedChange={setPushNotifications} />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Notification Types</h3>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="workout-reminders">Workout Reminders</Label>
                    <p className="text-sm text-muted-foreground">Reminders for scheduled workouts</p>
                  </div>
                  <Switch id="workout-reminders" checked={workoutReminders} onCheckedChange={setWorkoutReminders} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="nutrition-reminders">Nutrition Reminders</Label>
                    <p className="text-sm text-muted-foreground">Reminders to log your meals and water intake</p>
                  </div>
                  <Switch
                    id="nutrition-reminders"
                    checked={nutritionReminders}
                    onCheckedChange={setNutritionReminders}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={updateProfile} disabled={isUpdating}>
                {isUpdating ? "Saving..." : "Save notification settings"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Manage your data and privacy preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Data Management</h3>
                <Separator />
                <div className="space-y-2">
                  <Button variant="outline" className="w-full sm:w-auto">
                    Download Your Data
                  </Button>
                  <p className="text-xs text-muted-foreground">Download a copy of all your personal data</p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Button variant="destructive" className="w-full sm:w-auto">
                    Delete Account
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Permanently delete your account and all associated data
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
              <CardDescription>Manage your subscription and billing information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{subscription?.is_active ? "Premium Plan" : "Free Plan"}</h3>
                      <p className="text-sm text-muted-foreground">
                        {subscription?.is_active
                          ? "You are currently on the Premium plan"
                          : "You are currently on the Free plan"}
                      </p>
                    </div>
                    {subscription?.is_active ? (
                      <Badge className="bg-primary/10 text-primary">
                        <Check className="mr-1 h-3 w-3" /> Active
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        <X className="mr-1 h-3 w-3" /> Limited
                      </Badge>
                    )}
                  </div>
                  {subscription?.is_active && (
                    <div className="mt-4 text-sm">
                      <p>Next billing date: {new Date(subscription.current_period_end).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>

                {!subscription?.is_active && (
                  <div className="rounded-lg border p-4 bg-muted/50">
                    <h3 className="font-medium">Upgrade to Premium</h3>
                    <ul className="mt-2 space-y-2 text-sm">
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-primary" />
                        Unlimited AI coaching
                      </li>
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-primary" />
                        Advanced analytics and insights
                      </li>
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-primary" />
                        Custom workout and meal plans
                      </li>
                      <li className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-primary" />
                        Priority support
                      </li>
                    </ul>
                    <Button className="mt-4 w-full">
                      <Sparkles className="mr-2 h-4 w-4" /> Upgrade Now
                    </Button>
                  </div>
                )}

                {subscription?.is_active && (
                  <Button variant="outline" className="w-full">
                    Manage Subscription
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Manage your payment methods and billing information</CardDescription>
            </CardHeader>
            <CardContent>
              {subscription?.is_active ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-4">
                      <div className="rounded-full bg-muted p-2">
                        <CreditCard className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">•••• •••• •••• 4242</p>
                        <p className="text-sm text-muted-foreground">Expires 12/25</p>
                      </div>
                    </div>
                    <Badge>Default</Badge>
                  </div>
                  <Button variant="outline" className="w-full">
                    Add Payment Method
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No payment methods</h3>
                  <p className="text-muted-foreground mt-1">You haven't added any payment methods yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
