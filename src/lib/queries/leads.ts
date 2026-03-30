import type { SupabaseClient } from '@supabase/supabase-js'
import type { Lead } from '@/types/database'

export type LeadStatus = Lead['status']

export interface LeadsFilters {
  status?: LeadStatus | 'all'
  search?: string
}

export async function getLeads(
  supabase: SupabaseClient,
  workspaceId: string,
  filters?: LeadsFilters
): Promise<Lead[]> {
  let query = supabase
    .from('leads')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  if (filters?.search) {
    const term = filters.search.trim()
    if (term.length > 0) {
      query = query.or(`name.ilike.%${term}%,email.ilike.%${term}%`)
    }
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching leads:', error.message)
    return []
  }

  return (data ?? []) as Lead[]
}

export async function getLeadCount(
  supabase: SupabaseClient,
  workspaceId: string
): Promise<number> {
  const { count, error } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('workspace_id', workspaceId)

  if (error) {
    console.error('Error counting leads:', error.message)
    return 0
  }

  return count ?? 0
}
