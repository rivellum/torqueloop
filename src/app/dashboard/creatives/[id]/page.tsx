import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getActiveWorkspaceId } from '@/lib/workspace-server'
import { CreativeDetail } from '@/components/dashboard/creative-detail'
import { QAScoreCard } from '@/components/dashboard/qa-score-card'
import { ApprovalActions } from '@/components/dashboard/approval-actions'
import { Button } from '@/components/ui/button'
import type { Creative, ApprovalQueueItem, QAScore } from '@/types/database'
import type { QAScoreData } from '@/types/creative-qa'

export default async function CreativeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const workspaceId = await getActiveWorkspaceId()
  if (!workspaceId) redirect('/dashboard')

  const supabase = await createSupabaseServerClient()

  const { data: creative } = await supabase
    .from('creatives')
    .select('*')
    .eq('id', id)
    .eq('workspace_id', workspaceId)
    .single()

  if (!creative) redirect('/dashboard/creatives')

  const { data: approval } = await supabase
    .from('approval_queue')
    .select('*')
    .eq('creative_id', id)
    .eq('workspace_id', workspaceId)
    .single()

  const { data: qaScore } = await supabase
    .from('qa_scores')
    .select('*')
    .eq('creative_id', id)
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const scoreData: QAScoreData | null = qaScore
    ? {
        dimensions: (qaScore.criteria ?? {}) as QAScoreData['dimensions'],
        overall: qaScore.score,
      }
    : null

  const currentStatus = approval?.status ?? creative.status

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/creativas">← Volver</Link>
        </Button>
        <h1 className="text-2xl font-bold">Detalle del Creativo</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CreativeDetail creative={creative as Creative} />
        </div>
        <div className="space-y-6">
          {scoreData && <QAScoreCard scoreData={scoreData} />}
          <ApprovalActions
            creativeId={id}
            workspaceId={workspaceId}
            currentStatus={currentStatus}
          />
        </div>
      </div>
    </div>
  )
}
