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
  type: 'ad' | 'email' | 'social' | 'blog' | 'video' | 'landing_page'
  title: string
  content: string | null
  status: 'draft' | 'review' | 'approved' | 'published' | 'archived'
  generated_by: 'ai' | 'human' | 'hybrid'
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
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
