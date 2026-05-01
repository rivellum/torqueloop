// POST /api/proposals/generate-drafts — AI-assisted draft generation
// Generates 2-3 draft variants based on opportunity context
// Does NOT auto-send or auto-approve anything
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getActiveWorkspaceId } from '@/lib/workspace-server'
import { z } from 'zod'

const generateDraftsSchema = z.object({
  opportunity_id: z.string().uuid(),
  draft_types: z.array(z.enum(['cover_letter', 'proposal_email', 'qwilr_letter'])).default(['cover_letter']),
})

// Voice rules for Volt/Kathleen
const VOICE_RULES = {
  cover_letter: {
    maxWords: 200,
    noSalutation: true,
    openWith: 'a specific detail from the post',
    signOff: 'Kathleen',
    close: 'Happy to share more, when\'s a good time to connect?',
    rules: [
      'No corporate filler',
      'No em dashes',
      'Use one relevant proof point naturally',
      'Be specific, not generic',
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
    ],
  },
}

interface DraftInput {
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
    recommendation: string | null
    red_flags: string[]
  } | null
  proof_points: Array<{
    label: string
    metric: string
    client_context: string | null
  }>
  lead: {
    name: string | null
    email: string
    metadata: Record<string, unknown>
  } | null
}

function buildPrompt(input: DraftInput, draftType: string): string {
  const rules = VOICE_RULES[draftType as keyof typeof VOICE_RULES] || VOICE_RULES.cover_letter

  const parts = [
    `You are writing a ${draftType.replace(/_/g, ' ')} for Volt Studios, a women-led digital marketing agency with 11 years in business.`,
    '',
    `## Opportunity`,
    `Title: ${input.title}`,
    input.company_name ? `Company: ${input.company_name}` : '',
    input.description ? `Description:\n${input.description.slice(0, 2000)}` : '',
    input.source ? `Source: ${input.source}` : '',
    input.budget_min || input.budget_max ? `Budget: $${input.budget_min?.toLocaleString() || '?'} – $${input.budget_max?.toLocaleString() || '?'}` : '',
    '',
    input.score ? `## Score: ${input.score.total_score}/100` : '',
    input.score?.recommendation ? `Recommendation: ${input.score.recommendation}` : '',
    input.score?.red_flags?.length ? `Red flags: ${input.score.red_flags.join('; ')}` : '',
    '',
    '## Available Proof Points',
    ...input.proof_points.map((pp) => `- ${pp.label}: ${pp.metric}${pp.client_context ? ` (${pp.client_context})` : ''}`),
    '',
    input.lead ? `## Lead Context\nName: ${input.lead.name || 'Unknown'}\nEmail: ${input.lead.email}` : '',
    '',
    `## Voice Rules`,
    `Max words: ${rules.maxWords}`,
    rules.noSalutation ? 'No salutation (start directly with content)' : 'Include appropriate greeting',
    `Open with: ${rules.openWith}`,
    `Sign: ${rules.signOff}`,
    `Close with: ${rules.close}`,
    ...rules.rules.map((r) => `- ${r}`),
    '',
    'Generate the draft. Be specific and natural. Do not use generic agency language.',
  ].filter(Boolean)

  return parts.join('\n')
}

// Mock generator for when no AI provider is configured
function generateMockDraft(input: DraftInput, draftType: string): string {
  const rules = VOICE_RULES[draftType as keyof typeof VOICE_RULES] || VOICE_RULES.cover_letter
  const bestProof = input.proof_points[0]

  if (draftType === 'cover_letter') {
    const lines = [
      `I noticed your post about ${input.title.toLowerCase().includes('need') ? input.title.toLowerCase().replace('need ', '') : input.title}.`,
      '',
      bestProof
        ? `We recently helped ${bestProof.client_context || 'a client'} achieve ${bestProof.metric.toLowerCase()}.`
        : 'We have deep experience in this area.',
      '',
      input.score?.problem_fit && input.score.problem_fit >= 15
        ? 'This is exactly the kind of work we do best.'
        : 'We\'d love to learn more about your specific needs.',
      '',
      rules.close,
      '',
      `— ${rules.signOff}`,
    ]
    return lines.join('\n')
  }

  if (draftType === 'proposal_email') {
    const lines = [
      `Hi,`,
      '',
      `Following up on ${input.source === 'upwork' ? 'your Upwork post' : 'our conversation'} about ${input.title}.`,
      '',
      bestProof
        ? `To give you a sense of what we deliver: ${bestProof.metric} for ${bestProof.client_context || 'a recent client'}.`
        : 'We have a strong track record in this area.',
      '',
      'Here\'s how we\'d approach this:',
      '1. Discovery call to understand your specific goals',
      '2. Strategy and scope proposal within 48 hours',
      '3. Execution with weekly progress updates',
      '',
      rules.close,
      '',
      `Best,\n${rules.signOff}`,
    ]
    return lines.join('\n')
  }

  // qwilr_letter
  const lines = [
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
    `## Next Steps`,
    '',
    'Let\'s schedule a 30-minute discovery call to discuss your goals and how we can help.',
    '',
    rules.close,
    '',
    `— ${rules.signOff}`,
  ]
  return lines.join('\n')
}

