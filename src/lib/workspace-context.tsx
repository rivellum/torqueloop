'use client'

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import type { Workspace } from '@/types/database'

interface WorkspaceContextValue {
  workspaces: Workspace[]
  activeWorkspace: Workspace | null
  setActiveWorkspace: (workspace: Workspace) => void
  loading: boolean
}

const WorkspaceContext = createContext<WorkspaceContextValue>({
  workspaces: [],
  activeWorkspace: null,
  setActiveWorkspace: () => {},
  loading: true,
})

const ACTIVE_WORKSPACE_KEY = 'torqueloop-active-workspace'

export function WorkspaceProvider({
  children,
  userId,
  initialWorkspaces = [],
}: {
  children: ReactNode
  userId: string
  initialWorkspaces?: Workspace[]
}) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(initialWorkspaces)
  const [activeWorkspace, setActiveWorkspaceState] = useState<Workspace | null>(null)
  const [loading, setLoading] = useState(initialWorkspaces.length === 0)

  useEffect(() => {
    async function fetchWorkspaces() {
      const supabase = createSupabaseBrowserClient()

      const { data, error } = await supabase
        .from('workspaces')
        .select(`
          *,
          team_members!inner(user_id)
        `)
        .eq('team_members.user_id', userId)

      if (error) {
        console.error('Error fetching workspaces:', error.message)
        setLoading(false)
        return
      }

      const fetchedWorkspaces: Workspace[] = data ?? []
      setWorkspaces(fetchedWorkspaces)

      // Restore from localStorage or use first workspace
      const storedId = typeof window !== 'undefined'
        ? localStorage.getItem(ACTIVE_WORKSPACE_KEY)
        : null

      const selected = storedId && fetchedWorkspaces.find((w) => w.id === storedId)
        ? fetchedWorkspaces.find((w) => w.id === storedId)!
        : fetchedWorkspaces.length > 0
        ? fetchedWorkspaces[0]
        : null

      if (selected) {
        setActiveWorkspaceState(selected)
        document.cookie = `${ACTIVE_WORKSPACE_KEY}=${selected.id};path=/;max-age=31536000;SameSite=Lax`
      }

      setLoading(false)
    }

    // Always fetch in background to get latest, but don't block if we have initial data
    if (initialWorkspaces.length === 0) {
      fetchWorkspaces()
    } else {
      // Set initial active workspace
      const storedId = typeof window !== 'undefined'
        ? localStorage.getItem(ACTIVE_WORKSPACE_KEY)
        : null

      const selected = storedId && initialWorkspaces.find((w) => w.id === storedId)
        ? initialWorkspaces.find((w) => w.id === storedId)!
        : initialWorkspaces[0]

      setActiveWorkspaceState(selected)
      if (typeof window !== 'undefined') {
        document.cookie = `${ACTIVE_WORKSPACE_KEY}=${selected.id};path=/;max-age=31536000;SameSite=Lax`
      }

      // Also fetch in background to refresh
      fetchWorkspaces()
    }
  }, [userId, initialWorkspaces])

  const setActiveWorkspace = useCallback((workspace: Workspace) => {
    setActiveWorkspaceState(workspace)
    if (typeof window !== 'undefined') {
      localStorage.setItem(ACTIVE_WORKSPACE_KEY, workspace.id)
      document.cookie = `${ACTIVE_WORKSPACE_KEY}=${workspace.id};path=/;max-age=31536000;SameSite=Lax`
    }
  }, [])

  return (
    <WorkspaceContext.Provider
      value={{ workspaces, activeWorkspace, setActiveWorkspace, loading }}
    >
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext)
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider')
  }
  return context
}
