"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Brain, Send, Dumbbell, Utensils, Sparkles, Clock, MessageSquare, Zap } from "lucide-react"
import type { Database } from "@/lib/supabase/database.types"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]
type AIUsage = Database["public"]["Tables"]["ai_usage"]["Row"]
type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"] | null

interface CoachViewProps {
  user: User
  profile: Profile
  aiUsage: AIUsage[]
  subscription: Subscription
}

export function CoachView({ user, profile, aiUsage, subscription }: CoachViewProps) {
  const router = useRouter()
  const supabase = getSupabaseClient()
  const [activeTab, setActiveTab] = useState("chat")
  const [prompt, setPrompt] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    {
      role: "assistant",
      content: `Hello ${profile.username}! I'm your Blackheart Coach AI assistant. How can I help with your fitness journey today?`,
    },
  ])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Check if user has available AI credits
  const hasCredits = subscription?.is_active || (profile.ai_credits && profile.ai_credits > 0)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async () => {
    if (!prompt.trim() || isSubmitting) return
    if (!hasCredits) {
      setMessages([
        ...messages,
        { role: "user", content: prompt },
        {
          role: "assistant",
          content:
            "You've reached your AI usage limit. Please upgrade your subscription to continue using the AI coach.",
        },
      ])
      setPrompt("")
      setTimeout(scrollToBottom, 100)
      return
    }

    const userMessage = prompt
    setMessages([...messages, { role: "user", content: userMessage }])
    setPrompt("")
    setIsSubmitting(true)

    // Simulate AI response (in a real app, this would call an AI API)
    setTimeout(() => {
      // Mock responses based on keywords
      let response = "I'm here to help with your fitness journey. What specific advice are you looking for?"

      const lowerPrompt = userMessage.toLowerCase()
      if (lowerPrompt.includes("workout") || lowerPrompt.includes("exercise")) {
        response =
          "For effective workouts, focus on progressive overload and proper form. Make sure to include both strength training and cardiovascular exercise in your routine. Would you like me to suggest a specific workout plan based on your goals?"
      } else if (lowerPrompt.includes("nutrition") || lowerPrompt.includes("diet") || lowerPrompt.includes("food")) {
        response =
          "Nutrition is key to reaching your fitness goals. Focus on whole foods, adequate protein intake, and staying hydrated. Would you like specific meal suggestions based on your calorie and macro targets?"
      } else if (lowerPrompt.includes("motivation") || lowerPrompt.includes("stuck")) {
        response =
          "It's normal to experience motivation dips. Try setting smaller, achievable goals, finding a workout buddy, or mixing up your routine. Remember why you started this journey and celebrate your progress, no matter how small."
      }

      setMessages((prev) => [...prev, { role: "assistant", content: response }])
      setIsSubmitting(false)

      // Log AI usage to database (in a real implementation)
      // This would be handled by a server action in production
      const logUsage = async () => {
        try {
          await supabase.from("ai_usage").insert({
            user_id: user.id,
            prompt: userMessage,
            tokens_used: Math.floor(Math.random() * 500) + 100, // Mock token usage
            feature: "coach_chat",
          })

          // Decrement AI credits if not on subscription
          if (!subscription?.is_active && profile.ai_credits && profile.ai_credits > 0) {
            await supabase
              .from("profiles")
              .update({ ai_credits: profile.ai_credits - 1 })
              .eq("id", user.id)
          }

          router.refresh()
        } catch (error) {
          console.error("Error logging AI usage:", error)
        }
      }

      logUsage()
      setTimeout(scrollToBottom, 100)
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">AI Coach</h1>
          {hasCredits ? (
            subscription?.is_active ? (
              <Badge variant="outline" className="bg-primary/10 text-primary">
                <Sparkles className="mr-1 h-3 w-3" /> Premium
              </Badge>
            ) : (
              <Badge variant="outline">
                <Zap className="mr-1 h-3 w-3" /> {profile.ai_credits} Credits Left
              </Badge>
            )
          ) : (
            <Badge variant="destructive">
              <Zap className="mr-1 h-3 w-3" /> No Credits
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground">Get personalized fitness advice, workout plans, and nutrition guidance</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>Chat</span>
          </TabsTrigger>
          <TabsTrigger value="workout" className="flex items-center gap-2">
            <Dumbbell className="h-4 w-4" />
            <span>Workout Plans</span>
          </TabsTrigger>
          <TabsTrigger value="nutrition" className="flex items-center gap-2">
            <Utensils className="h-4 w-4" />
            <span>Nutrition</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-4">
          <Card className="flex flex-col h-[calc(100vh-280px)]">
            <CardHeader className="pb-2">
              <CardTitle>Coach Chat</CardTitle>
              <CardDescription>Ask questions about fitness, nutrition, or workout plans</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      <p className="whitespace-pre-line">{message.content}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <div className="flex w-full items-center space-x-2">
                <Textarea
                  placeholder="Ask your fitness coach..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="flex-1 min-h-10 resize-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                />
                <Button
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={!prompt.trim() || isSubmitting || !hasCredits}
                >
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send</span>
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="workout" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Workout Generator</CardTitle>
              <CardDescription>Generate personalized workout plans based on your goals and preferences</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <Brain className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-center">Personalized Workout Plans</h3>
              <p className="text-muted-foreground text-center mt-2 max-w-md">
                Get AI-generated workout plans tailored to your fitness level, goals, and available equipment
              </p>
              <Button className="mt-6" disabled={!hasCredits}>
                <Sparkles className="mr-2 h-4 w-4" /> Generate Workout Plan
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nutrition" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Nutrition Guidance</CardTitle>
              <CardDescription>Get personalized meal plans and nutrition advice</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <Utensils className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-center">Meal Planning Assistant</h3>
              <p className="text-muted-foreground text-center mt-2 max-w-md">
                Generate meal plans and recipes based on your calorie goals, dietary preferences, and macronutrient
                targets
              </p>
              <Button className="mt-6" disabled={!hasCredits}>
                <Sparkles className="mr-2 h-4 w-4" /> Create Meal Plan
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Recent AI Interactions</CardTitle>
          <CardDescription>Your recent conversations with the AI coach</CardDescription>
        </CardHeader>
        <CardContent>
          {aiUsage.length > 0 ? (
            <div className="space-y-4">
              {aiUsage.map((usage) => (
                <div key={usage.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
                  <div className="bg-muted rounded-full p-2">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium truncate">{usage.prompt}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-muted-foreground">
                        {new Date(usage.created_at).toLocaleDateString()} at{" "}
                        {new Date(usage.created_at).toLocaleTimeString()}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {usage.feature.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No AI interactions yet</h3>
              <p className="text-muted-foreground mt-1">Start chatting with your AI coach to see your history here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
