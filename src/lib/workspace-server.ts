import { cookies } from 'next/headers'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { Workspace } from '@/types/database'

const ACTIVE_WORKSPACE_COOKIE = 'torqueloop-active-workspace'

export async function getActiveWorkspaceId(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(ACTIVE_WORKSPACE_COOKIE)?.value ?? null
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
