"use client"
import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { OnboardingState } from '@/types/onboarding'
import { Rocket, MessageSquare, ThumbsUp, Send, PartyPopper } from 'lucide-react'

interface Props {
  state: OnboardingState
  update: (v: Partial<OnboardingState['feedback']>) => void
}

export function StepLaunch({ state, update }: Props) {
  const [feedbackText, setFeedbackText] = useState('')
  const [submitted, setSubmitted] = useState(state.feedback.final_approval)

  const addFeedback = () => {
    if (!feedbackText.trim()) return
    const notes = [...state.feedback.notes, feedbackText.trim()]
    update({ notes, rounds: state.feedback.rounds + 1 })
    setFeedbackText('')
  }

  const approve = () => {
    update({ final_approval: true })
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <PartyPopper className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Strategy approved!</h2>
        <p className="text-muted-foreground max-w-md mx-auto mb-6">
          TorqueLoop is now generating your creatives, setting up campaigns, and building
          landing pages. You'll receive a notification when everything is ready for final review.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 text-green-700 text-sm font-medium border border-green-200">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Campaign generation in progress...
        </div>
        <div className="mt-8 grid grid-cols-3 gap-4 max-w-sm mx-auto text-center">
          <div>
            <div className="text-2xl font-bold text-primary">~30</div>
            <div className="text-xs text-muted-foreground">Min to generate</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">5+</div>
            <div className="text-xs text-muted-foreground">Creative variants</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">3</div>
            <div className="text-xs text-muted-foreground">Channels setup</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Pre-launch summary */}
      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Rocket className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Ready to launch?</h3>
            <p className="text-xs text-muted-foreground">
              Review your strategy brief on the previous step, then approve here to begin campaign generation.
            </p>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between py-1.5 border-b border-dashed">
            <span className="text-muted-foreground">Primary goal</span>
            <span className="font-medium capitalize">{state.goals.primary || '—'}</span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-dashed">
            <span className="text-muted-foreground">Budget</span>
            <span className="font-medium">{state.goals.budget_range || '—'}</span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-dashed">
            <span className="text-muted-foreground">Personas</span>
            <span className="font-medium">{state.personas.current.length + state.personas.ideal.length} defined</span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-dashed">
            <span className="text-muted-foreground">Active emotional triggers</span>
            <span className="font-medium">{state.messaging.emotional_triggers.filter(t => t.intensity > 5).length}</span>
          </div>
          <div className="flex items-center justify-between py-1.5">
            <span className="text-muted-foreground">Channels allocated</span>
            <span className="font-medium">{Object.values(state.strategy.budget_split).filter(v => v > 0).length}</span>
          </div>
        </div>
      </div>

      {/* Feedback section */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          <Label className="text-base font-semibold">Feedback & revisions</Label>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          Have changes? Add feedback and the AI will revise the strategy. Otherwise, approve to launch.
        </p>

        {state.feedback.notes.length > 0 && (
          <div className="space-y-2 mb-4">
            {state.feedback.notes.map((note, i) => (
              <div key={i} className="rounded-lg bg-muted/50 p-3 text-sm">
                <div className="text-xs text-muted-foreground mb-1">Revision round {i + 1}</div>
                {note}
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Textarea
            placeholder="Describe any changes you'd like to the strategy..."
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            className="min-h-[80px] resize-none"
          />
        </div>
        <div className="flex justify-end mt-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={addFeedback} disabled={!feedbackText.trim()}>
            <Send className="w-3 h-3" />
            Submit feedback
          </Button>
        </div>
      </div>

      {/* Approve button */}
      <div className="pt-4">
        <Button
          size="lg"
          className="w-full h-12 text-base gap-2"
          onClick={approve}
        >
          <ThumbsUp className="w-4 h-4" />
          Approve strategy & begin campaign generation
        </Button>
        <p className="text-xs text-muted-foreground text-center mt-2">
          You'll have a chance to review and approve all creatives before anything goes live.
        </p>
      </div>
    </div>
  )
}
