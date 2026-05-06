'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Briefcase, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

interface ScoreResult {
  total_score: number
  icp_fit: number
  problem_fit: number
  budget_fit: number
  proof_match: number
  urgency: number
  authority_signal: number
  competition_edge: number
  red_flags: string[]
  recommendation: string
  band: string
}

export default function NewOpportunityPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [scoring, setScoring] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [score, setScore] = useState<ScoreResult | null>(null)

  // Form state
  const [title, setTitle] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [description, setDescription] = useState('')
  const [source, setSource] = useState('upwork')
  const [externalUrl, setExternalUrl] = useState('')
  const [budgetMin, setBudgetMin] = useState('')
  const [budgetMax, setBudgetMax] = useState('')
  const [currency, setCurrency] = useState('USD')

  async function handleScore() {
    if (!title.trim() || !description.trim()) {
      setError('Title and description are required for scoring')
      return
    }

    setScoring(true)
    setError(null)

    try {
      const res = await fetch('/api/proposals/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          company_name: companyName,
          description,
          budget_min: budgetMin ? parseFloat(budgetMin) : null,
          budget_max: budgetMax ? parseFloat(budgetMax) : null,
          source,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to score opportunity')
      }

      const data = await res.json()
      setScore(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scoring failed')
    } finally {
      setScoring(false)
    }
  }

  async function handleSave() {
    if (!title.trim()) {
      setError('Title is required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/proposals/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          company_name: companyName || null,
          description: description || null,
          source: source || null,
          external_url: externalUrl || null,
          budget_min: budgetMin ? parseFloat(budgetMin) : null,
          budget_max: budgetMax ? parseFloat(budgetMax) : null,
          currency,
          status: score ? 'scored' : 'intake',
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create opportunity')
      }

      const data = await res.json()
      router.push(`/dashboard/proposals/${data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setLoading(false)
    }
  }

  const bandColors: Record<string, string> = {
    bid_now: 'bg-green-100 text-green-800 border-green-300',
    review: 'bg-blue-100 text-blue-800 border-blue-300',
    consider: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    skip: 'bg-red-100 text-red-800 border-red-300',
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
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Briefcase className="h-6 w-6" />
            New Opportunity
          </h1>
          <p className="text-muted-foreground">
            Paste an opportunity and score it before investing human time.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-lg border p-6 space-y-4">
            <h2 className="font-semibold">Opportunity Details</h2>

            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Need Google Ads management for SaaS startup"
                className="w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Client or company name"
                  className="w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Source</label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="upwork">Upwork</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="referral">Referral</option>
                  <option value="inbound">Inbound</option>
                  <option value="past_client">Past Client</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Description * <span className="text-muted-foreground">(paste the job post or opportunity details)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={10}
                placeholder="Paste the full job post, LinkedIn message, or opportunity description here..."
                className="w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-y"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">External URL</label>
              <input
                type="url"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                placeholder="https://www.upwork.com/jobs/..."
                className="w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Budget Min</label>
                <input
                  type="number"
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Budget Max</label>
                <input
                  type="number"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="USD">USD</option>
                  <option value="MXN">MXN</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleScore}
              disabled={scoring || !title.trim() || !description.trim()}
              className="inline-flex items-center gap-2 rounded-lg border border-primary bg-white px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {scoring ? 'Scoring...' : 'Score Opportunity'}
            </button>
            <button
              onClick={handleSave}
              disabled={loading || !title.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Opportunity'}
            </button>
          </div>
        </div>

        {/* Score panel */}
        <div className="space-y-4">
          <div className="rounded-lg border p-6 space-y-4">
            <h2 className="font-semibold">Score</h2>

            {score ? (
              <>
                <div className="text-center">
                  <div className="text-4xl font-bold">{score.total_score}</div>
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium mt-2 border ${bandColors[score.band] || 'bg-gray-100'}`}>
                    {score.band === 'bid_now' ? 'Bid Now' : score.band === 'review' ? 'Review' : score.band === 'consider' ? 'Consider' : 'Skip'}
                  </span>
                </div>

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
                        <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${(cat.value / cat.max) * 100}%` }}
                          />
                        </div>
                        <span className="font-medium w-8 text-right">{cat.value}/{cat.max}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {score.red_flags.length > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium text-red-700 mb-1">Red Flags</p>
                    <ul className="text-sm text-red-600 space-y-1">
                      {score.red_flags.map((flag, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
                          {flag}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {score.recommendation && (
                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium mb-1">Recommendation</p>
                    <p className="text-sm text-muted-foreground">{score.recommendation}</p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Fill in the title and description, then click &quot;Score Opportunity&quot; to see the breakdown.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
