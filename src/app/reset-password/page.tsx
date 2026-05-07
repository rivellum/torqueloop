import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import ResetPasswordForm from './reset-password-form'

export default async function ResetPasswordPage() {
  const user = await getUser({ logErrors: false })

  if (!user) {
    redirect('/forgot-password')
  }

  return <ResetPasswordForm />
}
