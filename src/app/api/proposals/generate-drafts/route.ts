// POST /api/proposals/generate-drafts — AI-assisted draft generation
// Generates 3 draft variants based on opportunity context
// Uses real AI provider (Claude/OpenAI) when available; falls back to mock for tests/local.
// Does NOT auto-send or auto-approve anything.
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getActiveWorkspaceId } from '@/lib/workspace-server'
import { generateDraft, hasAIProvider } from '@/lib/proposals/ai-provider'
import {
  buildPrompt,
  generateMockDraft,
  selectProofPoint,
  type DraftInput,
} from '@/lib/proposals/prompts'
import { z } from 'zod'

const generateDraftsSchema = z.object({
  opportunity_id: z.string().uuid(),
  draft_types: z
    .array(z.enum(['cover_letter', 'proposal_email', 'qwilr_letter']))
    .default(['cover_letter', 'proposal_email', 'qwilr_letter']),
})

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
      .select('label, metric, client_context, problem_type, best_fit')
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

    // Fetch channel info if linked
    let channelName: string | null = null
    if (opportunity.channel_id) {
      const { data: channelData } = await supabase
        .from('channels')
        .select('name')
        .eq('id', opportunity.channel_id)
        .single()
      channelName = channelData?.name || null
    }

    const draftInput: DraftInput = {
      title: opportunity.title,
      description: opportunity.description,
      company_name: opportunity.company_name,
      source: opportunity.source,
      budget_min: opportunity.budget_min,
      budget_max: opportunity.budget_max,
      score: scoreData
        ? {
            total_score: scoreData.total_score,
            icp_fit: scoreData.icp_fit,
            problem_fit: scoreData.problem_fit,
            budget_fit: scoreData.budget_fit,
            proof_match: scoreData.proof_match,
            urgency: scoreData.urgency,
            recommendation: scoreData.recommendation,
            red_flags: scoreData.red_flags,
          }
        : null,
      proof_points: proofPoints || [],
      lead: lead
        ? {
            name: lead.name,
            email: lead.email,
            metadata: lead.metadata as Record<string, unknown>,
          }
        : null,
      channel: channelName,
    }

    const useAI = hasAIProvider()
    const errors: string[] = []

    // Generate drafts for each requested type
    const generatedDrafts: Array<{
      draft_type: string
      variant_name: string
      angle: string
      body: string
      provider: string
    }> = []

    for (const draftType of parsed.draft_types) {
      const prompt = buildPrompt(draftInput, draftType)
      const bestProof = selectProofPoint(draftInput, draftType)

      let body: string
      let provider: string

      if (useAI) {
        try {
          const result = await generateDraft({
            prompt,
            maxTokens: 1024,
            timeoutMs: 30000,
          })
          body = result.text
          provider = result.provider
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : 'Unknown AI error'
          errors.push(`${draftType}: ${errMsg}`)
          // Fallback to mock on provider failure
          body = generateMockDraft(draftInput, draftType)
          provider = 'mock-fallback'
        }
      } else {
        body = generateMockDraft(draftInput, draftType)
        provider = 'mock'
      }

      generatedDrafts.push({
        draft_type: draftType,
        variant_name: `${draftType.replace(/_/g, ' ')} — ${bestProof?.label || 'auto'}`,
        angle: bestProof ? `Lead with ${bestProof.label}` : 'General approach',
        body,
        provider,
      })
    }

    // Store generated drafts — NEVER auto-approve (selected: false)
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
          selected: false, // NEVER auto-approve
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
      provider: useAI ? 'ai' : 'mock',
      errors: errors.length ? errors : undefined,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
