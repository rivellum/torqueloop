import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getCampaigns } from '@/lib/queries/campaigns'
import { CampaignRow } from '@/components/dashboard/campaign-row'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Megaphone } from 'lucide-react'

export default async function CampaignsPage() {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  const supabase = await createSupabaseServerClient()

  // Fetch user's first workspace
  const { data: workspaces } = await supabase
    .from('workspaces')
    .select('id, team_members!inner(user_id)')
    .eq('team_members.user_id', user.id)
    .limit(1)

  const workspaceId = workspaces?.[0]?.id

  if (!workspaceId) {
    redirect('/dashboard')
  }

  const campaigns = await getCampaigns(supabase, workspaceId)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Campañas</h1>
        <p className="text-muted-foreground">
          Gestiona tus campañas publicitarias activas.
        </p>
      </div>

      {campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <Megaphone className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No hay campañas</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Aún no tienes campañas creadas. Crea tu primera campaña desde el
            asistente de IA para comenzar a generar leads.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Presupuesto</TableHead>
                <TableHead>Canales</TableHead>
                <TableHead>Rendimiento</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => (
                <CampaignRow key={campaign.id} campaign={campaign} />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
