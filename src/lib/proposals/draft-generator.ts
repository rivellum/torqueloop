// AI Draft Generator for Proposal Factory
// Generates draft variants using Anthropic Claude (real) or mock fallback
// Never auto-sends — all drafts require human review

import Anthropic from '@anthropic-ai/sdk'
import type { Opportunity, OpportunityScore, ProofPoint, DraftType } from '@/types/proposals'

export type GenerateDraftType = Extract<DraftType, 'cover_letter' | 'proposal_email' | 'qwilr_letter'>

export interface DraftInput {
  opportunity: Opportunity
  score: OpportunityScore | null
  proofPoints: ProofPoint[]
  draftType: GenerateDraftType
  leadContext?: {
    name: string | null
    email: string | null
    source: string | null
    status: string | null
    metadata: Record<string, unknown>
  } | null
  budgetInfo?: string
}

export interface GeneratedDraft {
  draft_type: GenerateDraftType
  variant_name: string
  angle: string
  body: string
}

// ─── Voice rules ────────────────────────────────────────────────────────────

export const VOICE_RULES: Record<GenerateDraftType, string> = {
  cover_letter: `Upwork cover letter rules:
- No salutation (no "Hi", "Hello", "Dear")
- Open with a specific detail from the job post — show you actually read it
- Use one relevant proof point naturally in the flow
- Under 200 words
- No corporate filler, no buzzwords, no em dashes
- Sign as Kathleen when appropriate
- Close with: "Happy to share more, when's a good time to connect?"`,

  proposal_email: `Proposal email rules:
- Professional but warm tone — not corporate
- Open with context about their specific situation
- Reference relevant proof points with metrics
- Clear scope and investment section
- No corporate filler, no em dashes
- Sign as Kathleen`,

  qwilr_letter: `Qwilr executive letter rules:
- Professional, authoritative tone
- Open with their challenge or goal
- Reference 1-2 proof points with specific metrics
- Clear value proposition
- Concise — under 300 words
- No em dashes
- Sign as Kathleen Lockwood, CEO`,
}

// ─── Prompt construction ────────────────────────────────────────────────────

export function buildDraftPrompt(input: DraftInput): string {
  const { opportunity, score, proofPoints, draftType, leadContext, budgetInfo } = input

  const proofSection = proofPoints.length > 0
    ? `\nAvailable proof points:\n${proofPoints.map((pp) =>
        `- ${pp.label}: ${pp.metric}${pp.client_context ? ` (${pp.client_context})` : ''}${pp.best_fit ? ` [Best for: ${pp.best_fit}]` : ''}`
      ).join('\n')}`
    : '\nNo proof points available.'

  const scoreSection = score
    ? `\nOpportunity score: ${score.total_score}/100
Breakdown: ICP fit ${score.icp_fit}/20, Problem fit ${score.problem_fit}/20, Budget fit ${score.budget_fit}/15, Proof match ${score.proof_match}/15, Urgency ${score.urgency}/10, Authority ${score.authority_signal}/10, Edge ${score.competition_edge}/10
Red flags: ${score.red_flags.length > 0 ? score.red_flags.join(', ') : 'none'}
Recommendation: ${score.recommendation}`
    : '\nNot scored yet.'

  const leadSection = leadContext
    ? `\nLinked lead context:
Name: ${leadContext.name || 'Unknown'}
Email: ${leadContext.email || 'Unknown'}
Source: ${leadContext.source || 'Unknown'}
Status: ${leadContext.status || 'Unknown'}`
    : ''

  const budgetSection = budgetInfo
    ? `\nBudget context: ${budgetInfo}`
    : opportunity.budget_min || opportunity.budget_max
      ? `\nBudget: $${opportunity.budget_min?.toLocaleString() || '?'} – $${opportunity.budget_max?.toLocaleString() || '?'} ${opportunity.currency}`
      : ''

  const sourceSection = opportunity.source
    ? `\nSource/channel: ${opportunity.source}`
    : ''

  const risksGaps = score?.red_flags?.length
    ? `\nKnown risks/gaps: ${score.red_flags.join(', ')}`
    : ''

  return `You are writing a ${draftType.replace(/_/g, ' ')} for Volt Studios, a women-led marketing and tech agency based in Austin, TX.

Opportunity: ${opportunity.title}
Company: ${opportunity.company_name || 'Unknown'}
${opportunity.description ? `Description:\n${opportunity.description}` : ''}${scoreSection}${leadSection}${budgetSection}${sourceSection}${risksGaps}${proofSection}

${VOICE_RULES[draftType]}

Generate exactly 3 different variants with different angles. Each variant must:
1. Have a descriptive variant_name (e.g., "Direct + Metric Lead", "Problem-First + Social Proof")
2. Have a brief angle description (1-2 sentences explaining the approach)
3. Have the full draft body

Return ONLY a valid JSON array with no markdown formatting:
[{"variant_name": "...", "angle": "...", "body": "..."}]`
}

