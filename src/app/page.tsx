"use client"

import { useState } from "react"
import { LandingHero } from "@/components/landing/hero"
import { OnboardingWizard } from "@/components/onboarding/wizard"

export default function Home() {
  const [view, setView] = useState<"landing" | "onboarding">("landing")

  if (view === "onboarding") {
    return <OnboardingWizard onBack={() => setView("landing")} />
  }

  return <LandingHero onGetStarted={() => setView("onboarding")} />
}
