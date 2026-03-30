import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getActiveWorkspaceId } from '@/lib/workspace-server'
import { getLeads } from '@/lib/queries/leads'
import { LeadsTable } from '@/components/dashboard/leads-table'
import { Users } from 'lucide-react'

export default async function LeadsPage() {
  const workspaceId = await getActiveWorkspaceId()

  if (!workspaceId) {
    redirect('/dashboard')
  }

  const supabase = await createSupabaseServerClient()
  const leads = await getLeads(supabase, workspaceId)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6" />
            Leads
          </h1>
          <p className="text-muted-foreground">
            Gestiona y filtra los leads capturados en tu workspace.
          </p>
        </div>
      </div>

      <LeadsTable leads={leads} />
    </div>
  )
}
