import { describe, expect, it } from 'vitest'
import { createProofPointSchema, listOpportunitiesSchema } from '@/lib/proposals/schemas'

describe('Proposal Factory — workspace isolation', () => {
  describe('proof points', () => {
    it('requires workspace_id for creation', () => {
      const result = createProofPointSchema.safeParse({
        label: 'Test',
        metric: '100%',
      })
      expect(result.success).toBe(false)
    })

    it('accepts valid workspace-scoped proof point', () => {
      const result = createProofPointSchema.safeParse({
        workspace_id: '550e8400-e29b-41d4-a716-446655440001',
        label: 'Test Proof',
        metric: '50% improvement',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.workspace_id).toBe('550e8400-e29b-41d4-a716-446655440001')
        expect(result.data.active).toBe(true) // default
      }
    })

    it('different workspaces can have same label', () => {
      const ws1 = createProofPointSchema.parse({
        workspace_id: '550e8400-e29b-41d4-a716-446655440001',
        label: 'Same Label',
        metric: '100%',
      })
      const ws2 = createProofPointSchema.parse({
        workspace_id: '550e8400-e29b-41d4-a716-446655440002',
        label: 'Same Label',
        metric: '200%',
      })
      // Both valid — isolation is enforced at DB level via RLS + unique constraint
      expect(ws1.workspace_id).not.toBe(ws2.workspace_id)
      expect(ws1.label).toBe(ws2.label)
    })
  })

  describe('opportunities', () => {
    it('requires workspace_id', () => {
      const result = listOpportunitiesSchema.safeParse({})
      expect(result.success).toBe(false)
    })

    it('scopes list query to workspace', () => {
      const result = listOpportunitiesSchema.parse({
        workspace_id: '550e8400-e29b-41d4-a716-446655440001',
      })
      expect(result.workspace_id).toBe('550e8400-e29b-41d4-a716-446655440001')
    })
  })
})
