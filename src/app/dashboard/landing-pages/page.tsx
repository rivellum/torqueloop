import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getLandingPages } from '@/lib/queries/campaigns'
import { LPRow } from '@/components/dashboard/lp-row'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Globe } from 'lucide-react'

export default async function LandingPagesPage() {
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

  const landingPages = await getLandingPages(supabase, workspaceId)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Landing Pages</h1>
        <p className="text-muted-foreground">
          Administra tus páginas de aterrizaje y conversiones.
        </p>
      </div>

      {landingPages.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <Globe className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No hay landing pages</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Aún no tienes landing pages creadas. Genera una desde el asistente
            de IA para capturar leads de tus campañas.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre / Slug</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Visitas</TableHead>
                <TableHead>Conversiones</TableHead>
                <TableHead>Tasa de Conversión</TableHead>
                <TableHead>A/B Test</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {landingPages.map((lp) => (
                <LPRow key={lp.id} landingPage={lp} />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
