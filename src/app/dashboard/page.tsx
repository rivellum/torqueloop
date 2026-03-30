import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getActiveWorkspaceId } from '@/lib/workspace-server'
import { getOverviewMetrics, getRecentActivity, getPendingCreatives } from '@/lib/queries/overview'
import { MetricCard } from '@/components/dashboard/metric-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DollarSign, Users, TrendingUp, Megaphone, Clock, ArrowRight } from 'lucide-react'

const STATUS_LABELS: Record<string, string> = {
  new: 'Nuevo',
  contacted: 'Contactado',
  qualified: 'Calificado',
  converted: 'Convertido',
  lost: 'Perdido',
}

export default async function DashboardOverviewPage() {
  const workspaceId = await getActiveWorkspaceId()

  if (!workspaceId) {
    // No workspace yet — show placeholder
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Resumen</h1>
          <p className="text-muted-foreground">
            Vista general de tu workspace.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {['Gasto Total', 'Total Leads', 'CPA', 'Creativos Activos', 'Aprobaciones Pendientes'].map(
            (label) => (
              <div key={label} className="rounded-lg border bg-card p-6">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-2xl font-bold mt-1">—</p>
              </div>
            )
          )}
        </div>
      </div>
    )
  }

  const supabase = await createSupabaseServerClient()

  const [metrics, recentLeads, pendingCreatives] = await Promise.all([
    getOverviewMetrics(supabase, workspaceId),
    getRecentActivity(supabase, workspaceId, 5),
    getPendingCreatives(supabase, workspaceId, 3),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Resumen</h1>
        <p className="text-muted-foreground">
          Vista general de tu workspace.
        </p>
      </div>

      {/* Metric cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <MetricCard
          title="Gasto Total"
          value={`$${metrics.totalSpend.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
          icon={<DollarSign className="h-4 w-4" />}
        />
        <MetricCard
          title="Total Leads"
          value={metrics.totalLeads.toLocaleString('es-MX')}
          icon={<Users className="h-4 w-4" />}
        />
        <MetricCard
          title="CPA"
          value={
            metrics.totalLeads > 0
              ? `$${metrics.cpa.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : '—'
          }
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <MetricCard
          title="Creativos Activos"
          value={metrics.activeCreatives}
          icon={<Megaphone className="h-4 w-4" />}
        />
        <MetricCard
          title="Aprobaciones Pendientes"
          value={metrics.pendingApprovals}
          icon={<Clock className="h-4 w-4" />}
        />
      </div>

      {/* Bottom sections */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Actividad Reciente</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/leads">
                Ver todos
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentLeads.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay actividad reciente.</p>
            ) : (
              <div className="space-y-3">
                {recentLeads.map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{lead.name ?? lead.email}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {lead.source ?? 'Desconocido'} ·{' '}
                        {new Date(lead.created_at).toLocaleDateString('es-MX')}
                      </p>
                    </div>
                    <Badge variant="outline" className="ml-2 shrink-0">
                      {STATUS_LABELS[lead.status] ?? lead.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending creatives */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Creativos Pendientes</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/approvals">
                Ver todos
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {pendingCreatives.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay creativos pendientes.</p>
            ) : (
              <div className="space-y-3">
                {pendingCreatives.map((creative) => (
                  <div key={creative.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{creative.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">{creative.type}</p>
                    </div>
                    <Badge variant="secondary" className="ml-2 shrink-0">
                      Pendiente
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
