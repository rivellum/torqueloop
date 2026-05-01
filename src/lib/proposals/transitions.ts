// Status transition guard for Proposal Factory
// Enforces the closed-loop review requirement at the data/API layer
import type { OpportunityStatus } from '@/types/proposals'
import { getNextStatuses } from '@/types/proposals'

export interface TransitionContext {
  currentStatus: OpportunityStatus
  targetStatus: OpportunityStatus
  hasApprovedStrategyLock: boolean
  hasApprovedSendGate: boolean
  hasSelectedDraft: boolean
}

export interface TransitionResult {
  allowed: boolean
  error?: string
}

// ─── Transition rules ───────────────────────────────────────────────────────

/**
 * Validates whether a status transition is allowed.
 * Enforces the human-review loop: no skipping to send-ready without approvals.
 */
export function validateStatusTransition(ctx: TransitionContext): TransitionResult {
  const { currentStatus, targetStatus } = ctx

  // Same status — no-op, always allowed
  if (currentStatus === targetStatus) {
    return { allowed: true }
  }

  // Check basic flow validity (is this a recognized transition?)
  const validNext = getNextStatuses(currentStatus)
  if (!validNext.includes(targetStatus)) {
    return {
      allowed: false,
      error: `Invalid transition: cannot go from '${currentStatus}' to '${targetStatus}'. Valid next states: ${validNext.join(', ') || 'none (terminal state)'}`,
    }
  }

  // ─── Gate: ready_to_send requires approved strategy lock ──────────────
  if (targetStatus === 'ready_to_send') {
    if (!ctx.hasApprovedStrategyLock) {
      return {
        allowed: false,
        error: `Cannot move to 'ready_to_send': strategy lock review must be approved first.`,
      }
    }
  }

  // ─── Gate: sent requires approved send gate + selected draft ──────────
  if (targetStatus === 'sent') {
    if (!ctx.hasSelectedDraft) {
      return {
        allowed: false,
        error: `Cannot mark as 'sent': no selected draft. Select a draft before sending.`,
      }
    }
    if (!ctx.hasApprovedSendGate) {
      return {
        allowed: false,
        error: `Cannot mark as 'sent': send gate review must be approved first.`,
      }
    }
  }

  return { allowed: true }
}

/**
 * Convenience: can this opportunity be sent right now?
 */
export function canSend(ctx: Omit<TransitionContext, 'targetStatus'>): TransitionResult {
  return validateStatusTransition({
    ...ctx,
    targetStatus: 'sent',
  })
}

/**
 * Convenience: can this opportunity move to ready_to_send?
 */
export function canMarkReady(ctx: Omit<TransitionContext, 'targetStatus'>): TransitionResult {
  return validateStatusTransition({
    ...ctx,
    targetStatus: 'ready_to_send',
  })
}
