// Proposal Factory — typed Supabase data access helpers
// All queries are workspace-scoped for RLS. Server-side only.
import { createSupabaseServerClient } from '@/lib/supabase-server'
import type {
  Opportunity,
  OpportunityScore,
  ProposalDraft,
  ProofPoint,
  ProposalPackage,
  OpportunityStatus,
} from '@/types/proposals'
import { getScoreBand, validateStatusTransition } from '@/types/proposals'
import {
  createOpportunitySchema,
  updateOpportunitySchema,
  createScoreSchema,
  createDraftSchema,
  updateDraftSchema,
  createProofPointSchema,
  createPackageSchema,
  updatePackageSchema,
  listOpportunitiesSchema,
} from './schemas'
import type { z } from 'zod'

// ─── Helpers ────────────────────────────────────────────────────────────────

function computeTotalScore(
  score: Omit<OpportunityScore, 'id' | 'workspace_id' | 'opportunity_id' | 'total_score' | 'recommendation' | 'model_version' | 'created_at'>
): number {
  return (
    score.icp_fit +
    score.problem_fit +
    score.budget_fit +
    score.proof_match +
    score.urgency +
    score.authority_signal +
    score.competition_edge
  )
}

// ─── Opportunities ──────────────────────────────────────────────────────────

export async function createOpportunity(
  input: z.infer<typeof createOpportunitySchema>
): Promise<Opportunity> {
  const parsed = createOpportunitySchema.parse(input)
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('opportunities')
    .insert(parsed)
    .select()
    .single()

  if (error) throw new Error(`Failed to create opportunity: ${error.message}`)
  return data as Opportunity
}

export async function getOpportunity(
  id: string,
  workspaceId: string
): Promise<Opportunity | null> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('opportunities')
    .select()
    .eq('id', id)
    .eq('workspace_id', workspaceId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // not found
    throw new Error(`Failed to fetch opportunity: ${error.message}`)
  }
  return data as Opportunity
}

export async function listOpportunities(
  input: z.infer<typeof listOpportunitiesSchema>
): Promise<{ opportunities: Opportunity[]; total: number }> {
  const parsed = listOpportunitiesSchema.parse(input)
  const supabase = await createSupabaseServerClient()

  let query = supabase
    .from('opportunities')
    .select('*', { count: 'exact' })
    .eq('workspace_id', parsed.workspace_id)
    .order('created_at', { ascending: false })
    .range(parsed.offset, parsed.offset + parsed.limit - 1)

  if (parsed.status?.length) {
    query = query.in('status', parsed.status)
  }
  if (parsed.source) {
    query = query.eq('source', parsed.source)
  }
  if (parsed.channel_id) {
    query = query.eq('channel_id', parsed.channel_id)
  }

  const { data, error, count } = await query

  if (error) throw new Error(`Failed to list opportunities: ${error.message}`)

  return {
    opportunities: (data ?? []) as Opportunity[],
    total: count ?? 0,
  }
}

export async function updateOpportunity(
  input: z.infer<typeof updateOpportunitySchema>
): Promise<Opportunity> {
  const { id, ...updates } = updateOpportunitySchema.parse(input)
  const supabase = await createSupabaseServerClient()

  // ── Status transition guard ──────────────────────────────────────────────
  if (updates.status) {
    // Fetch current record to get existing status
    const { data: current, error: fetchError } = await supabase
      .from('opportunities')
      .select('status')
      .eq('id', id)
      .eq('workspace_id', updates.workspace_id!)
      .single()

    if (fetchError) throw new Error(`Failed to fetch opportunity: ${fetchError.message}`)

    const currentStatus = (current as { status: OpportunityStatus }).status
    const nextStatus = updates.status as OpportunityStatus

    // If the status is actually changing, validate the transition
    if (currentStatus !== nextStatus) {
      // For send-gated and ready-gated transitions, pull gate context
      if (nextStatus === 'sent' || nextStatus === 'ready_to_send') {
        const [draftsRes, reviewsRes, packageRes] = await Promise.all([
          supabase
            .from('proposal_drafts')
            .select('id')
            .eq('opportunity_id', id)
            .eq('workspace_id', updates.workspace_id!)
            .eq('selected', true)
            .limit(1)
            .maybeSingle(),
          supabase
            .from('proposal_reviews')
            .select('review_type, status')
            .eq('opportunity_id', id)
            .eq('workspace_id', updates.workspace_id!),
          supabase
            .from('proposal_packages')
            .select('package_status')
            .eq('opportunity_id', id)
            .eq('workspace_id', updates.workspace_id!)
            .maybeSingle(),
        ])

        const reviews = (reviewsRes.data ?? []) as { review_type: string; status: string }[]
        const pkg = packageRes.data as { package_status: string } | null

        const hasSelectedDraft = draftsRes.data !== null
        const hasApprovedSendGate = reviews.some(
          (r) => r.review_type === 'proposal_send_gate' && r.status === 'approved'
        )
        const hasApprovedStrategyLock = reviews.some(
          (r) => r.review_type === 'proposal_strategy_lock' && r.status === 'approved'
        )
        const packageReady = pkg?.package_status === 'ready'

        validateStatusTransition(currentStatus, nextStatus, {
          hasSelectedDraft,
          // For ready_to_send: require strategy_lock. For sent: require send_gate.
          hasApprovedSendGate: nextStatus === 'ready_to_send'
            ? hasApprovedStrategyLock
            : hasApprovedSendGate,
          packageReady,
        })
      } else {
        validateStatusTransition(currentStatus, nextStatus)
      }
    }
  }

  const { data, error } = await supabase
    .from('opportunities')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('workspace_id', updates.workspace_id!)
    .select()
    .single()

  if (error) throw new Error(`Failed to update opportunity: ${error.message}`)
  return data as Opportunity
}

