'use server'

import { updatePassword } from '@/lib/auth'

export async function setRecoveryPassword(password: string) {
  if (password.length < 8) {
    return { error: 'La contraseña debe tener al menos 8 caracteres.' }
  }

  return updatePassword(password)
}
