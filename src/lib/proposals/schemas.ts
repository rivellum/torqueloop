// Zod schemas for Proposal Factory — validation for API routes and forms
import { z } from 'zod'

// ─── Enums ──────────────────────────────────────────────────────────────────

export const opportunityStatusSchema = z.enum([
  'intake', 'scored', 'drafting', 'human_review', 'ready_to_send',
  'sent', 'replied', 'call_booked', 'proposal_sent', 'won', 'lost', 'skipped',
])

export const draftTypeSchema = z.enum([
  'cover_letter', 'application_answer', 'qwilr_letter',
  'proposal_scope', 'proposal_email', 'follow_up',
])

export const approvalTypeSchema = z.enum([
  'proposal_strategy_lock', 'proposal_send_gate',
])

export const packageStatusSchema = z.enum([
  'drafting', 'ready', 'sent', 'follow_up_due', 'closed',
])

// ─── Opportunity ────────────────────────────────────────────────────────────

export const createOpportunitySchema = z.object({
  workspace_id: z.string().uuid(),
  lead_id: z.string().uuid().optional().nullable(),
  initiative_id: z.string().uuid().optional().nullable(),
  channel_id: z.string().uuid().optional().nullable(),
  source: z.string().max(100).optional().nullable(),
  external_url: z.string().url().optional().nullable().or(z.literal('')),
  title: z.string().min(1, 'Title is required').max(500),
  company_name: z.string().max(300).optional().nullable(),
  description: z.string().max(10000).optional().nullable(),
  budget_min: z.number().min(0).optional().nullable(),
  budget_max: z.number().min(0).optional().nullable(),
  currency: z.string().length(3).default('USD'),
  posted_at: z.string().datetime().optional().nullable(),
  deadline_at: z.string().datetime().optional().nullable(),
})

export const updateOpportunitySchema = createOpportunitySchema.partial().extend({
  id: z.string().uuid(),
  status: opportunityStatusSchema.optional(),
})

// ─── Opportunity Score ──────────────────────────────────────────────────────

export const scoreCategorySchema = z.number().min(0)

export const createScoreSchema = z.object({
  workspace_id: z.string().uuid(),
  opportunity_id: z.string().uuid(),
  icp_fit: scoreCategorySchema.max(20),
  problem_fit: scoreCategorySchema.max(20),
  budget_fit: scoreCategorySchema.max(15),
  proof_match: scoreCategorySchema.max(15),
  urgency: scoreCategorySchema.max(10),
  authority_signal: scoreCategorySchema.max(10),
  competition_edge: scoreCategorySchema.max(10),
  red_flags: z.array(z.string()).default([]),
  recommendation: z.string().max(500),
  model_version: z.string().max(50).default('v1'),
})

// Computed total — validated in the data layer
export const totalScoreSchema = z.number().min(0).max(100)

// ─── Proposal Draft ─────────────────────────────────────────────────────────

export const createDraftSchema = z.object({
  workspace_id: z.string().uuid(),
  opportunity_id: z.string().uuid(),
  draft_type: draftTypeSchema,
  variant_name: z.string().max(100).optional().nullable(),
  angle: z.string().max(500).optional().nullable(),
  body: z.string().min(1, 'Draft body is required').max(50000),
  score: z.number().min(0).max(100).optional().nullable(),
  selected: z.boolean().default(false),
  created_by: z.string().uuid().optional().nullable(),
})

export const updateDraftSchema = createDraftSchema.partial().extend({
  id: z.string().uuid(),
})

// ─── Proof Point ────────────────────────────────────────────────────────────

export const createProofPointSchema = z.object({
  workspace_id: z.string().uuid(),
  label: z.string().min(1).max(200),
  metric: z.string().min(1).max(500),
  client_context: z.string().max(500).optional().nullable(),
  problem_type: z.string().max(100).optional().nullable(),
  service_category: z.string().max(100).optional().nullable(),
  best_fit: z.string().max(500).optional().nullable(),
  do_not_use_when: z.string().max(500).optional().nullable(),
  source_note: z.string().max(500).optional().nullable(),
  active: z.boolean().default(true),
})

export const updateProofPointSchema = createProofPointSchema.partial().extend({
  id: z.string().uuid(),
})

export const listProofPointsSchema = z.object({
  workspace_id: z.string().uuid(),
  active: z.boolean().optional(),
  problem_type: z.string().optional(),
  service_category: z.string().optional(),
  limit: z.number().min(1).max(200).default(50),
  offset: z.number().min(0).default(0),
})

// ─── Proposal Package ───────────────────────────────────────────────────────

export const createPackageSchema = z.object({
  workspace_id: z.string().uuid(),
  opportunity_id: z.string().uuid(),
  selected_draft_id: z.string().uuid().optional().nullable(),
  package_status: packageStatusSchema.default('drafting'),
  price_recommendation: z.string().max(200).optional().nullable(),
  pricing_notes: z.string().max(2000).optional().nullable(),
  send_gate_status: z.enum(['pending', 'passed', 'blocked']).default('pending'),
  send_gate_checks: z.record(z.string(), z.boolean()).default({}),
})

export const updatePackageSchema = createPackageSchema.partial().extend({
  id: z.string().uuid(),
})

// ─── List / filter schemas ──────────────────────────────────────────────────

export const listOpportunitiesSchema = z.object({
  workspace_id: z.string().uuid(),
  status: z.array(opportunityStatusSchema).optional(),
  source: z.string().optional(),
  score_band: z.enum(['bid_now', 'review', 'consider', 'skip']).optional(),
  channel_id: z.string().uuid().optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
})
