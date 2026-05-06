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

export async function signInWithPassword(email: string, password: string) {
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('Error signing in with password:', error.message)
    return { error: 'Correo o contraseña incorrectos.' }
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
