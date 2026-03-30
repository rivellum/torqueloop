import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getActiveWorkspaceId } from '@/lib/workspace-server'
import { CreativeCard } from '@/components/dashboard/creative-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Creative, ApprovalQueueItem, QAScore } from '@/types/database'

export default async function CreativesPage() {
  const workspaceId = await getActiveWorkspaceId()
  if (!workspaceId) redirect('/dashboard')

  const supabase = await createSupabaseServerClient()

  const { data: creatives } = await supabase
    .from('creatives')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })

  const creativeList: Creative[] = creatives ?? []

  // Fetch approvals for these creatives
  const creativeIds = creativeList.map((c) => c.id)
  const approvalsMap = new Map<string, ApprovalQueueItem>()
  const qaScoresMap = new Map<string, number>()

  if (creativeIds.length > 0) {
    const { data: approvals } = await supabase
      .from('approval_queue')
      .select('*')
      .eq('workspace_id', workspaceId)
      .in('creative_id', creativeIds)

    approvals?.forEach((a) => approvalsMap.set(a.creative_id, a))

    const { data: scores } = await supabase
      .from('qa_scores')
      .select('*')
      .eq('workspace_id', workspaceId)
      .in('creative_id', creativeIds)

    scores?.forEach((s) => qaScoresMap.set(s.creative_id, s.score))
  }

  // Filter by tab
  const all = creativeList
  const pendientes = creativeList.filter(
    (c) =>
      c.status === 'review' ||
      approvalsMap.get(c.id)?.status === 'pending' ||
      approvalsMap.get(c.id)?.status === 'revision_requested',
  )
  const aprobados = creativeList.filter(
    (c) => c.status === 'approved' || approvalsMap.get(c.id)?.status === 'approved',
  )
  const rechazados = creativeList.filter(
    (c) => approvalsMap.get(c.id)?.status === 'rejected',
  )

  function renderGrid(items: Creative[]) {
    if (items.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-lg text-muted-foreground">No hay creativos aún</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Los creativos aparecerán aquí cuando se generen.
          </p>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((creative) => (
          <CreativeCard
            key={creative.id}
            creative={creative}
            approval={approvalsMap.get(creative.id)}
            qaScore={qaScoresMap.get(creative.id) ?? null}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Creativos</h1>
          <p className="text-sm text-muted-foreground">
            {creativeList.length} creativo{creativeList.length !== 1 ? 's' : ''} en total
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/approvals">Ver Aprobaciones</Link>
        </Button>
      </div>

      <Tabs defaultValue="todos">
        <TabsList>
          <TabsTrigger value="todos">
            Todos <Badge variant="secondary" className="ml-1.5">{all.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="pendientes">
            Pendientes <Badge variant="secondary" className="ml-1.5">{pendientes.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="aprobados">
            Aprobados <Badge variant="secondary" className="ml-1.5">{aprobados.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="rechazados">
            Rechazados <Badge variant="secondary" className="ml-1.5">{rechazados.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="todos" className="mt-4">{renderGrid(all)}</TabsContent>
        <TabsContent value="pendientes" className="mt-4">{renderGrid(pendientes)}</TabsContent>
        <TabsContent value="aprobados" className="mt-4">{renderGrid(aprobados)}</TabsContent>
        <TabsContent value="rechazados" className="mt-4">{renderGrid(rechazados)}</TabsContent>
      </Tabs>
    </div>
  )
}
