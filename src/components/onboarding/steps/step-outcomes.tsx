"use client"
import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { OnboardingState } from '@/types/onboarding'
import { Users, DollarSign, Calendar, FileText, GraduationCap, ShoppingBag, Key, Edit, Target, BarChart3 } from 'lucide-react'

interface Props {
  state: OnboardingState
  update: (v: Partial<OnboardingState['outcomes']>) => void
  onAiInsight: (msg: string, delay?: number) => void
}

const OUTCOME_TYPES = [
  { 
    id: 'hire', 
    label: 'Hire / Recruit', 
    icon: Users, 
    desc: 'Someone joins your team or network', 
    category: 'Recruitment',
    emoji: '🧑‍💼'
  },
  { 
    id: 'sale', 
    label: 'Closed Sale', 
    icon: DollarSign, 
    desc: 'A prospect becomes a paying customer', 
    category: 'Revenue',
    emoji: '💰'
  },
  { 
    id: 'booked_call', 
    label: 'Booked Call', 
    icon: Calendar, 
    desc: 'A qualified prospect books a discovery call', 
    category: 'Pipeline',
    emoji: '📅'
  },
  { 
    id: 'contract', 
    label: 'Signed Contract', 
    icon: FileText, 
    desc: 'A deal is formally closed and signed', 
    category: 'Revenue',
    emoji: '📝'
  },
  { 
    id: 'enrollment', 
    label: 'Enrollment', 
    icon: GraduationCap, 
    desc: 'Someone joins a course, program, or membership', 
    category: 'Education',
    emoji: '🎓'
  },
  { 
    id: 'purchase', 
    label: 'Purchase', 
    icon: ShoppingBag, 
    desc: 'A product or item is bought', 
    category: 'E-commerce',
    emoji: '📦'
  },
  { 
    id: 'trial', 
    label: 'Free Trial / Signup', 
    icon: Key, 
    desc: 'Someone starts a trial or creates an account', 
    category: 'SaaS',
    emoji: '🔑'
  },
  { 
    id: 'custom', 
    label: 'Custom', 
    icon: Edit, 
    desc: "I'll define my own", 
    category: 'Custom',
    emoji: '✏️'
  },
]

const BOTTLENECKS = [
  { value: 'leads', label: 'Not enough leads coming in' },
  { value: 'conversion', label: "Leads aren't converting to outcomes" },
  { value: 'cost', label: 'My cost per outcome is too high' },
  { value: 'unknown', label: "I don't know yet — help me figure it out" },
]

