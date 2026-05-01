// POST /api/proposals/link-lead — link a lead to an existing opportunity
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getActiveWorkspaceId } from '@/lib/workspace-server'
import { updateOpportunity } from '@/lib/proposals/data'
import { z } from 'zod'

const linkLeadSchema = z.object({
  opportunity_id: z.string().uuid(),
  lead_id: z.string().uuid(),
})

export async function POST(req: NextRequest) {
  try {
    const workspaceId = await getActiveWorkspaceId()
    if (!workspaceId) {
      return NextResponse.json({ error: 'No active workspace' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = linkLeadSchema.parse(body)

    // Verify lead belongs to this workspace
    const supabase = await createSupabaseServerClient()
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('id')
      .eq('id', parsed.lead_id)
      .eq('workspace_id', workspaceId)
      .single()

    if (leadError || !lead) {
      return NextResponse.json({ error: 'Lead not found in this workspace' }, { status: 404 })
    }

    // Update opportunity with lead_id
    const opportunity = await updateOpportunity({
      id: parsed.opportunity_id,
      workspace_id: workspaceId,
      lead_id: parsed.lead_id,
    })

    return NextResponse.json(opportunity)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
