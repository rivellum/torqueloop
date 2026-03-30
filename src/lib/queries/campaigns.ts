import type { SupabaseClient } from '@supabase/supabase-js'
import type { Initiative, Performance } from '@/types/database'

export interface CampaignWithMetrics extends Initiative {
  channels: string[]
  impressions: number
  clicks: number
  conversions: number
  spend: number
}

export interface LandingPageData {
  id: string
  name: string
  slug: string
  status: string
  visits: number
  conversions: number
  ab_test_status: string | null
  created_at: string
}

export async function getCampaigns(
  supabase: SupabaseClient,
  workspaceId: string
): Promise<CampaignWithMetrics[]> {
  // Fetch initiatives
  const { data: initiatives, error } = await supabase
    .from('initiatives')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching campaigns:', error.message)
    return []
  }

  if (!initiatives?.length) return []

  // Fetch all creatives for these initiatives to find channel + publication links
  const initiativeIds = initiatives.map((i) => i.id)
  const { data: creatives } = await supabase
    .from('creatives')
    .select('id, initiative_id, metadata')
    .in('initiative_id', initiativeIds)
    .eq('workspace_id', workspaceId)

  const creativeIds = creatives?.map((c) => c.id) ?? []

  // Fetch performance data for publications linked to these creatives
  let performances: Performance[] = []
  if (creativeIds.length > 0) {
    const { data: pubs } = await supabase
      .from('publications')
      .select('id, creative_id, channel')
      .in('creative_id', creativeIds)

    const pubIds = pubs?.map((p) => p.id) ?? []
    if (pubIds.length > 0) {
      const { data: perfData } = await supabase
        .from('performance')
        .select('*')
        .in('publication_id', pubIds)

      performances = (perfData ?? []) as Performance[]
    }
  }

  // Aggregate metrics per initiative
  return initiatives.map((initiative) => {
    const initCreativeIds =
      creatives
        ?.filter((c) => c.initiative_id === initiative.id)
        .map((c) => c.id) ?? []

    const channels = Array.from(
      new Set(
        initCreativeIds.flatMap((cid) => {
          const creative = creatives?.find((c) => c.id === cid)
          return creative?.metadata?.channels
            ? (creative.metadata.channels as string[])
            : initiative.channel
              ? [initiative.channel]
              : []
        })
      )
    )

    const impressions = performances.reduce(
      (sum, p) => sum + (p.impressions ?? 0),
      0
    )
    const clicks = performances.reduce((sum, p) => sum + (p.clicks ?? 0), 0)
    const conversions = performances.reduce(
      (sum, p) => sum + (p.conversions ?? 0),
      0
    )
    const spend = performances.reduce((sum, p) => sum + (p.spend ?? 0), 0)

    return {
      ...initiative,
      channels,
      impressions,
      clicks,
      conversions,
      spend,
    }
  })
}

export async function getCampaignPerformance(
  supabase: SupabaseClient,
  initiativeId: string
): Promise<Performance[]> {
  // Get creatives for this initiative
  const { data: creatives } = await supabase
    .from('creatives')
    .select('id')
    .eq('initiative_id', initiativeId)

  const creativeIds = creatives?.map((c) => c.id) ?? []
  if (creativeIds.length === 0) return []

  // Get publications for these creatives
  const { data: pubs } = await supabase
    .from('publications')
    .select('id')
    .in('creative_id', creativeIds)

  const pubIds = pubs?.map((p) => p.id) ?? []
  if (pubIds.length === 0) return []

  // Get performance data
  const { data, error } = await supabase
    .from('performance')
    .select('*')
    .in('publication_id', pubIds)
    .order('date', { ascending: false })

  if (error) {
    console.error('Error fetching performance:', error.message)
    return []
  }

  return (data ?? []) as Performance[]
}

export async function getLandingPages(
  supabase: SupabaseClient,
  workspaceId: string
): Promise<LandingPageData[]> {
  const { data, error } = await supabase
    .from('creatives')
    .select('id, title, status, metadata, created_at')
    .eq('workspace_id', workspaceId)
    .eq('type', 'landing_page')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching landing pages:', error.message)
    return []
  }

  if (!data?.length) return []

  return data.map((lp) => {
    const meta = (lp.metadata ?? {}) as Record<string, unknown>
    return {
      id: lp.id,
      name: lp.title,
      slug: (meta.slug as string) ?? lp.id,
      status: lp.status,
      visits: (meta.visits as number) ?? 0,
      conversions: (meta.conversions as number) ?? 0,
      ab_test_status: (meta.ab_test_status as string) ?? null,
      created_at: lp.created_at,
    }
  })
}
