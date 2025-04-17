'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { OnboardingForm } from "@/components/onboarding/onboarding-form"

export default function OnboardingPage() {
  const router = useRouter()

  const [form, setForm] = useState({
    gender: "",
    current_weight: "",
    target_weight: "",
    height: "",
    goal_type: "",
    fitness_level: "",
    activity_level: "",
  })

  useEffect(() => {
    // load saved onboarding data
    const saved = localStorage.getItem("onboardingData")
    if(saved) {
      setForm(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("onboardingData", JSON.stringify(form))
  }, [form])


  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-muted">
      <OnboardingForm />
    </div>
  )
}
