import { describe, expect, it } from 'vitest'
import {
  getScoreBand,
  getScoreBandLabel,
  getStatusLabel,
  getNextStatuses,
  validateStatusTransition,
  StatusTransitionError,
} from '@/types/proposals'
import {
  createOpportunitySchema,
  createScoreSchema,
  createDraftSchema,
  createProofPointSchema,
  createPackageSchema,
  listOpportunitiesSchema,
} from '@/lib/proposals/schemas'

describe('Proposal Factory — type helpers', () => {
  describe('getScoreBand', () => {
    it('returns bid_now for 80+', () => {
      expect(getScoreBand(100)).toBe('bid_now')
      expect(getScoreBand(80)).toBe('bid_now')
      expect(getScoreBand(95)).toBe('bid_now')
    })

    it('returns review for 65-79', () => {
      expect(getScoreBand(79)).toBe('review')
      expect(getScoreBand(65)).toBe('review')
    })

    it('returns consider for 45-64', () => {
      expect(getScoreBand(64)).toBe('consider')
      expect(getScoreBand(45)).toBe('consider')
    })

    it('returns skip for <45', () => {
      expect(getScoreBand(44)).toBe('skip')
      expect(getScoreBand(0)).toBe('skip')
    })
  })

  describe('getScoreBandLabel', () => {
    it('returns human-readable labels', () => {
      expect(getScoreBandLabel('bid_now')).toBe('Bid Now')
      expect(getScoreBandLabel('review')).toBe('Review')
      expect(getScoreBandLabel('consider')).toBe('Consider')
      expect(getScoreBandLabel('skip')).toBe('Skip')
    })
  })

  describe('getStatusLabel', () => {
    it('returns labels for all statuses', () => {
      const statuses = [
        'intake', 'scored', 'drafting', 'human_review', 'ready_to_send',
        'sent', 'replied', 'call_booked', 'proposal_sent', 'won', 'lost', 'skipped',
      ] as const

      for (const status of statuses) {
        expect(getStatusLabel(status)).toBeTruthy()
        expect(typeof getStatusLabel(status)).toBe('string')
      }
    })
  })

  describe('getNextStatuses', () => {
    it('intake can go to scored or skipped', () => {
      expect(getNextStatuses('intake')).toContain('scored')
      expect(getNextStatuses('intake')).toContain('skipped')
    })

    it('drafting can only go to human_review', () => {
      expect(getNextStatuses('drafting')).toEqual(['human_review'])
    })

    it('won and lost are terminal', () => {
      expect(getNextStatuses('won')).toEqual([])
      expect(getNextStatuses('lost')).toEqual([])
    })

    it('human_review can go back to drafting', () => {
      expect(getNextStatuses('human_review')).toContain('drafting')
      expect(getNextStatuses('human_review')).toContain('ready_to_send')
    })
  })
})

