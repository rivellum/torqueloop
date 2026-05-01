// PATCH /api/proposals/opportunities/[id] — update with transition enforcement
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getActiveWorkspaceId } from '@/lib/workspace-server'
import { updateOpportunitySchema } from '@/lib/proposals/schemas'
import { validateStatusTransition } from '@/lib/proposals/transitions'
import type { OpportunityStatus } from '@/types/proposals'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const workspaceId = await getActiveWorkspaceId()
    if (!workspaceId) {
      return NextResponse.json({ error: 'No active workspace' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const parsed = updateOpportunitySchema.parse({ ...body, id })

    const supabase = await createSupabaseServerClient()

    // If status is being changed, enforce transition rules
    if (parsed.status) {
      // Fetch current opportunity
      const { data: current, error: fetchError } = await supabase
        .from('opportunities')
        .select('status')
        .eq('id', id)
        .eq('workspace_id', workspaceId)
        .single()

      if (fetchError || !current) {
        return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 })
      }

      const currentStatus = current.status as OpportunityStatus
      const targetStatus = parsed.status as OpportunityStatus

      // Only check gates if status is actually changing
      if (currentStatus !== targetStatus) {
        // Fetch review statuses for this opportunity
        const { data: reviews } = await supabase
          .from('proposal_reviews')
          .select('review_type, status')
          .eq('opportunity_id', id)
          .eq('workspace_id', workspaceId)

        const reviewMap = new Map(reviews?.map((r) => [r.review_type, r.status]) ?? [])
        const hasApprovedStrategyLock = reviewMap.get('proposal_strategy_lock') === 'approved'
        const hasApprovedSendGate = reviewMap.get('proposal_send_gate') === 'approved'

        // Check for selected draft
        const { count: selectedDraftCount } = await supabase
          .from('proposal_drafts')
          .select('*', { count: 'exact', head: true })
          .eq('opportunity_id', id)
          .eq('workspace_id', workspaceId)
          .eq('selected', true)

        const hasSelectedDraft = (selectedDraftCount ?? 0) > 0

        // Validate the transition
        const result = validateStatusTransition({
          currentStatus,
          targetStatus,
          hasApprovedStrategyLock,
          hasApprovedSendGate,
          hasSelectedDraft,
        })

        if (!result.allowed) {
          return NextResponse.json(
            { error: result.error, code: 'TRANSITION_BLOCKED' },
            { status: 422 }
          )
        }
      }
    }

    // Proceed with update
    const { id: _id, ...updates } = parsed
    const { data, error } = await supabase
      .from('opportunities')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('workspace_id', workspaceId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
