// GET /api/health/auth — smoke-test helper
// Returns authenticated user id + workspace ids. No secrets.
import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({
        authenticated: false,
        error: authError?.message || 'No session',
      }, { status: 401 })
    }

    // Get workspace memberships
    const { data: memberships } = await supabase
      .from('team_members')
      .select('workspace_id, role')
      .eq('user_id', user.id)

    return NextResponse.json({
      authenticated: true,
      user_id: user.id,
      email: user.email,
      workspaces: (memberships ?? []).map((m: { workspace_id: string; role: string }) => ({
        id: m.workspace_id,
        role: m.role,
      })),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
