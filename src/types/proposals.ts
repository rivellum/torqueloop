// Proposal Factory types — TorqueLoop native module
// These map to Supabase tables. RLS handles multi-tenant isolation via workspace_id.

// ─── Status enums ───────────────────────────────────────────────────────────

export type OpportunityStatus =
  | 'intake'
  | 'scored'
  | 'drafting'
  | 'human_review'
  | 'ready_to_send'
  | 'sent'
  | 'replied'
  | 'call_booked'
  | 'proposal_sent'
  | 'won'
  | 'lost'
  | 'skipped'

export type DraftType =
  | 'cover_letter'
  | 'application_answer'
  | 'qwilr_letter'
  | 'proposal_scope'
  | 'proposal_email'
  | 'follow_up'

export type ApprovalType =
  | 'proposal_strategy_lock'
  | 'proposal_send_gate'

export type PackageStatus =
  | 'drafting'
  | 'ready'
  | 'sent'
  | 'follow_up_due'
  | 'closed'

export type ScoreBand = 'bid_now' | 'review' | 'consider' | 'skip'

// ─── Table interfaces ───────────────────────────────────────────────────────

export interface Opportunity {
  id: string
  workspace_id: string
  lead_id: string | null
  initiative_id: string | null
  channel_id: string | null
  source: string | null
  external_url: string | null
  title: string
  company_name: string | null
  description: string | null
  budget_min: number | null
  budget_max: number | null
  currency: string
  status: OpportunityStatus
  posted_at: string | null
  deadline_at: string | null
  created_at: string
  updated_at: string
}

export interface OpportunityScore {
  id: string
  workspace_id: string
  opportunity_id: string
  total_score: number
  icp_fit: number
  problem_fit: number
  budget_fit: number
  proof_match: number
  urgency: number
  authority_signal: number
  competition_edge: number
  red_flags: string[]
  recommendation: string
  model_version: string
  created_at: string
}

export interface ProposalDraft {
  id: string
  workspace_id: string
  opportunity_id: string
  draft_type: DraftType
  variant_name: string | null
  angle: string | null
  body: string
  score: number | null
  selected: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface ProofPoint {
  id: string
  workspace_id: string
  label: string
  metric: string
  client_context: string | null
  problem_type: string | null
  service_category: string | null
  best_fit: string | null
  do_not_use_when: string | null
  source_note: string | null
  active: boolean
}

export interface ProposalPackage {
  id: string
  workspace_id: string
  opportunity_id: string
  selected_draft_id: string | null
  package_status: PackageStatus
  price_recommendation: string | null
  pricing_notes: string | null
  send_gate_status: 'pending' | 'passed' | 'blocked'
  send_gate_checks: Record<string, boolean>
  sent_at: string | null
  follow_up_at: string | null
  created_at: string
  updated_at: string
}

// ─── Derived / computed types ───────────────────────────────────────────────

export interface ScoreBreakdown {
  icp_fit: number
  problem_fit: number
  budget_fit: number
  proof_match: number
  urgency: number
  authority_signal: number
  competition_edge: number
}

export function getScoreBand(totalScore: number): ScoreBand {
  if (totalScore >= 80) return 'bid_now'
  if (totalScore >= 65) return 'review'
  if (totalScore >= 45) return 'consider'
  return 'skip'
}

export function getScoreBandLabel(band: ScoreBand): string {
  const labels: Record<ScoreBand, string> = {
    bid_now: 'Bid Now',
    review: 'Review',
    consider: 'Consider',
    skip: 'Skip',
  }
  return labels[band]
}

export function getStatusLabel(status: OpportunityStatus): string {
  const labels: Record<OpportunityStatus, string> = {
    intake: 'Intake',
    scored: 'Scored',
    drafting: 'Drafting',
    human_review: 'Human Review',
    ready_to_send: 'Ready to Send',
    sent: 'Sent',
    replied: 'Replied',
    call_booked: 'Call Booked',
    proposal_sent: 'Proposal Sent',
    won: 'Won',
    lost: 'Lost',
    skipped: 'Skipped',
  }
  return labels[status]
}

export function getNextStatuses(current: OpportunityStatus): OpportunityStatus[] {
  const flow: Record<OpportunityStatus, OpportunityStatus[]> = {
    intake: ['scored', 'skipped'],
    scored: ['drafting', 'skipped'],
    drafting: ['human_review'],
    human_review: ['ready_to_send', 'drafting', 'skipped'],
    ready_to_send: ['sent', 'human_review'],
    sent: ['replied', 'lost'],
    replied: ['call_booked', 'lost'],
    call_booked: ['proposal_sent', 'lost'],
    proposal_sent: ['won', 'lost'],
    won: [],
    lost: [],
    skipped: [],
  }
  return flow[current] ?? []
}

// ─── Status transition validation ───────────────────────────────────────────

export class StatusTransitionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'StatusTransitionError'
  }
}

/**
 * Centralized status transition guard.
 * Validates that a status move is allowed by the workflow graph
 * and (for send-gated transitions) that required gates are satisfied.
 *
 * @param current     Current opportunity status
 * @param next        Requested new status
 * @param gates       Optional gate context for send-gated transitions
 * @throws StatusTransitionError if the transition is not allowed
 */
export function validateStatusTransition(
  current: OpportunityStatus,
  next: OpportunityStatus,
  gates?: {
    hasSelectedDraft?: boolean
    hasApprovedSendGate?: boolean
    packageReady?: boolean
  }
): void {
  // Same-status is always fine (no-op)
  if (current === next) return

  const allowed = getNextStatuses(current)
  if (!allowed.includes(next)) {
    throw new StatusTransitionError(
      `Invalid transition: '${current}' → '${next}'. ` +
      `Allowed from '${current}': [${allowed.join(', ')}]`
    )
  }

  // Send gate: moving TO 'sent' requires approved send gate + selected draft + package ready
  if (next === 'sent') {
    const missing: string[] = []
    if (!gates?.hasSelectedDraft) missing.push('selected draft')
    if (!gates?.hasApprovedSendGate) missing.push('approved send gate review')
    if (!gates?.packageReady) missing.push('package marked ready')
    if (missing.length > 0) {
      throw new StatusTransitionError(
        `Cannot move to 'sent': missing ${missing.join(', ')}`
      )
    }
  }

  // Ready gate: moving TO 'ready_to_send' requires an approved strategy_lock review
  if (next === 'ready_to_send') {
    if (!gates?.hasApprovedSendGate) {
      throw new StatusTransitionError(
        `Cannot move to 'ready_to_send': missing approved strategy lock review`
      )
    }
  }
}
