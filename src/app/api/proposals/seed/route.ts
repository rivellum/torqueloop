// POST /api/proposals/seed — seed proof points for all workspaces
// Idempotent: uses upsert with unique constraint on (workspace_id, label)
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { SEED_PROOF_POINTS } from '@/lib/proposals/seed'

export async function POST(_req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()

    // Fetch all workspaces
    const { data: workspaces, error: wsError } = await supabase
      .from('workspaces')
      .select('id')

    if (wsError) {
      return NextResponse.json({ error: wsError.message }, { status: 500 })
    }

    if (!workspaces?.length) {
      return NextResponse.json({ error: 'No workspaces found' }, { status: 404 })
    }

    const results: { workspace: string; seeded: number; skipped: number }[] = []

    for (const ws of workspaces) {
      let seeded = 0
      let skipped = 0

      for (const pp of SEED_PROOF_POINTS) {
        const { error } = await supabase
          .from('proof_points')
          .upsert(
            { ...pp, workspace_id: ws.id },
            { onConflict: 'workspace_id,label', ignoreDuplicates: true }
          )

        if (error) {
          // If upsert fails (e.g. no unique constraint yet), try insert and skip on conflict
          const { error: insertError } = await supabase
            .from('proof_points')
            .insert({ ...pp, workspace_id: ws.id })

          if (insertError?.code === '23505') {
            skipped++ // unique violation = already exists
          } else if (insertError) {
            console.error(`Failed to seed proof point "${pp.label}" for workspace ${ws.id}:`, insertError.message)
            skipped++
          } else {
            seeded++
          }
        } else {
          seeded++
        }
      }

      results.push({ workspace: ws.id, seeded, skipped })
    }

    return NextResponse.json({ ok: true, results })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
