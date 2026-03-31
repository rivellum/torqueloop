import { cookies } from 'next/headers'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { Workspace } from '@/types/database'

const ACTIVE_WORKSPACE_COOKIE = 'torqueloop-active-workspace'

export async function getActiveWorkspaceId(): Promise<string | null> {
  const cookieStore = await cookies()
  const fromCookie = cookieStore.get(ACTIVE_WORKSPACE_COOKIE)?.value

  if (fromCookie) return fromCookie

  // Fallback: get user's first workspace from team_members
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: membership } = await supabase
    .from('team_members')
    .select('workspace_id')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (membership?.workspace_id) {
    // Set the cookie for future requests
    try {
      cookieStore.set(ACTIVE_WORKSPACE_COOKIE, membership.workspace_id, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax',
      })
    } catch {
      // Can't set cookies in some server component contexts
    }
    return membership.workspace_id
  }

  return null
}

export async function getActiveWorkspace(): Promise<Workspace | null> {
  const workspaceId = await getActiveWorkspaceId()
  if (!workspaceId) return null

  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from('workspaces')
    .select('*')
    .eq('id', workspaceId)
    .single()

  return data ?? null
}
