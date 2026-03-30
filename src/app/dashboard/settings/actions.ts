'use server'

import { signOut } from '@/lib/auth'
import { redirect } from 'next/navigation'

export async function signOutAction() {
  const { error } = await signOut()
  if (error) {
    console.error('Sign out error:', error)
  }
  redirect('/login')
}
