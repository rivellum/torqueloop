"use client"
import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Zap, ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react'
import { OnboardingState, DEFAULT_STATE, STEP_NAMES, STEP_DESCRIPTIONS } from '@/types/onboarding'
import { StepGoals } from './steps/step-goals'
import { StepTracking } from './steps/step-tracking'
import { StepOutcomes } from './steps/step-outcomes'
import { StepChannels } from './steps/step-channels'
import { StepPersonas } from './steps/step-personas'
import { StepMessaging } from './steps/step-messaging'
import { StepStrategy } from './steps/step-strategy'
import { StepPresentation } from './steps/step-presentation'
import { StepLaunch } from './steps/step-launch'
import { AiInsight } from './ai-insight'

interface WizardProps {
  onBack: () => void
}

export function OnboardingWizard({ onBack }: WizardProps) {
  const [step, setStep] = useState(0)
  const [state, setState] = useState<OnboardingState>(DEFAULT_STATE)
  const [aiThinking, setAiThinking] = useState(false)
  const [aiInsight, setAiInsight] = useState<string | null>(null)

  const totalSteps = 9
  const progress = ((step + 1) / totalSteps) * 100

  const updateState = useCallback(<K extends keyof OnboardingState>(
    key: K,
    value: Partial<OnboardingState[K]>
  ) => {
    setState(prev => ({
      ...prev,
      [key]: { ...prev[key], ...value }
    }))
  }, [])

  const simulateAi = useCallback((message: string, delay = 1500) => {
    setAiThinking(true)
    setAiInsight(null)
    setTimeout(() => {
      setAiInsight(message)
      setAiThinking(false)
    }, delay)
  }, [])

  const handleNext = () => {
    if (step < totalSteps - 1) {
      const nextStep = step + 1
      setStep(nextStep)
      setAiInsight(null)

      // Trigger AI insight for the new step
      const insights: Record<number, string> = {
        1: "Based on your goals, I'll recommend the best tracking system. Most businesses your size get the most value from a simple CRM or even a well-structured spreadsheet to start.",
        2: "This is the most important step. When we know what a win costs you versus what it's worth, I can optimize every creative, channel, and dollar toward outcomes that actually move your business.",
        3: "Let's look at what's worked and what hasn't. Understanding your channel history helps me avoid repeating what failed and double down on what converted.",
        4: "Now I'm going to help you think about who you're really trying to reach. The difference between a good campaign and a great one is persona specificity.",
        5: "This is where it gets powerful. I'll map emotional triggers to your personas using frameworks that drive action — not just awareness, but conversion.",
        6: "Based on your personas and messaging, I can see which channels will give you the best return. Let me build a budget-optimized channel mix.",
        7: "I've compiled everything into a strategy brief. Review it carefully — this is your marketing blueprint for the next 30 days.",
        8: "Almost there. Once you approve, I'll start generating creatives, building landing pages, and setting up campaigns across your chosen channels."
      }
      if (insights[nextStep]) {
        simulateAi(insights[nextStep], 1200 + Math.random() * 800)
      }
    }
  }

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1)
      setAiInsight(null)
    }
  }

  const steps = [
    <StepGoals state={state} update={(v) => updateState('goals', v)} onAiInsight={simulateAi} />,
    <StepTracking state={state} update={(v) => updateState('tracking', v)} />,
    <StepOutcomes state={state} update={(v) => updateState('outcomes', v)} onAiInsight={simulateAi} />,
    <StepChannels state={state} update={(v) => updateState('channels', v)} />,
    <StepPersonas state={state} update={(v) => updateState('personas', v)} onAiInsight={simulateAi} />,
    <StepMessaging state={state} update={(v) => updateState('messaging', v)} onAiInsight={simulateAi} />,
    <StepStrategy state={state} update={(v) => updateState('strategy', v)} />,
    <StepPresentation state={state} update={(v) => updateState('presentation', v)} />,
    <StepLaunch state={state} update={(v) => updateState('feedback', v)} />,
  ]

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-72 border-r bg-card flex-col">
        <div className="p-5 border-b">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-bold tracking-tight">TorqueLoop</span>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {STEP_NAMES.map((name, i) => {
            const isActive = i === step
            const isCompleted = i < step
            const isFuture = i > step

            return (
              <button
                key={i}
                onClick={() => i <= step && setStep(i)}
                disabled={isFuture}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : isCompleted
                    ? 'text-foreground hover:bg-muted cursor-pointer'
                    : 'text-muted-foreground cursor-not-allowed'
                }`}
              >
                <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium shrink-0 ${
                  isCompleted
                    ? 'bg-primary text-primary-foreground'
                    : isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : i + 1}
                </span>
                <div>
                  <div>{name}</div>
                  <div className={`text-xs ${isActive ? 'text-primary/70' : 'text-muted-foreground'}`}>
                    {STEP_DESCRIPTIONS[i]}
                  </div>
                </div>
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t">
          <div className="text-xs text-muted-foreground mb-1.5">
            Step {step + 1} of {totalSteps}
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <div className="lg:hidden border-b p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
                <Zap className="w-3 h-3 text-primary-foreground" />
              </div>
              <span className="font-bold text-sm">TorqueLoop</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {step + 1} / {totalSteps}
            </span>
          </div>
          <Progress value={progress} className="h-1" />
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-2xl mx-auto px-6 py-8 lg:py-12">
            {/* Step header */}
            <div className="mb-8 fade-in" key={`header-${step}`}>
              <div className="flex items-center gap-2 mb-2 text-sm font-medium text-primary">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs">
                  {step + 1}
                </span>
                {STEP_NAMES[step]}
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight mb-1">
                {[
                  'What are your growth goals?',
                  'Where do you track progress?',
                  'Define your success metrics',
                  "Let's audit your channels",
                  'Who are your ideal customers?',
                  'Craft your messaging strategy',
                  'Your optimized channel mix',
                  'Your strategy brief',
                  'Review and launch'
                ][step]}
              </h1>
              <p className="text-muted-foreground">
                {STEP_DESCRIPTIONS[step]}
              </p>
            </div>

            {/* AI Insight */}
            <AiInsight thinking={aiThinking} message={aiInsight} />

            {/* Step content */}
            <div className="fade-in" key={`step-${step}`}>
              {steps[step]}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t bg-card px-6 py-4">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={step === 0 ? onBack : handleBack}
              className="gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              {step === 0 ? 'Back to home' : 'Previous'}
            </Button>

            <Button
              onClick={handleNext}
              disabled={aiThinking || step === totalSteps - 1}
              className="gap-1.5"
            >
              {aiThinking ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  AI analyzing...
                </>
              ) : step === totalSteps - 2 ? (
                <>
                  Generate strategy
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
