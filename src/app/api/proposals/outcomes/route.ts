// POST /api/proposals/outcomes — record an outcome for an opportunity
// GET — list outcomes for a workspace (for the outcomes view)
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getActiveWorkspaceId } from '@/lib/workspace-server'
import { z } from 'zod'

const createOutcomeSchema = z.object({
  opportunity_id: z.string().uuid(),
  outcome_type: z.enum(['replied', 'call_booked', 'proposal_sent', 'won', 'lost']),
  value: z.number().nullable().optional(),
  currency: z.string().length(3).default('USD'),
  loss_reason: z.string().max(1000).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
})

export async function GET(req: NextRequest) {
  try {
    const workspaceId = await getActiveWorkspaceId()
    if (!workspaceId) {
      return NextResponse.json({ error: 'No active workspace' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const opportunityId = searchParams.get('opportunity_id')

    const supabase = await createSupabaseServerClient()
    let query = supabase
      .from('proposal_outcomes')
      .select(`
        *,
        opportunities!inner(title, company_name, source)
      `)
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })

    if (opportunityId) {
      query = query.eq('opportunity_id', opportunityId)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data ?? [])
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const workspaceId = await getActiveWorkspaceId()
    if (!workspaceId) {
      return NextResponse.json({ error: 'No active workspace' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = createOutcomeSchema.parse(body)

    const supabase = await createSupabaseServerClient()

    // Insert outcome
    const { data: outcome, error: outcomeError } = await supabase
      .from('proposal_outcomes')
      .insert({ ...parsed, workspace_id: workspaceId })
      .select()
      .single()

    if (outcomeError) {
      return NextResponse.json({ error: outcomeError.message }, { status: 500 })
    }

    // Update opportunity status to match outcome
    const statusMap: Record<string, string> = {
      replied: 'replied',
      call_booked: 'call_booked',
      proposal_sent: 'proposal_sent',
      won: 'won',
      lost: 'lost',
    }

    const newStatus = statusMap[parsed.outcome_type]
    if (newStatus) {
      await supabase
        .from('opportunities')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', parsed.opportunity_id)
        .eq('workspace_id', workspaceId)
    }

    return NextResponse.json(outcome, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
