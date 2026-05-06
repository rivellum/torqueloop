// GET /api/me — authenticated user info for smoke tests / health checks
// Returns user id + workspace ids. No secrets.
import { NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    const supabase = await createSupabaseServerClient()
    const { data: memberships } = await supabase
      .from('team_members')
      .select('workspace_id, role, workspaces(name, slug)')
      .eq('user_id', user.id)

    return NextResponse.json({
      authenticated: true,
      user_id: user.id,
      email: user.email,
      workspaces: (memberships || []).map((m) => ({
        id: m.workspace_id,
        role: m.role,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        name: (m.workspaces as any)?.name || null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        slug: (m.workspaces as any)?.slug || null,
      })),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
