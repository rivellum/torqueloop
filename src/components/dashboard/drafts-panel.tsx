'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ProposalDraft, DraftType } from '@/types/proposals'
import { Plus, Check, Edit3, X } from 'lucide-react'

const DRAFT_TYPES: { value: DraftType; label: string }[] = [
  { value: 'cover_letter', label: 'Cover Letter' },
  { value: 'application_answer', label: 'Application Answer' },
  { value: 'proposal_email', label: 'Proposal Email' },
  { value: 'follow_up', label: 'Follow Up' },
  { value: 'proposal_scope', label: 'Proposal Scope' },
  { value: 'qwilr_letter', label: 'Qwilr Letter' },
]

interface DraftsPanelProps {
  opportunityId: string
  initialDrafts: ProposalDraft[]
}

export function DraftsPanel({ opportunityId, initialDrafts }: DraftsPanelProps) {
  const router = useRouter()
  const [drafts, setDrafts] = useState(initialDrafts)
  const [showNew, setShowNew] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // New draft form
  const [newType, setNewType] = useState<DraftType>('cover_letter')
  const [newVariant, setNewVariant] = useState('')
  const [newAngle, setNewAngle] = useState('')
  const [newBody, setNewBody] = useState('')

  // Edit state
  const [editBody, setEditBody] = useState('')

  async function handleCreate() {
    if (!newBody.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/proposals/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunity_id: opportunityId,
          draft_type: newType,
          variant_name: newVariant || null,
          angle: newAngle || null,
          body: newBody,
        }),
      })
      if (!res.ok) throw new Error('Failed to create draft')
      const draft = await res.json()
      setDrafts([draft, ...drafts])
      setShowNew(false)
      setNewBody('')
      setNewVariant('')
      setNewAngle('')
      router.refresh()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSelect(draftId: string) {
    try {
      const res = await fetch(`/api/proposals/drafts/${draftId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _action: 'select', opportunity_id: opportunityId }),
      })
      if (!res.ok) throw new Error('Failed to select draft')
      setDrafts(drafts.map((d) => ({ ...d, selected: d.id === draftId })))
      router.refresh()
    } catch (err) {
      console.error(err)
    }
  }

  async function handleSaveEdit(draftId: string) {
    if (!editBody.trim()) return
    setLoading(true)
    try {
      const res = await fetch(`/api/proposals/drafts/${draftId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: editBody }),
      })
      if (!res.ok) throw new Error('Failed to update draft')
      const updated = await res.json()
      setDrafts(drafts.map((d) => (d.id === draftId ? updated : d)))
      setEditingId(null)
      router.refresh()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-lg border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">Drafts ({drafts.length})</h2>
        <button
          onClick={() => setShowNew(!showNew)}
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Draft
        </button>
      </div>

      {/* New draft form */}
      {showNew && (
        <div className="rounded border p-4 mb-4 space-y-3 bg-muted/30">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Type</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as DraftType)}
                className="w-full rounded border px-2 py-1.5 text-sm"
              >
                {DRAFT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Variant Name</label>
              <input
                type="text"
                value={newVariant}
                onChange={(e) => setNewVariant(e.target.value)}
                placeholder="e.g. Angle A"
                className="w-full rounded border px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Angle</label>
              <input
                type="text"
                value={newAngle}
                onChange={(e) => setNewAngle(e.target.value)}
                placeholder="e.g. Lead with ROAS proof"
                className="w-full rounded border px-2 py-1.5 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Body</label>
            <textarea
              value={newBody}
              onChange={(e) => setNewBody(e.target.value)}
              rows={8}
              placeholder="Write the draft content..."
              className="w-full rounded border px-2 py-1.5 text-sm resize-y"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={loading || !newBody.trim()}
              className="rounded bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              onClick={() => setShowNew(false)}
              className="rounded border px-3 py-1.5 text-sm hover:bg-muted"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Draft list */}
      {drafts.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          No drafts yet. Create one to get started.
        </p>
      ) : (
        <div className="space-y-3">
          {drafts.map((draft) => (
            <div key={draft.id} className="rounded border p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">
                    {draft.variant_name || DRAFT_TYPES.find((t) => t.value === draft.draft_type)?.label || draft.draft_type}
                  </span>
                  {draft.selected && (
                    <span className="rounded-full bg-green-100 text-green-800 px-2 py-0.5 text-xs font-medium">
                      Selected ✓
                    </span>
                  )}
                  {draft.angle && (
                    <span className="text-muted-foreground">— {draft.angle}</span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  {!draft.selected && (
                    <button
                      onClick={() => handleSelect(draft.id)}
                      className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-primary hover:bg-primary/5 transition-colors"
                      title="Select this draft"
                    >
                      <Check className="h-3 w-3" /> Select
                    </button>
                  )}
                  {editingId === draft.id ? (
                    <button
                      onClick={() => setEditingId(null)}
                      className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs hover:bg-muted transition-colors"
                    >
                      <X className="h-3 w-3" /> Cancel
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingId(draft.id)
                        setEditBody(draft.body)
                      }}
                      className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs hover:bg-muted transition-colors"
                    >
                      <Edit3 className="h-3 w-3" /> Edit
                    </button>
                  )}
                </div>
              </div>

              {editingId === draft.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    rows={8}
                    className="w-full rounded border px-2 py-1.5 text-sm resize-y"
                  />
                  <button
                    onClick={() => handleSaveEdit(draft.id)}
                    disabled={loading}
                    className="rounded bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-8">
                  {draft.body}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
