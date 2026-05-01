// GET /api/proposals/proof-points — list proof points with pagination
// POST /api/proposals/proof-points — create a proof point
import { NextRequest, NextResponse } from 'next/server'
import { getActiveWorkspaceId } from '@/lib/workspace-server'
import { listProofPoints, createProofPoint } from '@/lib/proposals/data'
import { listProofPointsSchema, createProofPointSchema } from '@/lib/proposals/schemas'

export async function GET(req: NextRequest) {
  try {
    const workspaceId = await getActiveWorkspaceId()
    if (!workspaceId) {
      return NextResponse.json({ error: 'No active workspace' }, { status: 401 })
    }

    const url = new URL(req.url)
    const input = listProofPointsSchema.parse({
      workspace_id: workspaceId,
      active: url.searchParams.get('active') !== null
        ? url.searchParams.get('active') === 'true'
        : undefined,
      problem_type: url.searchParams.get('problem_type') || undefined,
      service_category: url.searchParams.get('service_category') || undefined,
      limit: url.searchParams.get('limit') ? Number(url.searchParams.get('limit')) : 50,
      offset: url.searchParams.get('offset') ? Number(url.searchParams.get('offset')) : 0,
    })

    const result = await listProofPoints(input)
    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const workspaceId = await getActiveWorkspaceId()
    if (!workspaceId) {
      return NextResponse.json({ error: 'No active workspace' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = createProofPointSchema.parse({ ...body, workspace_id: workspaceId })
    const proofPoint = await createProofPoint(parsed)
    return NextResponse.json(proofPoint, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
