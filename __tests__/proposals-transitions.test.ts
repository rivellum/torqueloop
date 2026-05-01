import { describe, expect, it } from 'vitest'
import { validateStatusTransition, canSend, canMarkReady } from '@/lib/proposals/transitions'
import type { TransitionContext } from '@/lib/proposals/transitions'
import type { OpportunityStatus } from '@/types/proposals'

describe('Proposal Factory — status transition guard', () => {
  // Helper to build context with defaults
  function ctx(overrides: Partial<TransitionContext> = {}): TransitionContext {
    return {
      currentStatus: 'intake',
      targetStatus: 'scored',
      hasApprovedStrategyLock: false,
      hasApprovedSendGate: false,
      hasSelectedDraft: false,
      ...overrides,
    }
  }

  describe('basic flow validation', () => {
    it('allows same-status no-op', () => {
      const result = validateStatusTransition(ctx({
        currentStatus: 'drafting',
        targetStatus: 'drafting',
      }))
      expect(result.allowed).toBe(true)
    })

    it('blocks invalid transitions', () => {
      const result = validateStatusTransition(ctx({
        currentStatus: 'intake',
        targetStatus: 'sent',
      }))
      expect(result.allowed).toBe(false)
      expect(result.error).toContain('Invalid transition')
    })

    it('blocks transitions from terminal states', () => {
      const result = validateStatusTransition(ctx({
        currentStatus: 'won',
        targetStatus: 'sent',
      }))
      expect(result.allowed).toBe(false)
      expect(result.error).toContain('none (terminal state)')
    })

    it('allows valid flow transitions', () => {
      expect(validateStatusTransition(ctx({
        currentStatus: 'intake',
        targetStatus: 'scored',
      })).allowed).toBe(true)

      expect(validateStatusTransition(ctx({
        currentStatus: 'scored',
        targetStatus: 'drafting',
      })).allowed).toBe(true)

      expect(validateStatusTransition(ctx({
        currentStatus: 'drafting',
        targetStatus: 'human_review',
      })).allowed).toBe(true)
    })
  })

  describe('block drafting -> sent (skip review)', () => {
    it('rejects drafting -> sent even with all approvals', () => {
      const result = validateStatusTransition(ctx({
        currentStatus: 'drafting',
        targetStatus: 'sent',
        hasApprovedStrategyLock: true,
        hasApprovedSendGate: true,
        hasSelectedDraft: true,
      }))
      expect(result.allowed).toBe(false)
      expect(result.error).toContain('Invalid transition')
    })
  })

  describe('block scored -> ready_to_send without review', () => {
    it('rejects scored -> ready_to_send (invalid flow)', () => {
      const result = validateStatusTransition(ctx({
        currentStatus: 'scored',
        targetStatus: 'ready_to_send',
        hasApprovedStrategyLock: true,
      }))
      expect(result.allowed).toBe(false)
      expect(result.error).toContain('Invalid transition')
    })
  })

  describe('block human_review -> sent', () => {
    it('rejects human_review -> sent (must go through ready_to_send)', () => {
      const result = validateStatusTransition(ctx({
        currentStatus: 'human_review',
        targetStatus: 'sent',
        hasApprovedStrategyLock: true,
        hasApprovedSendGate: true,
        hasSelectedDraft: true,
      }))
      expect(result.allowed).toBe(false)
      expect(result.error).toContain('Invalid transition')
    })
  })

  describe('block ready_to_send -> sent without approved send gate', () => {
    it('rejects when send gate is not approved', () => {
      const result = validateStatusTransition(ctx({
        currentStatus: 'ready_to_send',
        targetStatus: 'sent',
        hasApprovedStrategyLock: true,
        hasApprovedSendGate: false,
        hasSelectedDraft: true,
      }))
      expect(result.allowed).toBe(false)
      expect(result.error).toContain('send gate')
    })

    it('rejects when no selected draft', () => {
      const result = validateStatusTransition(ctx({
        currentStatus: 'ready_to_send',
        targetStatus: 'sent',
        hasApprovedStrategyLock: true,
        hasApprovedSendGate: true,
        hasSelectedDraft: false,
      }))
      expect(result.allowed).toBe(false)
      expect(result.error).toContain('selected draft')
    })

    it('rejects when neither draft nor send gate', () => {
      const result = validateStatusTransition(ctx({
        currentStatus: 'ready_to_send',
        targetStatus: 'sent',
        hasApprovedStrategyLock: true,
        hasApprovedSendGate: false,
        hasSelectedDraft: false,
      }))
      expect(result.allowed).toBe(false)
    })
  })

  describe('block ready_to_send without strategy lock', () => {
    it('rejects human_review -> ready_to_send without strategy lock', () => {
      const result = validateStatusTransition(ctx({
        currentStatus: 'human_review',
        targetStatus: 'ready_to_send',
        hasApprovedStrategyLock: false,
      }))
      expect(result.allowed).toBe(false)
      expect(result.error).toContain('strategy lock')
    })
  })

  describe('valid reviewed path succeeds', () => {
    it('allows human_review -> ready_to_send with approved strategy lock', () => {
      const result = validateStatusTransition(ctx({
        currentStatus: 'human_review',
        targetStatus: 'ready_to_send',
        hasApprovedStrategyLock: true,
      }))
      expect(result.allowed).toBe(true)
    })

    it('allows ready_to_send -> sent with all gates passed', () => {
      const result = validateStatusTransition(ctx({
        currentStatus: 'ready_to_send',
        targetStatus: 'sent',
        hasApprovedStrategyLock: true,
        hasApprovedSendGate: true,
        hasSelectedDraft: true,
      }))
      expect(result.allowed).toBe(true)
    })

    it('allows sent -> replied', () => {
      const result = validateStatusTransition(ctx({
        currentStatus: 'sent',
        targetStatus: 'replied',
      }))
      expect(result.allowed).toBe(true)
    })

    it('allows sent -> lost', () => {
      const result = validateStatusTransition(ctx({
        currentStatus: 'sent',
        targetStatus: 'lost',
      }))
      expect(result.allowed).toBe(true)
    })

    it('allows full lifecycle: intake -> ... -> sent -> replied -> call_booked -> proposal_sent -> won', () => {
      const steps: OpportunityStatus[] = ['intake', 'scored', 'drafting', 'human_review', 'ready_to_send', 'sent', 'replied', 'call_booked', 'proposal_sent', 'won']

      for (let i = 0; i < steps.length - 1; i++) {
        const result = validateStatusTransition(ctx({
          currentStatus: steps[i],
          targetStatus: steps[i + 1],
          hasApprovedStrategyLock: true,
          hasApprovedSendGate: true,
          hasSelectedDraft: true,
        }))
        expect(result.allowed).toBe(true)
      }
    })
  })

  describe('convenience helpers', () => {
    it('canSend checks send gate', () => {
      expect(canSend(ctx({
        currentStatus: 'ready_to_send',
        hasApprovedSendGate: true,
        hasSelectedDraft: true,
      })).allowed).toBe(true)

      expect(canSend(ctx({
        currentStatus: 'ready_to_send',
        hasApprovedSendGate: false,
        hasSelectedDraft: true,
      })).allowed).toBe(false)
    })

    it('canMarkReady checks strategy lock', () => {
      expect(canMarkReady(ctx({
        currentStatus: 'human_review',
        hasApprovedStrategyLock: true,
      })).allowed).toBe(true)

      expect(canMarkReady(ctx({
        currentStatus: 'human_review',
        hasApprovedStrategyLock: false,
      })).allowed).toBe(false)
    })
  })

  describe('error messages', () => {
    it('includes valid next states in error', () => {
      const result = validateStatusTransition(ctx({
        currentStatus: 'intake',
        targetStatus: 'sent',
      }))
      expect(result.error).toContain('scored')
      expect(result.error).toContain('skipped')
    })

    it('uses specific error for review gate', () => {
      const result = validateStatusTransition(ctx({
        currentStatus: 'human_review',
        targetStatus: 'ready_to_send',
        hasApprovedStrategyLock: false,
      }))
      expect(result.error).toContain('strategy lock')
    })

    it('uses specific error for send gate', () => {
      const result = validateStatusTransition(ctx({
        currentStatus: 'ready_to_send',
        targetStatus: 'sent',
        hasApprovedSendGate: false,
        hasSelectedDraft: true,
      }))
      expect(result.error).toContain('send gate')
    })

    it('uses specific error for missing draft', () => {
      const result = validateStatusTransition(ctx({
        currentStatus: 'ready_to_send',
        targetStatus: 'sent',
        hasApprovedSendGate: true,
        hasSelectedDraft: false,
      }))
      expect(result.error).toContain('selected draft')
    })
  })
})