// ─── Scores ─────────────────────────────────────────────────────────────────

export async function createScore(
  input: z.infer<typeof createScoreSchema>
): Promise<OpportunityScore> {
  const parsed = createScoreSchema.parse(input)
  const total = computeTotalScore(parsed)

  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('opportunity_scores')
    .insert({ ...parsed, total_score: total })
    .select()
    .single()

  if (error) throw new Error(`Failed to create score: ${error.message}`)
  return data as OpportunityScore
}

export async function getLatestScore(
  opportunityId: string,
  workspaceId: string
): Promise<OpportunityScore | null> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('opportunity_scores')
    .select()
    .eq('opportunity_id', opportunityId)
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`Failed to fetch score: ${error.message}`)
  }
  return data as OpportunityScore
}

// ─── Drafts ─────────────────────────────────────────────────────────────────

export async function createDraft(
  input: z.infer<typeof createDraftSchema>
): Promise<ProposalDraft> {
  const parsed = createDraftSchema.parse(input)
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('proposal_drafts')
    .insert(parsed)
    .select()
    .single()

  if (error) throw new Error(`Failed to create draft: ${error.message}`)
  return data as ProposalDraft
}

export async function listDrafts(
  opportunityId: string,
  workspaceId: string
): Promise<ProposalDraft[]> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('proposal_drafts')
    .select()
    .eq('opportunity_id', opportunityId)
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Failed to list drafts: ${error.message}`)
  return (data ?? []) as ProposalDraft[]
}

export async function updateDraft(
  input: z.infer<typeof updateDraftSchema>
): Promise<ProposalDraft> {
  const { id, ...updates } = updateDraftSchema.parse(input)
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('proposal_drafts')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(`Failed to update draft: ${error.message}`)
  return data as ProposalDraft
}

export async function selectDraft(
  draftId: string,
  opportunityId: string,
  workspaceId: string
): Promise<void> {
  const supabase = await createSupabaseServerClient()

  // Deselect all drafts for this opportunity
  await supabase
    .from('proposal_drafts')
    .update({ selected: false })
    .eq('opportunity_id', opportunityId)
    .eq('workspace_id', workspaceId)

  // Select the chosen one
  const { error } = await supabase
    .from('proposal_drafts')
    .update({ selected: true })
    .eq('id', draftId)
    .eq('workspace_id', workspaceId)

  if (error) throw new Error(`Failed to select draft: ${error.message}`)
}

// ─── Proof Points ───────────────────────────────────────────────────────────

export async function listProofPoints(
  workspaceId: string,
  opts?: { active?: boolean; problem_type?: string; service_category?: string }
): Promise<ProofPoint[]> {
  const supabase = await createSupabaseServerClient()

  let query = supabase
    .from('proof_points')
    .select()
    .eq('workspace_id', workspaceId)
    .order('label')

  if (opts?.active !== undefined) {
    query = query.eq('active', opts.active)
  }
  if (opts?.problem_type) {
    query = query.eq('problem_type', opts.problem_type)
  }
  if (opts?.service_category) {
    query = query.eq('service_category', opts.service_category)
  }

  const { data, error } = await query

  if (error) throw new Error(`Failed to list proof points: ${error.message}`)
  return (data ?? []) as ProofPoint[]
}

export async function createProofPoint(
  input: z.infer<typeof createProofPointSchema>
): Promise<ProofPoint> {
  const parsed = createProofPointSchema.parse(input)
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('proof_points')
    .insert(parsed)
    .select()
    .single()

  if (error) throw new Error(`Failed to create proof point: ${error.message}`)
  return data as ProofPoint
}

// ─── Packages ───────────────────────────────────────────────────────────────

export async function createPackage(
  input: z.infer<typeof createPackageSchema>
): Promise<ProposalPackage> {
  const parsed = createPackageSchema.parse(input)
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('proposal_packages')
    .insert(parsed)
    .select()
    .single()

  if (error) throw new Error(`Failed to create package: ${error.message}`)
  return data as ProposalPackage
}

export async function getPackage(
  opportunityId: string,
  workspaceId: string
): Promise<ProposalPackage | null> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('proposal_packages')
    .select()
    .eq('opportunity_id', opportunityId)
    .eq('workspace_id', workspaceId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`Failed to fetch package: ${error.message}`)
  }
  return data as ProposalPackage
}

export async function updatePackage(
  input: z.infer<typeof updatePackageSchema>
): Promise<ProposalPackage> {
  const { id, ...updates } = updatePackageSchema.parse(input)
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('proposal_packages')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(`Failed to update package: ${error.message}`)
  return data as ProposalPackage
}
