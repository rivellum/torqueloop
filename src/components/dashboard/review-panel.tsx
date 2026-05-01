'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, Clock, MessageSquare } from 'lucide-react'

interface Review {
  id: string
  review_type: string
  status: string
  comments: string | null
  checks: Record<string, boolean>
  created_at: string
}

interface ReviewPanelProps {
  opportunityId: string
  score: number
  initialReviews: Review[]
}

const STRATEGY_CHECKS = [
  { key: 'strongest_angle', label: 'Strongest angle identified' },
  { key: 'proof_point_correct', label: 'Correct proof point selected' },
  { key: 'price_posture', label: 'Price posture decided' },
  { key: 'what_not_to_say', label: 'What not to say noted' },
  { key: 'proceed_decision', label: 'Proceed / revise / skip decision made' },
]

const SEND_GATE_CHECKS = [
  { key: 'specificity', label: 'Specificity — no generic claims' },
  { key: 'voice_match', label: 'Kathleen/Volt voice correct' },
  { key: 'proof_relevant', label: 'Proof point is relevant' },
  { key: 'pricing_guardrails', label: 'Pricing within guardrails' },
  { key: 'no_overpromise', label: 'No overpromising' },
  { key: 'no_agency_filler', label: 'No generic agency language' },
  { key: 'clear_next_step', label: 'Clear next step for the buyer' },
]

export function ReviewPanel({ opportunityId, score, initialReviews }: ReviewPanelProps) {
  const router = useRouter()
  const [reviews, setReviews] = useState(initialReviews)
  const [showForm, setShowForm] = useState<string | null>(null)
  const [comments, setComments] = useState('')
  const [checks, setChecks] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(false)

  const needsStrategyLock = score >= 80
  const needsSendGate = score >= 80

  const strategyReview = reviews.find((r) => r.review_type === 'proposal_strategy_lock')
  const sendGateReview = reviews.find((r) => r.review_type === 'proposal_send_gate')

  function toggleCheck(key: string) {
    setChecks((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  async function handleSubmit(reviewType: string, action: 'approved' | 'rejected' | 'revision_requested') {
    setLoading(true)
    try {
      const res = await fetch('/api/proposals/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunity_id: opportunityId,
          review_type: reviewType,
          status: action,
          comments: comments || null,
          checks,
        }),
      })
      if (!res.ok) throw new Error('Failed to submit review')
      const review = await res.json()
      setReviews([review, ...reviews])
      setShowForm(null)
      setComments('')
      setChecks({})
      router.refresh()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const statusIcons: Record<string, React.ReactNode> = {
    approved: <CheckCircle className="h-4 w-4 text-green-600" />,
    rejected: <XCircle className="h-4 w-4 text-red-600" />,
    revision_requested: <MessageSquare className="h-4 w-4 text-yellow-600" />,
    pending: <Clock className="h-4 w-4 text-muted-foreground" />,
  }

  function ReviewCard({ type, label, review, checkList }: {
    type: string
    label: string
    review: Review | undefined
    checkList: { key: string; label: string }[]
  }) {
    const isShowing = showForm === type

    return (
      <div className="rounded-lg border p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {review ? statusIcons[review.status] : <Clock className="h-4 w-4 text-muted-foreground" />}
            <span className="font-medium text-sm">{label}</span>
            {review && (
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                review.status === 'approved' ? 'bg-green-100 text-green-800' :
                review.status === 'rejected' ? 'bg-red-100 text-red-800' :
                review.status === 'revision_requested' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {review.status === 'revision_requested' ? 'Revision Requested' : review.status.charAt(0).toUpperCase() + review.status.slice(1)}
              </span>
            )}
          </div>
          {!review && !isShowing && (
            <button
              onClick={() => setShowForm(type)}
              className="text-xs text-primary hover:text-primary/80"
            >
              Start Review
            </button>
          )}
        </div>

        {review?.comments && (
          <p className="text-sm text-muted-foreground mb-2">{review.comments}</p>
        )}

        {isShowing && (
          <div className="space-y-3 mt-3 pt-3 border-t">
            <div className="space-y-2">
              {checkList.map((item) => (
                <label key={item.key} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checks[item.key] || false}
                    onChange={() => toggleCheck(item.key)}
                    className="rounded border-gray-300"
                  />
                  {item.label}
                </label>
              ))}
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Comments</label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={3}
                className="w-full rounded border px-2 py-1.5 text-sm resize-y"
                placeholder="Notes, decisions, concerns..."
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleSubmit(type, 'approved')}
                disabled={loading}
                className="rounded bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700 disabled:opacity-50"
              >
                Approve
              </button>
              <button
                onClick={() => handleSubmit(type, 'revision_requested')}
                disabled={loading}
                className="rounded bg-yellow-600 px-3 py-1.5 text-sm text-white hover:bg-yellow-700 disabled:opacity-50"
              >
                Request Revision
              </button>
              <button
                onClick={() => handleSubmit(type, 'rejected')}
                disabled={loading}
                className="rounded bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700 disabled:opacity-50"
              >
                Reject
              </button>
              <button
                onClick={() => setShowForm(null)}
                className="rounded border px-3 py-1.5 text-sm hover:bg-muted"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-lg border p-6">
      <h2 className="font-semibold mb-4">Human Review</h2>

      {score < 80 && (
        <p className="text-sm text-muted-foreground mb-4">
          Score is below 80. Reviews are required for 80+ opportunities but you can still request one.
        </p>
      )}

      <div className="space-y-3">
        <ReviewCard
          type="proposal_strategy_lock"
          label="Strategy Lock"
          review={strategyReview}
          checkList={STRATEGY_CHECKS}
        />
        <ReviewCard
          type="proposal_send_gate"
          label="Send Gate"
          review={sendGateReview}
          checkList={SEND_GATE_CHECKS}
        />
      </div>
    </div>
  )
}
