// PATCH /api/proposals/drafts/[id] — update or select a draft
import { NextRequest, NextResponse } from 'next/server'
import { getActiveWorkspaceId } from '@/lib/workspace-server'
import { updateDraft, selectDraft } from '@/lib/proposals/data'
import { updateDraftSchema } from '@/lib/proposals/schemas'

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

    // Handle select action separately
    if (body._action === 'select') {
      await selectDraft(id, body.opportunity_id, workspaceId)
      return NextResponse.json({ ok: true })
    }

    const parsed = updateDraftSchema.parse({ ...body, id })
    const draft = await updateDraft(parsed)
    return NextResponse.json(draft)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
