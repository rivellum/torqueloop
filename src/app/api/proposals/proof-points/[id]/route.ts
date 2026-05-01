// PATCH /api/proposals/proof-points/[id] — update a proof point
import { NextRequest, NextResponse } from 'next/server'
import { getActiveWorkspaceId } from '@/lib/workspace-server'
import { updateProofPoint } from '@/lib/proposals/data'
import { updateProofPointSchema } from '@/lib/proposals/schemas'

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
    const parsed = updateProofPointSchema.parse({ ...body, id, workspace_id: workspaceId })
    const proofPoint = await updateProofPoint(parsed)
    return NextResponse.json(proofPoint)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
