// POST /api/proposals/from-lead — create an opportunity from an existing lead
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getActiveWorkspaceId } from '@/lib/workspace-server'
import { createOpportunity } from '@/lib/proposals/data'
import { z } from 'zod'

const fromLeadSchema = z.object({
  lead_id: z.string().uuid(),
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(10000).optional(),
  budget_min: z.number().min(0).optional(),
  budget_max: z.number().min(0).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const workspaceId = await getActiveWorkspaceId()
    if (!workspaceId) {
      return NextResponse.json({ error: 'No active workspace' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = fromLeadSchema.parse(body)

    // Fetch the lead to confirm it exists and belongs to this workspace
    const supabase = await createSupabaseServerClient()
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('id, name, email, source, workspace_id, metadata')
      .eq('id', parsed.lead_id)
      .eq('workspace_id', workspaceId)
      .single()

    if (leadError || !lead) {
      return NextResponse.json({ error: 'Lead not found in this workspace' }, { status: 404 })
    }

    // Create opportunity from lead context
    const leadData = lead as { name: string | null; email: string; source: string | null }
    const opportunity = await createOpportunity({
      workspace_id: workspaceId,
      lead_id: parsed.lead_id,
      title: parsed.title || `Opportunity from lead: ${leadData.name || leadData.email}`,
      description: parsed.description || undefined,
      source: leadData.source || undefined,
      budget_min: parsed.budget_min ?? undefined,
      budget_max: parsed.budget_max ?? undefined,
      currency: 'USD',
    })

    return NextResponse.json(opportunity, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
