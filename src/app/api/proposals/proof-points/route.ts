// POST /api/proposals/proof-points — create a proof point
// GET — list proof points for workspace
import { NextRequest, NextResponse } from 'next/server'
import { getActiveWorkspaceId } from '@/lib/workspace-server'
import { createProofPoint, listProofPoints } from '@/lib/proposals/data'
import { createProofPointSchema } from '@/lib/proposals/schemas'

export async function GET(req: NextRequest) {
  try {
    const workspaceId = await getActiveWorkspaceId()
    if (!workspaceId) {
      return NextResponse.json({ error: 'No active workspace' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const active = searchParams.get('active')
    const problemType = searchParams.get('problem_type') ?? undefined
    const serviceCategory = searchParams.get('service_category') ?? undefined

    const proofPoints = await listProofPoints(workspaceId, {
      active: active !== null ? active === 'true' : undefined,
      problem_type: problemType,
      service_category: serviceCategory,
    })

    return NextResponse.json(proofPoints)
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
    const parsed = createProofPointSchema.parse({ ...body, workspace_id: workspaceId })

    const proofPoint = await createProofPoint(parsed)
    return NextResponse.json(proofPoint, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
