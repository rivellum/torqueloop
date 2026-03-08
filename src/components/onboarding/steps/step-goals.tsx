"use client"
import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { OnboardingState } from '@/types/onboarding'
import { Target, DollarSign, Users, TrendingUp, Calendar, Briefcase, ShoppingCart, Phone } from 'lucide-react'

interface Props {
  state: OnboardingState
  update: (v: Partial<OnboardingState['goals']>) => void
  onAiInsight: (msg: string, delay?: number) => void
}

const GOAL_TYPES = [
  { id: 'hire', label: 'Recruit / Hire', icon: Users, desc: 'Recruit agents, employees, or contractors' },
  { id: 'sales', label: 'Close Sales', icon: ShoppingCart, desc: 'Drive e-commerce or direct sales' },
  { id: 'leads', label: 'Generate Leads', icon: Phone, desc: 'Capture qualified leads for your pipeline' },
  { id: 'revenue', label: 'Grow Revenue', icon: DollarSign, desc: 'Increase monthly or annual revenue' },
  { id: 'signups', label: 'Get Signups', icon: TrendingUp, desc: 'Trial registrations or subscriptions' },
  { id: 'brand', label: 'Build Brand', icon: Briefcase, desc: 'Increase awareness and reputation' },
]

const TIMELINES = [
  { value: '1_week', label: 'This week' },
  { value: '2_weeks', label: 'Next 2 weeks' },
  { value: '1_month', label: 'This month' },
  { value: '3_months', label: 'Next quarter' },
  { value: '6_months', label: '6 months' },
  { value: '1_year', label: 'This year' },
]

const BUDGETS = [
  { value: 'under_500', label: 'Under $500/mo' },
  { value: '500_2k', label: '$500 – $2,000/mo' },
  { value: '2k_5k', label: '$2,000 – $5,000/mo' },
  { value: '5k_10k', label: '$5,000 – $10,000/mo' },
  { value: '10k_plus', label: '$10,000+/mo' },
  { value: 'unsure', label: "Not sure yet" },
]

export function StepGoals({ state, update, onAiInsight }: Props) {
  const [selectedGoals, setSelectedGoals] = useState<string[]>(
    state.goals.primary ? [state.goals.primary, ...state.goals.secondary] : []
  )

  const toggleGoal = (id: string) => {
    const next = selectedGoals.includes(id)
      ? selectedGoals.filter(g => g !== id)
      : [...selectedGoals, id]
    setSelectedGoals(next)

    if (next.length > 0) {
      update({ primary: next[0], secondary: next.slice(1) })
    }

    if (next.length === 1) {
      const goalLabel = GOAL_TYPES.find(g => g.id === next[0])?.label
      onAiInsight(
        `Great — "${goalLabel}" is a strong primary goal. I'll structure your entire strategy around optimizing for this outcome. You can add secondary goals too if they apply.`,
        1000
      )
    }
  }

  return (
    <div className="space-y-8">
      {/* Goal selection */}
      <div>
        <Label className="text-base font-semibold mb-3 block">
          What's the primary outcome you want from marketing?
        </Label>
        <p className="text-sm text-muted-foreground mb-4">
          Select your main goal first, then any secondary goals. We'll optimize everything for your primary outcome.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {GOAL_TYPES.map(goal => {
            const Icon = goal.icon
            const isSelected = selectedGoals.includes(goal.id)
            const isPrimary = selectedGoals[0] === goal.id

            return (
              <button
                key={goal.id}
                onClick={() => toggleGoal(goal.id)}
                className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                    : 'border-border hover:border-primary/30 hover:bg-muted/50'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{goal.label}</span>
                    {isPrimary && (
                      <Badge variant="default" className="text-[10px] px-1.5 py-0">
                        Primary
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{goal.desc}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Timeline */}
      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <Label className="text-sm font-medium mb-2 block flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            When do you need results?
          </Label>
          <Select
            value={state.goals.timeline}
            onValueChange={(v) => update({ timeline: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select timeline" />
            </SelectTrigger>
            <SelectContent>
              {TIMELINES.map(t => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium mb-2 block flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5" />
            Monthly marketing budget
          </Label>
          <Select
            value={state.goals.budget_range}
            onValueChange={(v) => update({ budget_range: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select budget range" />
            </SelectTrigger>
            <SelectContent>
              {BUDGETS.map(b => (
                <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Context */}
      <div>
        <Label htmlFor="context" className="text-sm font-medium mb-2 block">
          Anything else we should know about your goals?
        </Label>
        <Textarea
          id="context"
          placeholder="E.g., 'We need to hire 20 agents in Mexico City by end of month' or 'We want to double our e-commerce revenue this quarter'"
          className="min-h-[100px] resize-none"
          value={state.goals.secondary.join(', ')}
          onChange={(e) => update({ secondary: e.target.value ? [e.target.value] : [] })}
        />
        <p className="text-xs text-muted-foreground mt-1.5">
          The more specific you are, the better our AI can tailor your strategy.
        </p>
      </div>
    </div>
  )
}
