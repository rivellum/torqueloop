import { redirect, notFound } from 'next/navigation'
import { getActiveWorkspaceId } from '@/lib/workspace-server'
import { getOpportunity, getLatestScore, listDrafts } from '@/lib/proposals/data'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getScoreBand, getScoreBandLabel, getStatusLabel } from '@/types/proposals'
import Link from 'next/link'
import { ArrowLeft, Briefcase, ExternalLink } from 'lucide-react'
import { DraftsPanel } from '@/components/dashboard/drafts-panel'
import { ReviewPanel } from '@/components/dashboard/review-panel'
import { OutcomeTracker } from '@/components/dashboard/outcome-tracker'
import { LeadContext } from '@/components/dashboard/lead-context'
import { ProposalStatusActions } from '@/components/dashboard/proposal-status-actions'

export default async function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const workspaceId = await getActiveWorkspaceId()
  if (!workspaceId) redirect('/dashboard')

  const { id } = await params
  const opportunity = await getOpportunity(id, workspaceId)
  if (!opportunity) notFound()

  const [score, drafts, reviewsData] = await Promise.all([
    getLatestScore(id, workspaceId),
    listDrafts(id, workspaceId),
    // Fetch proposal reviews
    (async () => {
      const supabase = await createSupabaseServerClient()
      const { data } = await supabase
        .from('proposal_reviews')
        .select()
        .eq('opportunity_id', id)
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false })
      return data ?? []
    })(),
  ])
  const reviews = reviewsData as { id: string; review_type: string; status: string; comments: string | null; checks: Record<string, boolean>; created_at: string }[]
  const hasSelectedDraft = drafts.some((draft) => draft.selected)
  const hasApprovedStrategyLock = reviews.some((review) => review.review_type === 'proposal_strategy_lock' && review.status === 'approved')
  const hasApprovedSendGate = reviews.some((review) => review.review_type === 'proposal_send_gate' && review.status === 'approved')

  const band = score ? getScoreBand(score.total_score) : null
  const bandColors: Record<string, string> = {
    bid_now: 'bg-green-100 text-green-800',
    review: 'bg-blue-100 text-blue-800',
    consider: 'bg-yellow-100 text-yellow-800',
    skip: 'bg-red-100 text-red-800',
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/proposals"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Briefcase className="h-6 w-6" />
            {opportunity.title}
          </h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
            {opportunity.company_name && <span>{opportunity.company_name}</span>}
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-muted">
              {getStatusLabel(opportunity.status)}
            </span>
            {opportunity.external_url && (
              <a href={opportunity.external_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-foreground">
                <ExternalLink className="h-3 w-3" /> Source
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Description */}
          {opportunity.description && (
            <div className="rounded-lg border p-6">
              <h2 className="font-semibold mb-3">Description</h2>
              <div className="text-sm whitespace-pre-wrap text-muted-foreground">
                {opportunity.description}
              </div>
            </div>
          )}

          {/* Score breakdown */}
          {score && (
            <div className="rounded-lg border p-6">
              <h2 className="font-semibold mb-3">Score Breakdown</h2>
              <div className="space-y-2 text-sm">
                {[
                  { label: 'ICP Fit', value: score.icp_fit, max: 20 },
                  { label: 'Problem Fit', value: score.problem_fit, max: 20 },
                  { label: 'Budget Fit', value: score.budget_fit, max: 15 },
                  { label: 'Proof Match', value: score.proof_match, max: 15 },
                  { label: 'Urgency', value: score.urgency, max: 10 },
                  { label: 'Authority', value: score.authority_signal, max: 10 },
                  { label: 'Edge', value: score.competition_edge, max: 10 },
                ].map((cat) => (
                  <div key={cat.label} className="flex items-center justify-between">
                    <span className="text-muted-foreground">{cat.label}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${(cat.value / cat.max) * 100}%` }}
                        />
                      </div>
                      <span className="font-medium w-10 text-right">{cat.value}/{cat.max}</span>
                    </div>
                  </div>
                ))}
              </div>
              {score.red_flags.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-medium text-red-700 mb-2">Red Flags</p>
                  <ul className="text-sm text-red-600 space-y-1">
                    {score.red_flags.map((flag: string, i: number) => (
                      <li key={i}>⚠ {flag}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Drafts */}
          <DraftsPanel opportunityId={opportunity.id} initialDrafts={drafts} opportunityStatus={opportunity.status} />

          <ProposalStatusActions
            opportunityId={opportunity.id}
            status={opportunity.status}
            draftCount={drafts.length}
            hasSelectedDraft={hasSelectedDraft}
            hasApprovedStrategyLock={hasApprovedStrategyLock}
            hasApprovedSendGate={hasApprovedSendGate}
          />

          {/* Human Review */}
          <ReviewPanel
            opportunityId={opportunity.id}
            score={score?.total_score ?? 0}
            initialReviews={reviews}
          />

          {/* Outcome */}
          <OutcomeTracker
            opportunityId={opportunity.id}
            currentStatus={opportunity.status}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Score card */}
          <div className="rounded-lg border p-6 text-center">
            {score ? (
              <>
                <div className="text-4xl font-bold">{score.total_score}</div>
                {band && (
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium mt-2 ${bandColors[band]}`}>
                    {getScoreBandLabel(band)}
                  </span>
                )}
                {score.recommendation && (
                  <p className="text-sm text-muted-foreground mt-3">{score.recommendation}</p>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Not scored yet</p>
            )}
          </div>

          {/* Details */}
          <LeadContext
            opportunityId={opportunity.id}
            workspaceId={workspaceId}
            currentLeadId={opportunity.lead_id}
          />

          <div className="rounded-lg border p-6 space-y-3 text-sm">
            <h3 className="font-semibold">Details</h3>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Source</span>
              <span>{opportunity.source || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Budget</span>
              <span>
                {opportunity.budget_min || opportunity.budget_max
                  ? `${opportunity.budget_min ? `$${opportunity.budget_min.toLocaleString()}` : ''}${opportunity.budget_min && opportunity.budget_max ? ' – ' : ''}${opportunity.budget_max ? `$${opportunity.budget_max.toLocaleString()}` : ''}`
                  : '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Currency</span>
              <span>{opportunity.currency}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created</span>
              <span>{new Date(opportunity.created_at).toLocaleDateString()}</span>
            </div>
            {opportunity.deadline_at && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Deadline</span>
                <span>{new Date(opportunity.deadline_at).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
