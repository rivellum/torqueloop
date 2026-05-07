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

export function getAuthRedirectOrigin(origin: string | null | undefined, host: string | null | undefined) {
  if (origin) return origin
  if (!host) return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const protocol = host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https'
  return `${protocol}://${host}`
}

export function getPasswordResetRedirectTo(origin: string) {
  const callbackUrl = new URL('/auth/callback', origin)
  callbackUrl.searchParams.set('next', '/reset-password')
  return callbackUrl.toString()
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

export async function requestPasswordReset(email: string, redirectTo: string) {
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  })

  if (error) {
    console.error('Error requesting password reset:', error.message)
    return { error: 'No pudimos enviar el correo de recuperación. Intenta de nuevo.' }
  }

  return { error: null }
}

export async function updatePassword(password: string) {
  const supabase = await createSupabaseServerClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    if (userError) console.error('Error reading recovery session:', userError.message)
    return { error: 'El enlace de recuperación expiró. Solicita uno nuevo.' }
  }

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    console.error('Error updating password:', error.message)
    return { error: 'No pudimos guardar la contraseña. Solicita un nuevo enlace e intenta otra vez.' }
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
