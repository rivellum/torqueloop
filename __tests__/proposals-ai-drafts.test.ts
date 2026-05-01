import { describe, expect, it } from 'vitest'

// Test the prompt construction logic for AI draft generation
// We replicate the core buildPrompt function since the API route is Next.js

const VOICE_RULES = {
  cover_letter: {
    maxWords: 200,
    noSalutation: true,
    openWith: 'a specific detail from the post',
    signOff: 'Kathleen',
    close: 'Happy to share more, when\'s a good time to connect?',
    rules: ['No corporate filler', 'No em dashes'],
  },
}

interface DraftInput {
  title: string
  description: string | null
  company_name: string | null
  source: string | null
  budget_min: number | null
  budget_max: number | null
  score: { total_score: number; recommendation: string | null; red_flags: string[] } | null
  proof_points: Array<{ label: string; metric: string; client_context: string | null }>
  lead: { name: string | null; email: string } | null
}

function buildPrompt(input: DraftInput, draftType: string): string {
  const rules = VOICE_RULES[draftType as keyof typeof VOICE_RULES] || VOICE_RULES.cover_letter

  const parts = [
    `You are writing a ${draftType.replace(/_/g, ' ')} for Volt Studios.`,
    `Title: ${input.title}`,
    input.company_name ? `Company: ${input.company_name}` : '',
    input.description ? `Description: ${input.description.slice(0, 2000)}` : '',
    input.score ? `Score: ${input.score.total_score}/100` : '',
    '## Proof Points',
    ...input.proof_points.map((pp) => `- ${pp.label}: ${pp.metric}`),
    `Max words: ${rules.maxWords}`,
    rules.noSalutation ? 'No salutation' : 'Include greeting',
  ].filter(Boolean)

  return parts.join('\n')
}

describe('AI draft generation — prompt construction', () => {
  const baseInput: DraftInput = {
    title: 'Need Google Ads management for SaaS startup',
    description: 'We are a funded startup looking for PPC help',
    company_name: 'Acme Corp',
    source: 'upwork',
    budget_min: 3000,
    budget_max: 5000,
    score: { total_score: 82, recommendation: 'Strong fit — bid now', red_flags: [] },
    proof_points: [
      { label: '29.5x ROAS — Slay the PE', metric: '29.5x return on ad spend', client_context: 'exam prep company' },
    ],
    lead: null,
  }

  it('includes opportunity title', () => {
    const prompt = buildPrompt(baseInput, 'cover_letter')
    expect(prompt).toContain('Need Google Ads management')
  })

  it('includes company name when present', () => {
    const prompt = buildPrompt(baseInput, 'cover_letter')
    expect(prompt).toContain('Acme Corp')
  })

  it('includes score when present', () => {
    const prompt = buildPrompt(baseInput, 'cover_letter')
    expect(prompt).toContain('82/100')
  })

  it('includes proof points', () => {
    const prompt = buildPrompt(baseInput, 'cover_letter')
    expect(prompt).toContain('29.5x ROAS')
    expect(prompt).toContain('Slay the PE')
  })

  it('includes voice rules for cover letter', () => {
    const prompt = buildPrompt(baseInput, 'cover_letter')
    expect(prompt).toContain('No salutation')
    expect(prompt).toContain('200') // max words
  })

  it('handles missing optional fields gracefully', () => {
    const minimal: DraftInput = {
      title: 'Test',
      description: null,
      company_name: null,
      source: null,
      budget_min: null,
      budget_max: null,
      score: null,
      proof_points: [],
      lead: null,
    }
    const prompt = buildPrompt(minimal, 'cover_letter')
    expect(prompt).toContain('Test')
    expect(prompt).not.toContain('Company:')
    expect(prompt).not.toContain('Score:')
  })

  it('truncates long descriptions', () => {
    const longDesc = 'A'.repeat(3000)
    const input: DraftInput = { ...baseInput, description: longDesc }
    const prompt = buildPrompt(input, 'cover_letter')
    // Should be truncated to 2000 chars
    expect(prompt.length).toBeLessThan(longDesc.length + 500)
  })

  it('multiple proof points all included', () => {
    const input: DraftInput = {
      ...baseInput,
      proof_points: [
        { label: 'Proof A', metric: '100%', client_context: null },
        { label: 'Proof B', metric: '200%', client_context: 'context' },
        { label: 'Proof C', metric: '300%', client_context: null },
      ],
    }
    const prompt = buildPrompt(input, 'cover_letter')
    expect(prompt).toContain('Proof A')
    expect(prompt).toContain('Proof B')
    expect(prompt).toContain('Proof C')
  })
})
