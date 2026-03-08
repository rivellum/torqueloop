"use client"
import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { OnboardingState, EmotionalTrigger, SevenSins } from '@/types/onboarding'
import { Sparkles } from 'lucide-react'

interface Props {
  state: OnboardingState
  update: (v: Partial<OnboardingState['messaging']>) => void
  onAiInsight: (msg: string, delay?: number) => void
}

const SINS: { id: SevenSins; label: string; emoji: string; desc: string; example: string }[] = [
  { id: 'greed', label: 'Greed', emoji: '💰', desc: 'Desire for more wealth, success, achievement', example: '"Earn $50K+/mo with no ceiling on your income"' },
  { id: 'pride', label: 'Pride', emoji: '👑', desc: 'Desire for status, recognition, being the best', example: '"Be your own boss. Lead, don\'t follow."' },
  { id: 'envy', label: 'Envy', emoji: '👀', desc: 'Others have what you want — you deserve it too', example: '"Your peers already made the switch. When will you?"' },
  { id: 'lust', label: 'Desire', emoji: '✨', desc: 'Craving the lifestyle, freedom, experiences', example: '"The lifestyle you\'ve always dreamed of is one decision away"' },
  { id: 'wrath', label: 'Frustration', emoji: '🔥', desc: 'Anger at current situation, desire to break free', example: '"Tired of being undervalued? There\'s a better way."' },
  { id: 'sloth', label: 'Ease', emoji: '🛋️', desc: 'The easy path, done-for-you, minimal effort', example: '"We handle everything. You just show up and sell."' },
  { id: 'gluttony', label: 'Abundance', emoji: '🎉', desc: 'Unlimited potential, overflowing results', example: '"Commissions that renew every year. Income that grows while you sleep."' },
]

const TONES = [
  { id: 'professional', label: 'Professional', desc: 'Corporate, trustworthy' },
  { id: 'casual', label: 'Casual', desc: 'Friendly, approachable' },
  { id: 'bold', label: 'Bold', desc: 'Provocative, attention-grabbing' },
  { id: 'inspirational', label: 'Inspirational', desc: 'Motivational, uplifting' },
  { id: 'urgent', label: 'Urgent', desc: 'Time-sensitive, FOMO' },
]

export function StepMessaging({ state, update, onAiInsight }: Props) {
  const [triggers, setTriggers] = useState<EmotionalTrigger[]>(
    state.messaging.emotional_triggers.length > 0
      ? state.messaging.emotional_triggers
      : SINS.map(s => ({ sin: s.id, message: '', intensity: 5 }))
  )

  const [selectedSins, setSelectedSins] = useState<Set<SevenSins>>(
    new Set(state.messaging.emotional_triggers.filter(t => t.intensity > 5).map(t => t.sin))
  )

  const toggleSin = (sin: SevenSins) => {
    const next = new Set(selectedSins)
    if (next.has(sin)) {
      next.delete(sin)
    } else {
      next.add(sin)
    }
    setSelectedSins(next)

    const updatedTriggers = triggers.map(t =>
      t.sin === sin ? { ...t, intensity: next.has(sin) ? 8 : 3 } : t
    )
    setTriggers(updatedTriggers)
    update({ emotional_triggers: updatedTriggers })
  }

  const updateTriggerMessage = (sin: SevenSins, message: string) => {
    const updatedTriggers = triggers.map(t =>
      t.sin === sin ? { ...t, message } : t
    )
    setTriggers(updatedTriggers)
    update({ emotional_triggers: updatedTriggers })
  }

  const updateIntensity = (sin: SevenSins, intensity: number) => {
    const updatedTriggers = triggers.map(t =>
      t.sin === sin ? { ...t, intensity } : t
    )
    setTriggers(updatedTriggers)
    update({ emotional_triggers: updatedTriggers })
  }

  const generateMessages = () => {
    onAiInsight(
      "I'm crafting emotionally targeted messages for each trigger based on your personas. The best campaigns combine 2-3 primary emotions with supporting ones for different stages of the funnel.",
      1500
    )
    setTimeout(() => {
      const examples: Record<SevenSins, string> = {
        greed: "Unlimited earning potential. Your income has no ceiling — top performers earn $50K+/mo.",
        pride: "Stop working for someone else's dream. Build your own legacy.",
        envy: "While you're reading this, 500+ agents are already earning with us. What's stopping you?",
        lust: "Imagine: flexible hours, financial freedom, work from anywhere. This is real.",
        wrath: "Fed up with a dead-end job? Your skills are worth more than what they're paying you.",
        sloth: "Full training provided. No experience needed. We give you the tools, leads, and mentorship.",
        gluttony: "Recurring commissions. Every policy you sell pays you again next year. And the year after."
      }
      const updated = triggers.map(t => ({
        ...t,
        message: examples[t.sin] || t.message,
        intensity: selectedSins.has(t.sin) ? t.intensity : t.intensity
      }))
      setTriggers(updated)
      update({ emotional_triggers: updated })
    }, 2000)
  }

  return (
    <div className="space-y-8">
      {/* Tone selector */}
      <div>
        <Label className="text-base font-semibold mb-2 block">Brand tone</Label>
        <p className="text-sm text-muted-foreground mb-3">
          How should your marketing voice feel?
        </p>
        <div className="flex flex-wrap gap-2">
          {TONES.map(t => (
            <button
              key={t.id}
              onClick={() => update({ tone: t.id })}
              className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                state.messaging.tone === t.id
                  ? 'border-primary bg-primary/10 text-primary font-medium'
                  : 'border-border text-muted-foreground hover:border-primary/30'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Emotional triggers */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-base font-semibold">Emotional triggers</Label>
          <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" onClick={generateMessages}>
            <Sparkles className="w-3 h-3" /> Auto-generate messages
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Select which emotional drivers resonate most with your audience. We'll weight your messaging strategy accordingly.
        </p>

        <div className="space-y-3">
          {SINS.map(sin => {
            const trigger = triggers.find(t => t.sin === sin.id)
            const isActive = selectedSins.has(sin.id)

            return (
              <div
                key={sin.id}
                className={`rounded-xl border transition-all overflow-hidden ${
                  isActive ? 'border-primary/30 bg-primary/5' : 'border-border'
                }`}
              >
                <button
                  onClick={() => toggleSin(sin.id)}
                  className="w-full flex items-center gap-3 p-3 text-left"
                >
                  <span className="text-xl">{sin.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{sin.label}</span>
                      {isActive && <Badge variant="default" className="text-[10px] px-1.5 py-0">Active</Badge>}
                    </div>
                    <div className="text-xs text-muted-foreground">{sin.desc}</div>
                  </div>
                </button>

                {isActive && (
                  <div className="px-3 pb-3 space-y-2">
                    <div className="text-xs text-muted-foreground italic pl-10">
                      Example: {sin.example}
                    </div>
                    <div className="pl-10">
                      <Textarea
                        placeholder={`Your ${sin.label.toLowerCase()} message...`}
                        value={trigger?.message || ''}
                        onChange={(e) => updateTriggerMessage(sin.id, e.target.value)}
                        className="min-h-[60px] resize-none text-sm"
                      />
                    </div>
                    <div className="pl-10 flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-16">Intensity:</span>
                      <Slider
                        value={[trigger?.intensity || 5]}
                        onValueChange={([v]) => updateIntensity(sin.id, v)}
                        min={1}
                        max={10}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-xs font-mono w-6 text-right">{trigger?.intensity || 5}</span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
