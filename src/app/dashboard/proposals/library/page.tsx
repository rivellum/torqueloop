import { redirect } from 'next/navigation'
import { getActiveWorkspaceId } from '@/lib/workspace-server'
import { listProofPoints } from '@/lib/proposals/data'
import { Library, Plus } from 'lucide-react'

export default async function LibraryPage() {
  const workspaceId = await getActiveWorkspaceId()
  if (!workspaceId) redirect('/dashboard')

  const proofPoints = await listProofPoints(workspaceId)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Library className="h-6 w-6" />
            Proposal Library
          </h1>
          <p className="text-muted-foreground">
            Proof points, voice rules, and reusable proposal assets.
          </p>
        </div>
      </div>

      {/* Proof Points */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Proof Points ({proofPoints.length})</h2>

        {proofPoints.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center rounded-lg border">
            <Library className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground">No proof points yet.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Seed proof points from the migration or add them manually.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {proofPoints.map((pp) => (
              <div key={pp.id} className="rounded-lg border p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{pp.label}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{pp.metric}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {pp.service_category && (
                      <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
                        {pp.service_category}
                      </span>
                    )}
                    {!pp.active && (
                      <span className="rounded-full bg-red-100 text-red-800 px-2.5 py-0.5 text-xs font-medium">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>

                {pp.client_context && (
                  <p className="text-sm mt-2">
                    <span className="text-muted-foreground">Context:</span> {pp.client_context}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                  {pp.best_fit && (
                    <div>
                      <span className="text-muted-foreground font-medium">Best fit:</span>
                      <p className="mt-0.5">{pp.best_fit}</p>
                    </div>
                  )}
                  {pp.do_not_use_when && (
                    <div>
                      <span className="text-red-600 font-medium">Don&apos;t use when:</span>
                      <p className="mt-0.5">{pp.do_not_use_when}</p>
                    </div>
                  )}
                </div>

                {pp.problem_type && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    Problem type: {pp.problem_type}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
