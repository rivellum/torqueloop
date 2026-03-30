import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import SettingsClient from './SettingsClient'

export default async function SettingsPage() {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  return <SettingsClient userEmail={user.email} />
}
