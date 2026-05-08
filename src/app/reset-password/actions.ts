'use server'

import { cookies } from 'next/headers'
import { PASSWORD_RECOVERY_COOKIE, updatePassword } from '@/lib/auth'

export async function setRecoveryPassword(password: string) {
  if (password.length < 8) {
    return { error: 'La contraseña debe tener al menos 8 caracteres.' }
  }

  const result = await updatePassword(password)

  if (!result.error) {
    const cookieStore = await cookies()
    cookieStore.delete(PASSWORD_RECOVERY_COOKIE)
  }

  return result
}
