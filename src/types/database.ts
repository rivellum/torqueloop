export interface Workspace {
  id: string
  name: string
  slug: string
  logo_url: string | null
  color: string | null
  owner_id: string
  created_at: string
  updated_at: string
}

export interface Creative {
  id: string
  workspace_id: string
  initiative_id: string | null
  type: string
  channel_format: string | null
  variant_label: string | null
  content: Record<string, unknown> | null
  status: string
  brand_alignment_score: number | null
  rejection_notes: string | null
  created_at: string
  updated_at: string
}

/** Helper to extract display title from creative content JSONB */
export function getCreativeTitle(creative: { content?: Record<string, unknown> | null; variant_label?: string | null }): string {
  return (creative.content?.name as string) || creative.variant_label || 'Sin título'
}

/** Helper to extract storage URL from creative content JSONB */
export function getCreativeStorageUrl(creative: Creative): string | null {
  return (creative.content?.storage_url as string) || null
}

/** Helper to extract thumbnail/mime from creative content JSONB */
export function getCreativeMimeType(creative: Creative): string | null {
  return (creative.content?.mime_type as string) || null
}

export interface Initiative {
  id: string
  workspace_id: string
  name: string
  description: string | null
  status: 'planning' | 'active' | 'paused' | 'completed' | 'cancelled'
  start_date: string | null
  end_date: string | null
  budget: number | null
  channel: string | null
  created_at: string
  updated_at: string
}

export interface Lead {
  id: string
  workspace_id: string
  email: string
  name: string | null
  phone: string | null
  source: string | null
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'
  score: number | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface ApprovalQueueItem {
  id: string
  workspace_id: string
  creative_id: string
  status: 'pending' | 'approved' | 'rejected' | 'revision_requested'
  reviewer_id: string | null
  comments: string | null
  created_at: string
  updated_at: string
}

export interface Publication {
  id: string
  workspace_id: string
  creative_id: string
  channel: string
  channel_id: string | null
  published_at: string
  url: string | null
  status: 'scheduled' | 'published' | 'failed' | 'removed'
  metadata: Record<string, unknown>
  created_at: string
}

export interface Performance {
  id: string
  publication_id: string
  workspace_id: string
  impressions: number
  clicks: number
  conversions: number
  spend: number
  revenue: number
  date: string
  metadata: Record<string, unknown>
  created_at: string
}

export interface TeamMember {
  id: string
  user_id: string
  workspace_id: string
  role: 'owner' | 'admin' | 'member' | 'viewer'
  email: string
  name: string | null
  avatar_url: string | null
  invited_at: string
  joined_at: string | null
  created_at: string
}

export interface QAScore {
  id: string
  workspace_id: string
  creative_id: string
  score: number
  criteria: Record<string, number>
  feedback: string | null
  reviewed_by: 'ai' | 'human'
  created_at: string
}
