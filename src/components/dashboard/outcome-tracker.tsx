'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TrendingUp, TrendingDown, Phone, Mail, FileText, CheckCircle, XCircle } from 'lucide-react'

interface OutcomeTrackerProps {
  opportunityId: string
  currentStatus: string
}

const OUTCOME_OPTIONS = [
  { value: 'replied', label: 'Replied', icon: Mail, color: 'text-blue-600' },
  { value: 'call_booked', label: 'Call Booked', icon: Phone, color: 'text-purple-600' },
  { value: 'proposal_sent', label: 'Proposal Sent', icon: FileText, color: 'text-orange-600' },
  { value: 'won', label: 'Won', icon: CheckCircle, color: 'text-green-600' },
  { value: 'lost', label: 'Lost', icon: XCircle, color: 'text-red-600' },
]

export function OutcomeTracker({ opportunityId, currentStatus }: OutcomeTrackerProps) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [outcomeType, setOutcomeType] = useState('replied')
  const [value, setValue] = useState('')
  const [lossReason, setLossReason] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setLoading(true)
    try {
      const res = await fetch('/api/proposals/outcomes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunity_id: opportunityId,
          outcome_type: outcomeType,
          value: value ? parseFloat(value) : null,
          loss_reason: lossReason || null,
          notes: notes || null,
        }),
      })
      if (!res.ok) throw new Error('Failed to record outcome')
      setShowForm(false)
      setValue('')
      setLossReason('')
      setNotes('')
      router.refresh()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Terminal states don't need outcome tracking
  if (currentStatus === 'won' || currentStatus === 'lost' || currentStatus === 'skipped') {
    return (
      <div className="rounded-lg border p-6">
        <h2 className="font-semibold mb-2">Outcome</h2>
        <div className={`flex items-center gap-2 text-sm font-medium ${
          currentStatus === 'won' ? 'text-green-600' :
          currentStatus === 'lost' ? 'text-red-600' : 'text-muted-foreground'
        }`}>
          {currentStatus === 'won' && <TrendingUp className="h-4 w-4" />}
          {currentStatus === 'lost' && <TrendingDown className="h-4 w-4" />}
          {currentStatus === 'skipped' && <XCircle className="h-4 w-4" />}
          {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">Record Outcome</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-xs text-primary hover:text-primary/80"
          >
            Log Outcome
          </button>
        )}
      </div>

      {showForm ? (
        <div className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            {OUTCOME_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setOutcomeType(opt.value)}
                className={`flex flex-col items-center gap-1 rounded-lg border p-2.5 text-xs transition-colors ${
                  outcomeType === opt.value
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'hover:bg-muted'
                }`}
              >
                <opt.icon className={`h-4 w-4 ${outcomeType === opt.value ? '' : opt.color}`} />
                {opt.label}
              </button>
            ))}
          </div>

          {(outcomeType === 'won' || outcomeType === 'proposal_sent') && (
            <div>
              <label className="block text-xs font-medium mb-1">Value ($)</label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Contract value or MRR"
                className="w-full rounded border px-2 py-1.5 text-sm"
              />
            </div>
          )}

          {outcomeType === 'lost' && (
            <div>
              <label className="block text-xs font-medium mb-1">Loss Reason</label>
              <select
                value={lossReason}
                onChange={(e) => setLossReason(e.target.value)}
                className="w-full rounded border px-2 py-1.5 text-sm"
              >
                <option value="">Select reason...</option>
                <option value="price_too_high">Price too high</option>
                <option value="chose_competitor">Chose competitor</option>
                <option value="no_response">No response after follow-up</option>
                <option value="scope_mismatch">Scope mismatch</option>
                <option value="timing">Bad timing</option>
                <option value="budget_cut">Budget cut</option>
                <option value="other">Other</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full rounded border px-2 py-1.5 text-sm resize-y"
              placeholder="Additional context..."
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="rounded bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Record Outcome'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="rounded border px-3 py-1.5 text-sm hover:bg-muted"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Track whether this opportunity produced a real business result.
        </p>
      )}
    </div>
  )
}