export async function POST(req: NextRequest) {
  try {
    const workspaceId = await getActiveWorkspaceId()
    if (!workspaceId) {
      return NextResponse.json({ error: 'No active workspace' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = generateDraftsSchema.parse(body)

    const supabase = await createSupabaseServerClient()

    // Fetch opportunity
    const { data: opportunity, error: oppError } = await supabase
      .from('opportunities')
      .select()
      .eq('id', parsed.opportunity_id)
      .eq('workspace_id', workspaceId)
      .single()

    if (oppError || !opportunity) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 })
    }

    // Fetch score
    const { data: scoreData } = await supabase
      .from('opportunity_scores')
      .select()
      .eq('opportunity_id', parsed.opportunity_id)
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // Fetch active proof points
    const { data: proofPoints } = await supabase
      .from('proof_points')
      .select('label, metric, client_context')
      .eq('workspace_id', workspaceId)
      .eq('active', true)
      .limit(10)

    // Fetch linked lead
    let lead = null
    if (opportunity.lead_id) {
      const { data: leadData } = await supabase
        .from('leads')
        .select('name, email, metadata')
        .eq('id', opportunity.lead_id)
        .eq('workspace_id', workspaceId)
        .single()
      lead = leadData
    }

    const draftInput: DraftInput = {
      title: opportunity.title,
      description: opportunity.description,
      company_name: opportunity.company_name,
      source: opportunity.source,
      budget_min: opportunity.budget_min,
      budget_max: opportunity.budget_max,
      score: scoreData ? {
        total_score: scoreData.total_score,
        icp_fit: scoreData.icp_fit,
        problem_fit: scoreData.problem_fit,
        recommendation: scoreData.recommendation,
        red_flags: scoreData.red_flags,
      } : null,
      proof_points: proofPoints || [],
      lead: lead ? {
        name: lead.name,
        email: lead.email,
        metadata: lead.metadata as Record<string, unknown>,
      } : null,
    }

    // Generate drafts for each requested type
    const generatedDrafts: Array<{
      draft_type: string
      variant_name: string
      angle: string
      body: string
      prompt: string
    }> = []

    for (const draftType of parsed.draft_types) {
      const prompt = buildPrompt(draftInput, draftType)
      const body = generateMockDraft(draftInput, draftType)

      // Find the best matching proof point for this draft
      const bestProof = proof_points_match(draftInput, draftType)

      generatedDrafts.push({
        draft_type: draftType,
        variant_name: `${draftType.replace(/_/g, ' ')} — ${bestProof?.label || 'auto'}`,
        angle: bestProof ? `Lead with ${bestProof.label}` : 'General approach',
        body,
        prompt,
      })
    }

    // Store generated drafts
    const storedDrafts = []
    for (const draft of generatedDrafts) {
      const { data, error } = await supabase
        .from('proposal_drafts')
        .insert({
          workspace_id: workspaceId,
          opportunity_id: parsed.opportunity_id,
          draft_type: draft.draft_type,
          variant_name: draft.variant_name,
          angle: draft.angle,
          body: draft.body,
          selected: false,
        })
        .select()
        .single()

      if (!error && data) {
        storedDrafts.push(data)
      }
    }

    // Update opportunity status to drafting if currently intake or scored
    if (['intake', 'scored'].includes(opportunity.status)) {
      await supabase
        .from('opportunities')
        .update({ status: 'drafting', updated_at: new Date().toISOString() })
        .eq('id', parsed.opportunity_id)
        .eq('workspace_id', workspaceId)
    }

    return NextResponse.json({
      ok: true,
      drafts: storedDrafts,
      count: storedDrafts.length,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function proof_points_match(input: DraftInput, _draftType: string): { label: string; metric: string } | null {
  if (!input.proof_points.length) return null
  // Simple heuristic: pick first proof point (in production, match by problem_type)
  return input.proof_points[0]
}
