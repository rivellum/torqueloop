'use server'

import { signInWithMagicLink } from '@/lib/auth'

export async function sendMagicLink(email: string, next = '/dashboard') {
  return signInWithMagicLink(email, next)
}
