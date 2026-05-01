import { redirect } from 'next/navigation'
import { getActiveWorkspaceId } from '@/lib/workspace-server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { TrendingUp, TrendingDown, Target, DollarSign, BarChart3 } from 'lucide-react'

interface OutcomeRow {
  id: string
  opportunity_id: string
  outcome_type: string
  value: number | null
  currency: string
  loss_reason: string | null
  notes: string | null
  created_at: string
  opportunities: {
    title: string
    company_name: string | null
    source: string | null
  } | null
}

export default async function OutcomesPage() {
  const workspaceId = await getActiveWorkspaceId()
  if (!workspaceId) redirect('/dashboard')

  const supabase = await createSupabaseServerClient()

  const { data: outcomes } = await supabase
    .from('proposal_outcomes')
    .select(`
      *,
      opportunities!inner(title, company_name, source)
    `)
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })

  const outcomeList = (outcomes ?? []) as unknown as OutcomeRow[]

  // Aggregate stats
  const totalSent = outcomeList.filter((o) => o.outcome_type !== 'lost').length
  const totalWon = outcomeList.filter((o) => o.outcome_type === 'won').length
  const totalLost = outcomeList.filter((o) => o.outcome_type === 'lost').length
  const totalReplied = outcomeList.filter((o) => o.outcome_type === 'replied' || o.outcome_type === 'call_booked' || o.outcome_type === 'proposal_sent' || o.outcome_type === 'won').length
  const totalCalls = outcomeList.filter((o) => o.outcome_type === 'call_booked' || o.outcome_type === 'proposal_sent' || o.outcome_type === 'won').length
  const totalRevenue = outcomeList
    .filter((o) => o.outcome_type === 'won' && o.value)
    .reduce((sum, o) => sum + (o.value ?? 0), 0)

  const winRate = totalSent > 0 ? Math.round((totalWon / (totalWon + totalLost)) * 100) : 0
  const responseRate = totalSent > 0 ? Math.round((totalReplied / totalSent) * 100) : 0

  const typeLabels: Record<string, string> = {
    replied: 'Replied',
    call_booked: 'Call Booked',
    proposal_sent: 'Proposal Sent',
    won: 'Won',
    lost: 'Lost',
  }

  const typeColors: Record<string, string> = {
    replied: 'bg-blue-100 text-blue-800',
    call_booked: 'bg-purple-100 text-purple-800',
    proposal_sent: 'bg-orange-100 text-orange-800',
    won: 'bg-green-100 text-green-800',
    lost: 'bg-red-100 text-red-800',
  }

  const lossReasonLabels: Record<string, string> = {
    price_too_high: 'Price too high',
    chose_competitor: 'Chose competitor',
    no_response: 'No response',
    scope_mismatch: 'Scope mismatch',
    timing: 'Bad timing',
    budget_cut: 'Budget cut',
    other: 'Other',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          Outcomes
        </h1>
        <p className="text-muted-foreground">
          Track real business results from proposals. The closed loop.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Target className="h-4 w-4" />
            Response Rate
          </div>
          <div className="text-2xl font-bold">{responseRate}%</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <TrendingUp className="h-4 w-4" />
            Win Rate
          </div>
          <div className="text-2xl font-bold">{winRate}%</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <DollarSign className="h-4 w-4" />
            Revenue Won
          </div>
          <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <TrendingDown className="h-4 w-4" />
            Won / Lost
          </div>
          <div className="text-2xl font-bold">{totalWon} / {totalLost}</div>
        </div>
      </div>

      {/* Outcomes list */}
      {outcomeList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Target className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground text-lg font-medium">No outcomes yet</p>
          <p className="text-muted-foreground text-sm mt-1">
            Record outcomes from opportunity detail pages to close the loop.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-4 py-3 font-medium">Opportunity</th>
                <th className="px-4 py-3 font-medium">Outcome</th>
                <th className="px-4 py-3 font-medium">Value</th>
                <th className="px-4 py-3 font-medium">Loss Reason</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {outcomeList.map((outcome) => (
                <tr key={outcome.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/proposals/${outcome.opportunity_id}`}
                      className="font-medium hover:underline"
                    >
                      {outcome.opportunities?.title || 'Unknown'}
                    </Link>
                    {outcome.opportunities?.company_name && (
                      <span className="text-muted-foreground ml-2">
                        {outcome.opportunities.company_name}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${typeColors[outcome.outcome_type] || 'bg-gray-100'}`}>
                      {typeLabels[outcome.outcome_type] || outcome.outcome_type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {outcome.value ? (
                      <span className="font-medium">${outcome.value.toLocaleString()} {outcome.currency}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {outcome.loss_reason ? (lossReasonLabels[outcome.loss_reason] || outcome.loss_reason) : '—'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(outcome.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
