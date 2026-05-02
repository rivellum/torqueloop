import { describe, it, expect } from 'vitest'
import { buildDraftPrompt, generateDrafts, VOICE_RULES } from '@/lib/proposals/draft-generator'
import type { Opportunity, OpportunityScore, ProofPoint } from '@/types/proposals'

// ─── Test fixtures ──────────────────────────────────────────────────────────

const mockOpportunity: Opportunity = {
  id: 'opp-123',
  workspace_id: 'ws-1',
  lead_id: null,
  initiative_id: null,
  channel_id: null,
  source: 'upwork',
  external_url: null,
  title: 'Need PPC management for funded SaaS startup',
  company_name: 'TestCo',
  description: 'We are a Series A SaaS looking for PPC management. Current ad spend $10k/month. Need someone to optimize ROAS.',
  budget_min: 3000,
  budget_max: 5000,
  currency: 'USD',
  status: 'scored',
  posted_at: null,
  deadline_at: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

const mockScore: OpportunityScore = {
  id: 'score-1',
  workspace_id: 'ws-1',
  opportunity_id: 'opp-123',
  total_score: 72,
  icp_fit: 15,
  problem_fit: 16,
  budget_fit: 12,
  proof_match: 10,
  urgency: 8,
  authority_signal: 6,
  competition_edge: 5,
  red_flags: ['No existing tracking setup'],
  recommendation: 'Good fit — strong problem alignment, budget in range.',
  model_version: 'v1',
  created_at: '2026-01-01T00:00:00Z',
}

const mockProofPoints: ProofPoint[] = [
  {
    id: 'pp-1',
    workspace_id: 'ws-1',
    label: '29.5x ROAS — Slay the PE',
    metric: '29.5x return on ad spend',
    client_context: 'Slay the PE — professional exam prep company',
    problem_type: 'paid_advertising',
    service_category: 'PPC',
    best_fit: 'Companies spending on ads with unclear return',
    do_not_use_when: 'Client has no existing ad spend',
    source_note: 'Internal campaign data',
    active: true,
  },
  {
    id: 'pp-2',
    workspace_id: 'ws-1',
    label: '93.6% CPL Reduction — Kaleo',
    metric: '93.6% reduction in cost per lead',
    client_context: 'Kaleo — lead generation overhaul',
    problem_type: 'lead_generation',
    service_category: 'PPC',
    best_fit: 'Companies with high CPL',
    do_not_use_when: 'No tracking setup',
    source_note: 'Internal campaign data',
    active: true,
  },
]

const mockLeadContext = {
  name: 'Jane Smith',
  email: 'jane@testco.com',
  source: 'upwork',
  status: 'qualified',
  metadata: {},
}

// ─── Prompt construction tests ──────────────────────────────────────────────

describe('buildDraftPrompt', () => {
  it('includes opportunity title and description', () => {
    const prompt = buildDraftPrompt({
      opportunity: mockOpportunity,
      score: null,
      proofPoints: [],
      draftType: 'cover_letter',
    })
    expect(prompt).toContain('Need PPC management for funded SaaS startup')
    expect(prompt).toContain('Series A SaaS')
  })

  it('includes score breakdown when score is present', () => {
    const prompt = buildDraftPrompt({
      opportunity: mockOpportunity,
      score: mockScore,
      proofPoints: [],
      draftType: 'cover_letter',
    })
    expect(prompt).toContain('72/100')
    expect(prompt).toContain('ICP fit 15/20')
    expect(prompt).toContain('Problem fit 16/20')
    expect(prompt).toContain('No existing tracking setup')
  })

  it('includes proof points with context', () => {
    const prompt = buildDraftPrompt({
      opportunity: mockOpportunity,
      score: null,
      proofPoints: mockProofPoints,
      draftType: 'proposal_email',
    })
    expect(prompt).toContain('29.5x ROAS')
    expect(prompt).toContain('Slay the PE')
    expect(prompt).toContain('93.6% CPL Reduction')
  })

  it('includes lead context when available', () => {
    const prompt = buildDraftPrompt({
      opportunity: mockOpportunity,
      score: null,
      proofPoints: [],
      draftType: 'cover_letter',
      leadContext: mockLeadContext,
    })
    expect(prompt).toContain('Jane Smith')
    expect(prompt).toContain('jane@testco.com')
    expect(prompt).toContain('upwork')
  })

  it('includes budget info when provided', () => {
    const prompt = buildDraftPrompt({
      opportunity: mockOpportunity,
      score: null,
      proofPoints: [],
      draftType: 'cover_letter',
      budgetInfo: 'Client wants to stay under $4k/mo',
    })
    expect(prompt).toContain('Client wants to stay under $4k/mo')
  })

  it('includes opportunity budget when no budgetInfo override', () => {
    const prompt = buildDraftPrompt({
      opportunity: mockOpportunity,
      score: null,
      proofPoints: [],
      draftType: 'cover_letter',
    })
    expect(prompt).toContain('$3,000')
    expect(prompt).toContain('$5,000')
  })

  it('includes source/channel info', () => {
    const prompt = buildDraftPrompt({
      opportunity: mockOpportunity,
      score: null,
      proofPoints: [],
      draftType: 'cover_letter',
    })
    expect(prompt).toContain('upwork')
  })

  it('includes voice rules for the correct draft type', () => {
    const coverPrompt = buildDraftPrompt({
      opportunity: mockOpportunity,
      score: null,
      proofPoints: [],
      draftType: 'cover_letter',
    })
    expect(coverPrompt).toContain('No salutation')
    expect(coverPrompt).toContain('Under 200 words')

    const emailPrompt = buildDraftPrompt({
      opportunity: mockOpportunity,
      score: null,
      proofPoints: [],
      draftType: 'proposal_email',
    })
    expect(emailPrompt).toContain('Professional but warm')

    const qwilrPrompt = buildDraftPrompt({
      opportunity: mockOpportunity,
      score: null,
      proofPoints: [],
      draftType: 'qwilr_letter',
    })
    expect(qwilrPrompt).toContain('Qwilr executive letter')
  })

  it('handles missing optional fields gracefully', () => {
    const minimalOpp: Opportunity = {
      ...mockOpportunity,
      company_name: null,
      description: null,
      budget_min: null,
      budget_max: null,
      source: null,
      lead_id: null,
    }
    const prompt = buildDraftPrompt({
      opportunity: minimalOpp,
      score: null,
      proofPoints: [],
      draftType: 'cover_letter',
    })
    expect(prompt).toContain('Unknown')
    expect(prompt).not.toContain('undefined')
    expect(prompt).not.toContain('null')
  })
})

// ─── Mock generator tests ───────────────────────────────────────────────────

describe('generateDrafts — mock mode', () => {
  it('returns 3 variants for cover_letter', async () => {
    const drafts = await generateDrafts({
      opportunity: mockOpportunity,
      score: mockScore,
      proofPoints: mockProofPoints,
      draftType: 'cover_letter',
    })
    expect(drafts).toHaveLength(3)
    drafts.forEach((d) => {
      expect(d.draft_type).toBe('cover_letter')
      expect(d.variant_name).toBeTruthy()
      expect(d.angle).toBeTruthy()
      expect(d.body).toBeTruthy()
    })
  })

  it('returns 3 variants for proposal_email', async () => {
    const drafts = await generateDrafts({
      opportunity: mockOpportunity,
      score: null,
      proofPoints: [],
      draftType: 'proposal_email',
    })
    expect(drafts).toHaveLength(3)
    drafts.forEach((d) => {
      expect(d.draft_type).toBe('proposal_email')
    })
  })

  it('returns 3 variants for qwilr_letter', async () => {
    const drafts = await generateDrafts({
      opportunity: mockOpportunity,
      score: null,
      proofPoints: [],
      draftType: 'qwilr_letter',
    })
    expect(drafts).toHaveLength(3)
    drafts.forEach((d) => {
      expect(d.draft_type).toBe('qwilr_letter')
    })
  })

  it('uses proof point context in drafts when available', async () => {
    const drafts = await generateDrafts({
      opportunity: mockOpportunity,
      score: null,
      proofPoints: mockProofPoints,
      draftType: 'cover_letter',
    })
    // At least one draft should reference a proof point
    const hasProofReference = drafts.some(
      (d) => d.body.includes('29.5x') || d.body.includes('Slay the PE')
    )
    expect(hasProofReference).toBe(true)
  })

  it('handles zero proof points gracefully', async () => {
    const drafts = await generateDrafts({
      opportunity: mockOpportunity,
      score: null,
      proofPoints: [],
      draftType: 'cover_letter',
    })
    expect(drafts).toHaveLength(3)
    drafts.forEach((d) => {
      expect(d.body).toBeTruthy()
    })
  })
})

// ─── No auto-approval test ──────────────────────────────────────────────────

describe('draft generation — no auto-approval', () => {
  it('generated drafts never have selected=true', async () => {
    const drafts = await generateDrafts({
      opportunity: mockOpportunity,
      score: mockScore,
      proofPoints: mockProofPoints,
      draftType: 'cover_letter',
    })
    // The generator itself doesn't set selected — that's the API route's job
    // But we verify the shape doesn't include selected
    drafts.forEach((d) => {
      expect((d as unknown as Record<string, unknown>).selected).toBeUndefined()
    })
  })
})

// ─── Voice rules completeness ───────────────────────────────────────────────

describe('voice rules', () => {
  it('all draft types have voice rules', () => {
    expect(VOICE_RULES.cover_letter).toBeTruthy()
    expect(VOICE_RULES.proposal_email).toBeTruthy()
    expect(VOICE_RULES.qwilr_letter).toBeTruthy()
  })

  it('cover letter rules prohibit salutation', () => {
    expect(VOICE_RULES.cover_letter).toContain('No salutation')
  })

  it('cover letter rules specify word limit', () => {
    expect(VOICE_RULES.cover_letter).toContain('200 words')
  })

  it('all rules prohibit em dashes', () => {
    expect(VOICE_RULES.cover_letter).toContain('em dashes')
    expect(VOICE_RULES.proposal_email).toContain('em dashes')
    expect(VOICE_RULES.qwilr_letter).toContain('em dashes')
  })
})