export function StepOutcomes({ state, update, onAiInsight }: Props) {
  const selectedType = state.outcomes.type
  const [currencyToggle, setCurrencyToggle] = useState<'USD' | 'MXN'>(state.outcomes.currency)

  const selectOutcomeType = (type: string) => {
    update({ type })

    if (type && type !== 'custom') {
      const outcomeLabel = OUTCOME_TYPES.find(o => o.id === type)?.label
      onAiInsight(
        `Perfect choice — "${outcomeLabel}" is a clear, measurable outcome. Now let's set your targets so I can optimize every campaign dollar toward this specific result.`,
        1000
      )
    }
  }

  const handleCurrencyChange = (currency: 'USD' | 'MXN') => {
    setCurrencyToggle(currency)
    update({ currency })
  }

  const calculateInsights = () => {
    const { target_per_month, value_per_outcome, max_cost_per_outcome } = state.outcomes
    
    if (target_per_month && value_per_outcome) {
      const monthlyRevenue = target_per_month * value_per_outcome
      const maxBudget = max_cost_per_outcome ? target_per_month * max_cost_per_outcome : null
      const roas = max_cost_per_outcome ? (value_per_outcome / max_cost_per_outcome).toFixed(1) : null
      
      const currencySymbol = currencyToggle === 'USD' ? '$' : '$'
      
      return {
        monthlyRevenue: `${currencySymbol}${monthlyRevenue.toLocaleString()}`,
        maxBudget: maxBudget ? `${currencySymbol}${maxBudget.toLocaleString()}` : null,
        roas: roas
      }
    }
    
    return null
  }

  const insights = calculateInsights()

  return (
    <div className="space-y-8">
      {/* Outcome Type Selection */}
      <div>
        <Label className="text-base font-semibold mb-3 block">
          What counts as a win?
        </Label>
        <p className="text-sm text-muted-foreground mb-4">
          TorqueLoop will optimize every campaign toward this specific result — not just clicks or leads.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {OUTCOME_TYPES.map(outcome => {
            const Icon = outcome.icon
            const isSelected = selectedType === outcome.id

            return (
              <button
                key={outcome.id}
                onClick={() => selectOutcomeType(outcome.id)}
                className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                    : 'border-border hover:border-primary/30 hover:bg-muted/50'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  <span className="text-lg">{outcome.emoji}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{outcome.label}</div>
                  <div className="text-xs text-muted-foreground mb-0.5">{outcome.desc}</div>
                  <div className="text-xs text-primary/70 font-medium">{outcome.category}</div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Custom Label Input */}
      {selectedType === 'custom' && (
        <div>
          <Label htmlFor="custom_label" className="text-sm font-medium mb-2 block">
            What's your custom outcome?
          </Label>
          <Input
            id="custom_label"
            placeholder="e.g., 'Partnership signed', 'Certification completed'"
            value={state.outcomes.custom_label}
            onChange={(e) => update({ custom_label: e.target.value })}
            className="max-w-md"
          />
        </div>
      )}

      {/* Target Numbers Section */}
      {selectedType && (
        <div className="space-y-6">
          <div>
            <Label className="text-base font-semibold mb-3 block flex items-center gap-1.5">
              <Target className="w-4 h-4" />
              Set your targets
            </Label>
          </div>

          {/* Currency Toggle */}
          <div className="flex items-center gap-2 mb-4">
            <Label className="text-sm font-medium">Currency:</Label>
            <div className="flex rounded-lg border overflow-hidden">
              <button
                onClick={() => handleCurrencyChange('USD')}
                className={`px-3 py-1 text-sm font-medium transition-colors ${
                  currencyToggle === 'USD'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background text-muted-foreground hover:text-foreground'
                }`}
              >
                USD
              </button>
              <button
                onClick={() => handleCurrencyChange('MXN')}
                className={`px-3 py-1 text-sm font-medium transition-colors ${
                  currencyToggle === 'MXN'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background text-muted-foreground hover:text-foreground'
                }`}
              >
                MXN
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Target per month */}
            <div>
              <Label htmlFor="target_month" className="text-sm font-medium mb-2 block">
                How many per month?
              </Label>
              <Input
                id="target_month"
                type="number"
                placeholder="e.g. 10"
                min="0"
                value={state.outcomes.target_per_month || ''}
                onChange={(e) => update({ target_per_month: e.target.value ? parseInt(e.target.value) : null })}
              />
            </div>

            {/* Value per outcome */}
            <div>
              <Label htmlFor="value_outcome" className="text-sm font-medium mb-2 block">
                What's each outcome worth?
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  {currencyToggle === 'USD' ? '$' : '$'}
                </span>
                <Input
                  id="value_outcome"
                  type="number"
                  placeholder="e.g. 5,000"
                  min="0"
                  className="pl-6"
                  value={state.outcomes.value_per_outcome || ''}
                  onChange={(e) => update({ value_per_outcome: e.target.value ? parseInt(e.target.value) : null })}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Revenue or value you attribute to each outcome. Used to calculate ROI.
              </p>
            </div>

            {/* Max cost per outcome */}
            <div>
              <Label htmlFor="max_cost" className="text-sm font-medium mb-2 block">
                Max cost you'd pay per outcome?
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  {currencyToggle === 'USD' ? '$' : '$'}
                </span>
                <Input
                  id="max_cost"
                  type="number"
                  placeholder="e.g. 200"
                  min="0"
                  className="pl-6"
                  value={state.outcomes.max_cost_per_outcome || ''}
                  onChange={(e) => update({ max_cost_per_outcome: e.target.value ? parseInt(e.target.value) : null })}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Your target cost-per-outcome. TorqueLoop pauses campaigns that exceed this.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Baseline Section */}
      {selectedType && (
        <div className="space-y-4">
          <div>
            <Label className="text-base font-semibold mb-2 block">
              Where are you starting from? (optional)
            </Label>
            <p className="text-sm text-muted-foreground mb-4">
              If you have current results, add them so we can measure real improvement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Current volume */}
            <div>
              <Label htmlFor="baseline_volume" className="text-sm font-medium mb-2 block">
                Current volume/month
              </Label>
              <Input
                id="baseline_volume"
                type="number"
                placeholder="Leave blank if starting from zero"
                min="0"
                value={state.outcomes.baseline_volume || ''}
                onChange={(e) => update({ baseline_volume: e.target.value ? parseInt(e.target.value) : null })}
              />
            </div>

            {/* Current cost */}
            <div>
              <Label htmlFor="baseline_cost" className="text-sm font-medium mb-2 block">
                Current cost per outcome
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  {currencyToggle === 'USD' ? '$' : '$'}
                </span>
                <Input
                  id="baseline_cost"
                  type="number"
                  placeholder="What are you paying now?"
                  min="0"
                  className="pl-6"
                  value={state.outcomes.baseline_cost || ''}
                  onChange={(e) => update({ baseline_cost: e.target.value ? parseInt(e.target.value) : null })}
                />
              </div>
            </div>

            {/* Bottleneck */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Main bottleneck
              </Label>
              <Select
                value={state.outcomes.bottleneck}
                onValueChange={(v) => update({ bottleneck: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select bottleneck" />
                </SelectTrigger>
                <SelectContent>
                  {BOTTLENECKS.map(b => (
                    <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* AI Insight Panel */}
      {insights && (
        <div className="p-5 rounded-xl bg-primary/5 border border-primary/10">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <BarChart3 className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm mb-2 text-primary">Budget & ROI Calculation</div>
              <div className="space-y-1 text-sm text-foreground/80">
                <p>
                  At {insights.maxBudget ? `${insights.maxBudget}/month budget` : `${state.outcomes.max_cost_per_outcome ? currencyToggle === 'USD' ? '$' : '$' : ''}${state.outcomes.max_cost_per_outcome || 'X'} per outcome and ${state.outcomes.target_per_month || 'Y'} outcomes/month`}, you need {insights.maxBudget || 'budget calculation'}.
                </p>
                {insights.roas && (
                  <p>
                    <strong>Your target ROAS is {insights.roas}:1</strong>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}