"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"

type OnboardingStep = "personal" | "body" | "goals" | "activity" | "preferences" | "complete"

export function OnboardingForm() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("personal")
  const [formData, setFormData] = useState({
    username: "",
    gender: "male",
    currentWeight: 70,
    height: 175,
    fitnessGoal: "muscle_gain" as "fat_loss" | "muscle_gain" | "maintenance",
    fitnessLevel: "newbie" as "newbie" | "intermediate" | "advanced",
    activityLevel: "moderately_active" as
      | "sedentary"
      | "lightly_active"
      | "moderately_active"
      | "very_active"
      | "extremely_active",
    preferredWeightUnit: "kg" as "lbs" | "kg",
    preferredVolumeUnit: "ml" as "oz" | "ml",
  })

  useEffect(() => {
    localStorage.setItem("onboardingData", JSON.stringify(formData))
  }, [formData])

  const steps: OnboardingStep[] = [
    "personal",
    "body",
    "goals",
    "activity",
    "preferences",
    "complete",
  ]

  const currentStepIndex = steps.indexOf(currentStep)
  const progress = (currentStepIndex / (steps.length - 1)) * 100

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex])
    }
  }

  const handlePrevious = () => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex])
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSliderChange = (name: string, value: number[]) => {
    setFormData((prev) => ({ ...prev, [name]: value[0] }))
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Set Up Your Profile</CardTitle>
        <CardDescription className="text-center">
          {currentStep === "personal" && "Tell us a bit about yourself"}
          {currentStep === "body" && "Let's get your body measurements"}
          {currentStep === "goals" && "What are your fitness goals?"}
          {currentStep === "activity" && "How active are you?"}
          {currentStep === "preferences" && "Set your preferences"}
          {currentStep === "complete" && "Review your information"}
        </CardDescription>
        <Progress value={progress} className="h-2 mt-2" />
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {/* Render your onboarding steps UI here */}
      </CardContent>
      <CardFooter className="flex justify-between">
        {currentStepIndex > 0 && (
          <Button variant="outline" onClick={handlePrevious}>
            Back
          </Button>
        )}
        {currentStepIndex === 0 && <div />}

        {currentStep !== "complete" ? (
          <Button onClick={handleNext} disabled={currentStep === "personal" && !formData.username}>
            Next
          </Button>
        ) : (
          <Button onClick={() => router.push("/login")}>Continue to Sign Up</Button>
        )}
      </CardFooter>
    </Card>
  )
}
