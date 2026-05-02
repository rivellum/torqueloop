// POST /api/proposals/generate — generate draft variants for an opportunity
// Never auto-sends. All drafts require human review.
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getActiveWorkspaceId } from '@/lib/workspace-server'
import { getOpportunity, getLatestScore, listProofPoints, createDraft, listDrafts } from '@/lib/proposals/data'
import { generateDrafts, type GenerateDraftType } from '@/lib/proposals/draft-generator'
import { z } from 'zod'

const generateSchema = z.object({
  opportunity_id: z.string().uuid(),
  draft_type: z.enum(['cover_letter', 'proposal_email', 'qwilr_letter']),
  budget_info: z.string().max(500).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const workspaceId = await getActiveWorkspaceId()
    if (!workspaceId) {
      return NextResponse.json({ error: 'No active workspace' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = generateSchema.parse(body)

    // Fetch opportunity, score, proof points, and linked lead in parallel
    const [opportunity, score, proofPoints, existingDrafts] = await Promise.all([
      getOpportunity(parsed.opportunity_id, workspaceId),
      getLatestScore(parsed.opportunity_id, workspaceId),
      listProofPoints(workspaceId, { active: true }),
      listDrafts(parsed.opportunity_id, workspaceId),
    ])

    if (!opportunity) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 })
    }

    // Fetch linked lead context if available
    let leadContext = null
    if (opportunity.lead_id) {
      const supabase = await createSupabaseServerClient()
      const { data: lead } = await supabase
        .from('leads')
        .select('name, email, source_channel, status, metadata')
        .eq('id', opportunity.lead_id)
        .eq('workspace_id', workspaceId)
        .single()

      if (lead) {
        const l = lead as { name: string | null; email: string | null; source_channel: string | null; status: string | null; metadata: Record<string, unknown> }
        leadContext = {
          name: l.name,
          email: l.email,
          source: l.source_channel,
          status: l.status,
          metadata: l.metadata || {},
        }
      }
    }

    // Generate drafts (AI or mock depending on env)
    const generated = await generateDrafts({
      opportunity,
      score,
      proofPoints: proofPoints,
      draftType: parsed.draft_type as GenerateDraftType,
      leadContext,
      budgetInfo: parsed.budget_info,
    })

    // Persist drafts to database
    const saved = []
    for (const draft of generated) {
      const result = await createDraft({
        workspace_id: workspaceId,
        opportunity_id: parsed.opportunity_id,
        draft_type: draft.draft_type,
        variant_name: draft.variant_name,
        angle: draft.angle,
        body: draft.body,
        selected: false,
      })
      saved.push(result)
    }

    // Update opportunity status to drafting if currently scored
    if (opportunity.status === 'scored') {
      const supabase = await createSupabaseServerClient()
      await supabase
        .from('opportunities')
        .update({ status: 'drafting', updated_at: new Date().toISOString() })
        .eq('id', opportunity.id)
        .eq('workspace_id', workspaceId)
    }

    const usingAI = process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_API_KEY.startsWith('your_') && process.env.ANTHROPIC_API_KEY.length >= 20

    return NextResponse.json({
      drafts: saved,
      count: saved.length,
      provider: usingAI ? 'anthropic' : 'mock',
      message: `Generated ${saved.length} draft variants${usingAI ? ' via AI' : ' (mock mode — set ANTHROPIC_API_KEY for real generation)'}. Review and select one before proceeding.`,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
