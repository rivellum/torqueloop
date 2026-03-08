export interface OnboardingState {
  // Step 1: Goals
  goals: {
    primary: string
    secondary: string[]
    timeline: string
    budget_range: string
  }
  // Step 2: Goal Tracking
  tracking: {
    system: string
    connected: boolean
    details: string
  }
  // Step 3: Channel Audit
  channels: {
    used: string[]
    worked: string[]
    failed: string[]
    notes: string
  }
  // Step 4: Personas
  personas: {
    current: PersonaProfile[]
    ideal: PersonaProfile[]
    ai_generated: boolean
  }
  // Step 5: Narratives & Messaging
  messaging: {
    narratives: string[]
    emotional_triggers: EmotionalTrigger[]
    tone: string
    key_messages: string[]
  }
  // Step 6: Channel Strategy
  strategy: {
    recommended_channels: ChannelRecommendation[]
    budget_split: Record<string, number>
    organic_vs_paid: number // 0-100, % paid
  }
  // Step 7: Strategy Presentation
  presentation: {
    pdf_url: string | null
    approved: boolean
  }
  // Step 8: Feedback & Launch
  feedback: {
    rounds: number
    notes: string[]
    final_approval: boolean
  }
}

export interface PersonaProfile {
  name: string
  age_range: string
  occupation: string
  pain_points: string[]
  desires: string[]
  media_habits: string[]
  location: string
}

export interface EmotionalTrigger {
  sin: SevenSins
  message: string
  intensity: number // 1-10
}

export type SevenSins =
  | 'pride'    // Orgullo: "Be the best version of yourself"
  | 'greed'    // Codicia: "Earn more, achieve more"
  | 'lust'     // Lujuria: "The lifestyle you desire"
  | 'envy'     // Envidia: "Others already have this"
  | 'gluttony' // Gula: "Abundance, unlimited potential"
  | 'wrath'    // Ira: "Break free from what holds you back"
  | 'sloth'    // Pereza: "The easy path, done for you"

export interface ChannelRecommendation {
  channel: string
  mode: 'paid' | 'organic' | 'both'
  budget_pct: number
  rationale: string
  content_types: string[]
}

export const STEP_NAMES = [
  'Goals',
  'Tracking',
  'Channels',
  'Personas',
  'Messaging',
  'Strategy',
  'Presentation',
  'Launch'
] as const

export const STEP_DESCRIPTIONS = [
  'Define your growth objectives',
  'Connect your goal tracking system',
  'Audit your marketing channels',
  'Identify your ideal customers',
  'Craft your emotional messaging',
  'Design your channel strategy',
  'Review your strategy brief',
  'Approve and launch'
] as const

export const DEFAULT_STATE: OnboardingState = {
  goals: { primary: '', secondary: [], timeline: '', budget_range: '' },
  tracking: { system: '', connected: false, details: '' },
  channels: { used: [], worked: [], failed: [], notes: '' },
  personas: { current: [], ideal: [], ai_generated: false },
  messaging: { narratives: [], emotional_triggers: [], tone: '', key_messages: [] },
  strategy: { recommended_channels: [], budget_split: {}, organic_vs_paid: 50 },
  presentation: { pdf_url: null, approved: false },
  feedback: { rounds: 0, notes: [], final_approval: false }
}
