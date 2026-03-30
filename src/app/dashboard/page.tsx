export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Resumen</h1>
        <p className="text-muted-foreground">
          Vista general de tu workspace.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Placeholder cards — will be populated by data packages */}
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">Creativos activos</p>
          <p className="text-2xl font-bold mt-1">—</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">Campañas en curso</p>
          <p className="text-2xl font-bold mt-1">—</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">Leads nuevos</p>
          <p className="text-2xl font-bold mt-1">—</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">Aprobaciones pendientes</p>
          <p className="text-2xl font-bold mt-1">—</p>
        </div>
      </div>
    </div>
  )
}
