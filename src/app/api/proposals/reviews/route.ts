// POST /api/proposals/review — create approval queue records for proposals
// GET — list reviews for an opportunity
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getActiveWorkspaceId } from '@/lib/workspace-server'
import { z } from 'zod'

const createReviewSchema = z.object({
  opportunity_id: z.string().uuid(),
  review_type: z.enum(['proposal_strategy_lock', 'proposal_send_gate']),
  status: z.enum(['pending', 'approved', 'rejected', 'revision_requested']).default('pending'),
  reviewer_id: z.string().uuid().optional().nullable(),
  comments: z.string().max(5000).optional().nullable(),
  checks: z.record(z.string(), z.boolean()).optional(),
})

export async function GET(req: NextRequest) {
  try {
    const workspaceId = await getActiveWorkspaceId()
    if (!workspaceId) {
      return NextResponse.json({ error: 'No active workspace' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const opportunityId = searchParams.get('opportunity_id')
    if (!opportunityId) {
      return NextResponse.json({ error: 'opportunity_id required' }, { status: 400 })
    }

    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
      .from('proposal_reviews')
      .select()
      .eq('opportunity_id', opportunityId)
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })

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
    const parsed = createReviewSchema.parse(body)

    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
      .from('proposal_reviews')
      .insert({ ...parsed, workspace_id: workspaceId })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
