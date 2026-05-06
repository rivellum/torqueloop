// Proposal draft prompts and mock generator
// Extracted from route.ts so the route file only exports HTTP methods (Next.js requirement)

export interface VoiceRule {
  maxWords: number
  noSalutation: boolean
  openWith: string
  signOff: string
  close: string
  rules: string[]
}

export const VOICE_RULES: Record<string, VoiceRule> = {
  cover_letter: {
    maxWords: 200,
    noSalutation: true,
    openWith: 'a specific detail from the post',
    signOff: 'Kathleen',
    close: "Happy to share more, when's a good time to connect?",
    rules: [
      'No corporate filler',
      'No em dashes',
      'Use one relevant proof point naturally',
      'Be specific, not generic',
      'Sound like a real person, not a template',
    ],
  },
  proposal_email: {
    maxWords: 500,
    noSalutation: false,
    openWith: 'the business outcome the buyer wants',
    signOff: 'Kathleen',
    close: 'Looking forward to your thoughts.',
    rules: [
      'Clarity -> Engine -> Alignment structure',
      'Reference specific proof point',
      'No overpromising',
      'Clear next step',
      'Be direct, not salesy',
    ],
  },
  qwilr_letter: {
    maxWords: 400,
    noSalutation: false,
    openWith: 'the core business challenge',
    signOff: 'Kathleen',
    close: 'Happy to walk through this in detail.',
    rules: [
      'Executive-ready tone',
      'Why Volt section',
      'Process section',
      'Investment framing, not pricing',
      'Professional but warm',
    ],
  },
}

export interface DraftInput {
  title: string
  description: string | null
  company_name: string | null
  source: string | null
  budget_min: number | null
  budget_max: number | null
  score: {
    total_score: number
    icp_fit: number
    problem_fit: number
    budget_fit: number
    proof_match: number
    urgency: number
    recommendation: string | null
    red_flags: string[]
  } | null
  proof_points: Array<{
    label: string
    metric: string
    client_context: string | null
    problem_type: string | null
    best_fit: string | null
  }>
  lead: {
    name: string | null
    email: string | null
    metadata: Record<string, unknown>
  } | null
  channel: string | null
}

export function buildPrompt(input: DraftInput, draftType: string): string {
  const rules = VOICE_RULES[draftType] || VOICE_RULES.cover_letter

  const parts = [
    `You are Kathleen, a partner at Volt Studios — a women-led digital marketing agency with 11 years in business.`,
    `You specialize in paid advertising, SEO, lead generation, CRO, and brand strategy.`,
    '',
    `Write a ${draftType.replace(/_/g, ' ')} for the following opportunity.`,
    '',
    `## Opportunity`,
    `Title: ${input.title}`,
    input.company_name ? `Company: ${input.company_name}` : null,
    input.description ? `Description:\n${input.description.slice(0, 2000)}` : null,
    input.source ? `Source: ${input.source}` : null,
    input.channel ? `Channel: ${input.channel}` : null,
    input.budget_min || input.budget_max
      ? `Budget: $${input.budget_min?.toLocaleString() || '?'} – $${input.budget_max?.toLocaleString() || '?'}`
      : null,
    '',
    input.score ? `## Score: ${input.score.total_score}/100` : null,
    input.score?.recommendation ? `Recommendation: ${input.score.recommendation}` : null,
    input.score?.red_flags?.length ? `Red flags: ${input.score.red_flags.join('; ')}` : null,
    input.score
      ? `ICP Fit: ${input.score.icp_fit}/20 | Problem Fit: ${input.score.problem_fit}/20 | Budget Fit: ${input.score.budget_fit}/15`
      : null,
    '',
    '## Available Proof Points (use the most relevant one naturally)',
    ...input.proof_points.map(
      (pp) =>
        `- ${pp.label}: ${pp.metric}${pp.client_context ? ` (${pp.client_context})` : ''}${pp.best_fit ? ` [Best for: ${pp.best_fit}]` : ''}`
    ),
    '',
    input.lead
      ? [
          '## Lead Context',
          input.lead.name ? `Name: ${input.lead.name}` : null,
          input.lead.email ? `Email: ${input.lead.email}` : null,
        ]
          .filter(Boolean)
          .join('\n')
      : null,
    '',
    `## Voice Rules`,
    `Max words: ${rules.maxWords}`,
    rules.noSalutation ? 'No salutation — start directly with content' : 'Include appropriate greeting',
    `Open with: ${rules.openWith}`,
    `Sign off: ${rules.signOff}`,
    `Close: ${rules.close}`,
    ...rules.rules.map((r) => `- ${r}`),
    '',
    `Generate ONLY the draft text. No meta-commentary. No explanation.`,
  ].filter(Boolean)

  return parts.join('\n')
}

