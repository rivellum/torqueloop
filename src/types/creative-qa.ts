/**
 * TorqueLoop Creative QA / Congruency Engine — Types
 *
 * This file contains both the API pipeline score-card shape and the dashboard
 * display shape used by the existing creative QA card.
 */

// ── Dashboard display model ──
export type QADimensionKey =
  | 'voice_text_sync'
  | 'timing_adjustment'
  | 'brand_presence'
  | 'audio_levels'
  | 'typography_congruence'
  | 'pivot_clarity'
  | 'persona_alignment'

export interface QAScoreData {
  dimensions: Record<QADimensionKey, number>
  overall: number
}

export const QA_DIMENSION_LABELS: Record<QADimensionKey, string> = {
  voice_text_sync: 'Sincronización Voz-Texto',
  timing_adjustment: 'Ajuste de Tiempo',
  brand_presence: 'Presencia de Marca',
  audio_levels: 'Niveles de Audio',
  typography_congruence: 'Congruencia Tipográfica',
  pivot_clarity: 'Claridad del Pivot',
  persona_alignment: 'Ajuste de Persona',
}

// ── API pipeline model ──
export interface QACheckResult {
  /** Numeric score (0-10) */
  score: number
  /** Human-readable summary of the result */
  details: string
  /** Optional structured sub-results for debugging */
  meta?: Record<string, unknown>
}

export interface QAScoreChecks {
  voTextSync: QACheckResult
  timingFit: QACheckResult
  brandPresence: QACheckResult
  audioLevels: QACheckResult
  fontCongruency: QACheckResult
  pivotClarity: QACheckResult
  personaFit: QACheckResult
}

export interface QAScoreCard {
  /** Weighted average of all checks (0-10) */
  overallScore: number
  /** true if overallScore >= APPROVAL_THRESHOLD */
  approved: boolean
  /** Individual check results */
  checks: QAScoreChecks
  /** Actionable recommendations for improvement */
  recommendations: string[]
}

export interface QAScoreRequest {
  /** UUID of the creative to score */
  creativeId: string
  /** Optional persona description for Persona Fit check */
  personaDescription?: string
}

export interface TextCard {
  text: string
  start: number
  end: number
  style?: string
}

export interface CreativeRow {
  id: string
  type: 'video' | 'image'
  content: {
    text_cards?: TextCard[]
    script?: string
    brand_name?: string
    persona_description?: string
    [key: string]: unknown
  } | null
  storage_url: string | null
  qa_score: QAScoreCard | null
  qa_scored_at: string | null
  created_at: string
}

export type QACheckName =
  | 'voTextSync'
  | 'timingFit'
  | 'brandPresence'
  | 'audioLevels'
  | 'fontCongruency'
  | 'pivotClarity'
  | 'personaFit'

export const QA_CHECK_WEIGHTS: Record<QACheckName, number> = {
  voTextSync: 1.0,
  timingFit: 1.0,
  brandPresence: 1.0,
  audioLevels: 0.8,
  fontCongruency: 0.9,
  pivotClarity: 1.0,
  personaFit: 1.0,
}

export const APPROVAL_THRESHOLD = 7.0
