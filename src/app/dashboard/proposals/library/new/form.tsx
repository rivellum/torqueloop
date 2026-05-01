'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const PROBLEM_TYPES = [
  'paid_advertising',
  'lead_generation',
  'organic_growth',
  'brand_positioning',
  'user_growth',
  'trust_credibility',
  'conversion_optimization',
  'retention',
]

const SERVICE_CATEGORIES = ['PPC', 'SEO', 'Branding', 'Growth', 'Content', 'Email', 'Social', 'General']

export function NewProofPointForm({ workspaceId }: { workspaceId: string }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const form = new FormData(e.currentTarget)
    const body = {
      workspace_id: workspaceId,
      label: form.get('label'),
      metric: form.get('metric'),
      client_context: form.get('client_context') || null,
      problem_type: form.get('problem_type') || null,
      service_category: form.get('service_category') || null,
      best_fit: form.get('best_fit') || null,
      do_not_use_when: form.get('do_not_use_when') || null,
      source_note: form.get('source_note') || null,
      active: true,
    }

    try {
      const res = await fetch('/api/proposals/proof-points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create proof point')
      }

      router.push('/dashboard/proposals/library')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="label" className="block text-sm font-medium mb-1.5">
            Label <span className="text-red-500">*</span>
          </label>
          <input
            id="label"
            name="label"
            required
            maxLength={200}
            placeholder="e.g. 29.5x ROAS — Slay the PE"
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label htmlFor="metric" className="block text-sm font-medium mb-1.5">
            Metric <span className="text-red-500">*</span>
          </label>
          <input
            id="metric"
            name="metric"
            required
            maxLength={500}
            placeholder="e.g. 29.5x return on ad spend"
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label htmlFor="client_context" className="block text-sm font-medium mb-1.5">
            Client / Context
          </label>
          <input
            id="client_context"
            name="client_context"
            maxLength={500}
            placeholder="e.g. Slay the PE — professional exam prep company"
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="problem_type" className="block text-sm font-medium mb-1.5">
              Problem Type
            </label>
            <select
              id="problem_type"
              name="problem_type"
              className="w-full rounded-lg border px-3 py-2 text-sm"
            >
              <option value="">Select...</option>
              {PROBLEM_TYPES.map((t) => (
                <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="service_category" className="block text-sm font-medium mb-1.5">
              Service Category
            </label>
            <select
              id="service_category"
              name="service_category"
              className="w-full rounded-lg border px-3 py-2 text-sm"
            >
              <option value="">Select...</option>
              {SERVICE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="best_fit" className="block text-sm font-medium mb-1.5">
            Best Fit
          </label>
          <textarea
            id="best_fit"
            name="best_fit"
            maxLength={500}
            rows={2}
            placeholder="When should this proof point be used?"
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label htmlFor="do_not_use_when" className="block text-sm font-medium mb-1.5">
            Don&apos;t Use When
          </label>
          <textarea
            id="do_not_use_when"
            name="do_not_use_when"
            maxLength={500}
            rows={2}
            placeholder="When should this proof point NOT be used?"
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label htmlFor="source_note" className="block text-sm font-medium mb-1.5">
            Source Note
          </label>
          <input
            id="source_note"
            name="source_note"
            maxLength={500}
            placeholder="e.g. Internal campaign data"
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Create Proof Point'}
        </button>
        <a
          href="/dashboard/proposals/library"
          className="rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
        >
          Cancel
        </a>
      </div>
    </form>
  )
}
