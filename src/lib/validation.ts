import { OnboardingState } from '@/types/onboarding'

export interface ValidationResult {
  valid: boolean
  message: string
}

export function validateStep(step: number, state: OnboardingState): ValidationResult {
  switch (step) {
    case 0: // Goals
      if (!state.goals.primary) {
        return { valid: false, message: 'Please select at least one primary goal to continue.' }
      }
      if (!state.goals.timeline) {
        return { valid: false, message: 'Please select a timeline for your goals.' }
      }
      if (!state.goals.budget_range) {
        return { valid: false, message: 'Please select a budget range.' }
      }
      return { valid: true, message: '' }

    case 1: // Tracking
      if (!state.tracking.system) {
        return { valid: false, message: 'Please select a tracking system, or choose "I don\'t have one yet".' }
      }
      if (state.tracking.system === 'other' && !state.tracking.details.trim()) {
        return { valid: false, message: 'Please tell us which tool you use.' }
      }
      return { valid: true, message: '' }

    case 2: // Outcomes
      if (!state.outcomes.type) {
        return { valid: false, message: 'Please select what counts as a win for your business.' }
      }
      if (state.outcomes.type === 'custom' && !state.outcomes.custom_label.trim()) {
        return { valid: false, message: 'Please define your custom outcome.' }
      }
      return { valid: true, message: '' }

    case 3: // Channels — optional, always valid
      return { valid: true, message: '' }

    case 4: // Personas
      if (state.personas.ideal.length === 0) {
        return { valid: false, message: 'Please add at least one persona. You can generate them with AI or add manually.' }
      }
      const hasNamedPersona = state.personas.ideal.some(p => p.name.trim())
      if (!hasNamedPersona) {
        return { valid: false, message: 'Please give at least one persona a name.' }
      }
      return { valid: true, message: '' }

    case 5: // Messaging
      if (!state.messaging.tone) {
        return { valid: false, message: 'Please select a brand tone.' }
      }
      const activeTriggers = state.messaging.emotional_triggers.filter(t => t.intensity > 5)
      if (activeTriggers.length === 0) {
        return { valid: false, message: 'Please activate at least one emotional trigger (click to select, then adjust intensity above 5).' }
      }
      return { valid: true, message: '' }

    case 6: // Strategy
      const totalBudget = Object.values(state.strategy.budget_split).reduce((sum, v) => sum + v, 0)
      if (totalBudget > 0 && totalBudget !== 100) {
        return { valid: false, message: `Budget allocation must total 100%. Currently at ${totalBudget}%. Adjust your channel splits or set all to 0 to skip.` }
      }
      return { valid: true, message: '' }

    case 7: // Presentation — always valid (review step)
      return { valid: true, message: '' }

    case 8: // Launch — always valid
      return { valid: true, message: '' }

    default:
      return { valid: true, message: '' }
  }
}
