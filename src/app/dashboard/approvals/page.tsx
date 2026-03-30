import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getActiveWorkspaceId } from '@/lib/workspace-server'
import { CreativeCard } from '@/components/dashboard/creative-card'
import type { Creative, ApprovalQueueItem, QAScore } from '@/types/database'

export default async function ApprovalsPage() {
  const workspaceId = await getActiveWorkspaceId()
  if (!workspaceId) redirect('/dashboard')

  const supabase = await createSupabaseServerClient()

  const { data: approvals } = await supabase
    .from('approval_queue')
    .select('*')
    .eq('workspace_id', workspaceId)
    .in('status', ['pending', 'revision_requested', 'rejected'])
    .order('created_at', { ascending: false })

  const approvalList: ApprovalQueueItem[] = approvals ?? []
  const creativeIds = approvalList.map((a) => a.creative_id)

  // Fetch associated creatives
  const creativesMap = new Map<string, Creative>()
  const qaScoresMap = new Map<string, number>()

  if (creativeIds.length > 0) {
    const { data: creatives } = await supabase
      .from('creatives')
      .select('*')
      .in('id', creativeIds)

    creatives?.forEach((c) => creativesMap.set(c.id, c))

    const { data: scores } = await supabase
      .from('qa_scores')
      .select('*')
      .eq('workspace_id', workspaceId)
      .in('creative_id', creativeIds)

    scores?.forEach((s) => qaScoresMap.set(s.creative_id, s.score))
  }

  if (approvalList.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Aprobaciones Pendientes</h1>
          <p className="text-sm text-muted-foreground">
            Revisa y aprueba creativos antes de su publicación.
          </p>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-lg font-medium">¡Todo aprobado!</p>
          <p className="mt-1 text-sm text-muted-foreground">
            No hay creativos pendientes de aprobación.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Aprobaciones Pendientes</h1>
        <p className="text-sm text-muted-foreground">
          {approvalList.length} creativo{approvalList.length !== 1 ? 's' : ''} pendiente
          {approvalList.length !== 1 ? 's' : ''} de revisión.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {approvalList.map((approval) => {
          const creative = creativesMap.get(approval.creative_id)
          if (!creative) return null

          return (
            <CreativeCard
              key={approval.id}
              creative={creative}
              approval={approval}
              qaScore={qaScoresMap.get(creative.id) ?? null}
            />
          )
        })}
      </div>
    </div>
  )
}
