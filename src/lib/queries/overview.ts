import type { SupabaseClient } from '@supabase/supabase-js'

export interface OverviewMetrics {
  totalSpend: number
  totalLeads: number
  cpa: number
  activeCreatives: number
  pendingApprovals: number
}

export interface RecentActivity {
  id: string
  name: string | null
  email: string
  source: string | null
  status: string
  created_at: string
}

export async function getOverviewMetrics(
  supabase: SupabaseClient,
  workspaceId: string
): Promise<OverviewMetrics> {
  const [spendRes, leadsRes, creativesRes, approvalsRes] = await Promise.all([
    // Total spend from performance records
    supabase
      .from('performance')
      .select('spend')
      .eq('workspace_id', workspaceId),
    // Total leads count
    supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId),
    // Active creatives (approved or published)
    supabase
      .from('creatives')
      .select('*', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId)
      .in('status', ['approved', 'published']),
    // Pending approvals
    supabase
      .from('approval_queue')
      .select('*', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId)
      .eq('status', 'pending'),
  ])

  const totalSpend = (spendRes.data ?? []).reduce(
    (sum: number, row: { spend: number }) => sum + (row.spend ?? 0),
    0
  )
  const totalLeads = leadsRes.count ?? 0
  const cpa = totalLeads > 0 ? totalSpend / totalLeads : 0
  const activeCreatives = creativesRes.count ?? 0
  const pendingApprovals = approvalsRes.count ?? 0

  return { totalSpend, totalLeads, cpa, activeCreatives, pendingApprovals }
}

export async function getRecentActivity(
  supabase: SupabaseClient,
  workspaceId: string,
  limit = 5
): Promise<RecentActivity[]> {
  const { data, error } = await supabase
    .from('leads')
    .select('id, name, email, source, status, created_at')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching recent activity:', error.message)
    return []
  }

  return (data ?? []) as RecentActivity[]
}

export interface PendingCreative {
  id: string
  title: string
  type: string
  created_at: string
}

export async function getPendingCreatives(
  supabase: SupabaseClient,
  workspaceId: string,
  limit = 3
): Promise<PendingCreative[]> {
  const { data, error } = await supabase
    .from('approval_queue')
    .select('id, created_at, creatives(id, title, type)')
    .eq('workspace_id', workspaceId)
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(limit)

  if (error) {
    console.error('Error fetching pending creatives:', error.message)
    return []
  }

  return (data ?? []).map((item: Record<string, unknown>) => {
    const creative = item.creatives as Record<string, unknown> | null
    return {
      id: (item.id as string) ?? (creative?.id as string) ?? '',
      title: (creative?.title as string) ?? 'Untitled',
      type: (creative?.type as string) ?? 'unknown',
      created_at: item.created_at as string,
    }
  })
}
