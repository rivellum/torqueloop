import { createSupabaseServerClient } from './supabase-server'

interface AuthReadOptions {
  logErrors?: boolean
}

export function getSafeRedirectPath(next: string | null | undefined, fallback = '/dashboard') {
  if (!next || typeof next !== 'string') return fallback
  if (!next.startsWith('/') || next.startsWith('//')) return fallback
  if (next.startsWith('/login') || next.startsWith('/auth/callback')) return fallback
  return next
}

export async function getSession(options: AuthReadOptions = {}) {
  const supabase = await createSupabaseServerClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) {
    if (options.logErrors !== false) console.error('Error getting session:', error.message)
    return null
  }
  return session
}

export async function getUser(options: AuthReadOptions = {}) {
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) {
    if (options.logErrors !== false) console.error('Error getting user:', error.message)
    return null
  }
  return user
}

export async function signInWithMagicLink(email: string, next = '/dashboard') {
  const supabase = await createSupabaseServerClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const redirectUrl = new URL('/auth/callback', siteUrl)
  redirectUrl.searchParams.set('next', getSafeRedirectPath(next))

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectUrl.toString(),
    },
  })
  if (error) {
    console.error('Error sending magic link:', error.message)
    return { error: error.message }
  }
  return { error: null }
}

export async function signOut() {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Error signing out:', error.message)
    return { error: error.message }
  }
  return { error: null }
}
