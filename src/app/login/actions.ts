'use server'

import { signInWithPassword } from '@/lib/auth'

export async function loginWithPassword(email: string, password: string) {
  return signInWithPassword(email, password)
}
