import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { PASSWORD_RECOVERY_COOKIE, getUser } from '@/lib/auth'
import ResetPasswordForm from './reset-password-form'

export default async function ResetPasswordPage() {
  const user = await getUser({ logErrors: false })
  const cookieStore = await cookies()
  const hasRecoveryIntent = cookieStore.get(PASSWORD_RECOVERY_COOKIE)?.value === '1'

  if (!user || !hasRecoveryIntent) {
    redirect('/forgot-password')
  }

  return <ResetPasswordForm />
}