// Mock generator — used when no AI provider is configured or as test fallback
export function generateMockDraft(input: DraftInput, draftType: string): string {
  const rules = VOICE_RULES[draftType] || VOICE_RULES.cover_letter
  const bestProof = input.proof_points[0]

  if (draftType === 'cover_letter') {
    return [
      `I noticed your post about ${input.title.toLowerCase().includes('need') ? input.title.toLowerCase().replace('need ', '') : input.title}.`,
      '',
      bestProof
        ? `We recently helped ${bestProof.client_context || 'a client'} achieve ${bestProof.metric.toLowerCase()}.`
        : 'We have deep experience in this area.',
      '',
      input.score?.problem_fit && input.score.problem_fit >= 15
        ? 'This is exactly the kind of work we do best.'
        : "We'd love to learn more about your specific needs.",
      '',
      rules.close,
      '',
      `— ${rules.signOff}`,
    ].join('\n')
  }

  if (draftType === 'proposal_email') {
    return [
      'Hi,',
      '',
      `Following up on ${input.source === 'upwork' ? 'your Upwork post' : 'our conversation'} about ${input.title}.`,
      '',
      bestProof
        ? `To give you a sense of what we deliver: ${bestProof.metric} for ${bestProof.client_context || 'a recent client'}.`
        : 'We have a strong track record in this area.',
      '',
      "Here's how we'd approach this:",
      '1. Discovery call to understand your specific goals',
      '2. Strategy and scope proposal within 48 hours',
      '3. Execution with weekly progress updates',
      '',
      rules.close,
      '',
      `Best,\n${rules.signOff}`,
    ].join('\n')
  }

  // qwilr_letter
  return [
    `## The Challenge`,
    '',
    `${input.company_name || 'Your company'} is looking for support with ${input.title.toLowerCase()}.`,
    '',
    `## Why Volt`,
    '',
    bestProof
      ? `${bestProof.metric} — ${bestProof.client_context || 'proven results'}.`
      : '11 years of digital marketing expertise.',
    'Women-led agency with a track record of measurable outcomes.',
    '',
    `## Our Approach`,
    '',
    'We combine data-driven strategy with hands-on execution:',
    '- Deep-dive discovery into your market and goals',
    '- Custom strategy built around your specific KPIs',
    '- Weekly reporting with clear, actionable insights',
    '',
    `## Investment`,
    '',
    input.budget_min || input.budget_max
      ? `Based on your scope, we'd estimate $${input.budget_min?.toLocaleString() || '?'} – $${input.budget_max?.toLocaleString() || '?'} monthly.`
      : "We'll tailor our engagement to your budget and goals.",
    '',
    `## Next Steps`,
    '',
    "Let's schedule a 30-minute discovery call to discuss your goals and how we can help.",
    '',
    rules.close,
    '',
    `— ${rules.signOff}`,
  ].join('\n')
}

export function selectProofPoint(
  input: DraftInput,
  draftType: string
): { label: string; metric: string } | null {
  if (!input.proof_points.length) return null
  if (draftType === 'cover_letter' && input.score?.problem_fit && input.score.problem_fit >= 15) {
    const paidProof = input.proof_points.find(
      (pp) => pp.problem_type === 'paid_advertising' || pp.problem_type === 'lead_generation'
    )
    if (paidProof) return paidProof
  }
  return input.proof_points[0]
}
