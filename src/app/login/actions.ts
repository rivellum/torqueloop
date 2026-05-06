'use server'

import { signInWithMagicLink } from '@/lib/auth'

export async function sendMagicLink(email: string) {
  return signInWithMagicLink(email)
}
