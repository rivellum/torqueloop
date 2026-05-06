// POST /api/proposals/drafts — create or list drafts for an opportunity
import { NextRequest, NextResponse } from 'next/server'
import { getActiveWorkspaceId } from '@/lib/workspace-server'
import { createDraft, listDrafts } from '@/lib/proposals/data'
import { createDraftSchema } from '@/lib/proposals/schemas'

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

    const drafts = await listDrafts(opportunityId, workspaceId)
    return NextResponse.json(drafts)
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
    const parsed = createDraftSchema.parse({ ...body, workspace_id: workspaceId })

    const draft = await createDraft(parsed)
    return NextResponse.json(draft, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
