import { redirect } from 'next/navigation'
import { getActiveWorkspaceId } from '@/lib/workspace-server'
import { NewProofPointForm } from './form'

export default async function NewProofPointPage() {
  const workspaceId = await getActiveWorkspaceId()
  if (!workspaceId) redirect('/dashboard')

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New Proof Point</h1>
        <p className="text-muted-foreground mt-1">
          Add a metric or case study to your proposal library.
        </p>
      </div>
      <NewProofPointForm workspaceId={workspaceId} />
    </div>
  )
}
