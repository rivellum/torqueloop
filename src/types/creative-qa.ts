/**
 * TorqueLoop Creative QA / Congruency Engine — Types
 *
 * Defines the score card, individual check results, and input types
 * for the automated quality-assurance pipeline.
 */

// ── Individual Check Result ──
export interface QACheckResult {
  /** Numeric score (0-10) */
  score: number
  /** Human-readable summary of the result */
  details: string
  /** Optional structured sub-results for debugging */
  meta?: Record<string, unknown>
}

// ── The 7 Checks ──
export interface QAScoreChecks {
  voTextSync: QACheckResult
  timingFit: QACheckResult
  brandPresence: QACheckResult
  audioLevels: QACheckResult
  fontCongruency: QACheckResult
  pivotClarity: QACheckResult
  personaFit: QACheckResult
}

// ── Full Score Card ──
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

// ── API Request Body ──
export interface QAScoreRequest {
  /** UUID of the creative to score */
  creativeId: string
  /** Optional persona description for Persona Fit check */
  personaDescription?: string
}

// ── Text Card (from creative content JSONB) ──
export interface TextCard {
  text: string
  start: number    // seconds
  end: number      // seconds
  style?: string   // font / colour descriptor
}

// ── Creative Row (subset we care about) ──
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

// ── Check name union (for logging) ──
export type QACheckName =
  | 'voTextSync'
  | 'timingFit'
  | 'brandPresence'
  | 'audioLevels'
  | 'fontCongruency'
  | 'pivotClarity'
  | 'personaFit'

// ── Weights for overall score calculation ──
export const QA_CHECK_WEIGHTS: Record<QACheckName, number> = {
  voTextSync:     1.0,
  timingFit:      1.0,
  brandPresence:  1.0,
  audioLevels:    0.8,
  fontCongruency: 0.9,
  pivotClarity:   1.0,
  personaFit:     1.0,
}

/** Minimum overall score required for approval */
export const APPROVAL_THRESHOLD = 7.0