// ─── Provider abstraction ───────────────────────────────────────────────────

interface AIProvider {
  generate(prompt: string): Promise<string>
}

class AnthropicProvider implements AIProvider {
  private client: Anthropic

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey })
  }

  async generate(prompt: string): Promise<string> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 60000) // 60s timeout

    try {
      const response = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
      }, { signal: controller.signal })

      const text = response.content[0].type === 'text' ? response.content[0].text : ''
      if (!text) throw new Error('Empty response from Anthropic')
      return text
    } finally {
      clearTimeout(timeout)
    }
  }
}

// ─── Mock generator (tests + fallback) ──────────────────────────────────────

function generateMockDrafts(input: DraftInput): GeneratedDraft[] {
  const { opportunity, proofPoints, draftType } = input
  const proof = proofPoints[0]

  const templates: Record<GenerateDraftType, GeneratedDraft[]> = {
    cover_letter: [
      {
        draft_type: 'cover_letter',
        variant_name: 'Direct + Metric Lead',
        angle: 'Opens with the strongest proof point metric to establish credibility immediately',
        body: `I noticed you're looking for help with ${opportunity.title.toLowerCase()}. ${proof ? `We recently helped ${proof.client_context} achieve ${proof.metric}.` : 'We have relevant experience in this area.'}

Our approach focuses on measurable outcomes, not vanity metrics. We'd love to discuss how this applies to ${opportunity.company_name || 'your business'}.

Happy to share more, when's a good time to connect?
— Kathleen`,
      },
      {
        draft_type: 'cover_letter',
        variant_name: 'Problem-First + Authority',
        angle: 'Opens with their specific problem, closes with credibility proof',
        body: `${opportunity.description ? opportunity.description.slice(0, 120) + '...' : 'Your project caught our attention.'}

${proof ? `We've tackled this exact challenge before — ${proof.label}.` : 'We have direct experience solving this.'}

Volt Studios is a women-led agency with 11 years of experience driving growth for digital brands. We'd love to explore how we can help ${opportunity.company_name || 'your team'}.

Happy to share more, when's a good time to connect?
— Kathleen`,
      },
      {
        draft_type: 'cover_letter',
        variant_name: 'Social Proof + Specific',
        angle: 'Leads with client results, specific to their use case',
        body: `${opportunity.company_name ? `Working with companies like ${opportunity.company_name}` : 'This type of project'} is exactly what we do best.

${proof ? `For context: ${proof.metric} for ${proof.client_context}.` : 'Our track record speaks for itself.'}

We'd love to learn more about your goals and share how we can help.

Happy to share more, when's a good time to connect?
— Kathleen`,
      },
    ],
    proposal_email: [
      {
        draft_type: 'proposal_email',
        variant_name: 'Context + Proof + CTA',
        angle: 'Opens with their situation, proves capability, closes with clear next step',
        body: `Following up on ${opportunity.title.toLowerCase()} — here's how we'd approach it.

${proof ? `For ${proof.client_context}, we delivered ${proof.metric}.` : 'We have deep experience in this space.'} That same playbook applies here.

Scope:
• Initial audit and strategy
• Implementation and optimization
• Weekly reporting and iteration

Investment: ${opportunity.budget_min ? `$${opportunity.budget_min.toLocaleString()} – $${opportunity.budget_max?.toLocaleString()}` : 'To be discussed'} /month

Next step: 30-minute call to align on priorities. What does your calendar look like this week?

Best,
Kathleen`,
      },
      {
        draft_type: 'proposal_email',
        variant_name: 'Problem + Solution + Urgency',
        angle: 'Frames their pain point, positions Volt as the solution, adds urgency',
        body: `${opportunity.company_name || 'Hi'} — ${opportunity.description ? opportunity.description.slice(0, 100).toLowerCase() : 'your project'} caught our attention because we've solved this exact problem before.

${proof ? `${proof.metric} — that's what we achieved for ${proof.client_context}.` : 'Our results speak for themselves.'}

We can start with a quick audit to identify the highest-impact opportunities, then build from there.

${opportunity.deadline_at ? `I see you have a deadline — let's move quickly.` : ''}

Are you free for a 20-minute call this week?

Kathleen`,
      },
      {
        draft_type: 'proposal_email',
        variant_name: 'Consultative + Value-First',
        angle: 'Positions as strategic partner, not vendor. Value-first framing.',
        body: `I've been thinking about ${opportunity.title.toLowerCase()} and wanted to share a few observations.

${proof ? `In similar work with ${proof.client_context}, we found that ${proof.best_fit?.toLowerCase() || 'the right strategy makes all the difference'}.` : 'The key is finding the right strategy before scaling spend.'}

Here's what I'd recommend:
1. Quick audit of current state
2. Strategy session to align on priorities
3. Phased rollout with weekly optimization

We're not the cheapest option, but we're the one that delivers ${proof ? proof.metric : 'real results'}.

Worth a conversation?

Kathleen`,
      },
    ],
    qwilr_letter: [
      {
        draft_type: 'qwilr_letter',
        variant_name: 'Executive + Data-Driven',
        angle: 'Opens with their challenge, proves capability with data, clear value prop',
        body: `${opportunity.company_name || 'Your team'} is looking for a partner to drive ${opportunity.title.toLowerCase().replace(/need|looking for/gi, '').trim()}. That's exactly our wheelhouse.

${proof ? `For ${proof.client_context}, we delivered ${proof.metric}.` : 'Our track record demonstrates consistent, measurable results.'}

Volt Studios is a women-led agency with 11 years of experience building growth engines for digital brands. We specialize in PPC, creative, and conversion optimization — the full stack needed to turn spend into revenue.

${opportunity.budget_min ? `At the $${opportunity.budget_min.toLocaleString()}–$${opportunity.budget_max?.toLocaleString()}/month investment level, we'd structure a phased approach:` : `We'd structure a phased approach:`}

Phase 1: Audit + Strategy (Week 1-2)
Phase 2: Launch + Optimize (Week 3-6)
Phase 3: Scale + Report (Ongoing)

We'd love to discuss how this applies to ${opportunity.company_name || 'your business'}.

Kathleen Lockwood
CEO, Volt Studios`,
      },
      {
        draft_type: 'qwilr_letter',
        variant_name: 'Problem-First + Proof Stack',
        angle: 'Opens with the core problem, stacks multiple proof points for credibility',
        body: `The challenge: ${opportunity.description ? opportunity.description.slice(0, 150) : 'Driving measurable growth in a competitive market'}. This is what we do every day.

Our results:
${proof ? `• ${proof.label}: ${proof.metric}` : '• Consistent, measurable client outcomes'}
• 11 years in business, women-led
• Full-funnel: PPC, creative, conversion optimization

We don't just run ads. We build growth engines.

${opportunity.budget_min ? `Investment: $${opportunity.budget_min.toLocaleString()}–$${opportunity.budget_max?.toLocaleString()}/month` : 'Investment: Tailored to your goals'}

Next step: 30-minute strategy call to map the highest-impact opportunities.

Kathleen Lockwood
CEO, Volt Studios`,
      },
      {
        draft_type: 'qwilr_letter',
        variant_name: 'Confident + Concise',
        angle: 'Short, confident, no filler. Lets results speak.',
        body: `${opportunity.company_name || 'Your team'} needs results, not decks.

${proof ? `${proof.metric} — that's what we delivered for ${proof.client_context}.` : 'We deliver measurable outcomes, period.'}

Volt Studios builds growth engines for brands scaling past $1M. PPC, creative, conversion — all in one team.

${opportunity.budget_min ? `$${opportunity.budget_min.toLocaleString()}–$${opportunity.budget_max?.toLocaleString()}/month` : 'Investment'} with a phased rollout starting Week 1.

Let's talk.

Kathleen Lockwood
CEO, Volt Studios`,
      },
    ],
  }

  return templates[draftType] || templates.cover_letter
}

// ─── Main generation function ───────────────────────────────────────────────

export async function generateDrafts(input: DraftInput): Promise<GeneratedDraft[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY

  // Use mock if no API key or placeholder
  if (!apiKey || apiKey.startsWith('your_') || apiKey.length < 20) {
    return generateMockDrafts(input)
  }

  try {
    const provider = new AnthropicProvider(apiKey)
    const prompt = buildDraftPrompt(input)
    const raw = await provider.generate(prompt)

    // Parse JSON from response — handle markdown code blocks
    let jsonStr = raw
    const codeBlockMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1].trim()
    }

    const arrayMatch = jsonStr.match(/\[[\s\S]*\]/)
    if (!arrayMatch) {
      console.error('[draft-generator] Failed to parse AI response, falling back to mock:', raw.slice(0, 200))
      return generateMockDrafts(input)
    }

    const variants = JSON.parse(arrayMatch[0]) as { variant_name: string; angle: string; body: string }[]

    if (!Array.isArray(variants) || variants.length === 0) {
      console.error('[draft-generator] Empty variants array, falling back to mock')
      return generateMockDrafts(input)
    }

    return variants.map((v) => ({
      draft_type: input.draftType,
      variant_name: v.variant_name || 'Untitled variant',
      angle: v.angle || '',
      body: v.body || '',
    }))
  } catch (err) {
    // On timeout or API error, fall back to mock
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[draft-generator] AI provider error, falling back to mock:', msg)
    return generateMockDrafts(input)
  }
}
