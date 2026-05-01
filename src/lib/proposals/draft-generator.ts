// AI Draft Generator for Proposal Factory
// Generates draft variants using Anthropic Claude
// Never auto-sends — all drafts require human review

import Anthropic from '@anthropic-ai/sdk'
import type { Opportunity, OpportunityScore, ProofPoint } from '@/types/proposals'

export type DraftType =
  | 'cover_letter'        // Upwork cover letter
  | 'proposal_email'      // Email to send proposal
  | 'qwilr_letter'        // Qwilr-ready executive letter

export interface DraftInput {
  opportunity: Opportunity
  score: OpportunityScore | null
  proofPoints: ProofPoint[]
  draftType: DraftType
  budgetInfo?: string
  voiceRules?: string
}

export interface GeneratedDraft {
  draft_type: DraftType
  variant_name: string
  angle: string
  body: string
}

// ─── Voice rules ────────────────────────────────────────────────────────────

const VOICE_RULES = {
  cover_letter: `Upwork cover letter rules:
- No salutation (no "Hi", "Hello", "Dear")
- Open with a specific detail from the job post
- Use one relevant proof point naturally in the flow
- Under 200 words
- No corporate filler, no buzzwords
- No em dashes
- Sign as Kathleen when appropriate
- Close with: "Happy to share more, when's a good time to connect?"`,

  proposal_email: `Proposal email rules:
- Professional but warm tone
- Open with context about their specific situation
- Reference relevant proof points with metrics
- Clear scope and investment section
- No corporate filler
- No em dashes
- Sign as Kathleen`,

  qwilr_letter: `Qwilr executive letter rules:
- Professional, authoritative tone
- Open with their challenge/goal
- Reference 1-2 proof points with specific metrics
- Clear value proposition
- Concise — under 300 words
- No em dashes
- Sign as Kathleen Lockwood, CEO`,
}

// ─── Prompt construction ────────────────────────────────────────────────────

function buildPrompt(input: DraftInput): string {
  const { opportunity, score, proofPoints, draftType, budgetInfo } = input

  const proofSection = proofPoints.length > 0
    ? `\nAvailable proof points:\n${proofPoints.map((pp) =>
        `- ${pp.label}: ${pp.metric} (${pp.client_context || 'general'})`
      ).join('\n')}`
    : '\nNo proof points available.'

  const scoreSection = score
    ? `\nScore: ${score.total_score}/100 (ICP: ${score.icp_fit}/20, Problem: ${score.problem_fit}/20, Budget: ${score.budget_fit}/15, Proof: ${score.proof_match}/15)\nRed flags: ${score.red_flags.length > 0 ? score.red_flags.join(', ') : 'none'}`
    : '\nNot scored yet.'

  const budgetSection = budgetInfo
    ? `\nBudget context: ${budgetInfo}`
    : opportunity.budget_min || opportunity.budget_max
      ? `\nBudget: $${opportunity.budget_min?.toLocaleString() || '?'} – $${opportunity.budget_max?.toLocaleString() || '?'} ${opportunity.currency}`
      : ''

  return `You are writing a ${draftType.replace(/_/g, ' ')} for Volt Studios, a women-led marketing and tech agency.

Opportunity: ${opportunity.title}
Company: ${opportunity.company_name || 'Unknown'}
${opportunity.description ? `Description:\n${opportunity.description}` : ''}${scoreSection}${budgetSection}${proofSection}

${VOICE_RULES[draftType]}

Generate 3 different variants with different angles. Each variant should:
1. Have a descriptive variant_name (e.g., "Direct + Metric Lead", "Problem-First + Social Proof")
2. Have a brief angle description (1 sentence)
3. Have the full draft body

Return ONLY valid JSON array: [{"variant_name": "...", "angle": "...", "body": "..."}]`
}

// ─── Generation ─────────────────────────────────────────────────────────────

export async function generateDrafts(input: DraftInput): Promise<GeneratedDraft[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey || apiKey.startsWith('your_') || apiKey.length < 20) {
    // Return mocked drafts if no API key
    return generateMockDrafts(input)
  }

  const client = new Anthropic({ apiKey })
  const prompt = buildPrompt(input)

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''

  // Parse JSON from response
  const jsonMatch = text.match(/\[[\s\S]*\]/)
  if (!jsonMatch) {
    throw new Error('Failed to parse draft generation response')
  }

  const variants = JSON.parse(jsonMatch[0]) as { variant_name: string; angle: string; body: string }[]

  return variants.map((v) => ({
    draft_type: input.draftType,
    variant_name: v.variant_name,
    angle: v.angle,
    body: v.body,
  }))
}

function generateMockDrafts(input: DraftInput): GeneratedDraft[] {
  const { opportunity, proofPoints, draftType } = input
  const proof = proofPoints[0]

  return [
    {
      draft_type: draftType,
      variant_name: 'Direct + Metric Lead',
      angle: 'Opens with the strongest proof point metric',
      body: `[Mock draft — set ANTHROPIC_API_KEY for real generation]

I noticed you're looking for help with ${opportunity.title.toLowerCase()}. ${proof ? `We recently helped ${proof.client_context} achieve ${proof.metric}.` : 'We have relevant experience in this area.'}

Our approach focuses on measurable outcomes, not vanity metrics. We'd love to discuss how this applies to ${opportunity.company_name || 'your business'}.

Happy to share more, when's a good time to connect?
— Kathleen`,
    },
    {
      draft_type: draftType,
      variant_name: 'Problem-First + Authority',
      angle: 'Opens with their specific problem, closes with credibility',
      body: `[Mock draft — set ANTHROPIC_API_KEY for real generation]

${opportunity.description ? opportunity.description.slice(0, 100) + '...' : 'Your project caught our attention.'}

${proof ? `We've tackled this exact challenge before — ${proof.label}.` : 'We have direct experience solving this.'}

Volt Studios is a women-led agency with 11 years of experience in growth marketing. We'd love to explore how we can help.

Happy to share more, when's a good time to connect?
— Kathleen`,
    },
    {
      draft_type: draftType,
      variant_name: 'Social Proof + Specific',
      angle: 'Leads with client results, specific to their industry',
      body: `[Mock draft — set ANTHROPIC_API_KEY for real generation]

${opportunity.company_name ? `Working with companies like ${opportunity.company_name}` : 'This type of project'} is exactly what we do best.

${proof ? `For context: ${proof.metric} for ${proof.client_context}.` : 'Our track record speaks for itself.'}

We'd love to learn more about your goals and share how we can help.

Happy to share more, when's a good time to connect?
— Kathleen`,
    },
  ]
}
