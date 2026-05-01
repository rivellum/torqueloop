import { describe, expect, it } from 'vitest'
import {
  getScoreBand,
  getScoreBandLabel,
  getStatusLabel,
  getNextStatuses,
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
