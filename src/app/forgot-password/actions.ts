'use server'

import { headers } from 'next/headers'
import { getAuthRedirectOrigin, getPasswordResetRedirectTo, requestPasswordReset } from '@/lib/auth'

export async function sendPasswordReset(email: string) {
  const trimmedEmail = email.trim().toLowerCase()
  if (!trimmedEmail) return { error: 'Ingresa tu correo electrónico.' }

  const headerStore = await headers()
  const origin = getAuthRedirectOrigin(headerStore.get('origin'), headerStore.get('host'))
  const redirectTo = getPasswordResetRedirectTo(origin)

  return requestPasswordReset(trimmedEmail, redirectTo)
}
