import { redirect } from 'next/navigation'
import { getSession, getUser } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { WorkspaceProvider } from '@/lib/workspace-context'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Topbar } from '@/components/dashboard/topbar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  const user = await getUser()

  if (!session || !user) {
    redirect('/login')
  }

  // Fetch workspaces on the server
  const supabase = await createSupabaseServerClient()
  const { data: workspaces } = await supabase
    .from('workspaces')
    .select(`
      *,
      team_members!inner(user_id)
    `)
    .eq('team_members.user_id', user.id)

  return (
    <WorkspaceProvider userId={user.id} initialWorkspaces={workspaces ?? []}>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar
            userEmail={user.email}
            userAvatar={user.user_metadata?.avatar_url}
          />
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </WorkspaceProvider>
  )
}