describe('Proposal Factory — Zod schemas', () => {
  describe('createOpportunitySchema', () => {
    it('accepts valid input', () => {
      const result = createOpportunitySchema.safeParse({
        workspace_id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Test Opportunity',
      })
      expect(result.success).toBe(true)
    })

    it('rejects empty title', () => {
      const result = createOpportunitySchema.safeParse({
        workspace_id: '550e8400-e29b-41d4-a716-446655440000',
        title: '',
      })
      expect(result.success).toBe(false)
    })

    it('defaults currency to USD', () => {
      const result = createOpportunitySchema.parse({
        workspace_id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Test',
      })
      expect(result.currency).toBe('USD')
    })

    it('rejects invalid UUID', () => {
      const result = createOpportunitySchema.safeParse({
        workspace_id: 'not-a-uuid',
        title: 'Test',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('createScoreSchema', () => {
    const validScore = {
      workspace_id: '550e8400-e29b-41d4-a716-446655440000',
      opportunity_id: '550e8400-e29b-41d4-a716-446655440001',
      icp_fit: 18,
      problem_fit: 16,
      budget_fit: 12,
      proof_match: 10,
      urgency: 8,
      authority_signal: 7,
      competition_edge: 9,
      recommendation: 'Strong fit — bid now',
    }

    it('accepts valid score', () => {
      const result = createScoreSchema.safeParse(validScore)
      expect(result.success).toBe(true)
    })

    it('rejects icp_fit over 20', () => {
      const result = createScoreSchema.safeParse({ ...validScore, icp_fit: 25 })
      expect(result.success).toBe(false)
    })

    it('defaults red_flags to empty array', () => {
      const result = createScoreSchema.parse(validScore)
      expect(result.red_flags).toEqual([])
    })
  })

  describe('createDraftSchema', () => {
    it('accepts valid draft', () => {
      const result = createDraftSchema.safeParse({
        workspace_id: '550e8400-e29b-41d4-a716-446655440000',
        opportunity_id: '550e8400-e29b-41d4-a716-446655440001',
        draft_type: 'cover_letter',
        body: 'Hi, I noticed your post about...',
      })
      expect(result.success).toBe(true)
    })

    it('rejects invalid draft_type', () => {
      const result = createDraftSchema.safeParse({
        workspace_id: '550e8400-e29b-41d4-a716-446655440000',
        opportunity_id: '550e8400-e29b-41d4-a716-446655440001',
        draft_type: 'invalid_type',
        body: 'Test body',
      })
      expect(result.success).toBe(false)
    })

    it('rejects empty body', () => {
      const result = createDraftSchema.safeParse({
        workspace_id: '550e8400-e29b-41d4-a716-446655440000',
        opportunity_id: '550e8400-e29b-41d4-a716-446655440001',
        draft_type: 'cover_letter',
        body: '',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('createProofPointSchema', () => {
    it('accepts valid proof point', () => {
      const result = createProofPointSchema.safeParse({
        workspace_id: '550e8400-e29b-41d4-a716-446655440000',
        label: 'Test proof',
        metric: '29.5x ROAS',
      })
      expect(result.success).toBe(true)
    })

    it('defaults active to true', () => {
      const result = createProofPointSchema.parse({
        workspace_id: '550e8400-e29b-41d4-a716-446655440000',
        label: 'Test',
        metric: '100%',
      })
      expect(result.active).toBe(true)
    })
  })

  describe('createPackageSchema', () => {
    it('accepts valid package', () => {
      const result = createPackageSchema.safeParse({
        workspace_id: '550e8400-e29b-41d4-a716-446655440000',
        opportunity_id: '550e8400-e29b-41d4-a716-446655440001',
      })
      expect(result.success).toBe(true)
    })

    it('defaults send_gate_status to pending', () => {
      const result = createPackageSchema.parse({
        workspace_id: '550e8400-e29b-41d4-a716-446655440000',
        opportunity_id: '550e8400-e29b-41d4-a716-446655440001',
      })
      expect(result.send_gate_status).toBe('pending')
    })
  })

  describe('listOpportunitiesSchema', () => {
    it('accepts minimal input', () => {
      const result = listOpportunitiesSchema.safeParse({
        workspace_id: '550e8400-e29b-41d4-a716-446655440000',
      })
      expect(result.success).toBe(true)
    })

    it('defaults limit to 50', () => {
      const result = listOpportunitiesSchema.parse({
        workspace_id: '550e8400-e29b-41d4-a716-446655440000',
      })
      expect(result.limit).toBe(50)
    })

    it('accepts status filter array', () => {
      const result = listOpportunitiesSchema.safeParse({
        workspace_id: '550e8400-e29b-41d4-a716-446655440000',
        status: ['intake', 'scored'],
      })
      expect(result.success).toBe(true)
    })
  })
})

describe('Status transition guard — validateStatusTransition', () => {
  describe('invalid transitions (no gates needed)', () => {
    it('rejects drafting → sent', () => {
      expect(() => validateStatusTransition('drafting', 'sent')).toThrow(StatusTransitionError)
      expect(() => validateStatusTransition('drafting', 'sent')).toThrow(/Invalid transition/)
    })

    it('rejects scored → ready_to_send', () => {
      expect(() => validateStatusTransition('scored', 'ready_to_send')).toThrow(StatusTransitionError)
    })

    it('rejects human_review → sent', () => {
      expect(() => validateStatusTransition('human_review', 'sent')).toThrow(StatusTransitionError)
    })

    it('rejects intake → won', () => {
      expect(() => validateStatusTransition('intake', 'won')).toThrow(StatusTransitionError)
    })

    it('rejects sent → intake (backwards)', () => {
      expect(() => validateStatusTransition('sent', 'intake')).toThrow(StatusTransitionError)
    })

    it('rejects won → anything (terminal)', () => {
      expect(() => validateStatusTransition('won', 'drafting')).toThrow(StatusTransitionError)
    })
  })

  describe('ready_to_send gate — requires approved strategy lock', () => {
    it('blocks human_review → ready_to_send without approved review', () => {
      expect(() =>
        validateStatusTransition('human_review', 'ready_to_send', {
          hasApprovedSendGate: false,
        })
      ).toThrow(StatusTransitionError)
      expect(() =>
        validateStatusTransition('human_review', 'ready_to_send', {
          hasApprovedSendGate: false,
        })
      ).toThrow(/missing approved strategy lock/)
    })

    it('allows human_review → ready_to_send with approved review', () => {
      expect(() =>
        validateStatusTransition('human_review', 'ready_to_send', {
          hasApprovedSendGate: true,
        })
      ).not.toThrow()
    })
  })

  describe('sent gate — requires selected draft + send gate + package ready', () => {
    it('blocks ready_to_send → sent without approved send gate', () => {
      expect(() =>
        validateStatusTransition('ready_to_send', 'sent', {
          hasSelectedDraft: true,
          hasApprovedSendGate: false,
          packageReady: true,
        })
      ).toThrow(StatusTransitionError)
      expect(() =>
        validateStatusTransition('ready_to_send', 'sent', {
          hasSelectedDraft: true,
          hasApprovedSendGate: false,
          packageReady: true,
        })
      ).toThrow(/approved send gate/)
    })

    it('blocks ready_to_send → sent without selected draft', () => {
      expect(() =>
        validateStatusTransition('ready_to_send', 'sent', {
          hasSelectedDraft: false,
          hasApprovedSendGate: true,
          packageReady: true,
        })
      ).toThrow(StatusTransitionError)
      expect(() =>
        validateStatusTransition('ready_to_send', 'sent', {
          hasSelectedDraft: false,
          hasApprovedSendGate: true,
          packageReady: true,
        })
      ).toThrow(/selected draft/)
    })

    it('blocks ready_to_send → sent without package ready', () => {
      expect(() =>
        validateStatusTransition('ready_to_send', 'sent', {
          hasSelectedDraft: true,
          hasApprovedSendGate: true,
          packageReady: false,
        })
      ).toThrow(StatusTransitionError)
      expect(() =>
        validateStatusTransition('ready_to_send', 'sent', {
          hasSelectedDraft: true,
          hasApprovedSendGate: true,
          packageReady: false,
        })
      ).toThrow(/package marked ready/)
    })

    it('blocks ready_to_send → sent with nothing satisfied', () => {
      expect(() =>
        validateStatusTransition('ready_to_send', 'sent', {
          hasSelectedDraft: false,
          hasApprovedSendGate: false,
          packageReady: false,
        })
      ).toThrow(/missing selected draft, approved send gate review, package marked ready/)
    })

    it('allows ready_to_send → sent with all gates satisfied', () => {
      expect(() =>
        validateStatusTransition('ready_to_send', 'sent', {
          hasSelectedDraft: true,
          hasApprovedSendGate: true,
          packageReady: true,
        })
      ).not.toThrow()
    })
  })

  describe('valid paths succeed', () => {
    it('allows intake → scored', () => {
      expect(() => validateStatusTransition('intake', 'scored')).not.toThrow()
    })

    it('allows scored → drafting', () => {
      expect(() => validateStatusTransition('scored', 'drafting')).not.toThrow()
    })

    it('allows drafting → human_review', () => {
      expect(() => validateStatusTransition('drafting', 'human_review')).not.toThrow()
    })

    it('allows human_review → drafting (revision)', () => {
      expect(() => validateStatusTransition('human_review', 'drafting')).not.toThrow()
    })

    it('allows sent → replied', () => {
      expect(() => validateStatusTransition('sent', 'replied')).not.toThrow()
    })

    it('allows replied → call_booked', () => {
      expect(() => validateStatusTransition('replied', 'call_booked')).not.toThrow()
    })

    it('allows call_booked → proposal_sent → won', () => {
      expect(() => validateStatusTransition('call_booked', 'proposal_sent')).not.toThrow()
      expect(() => validateStatusTransition('proposal_sent', 'won')).not.toThrow()
    })

    it('allows any → skipped from intake or scored', () => {
      expect(() => validateStatusTransition('intake', 'skipped')).not.toThrow()
      expect(() => validateStatusTransition('scored', 'skipped')).not.toThrow()
    })

    it('allows same-status (no-op)', () => {
      expect(() => validateStatusTransition('drafting', 'drafting')).not.toThrow()
    })
  })

  describe('full reviewed path — intake to sent', () => {
    it('succeeds through the complete happy path', () => {
      // intake → scored
      expect(() => validateStatusTransition('intake', 'scored')).not.toThrow()
      // scored → drafting
      expect(() => validateStatusTransition('scored', 'drafting')).not.toThrow()
      // drafting → human_review
      expect(() => validateStatusTransition('drafting', 'human_review')).not.toThrow()
      // human_review → ready_to_send (with approved strategy lock)
      expect(() =>
        validateStatusTransition('human_review', 'ready_to_send', {
          hasApprovedSendGate: true,
        })
      ).not.toThrow()
      // ready_to_send → sent (with all gates)
      expect(() =>
        validateStatusTransition('ready_to_send', 'sent', {
          hasSelectedDraft: true,
          hasApprovedSendGate: true,
          packageReady: true,
        })
      ).not.toThrow()
    })
  })
})
