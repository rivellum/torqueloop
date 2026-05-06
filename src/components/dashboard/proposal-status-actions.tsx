'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, CheckCircle2, Loader2 } from 'lucide-react'
import type { OpportunityStatus } from '@/types/proposals'
import { getStatusLabel } from '@/types/proposals'

interface ProposalStatusActionsProps {
  opportunityId: string
  status: OpportunityStatus
  draftCount: number
  hasSelectedDraft: boolean
  hasApprovedStrategyLock: boolean
  hasApprovedSendGate: boolean
}

interface ActionConfig {
  targetStatus: OpportunityStatus
  label: string
  description: string
  disabledReason?: string
}

function getPrimaryAction(props: ProposalStatusActionsProps): ActionConfig | null {
  const {
    status,
    draftCount,
    hasSelectedDraft,
    hasApprovedStrategyLock,
    hasApprovedSendGate,
  } = props

  switch (status) {
    case 'drafting':
      return {
        targetStatus: 'human_review',
        label: 'Send to human review',
        description: 'Move this opportunity into review once drafts are ready.',
        disabledReason: draftCount === 0 ? 'Create or generate at least one draft first.' : undefined,
      }
    case 'human_review':
      return {
        targetStatus: 'ready_to_send',
        label: 'Mark ready to send',
        description: 'Unlock this after the Strategy Lock review is approved.',
        disabledReason: hasApprovedStrategyLock ? undefined : 'Approve the Strategy Lock review first.',
      }
    case 'ready_to_send': {
      const blockers: string[] = []
      if (!hasSelectedDraft) blockers.push('select a draft')
      if (!hasApprovedSendGate) blockers.push('approve the Send Gate review')
      return {
        targetStatus: 'sent',
        label: 'Mark as sent',
        description: 'Use after the selected proposal or letter is sent externally.',
        disabledReason: blockers.length > 0 ? `Before sending: ${blockers.join(' and ')}.` : undefined,
      }
    }
    default:
      return null
  }
}

export function ProposalStatusActions(props: ProposalStatusActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const action = getPrimaryAction(props)

  async function updateStatus(targetStatus: OpportunityStatus) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/proposals/opportunities/${props.opportunityId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetStatus }),
      })
      const payload = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(payload?.error || 'Could not update proposal status')
      }
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update proposal status')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-lg border p-6 space-y-3">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-primary" />
        <h3 className="font-semibold">Workflow Next Step</h3>
      </div>

      <div className="text-sm text-muted-foreground">
        Current status: <span className="font-medium text-foreground">{getStatusLabel(props.status)}</span>
      </div>

      {action ? (
        <>
          <p className="text-sm text-muted-foreground">{action.description}</p>
          {action.disabledReason && (
            <p className="rounded-md bg-yellow-50 p-2 text-xs text-yellow-800">
              {action.disabledReason}
            </p>
          )}
          {error && (
            <p className="rounded-md bg-destructive/10 p-2 text-xs text-destructive">
              {error}
            </p>
          )}
          <button
            type="button"
            onClick={() => updateStatus(action.targetStatus)}
            disabled={loading || !!action.disabledReason}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            {loading ? 'Updating...' : action.label}
          </button>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          No manual advancement is needed from this status. Use the outcome tracker below for replies, calls, wins, and losses.
        </p>
      )}
    </div>
  )
}
