'use client'

import { useWorkspace } from '@/lib/workspace-context'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown } from 'lucide-react'

export function WorkspaceSwitcher() {
  const { workspaces, activeWorkspace, setActiveWorkspace } = useWorkspace()

  if (!activeWorkspace) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 px-3">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: activeWorkspace.color || '#6366f1' }}
          />
          <span className="font-medium text-sm">{activeWorkspace.name}</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {workspaces.map((workspace) => (
          <DropdownMenuItem
            key={workspace.id}
            onClick={() => setActiveWorkspace(workspace)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: workspace.color || '#6366f1' }}
            />
            <span>{workspace.name}</span>
            {workspace.id === activeWorkspace.id && (
              <span className="ml-auto text-xs text-muted-foreground">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
