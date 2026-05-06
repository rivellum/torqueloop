'use client'

import { useState, useEffect } from 'react'
import { User, Link2, Unlink } from 'lucide-react'

interface Lead {
  id: string
  name: string | null
  email: string
  source: string | null
  status: string
  score: number | null
}

interface LeadContextProps {
  opportunityId: string
  workspaceId: string
  currentLeadId: string | null
}

export function LeadContext({ opportunityId, workspaceId, currentLeadId }: LeadContextProps) {
  const [lead, setLead] = useState<Lead | null>(null)
  const [showLinker, setShowLinker] = useState(false)
  const [searchResults, setSearchResults] = useState<Lead[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)

  // Fetch linked lead on mount
  useEffect(() => {
    if (!currentLeadId) return
    fetch(`/api/leads?id=${currentLeadId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) setLead(data)
      })
      .catch(() => {})
  }, [currentLeadId])

  async function handleSearch() {
    if (!searchQuery.trim()) return
    setLoading(true)
    try {
      const res = await fetch(`/api/leads?search=${encodeURIComponent(searchQuery)}&workspace_id=${workspaceId}`)
      const data = await res.json()
      setSearchResults(Array.isArray(data) ? data : [])
    } catch {
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  async function handleLink(leadId: string) {
    try {
      const res = await fetch(`/api/proposals/opportunities/${opportunityId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_id: leadId }),
      })
      if (!res.ok) throw new Error('Failed to link lead')
      const updated = await res.json()
      const selectedLead = searchResults.find((l) => l.id === leadId)
      if (selectedLead) setLead(selectedLead)
      setShowLinker(false)
      setSearchResults([])
      setSearchQuery('')
    } catch (err) {
      console.error(err)
    }
  }

  async function handleUnlink() {
    try {
      await fetch(`/api/proposals/opportunities/${opportunityId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_id: null }),
      })
      setLead(null)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-sm flex items-center gap-2">
          <User className="h-4 w-4" />
          Linked Lead
        </h3>
        {lead && !showLinker && (
          <button
            onClick={() => setShowLinker(true)}
            className="text-xs text-primary hover:text-primary/80"
          >
            Change
          </button>
        )}
      </div>

      {lead ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">{lead.name || lead.email}</p>
              {lead.name && <p className="text-xs text-muted-foreground">{lead.email}</p>}
            </div>
            <button
              onClick={handleUnlink}
              className="text-xs text-muted-foreground hover:text-red-600 flex items-center gap-1"
            >
              <Unlink className="h-3 w-3" /> Unlink
            </button>
          </div>
          <div className="flex gap-2 text-xs">
            {lead.source && (
              <span className="rounded-full bg-muted px-2 py-0.5">{lead.source}</span>
            )}
            <span className="rounded-full bg-muted px-2 py-0.5">{lead.status}</span>
            {lead.score !== null && (
              <span className="rounded-full bg-muted px-2 py-0.5">Score: {lead.score}</span>
            )}
          </div>
        </div>
      ) : showLinker ? (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search leads by name or email..."
              className="flex-1 rounded border px-2 py-1.5 text-sm"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="rounded bg-primary px-3 py-1.5 text-sm text-primary-foreground disabled:opacity-50"
            >
              {loading ? '...' : 'Search'}
            </button>
          </div>
          {searchResults.length > 0 && (
            <div className="rounded border divide-y max-h-40 overflow-y-auto">
              {searchResults.map((l) => (
                <button
                  key={l.id}
                  onClick={() => handleLink(l.id)}
                  className="w-full text-left px-3 py-2 hover:bg-muted transition-colors text-sm"
                >
                  <span className="font-medium">{l.name || l.email}</span>
                  {l.source && <span className="text-muted-foreground ml-2">({l.source})</span>}
                </button>
              ))}
            </div>
          )}
          <button
            onClick={() => { setShowLinker(false); setSearchResults([]); setSearchQuery('') }}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowLinker(true)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Link2 className="h-3.5 w-3.5" />
          Link a lead
        </button>
      )}
    </div>
  )
}
