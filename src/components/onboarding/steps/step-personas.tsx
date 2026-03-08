"use client"
import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { OnboardingState, PersonaProfile } from '@/types/onboarding'
import { Plus, Sparkles, X, User } from 'lucide-react'

interface Props {
  state: OnboardingState
  update: (v: Partial<OnboardingState['personas']>) => void
  onAiInsight: (msg: string, delay?: number) => void
}

const EMPTY_PERSONA: PersonaProfile = {
  name: '',
  age_range: '',
  occupation: '',
  pain_points: [],
  desires: [],
  media_habits: [],
  location: ''
}

function PersonaCard({
  persona,
  index,
  onChange,
  onRemove,
  isAiGenerated
}: {
  persona: PersonaProfile
  index: number
  onChange: (p: PersonaProfile) => void
  onRemove: () => void
  isAiGenerated?: boolean
}) {
  // Local raw string state so spaces aren't eaten mid-typing.
  // We convert to array only on blur (when the user finishes typing).
  const [rawPainPoints, setRawPainPoints] = useState(persona.pain_points.join(', '))
  const [rawDesires, setRawDesires] = useState(persona.desires.join(', '))

  const commitPainPoints = (raw: string) => {
    onChange({ ...persona, pain_points: raw.split(',').map(s => s.trim()).filter(Boolean) })
  }
  const commitDesires = (raw: string) => {
    onChange({ ...persona, desires: raw.split(',').map(s => s.trim()).filter(Boolean) })
  }

  return (
    <div className="p-4 rounded-xl border bg-card space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
          <span className="font-medium text-sm">Persona {index + 1}</span>
          {isAiGenerated && (
            <Badge variant="secondary" className="text-[10px] gap-1">
              <Sparkles className="w-2.5 h-2.5" /> AI Generated
            </Badge>
          )}
        </div>
        <button onClick={onRemove} className="p-1 rounded hover:bg-muted text-muted-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <Label className="text-xs mb-1 block">Name / Label</Label>
          <Input
            placeholder="E.g., 'Career Changer Carlos'"
            value={persona.name}
            onChange={(e) => onChange({ ...persona, name: e.target.value })}
            className="h-9 text-sm"
          />
        </div>
        <div>
          <Label className="text-xs mb-1 block">Age Range</Label>
          <Input
            placeholder="E.g., '25-40'"
            value={persona.age_range}
            onChange={(e) => onChange({ ...persona, age_range: e.target.value })}
            className="h-9 text-sm"
          />
        </div>
        <div>
          <Label className="text-xs mb-1 block">Occupation / Situation</Label>
          <Input
            placeholder="E.g., 'Employed but dissatisfied'"
            value={persona.occupation}
            onChange={(e) => onChange({ ...persona, occupation: e.target.value })}
            className="h-9 text-sm"
          />
        </div>
        <div>
          <Label className="text-xs mb-1 block">Location</Label>
          <Input
            placeholder="E.g., 'Mexico City metro'"
            value={persona.location}
            onChange={(e) => onChange({ ...persona, location: e.target.value })}
            className="h-9 text-sm"
          />
        </div>
      </div>

      <div>
        <Label className="text-xs mb-1 block">Pain points (what frustrates them?)</Label>
        <p className="text-[11px] text-muted-foreground mb-1">Separate each item with a comma</p>
        <Textarea
          placeholder="Stagnant salary, toxic boss, no growth path..."
          value={rawPainPoints}
          onChange={(e) => setRawPainPoints(e.target.value)}
          onBlur={() => commitPainPoints(rawPainPoints)}
          className="min-h-[60px] resize-none text-sm"
        />
      </div>

      <div>
        <Label className="text-xs mb-1 block">Desires (what do they want?)</Label>
        <p className="text-[11px] text-muted-foreground mb-1">Separate each item with a comma</p>
        <Textarea
          placeholder="Financial freedom, flexibility, be their own boss..."
          value={rawDesires}
          onChange={(e) => setRawDesires(e.target.value)}
          onBlur={() => commitDesires(rawDesires)}
          className="min-h-[60px] resize-none text-sm"
        />
      </div>
    </div>
  )
}

export function StepPersonas({ state, update, onAiInsight }: Props) {
  const [personas, setPersonas] = useState<PersonaProfile[]>(
    state.personas.ideal.length > 0 ? state.personas.ideal : []
  )

  const addPersona = () => {
    const next = [...personas, { ...EMPTY_PERSONA }]
    setPersonas(next)
    update({ ideal: next })
  }

  const updatePersona = (index: number, persona: PersonaProfile) => {
    const next = [...personas]
    next[index] = persona
    setPersonas(next)
    update({ ideal: next })
  }

  const removePersona = (index: number) => {
    const next = personas.filter((_, i) => i !== index)
    setPersonas(next)
    update({ ideal: next })
  }

  const generateWithAi = () => {
    onAiInsight(
      "Analyzing your goals and channel data... I'm building persona profiles based on who typically converts for businesses like yours. Give me a moment.",
      1500
    )

    // Simulate AI-generated personas
    setTimeout(() => {
      const aiPersonas: PersonaProfile[] = [
        {
          name: 'Ambitious Professional',
          age_range: '28-38',
          occupation: 'Mid-career employee seeking more',
          pain_points: ['Salary ceiling', 'No growth path', 'Underutilized skills'],
          desires: ['Financial independence', 'Flexible schedule', 'Meaningful work'],
          media_habits: ['Instagram', 'LinkedIn', 'YouTube'],
          location: 'Urban metro areas'
        },
        {
          name: 'Side Hustle Seeker',
          age_range: '22-35',
          occupation: 'Employed but exploring extra income',
          pain_points: ['Living paycheck to paycheck', 'Wants more for family', 'No entrepreneurial support'],
          desires: ['Extra income stream', 'Low-risk opportunity', 'Community and mentorship'],
          media_habits: ['TikTok', 'Facebook groups', 'WhatsApp'],
          location: 'Suburban and emerging cities'
        }
      ]
      setPersonas(prev => [...prev, ...aiPersonas])
      update({ ideal: [...personas, ...aiPersonas], ai_generated: true })
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Label className="text-base font-semibold mb-1 block">
            Define your ideal customer personas
          </Label>
          <p className="text-sm text-muted-foreground">
            Who are you trying to reach? Add personas manually or let AI generate them from your goal and channel data.
          </p>
        </div>
      </div>

      {/* AI generate button */}
      <Button
        variant="outline"
        onClick={generateWithAi}
        className="gap-2 w-full justify-center border-dashed border-primary/30 text-primary hover:bg-primary/5"
      >
        <Sparkles className="w-4 h-4" />
        Generate personas with AI
      </Button>

      {/* Persona cards */}
      <div className="space-y-4">
        {personas.map((p, i) => (
          <PersonaCard
            key={i}
            persona={p}
            index={i}
            onChange={(updated) => updatePersona(i, updated)}
            onRemove={() => removePersona(i)}
            isAiGenerated={i >= personas.length - 2 && state.personas.ai_generated}
          />
        ))}
      </div>

      {/* Add manually */}
      <button
        onClick={addPersona}
        className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed text-sm text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add persona manually
      </button>
    </div>
  )
}
