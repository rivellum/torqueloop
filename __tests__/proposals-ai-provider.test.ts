import { describe, expect, it, vi, beforeEach } from 'vitest'
import { buildPrompt, generateMockDraft } from '@/lib/proposals/prompts'
import { hasAIProvider } from '@/lib/proposals/ai-provider'

const mockInput = {
  title: 'PPC Campaign Management for B2B SaaS',
  description: 'Looking for Google Ads and landing page optimization. Budget $5K-10K/mo.',
  company_name: 'Test Corp',
  source: 'upwork',
  budget_min: 5000,
  budget_max: 10000,
  score: {
    total_score: 78,
    icp_fit: 16,
    problem_fit: 15,
    budget_fit: 12,
    proof_match: 10,
    urgency: 8,
    recommendation: 'Strong fit. Should bid.',
    red_flags: [],
  },
  proof_points: [
    {
      label: '29.5x ROAS — Slay the PE',
      metric: '29.5x return on ad spend',
      client_context: 'Slay the PE — professional exam prep',
      problem_type: 'paid_advertising',
      best_fit: 'Companies with unclear ad return',
    },
    {
      label: '93.6% CPL Reduction — Kaleo',
      metric: '93.6% reduction in cost per lead',
      client_context: 'Kaleo — lead generation overhaul',
      problem_type: 'lead_generation',
      best_fit: 'High CPL looking to scale',
    },
  ],
  lead: {
    name: 'Jane Smith',
    email: 'jane@testcorp.com',
    metadata: {},
  },
  channel: 'Upwork',
}

describe('buildPrompt', () => {
  it('includes opportunity context', () => {
    const prompt = buildPrompt(mockInput, 'cover_letter')
    expect(prompt).toContain('PPC Campaign Management for B2B SaaS')
    expect(prompt).toContain('Test Corp')
    expect(prompt).toContain('$5,000')
    expect(prompt).toContain('$10,000')
  })

  it('includes score breakdown', () => {
    const prompt = buildPrompt(mockInput, 'cover_letter')
    expect(prompt).toContain('78/100')
    expect(prompt).toContain('ICP Fit: 16/20')
    expect(prompt).toContain('Problem Fit: 15/20')
    expect(prompt).toContain('Strong fit. Should bid.')
  })

  it('includes proof points', () => {
    const prompt = buildPrompt(mockInput, 'cover_letter')
    expect(prompt).toContain('29.5x ROAS')
    expect(prompt).toContain('Slay the PE')
    expect(prompt).toContain('93.6% CPL Reduction')
  })

  it('includes lead context when present', () => {
    const prompt = buildPrompt(mockInput, 'cover_letter')
    expect(prompt).toContain('Jane Smith')
    expect(prompt).toContain('jane@testcorp.com')
  })

  it('omits lead section when no lead', () => {
    const inputNoLead = { ...mockInput, lead: null }
    const prompt = buildPrompt(inputNoLead, 'cover_letter')
    expect(prompt).not.toContain('## Lead Context')
  })

  it('includes channel info', () => {
    const prompt = buildPrompt(mockInput, 'cover_letter')
    expect(prompt).toContain('Upwork')
  })

  it('applies correct voice rules per draft type', () => {
    const coverPrompt = buildPrompt(mockInput, 'cover_letter')
    expect(coverPrompt).toContain('No salutation')
    expect(coverPrompt).toContain('200')

    const emailPrompt = buildPrompt(mockInput, 'proposal_email')
    expect(emailPrompt).toContain('appropriate greeting')
    expect(emailPrompt).toContain('500')

    const qwilrPrompt = buildPrompt(mockInput, 'qwilr_letter')
    expect(qwilrPrompt).toContain('Executive-ready')
    expect(qwilrPrompt).toContain('400')
  })

  it('includes red flags when present', () => {
    const inputWithFlags = {
      ...mockInput,
      score: { ...mockInput.score!, red_flags: ['No existing tracking', 'Tight deadline'] },
    }
    const prompt = buildPrompt(inputWithFlags, 'cover_letter')
    expect(prompt).toContain('No existing tracking')
    expect(prompt).toContain('Tight deadline')
  })

  it('handles missing score gracefully', () => {
    const inputNoScore = { ...mockInput, score: null }
    const prompt = buildPrompt(inputNoScore, 'cover_letter')
    expect(prompt).not.toContain('## Score')
    expect(prompt).toContain('## Available Proof Points')
  })

  it('handles empty proof points gracefully', () => {
    const inputNoPP = { ...mockInput, proof_points: [] }
    const prompt = buildPrompt(inputNoPP, 'cover_letter')
    expect(prompt).toContain('## Available Proof Points')
  })
})

describe('generateMockDraft', () => {
  it('generates cover letter with proof point', () => {
    const draft = generateMockDraft(mockInput, 'cover_letter')
    expect(draft).toContain('Kathleen')
    expect(draft).toContain('29.5x return on ad spend')
    expect(draft).toContain("Happy to share more")
  })

  it('generates proposal email with structure', () => {
    const draft = generateMockDraft(mockInput, 'proposal_email')
    expect(draft).toContain('Hi,')
    expect(draft).toContain('Discovery call')
    expect(draft).toContain('Kathleen')
  })

  it('generates qwilr letter with sections', () => {
    const draft = generateMockDraft(mockInput, 'qwilr_letter')
    expect(draft).toContain('## The Challenge')
    expect(draft).toContain('## Why Volt')
    expect(draft).toContain('## Investment')
    expect(draft).toContain('## Next Steps')
  })

  it('handles no proof points', () => {
    const inputNoPP = { ...mockInput, proof_points: [] }
    const draft = generateMockDraft(inputNoPP, 'cover_letter')
    expect(draft).toContain('deep experience')
    expect(draft).toContain('Kathleen')
  })

  it('handles no score', () => {
    const inputNoScore = { ...mockInput, score: null }
    const draft = generateMockDraft(inputNoScore, 'cover_letter')
    expect(draft).toContain("We'd love to learn more")
  })

  it('includes budget in qwilr letter', () => {
    const draft = generateMockDraft(mockInput, 'qwilr_letter')
    expect(draft).toContain('$5,000')
    expect(draft).toContain('$10,000')
  })
})

describe('hasAIProvider', () => {
  it('returns boolean based on env', () => {
    const result = hasAIProvider()
    // In test env, no API keys are set, so should be false
    expect(typeof result).toBe('boolean')
  })
})
