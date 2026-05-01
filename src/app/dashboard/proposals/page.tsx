import { redirect } from 'next/navigation'
import { getActiveWorkspaceId } from '@/lib/workspace-server'
import { listOpportunities } from '@/lib/proposals/data'
import { getScoreBand, getScoreBandLabel, getStatusLabel } from '@/types/proposals'
import type { OpportunityStatus } from '@/types/proposals'
import Link from 'next/link'
import { Briefcase, Plus } from 'lucide-react'

const QUEUE_TABS: { label: string; statuses?: OpportunityStatus[] }[] = [
  { label: 'All' },
  { label: 'Intake', statuses: ['intake'] },
  { label: 'Scored', statuses: ['scored'] },
  { label: 'Drafting', statuses: ['drafting'] },
  { label: 'Human Review', statuses: ['human_review'] },
  { label: 'Ready', statuses: ['ready_to_send'] },
  { label: 'Sent', statuses: ['sent', 'replied', 'call_booked', 'proposal_sent'] },
  { label: 'Learning', statuses: ['won', 'lost'] },
]

export default async function ProposalsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; page?: string }>
}) {
  const workspaceId = await getActiveWorkspaceId()

  if (!workspaceId) {
    redirect('/dashboard')
  }

  const params = await searchParams
  const activeTab = params.tab || 'All'
  const currentPage = Math.max(1, parseInt(params.page || '1', 10))
  const pageSize = 25
  const tabConfig = QUEUE_TABS.find((t) => t.label === activeTab) ?? QUEUE_TABS[0]

  const { opportunities, total } = await listOpportunities({
    workspace_id: workspaceId,
    status: tabConfig.statuses,
    limit: pageSize,
    offset: (currentPage - 1) * pageSize,
  })

  const totalPages = Math.ceil(total / pageSize)
  const hasPrev = currentPage > 1
  const hasNext = currentPage < totalPages

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Briefcase className="h-6 w-6" />
            Proposal Factory
          </h1>
          <p className="text-muted-foreground">
            Score, draft, and track proposals through the full sales loop.
          </p>
        </div>
        <Link
          href="/dashboard/proposals/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Opportunity
        </Link>
      </div>

      {/* Queue tabs */}
      <div className="flex gap-1 overflow-x-auto border-b pb-px">
        {QUEUE_TABS.map((tab) => {
          const isActive = tab.label === activeTab
          return (
            <Link
              key={tab.label}
              href={`/dashboard/proposals?tab=${tab.label}`}
              className={`whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
              }`}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>

      {/* Table */}
      {opportunities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Briefcase className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground text-lg font-medium">No opportunities yet</p>
          <p className="text-muted-foreground text-sm mt-1">
            Create your first opportunity to start the proposal loop.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-4 py-3 font-medium">Score</th>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Source</th>
                <th className="px-4 py-3 font-medium">Budget</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {opportunities.map((opp) => (
                <tr key={opp.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-muted-foreground">—</span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/proposals/${opp.id}`}
                      className="font-medium text-foreground hover:underline"
                    >
                      {opp.title}
                    </Link>
                    {opp.company_name && (
                      <span className="text-muted-foreground ml-2">{opp.company_name}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {opp.source || '—'}
                  </td>
                  <td className="px-4 py-3">
                    {opp.budget_min || opp.budget_max ? (
                      <span>
                        {opp.budget_min ? `$${opp.budget_min.toLocaleString()}` : ''}
                        {opp.budget_min && opp.budget_max ? ' – ' : ''}
                        {opp.budget_max ? `$${opp.budget_max.toLocaleString()}` : ''}
                        {opp.currency !== 'USD' ? ` ${opp.currency}` : ''}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-muted">
                      {getStatusLabel(opp.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    —
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 text-sm text-muted-foreground border-t bg-muted/30 flex items-center justify-between">
            <span>{total} {total === 1 ? 'opportunity' : 'opportunities'}</span>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                {hasPrev ? (
                  <Link
                    href={`/dashboard/proposals?tab=${activeTab}&page=${currentPage - 1}`}
                    className="rounded border px-2 py-1 text-xs hover:bg-muted transition-colors"
                  >
                    ← Prev
                  </Link>
                ) : (
                  <span className="rounded border px-2 py-1 text-xs text-muted-foreground/40">← Prev</span>
                )}
                <span className="text-xs">Page {currentPage} of {totalPages}</span>
                {hasNext ? (
                  <Link
                    href={`/dashboard/proposals?tab=${activeTab}&page=${currentPage + 1}`}
                    className="rounded border px-2 py-1 text-xs hover:bg-muted transition-colors"
                  >
                    Next →
                  </Link>
                ) : (
                  <span className="rounded border px-2 py-1 text-xs text-muted-foreground/40">Next →</span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
