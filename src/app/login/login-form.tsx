'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginWithPassword } from './actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

type FormState = 'idle' | 'loading' | 'error'

interface LoginFormProps {
  next?: string
}

export default function LoginForm({ next = '/dashboard' }: LoginFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [state, setState] = useState<FormState>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmedEmail = email.trim()
    if (!trimmedEmail || !password) return

    setState('loading')
    setErrorMessage('')

    const { error } = await loginWithPassword(trimmedEmail, password)

    if (error) {
      setErrorMessage(error)
      setState('error')
      return
    }

    router.replace(next)
    router.refresh()
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
            <span className="text-xl font-bold text-primary-foreground">TL</span>
          </div>
          <CardTitle className="text-xl">Inicia sesión</CardTitle>
          <CardDescription>
            Ingresa tu correo y contraseña para continuar tu trabajo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={state === 'loading'}
                required
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={state === 'loading'}
                required
              />
            </div>

            {state === 'error' && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {errorMessage || 'Ocurrió un error. Intenta de nuevo.'}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={state === 'loading' || !email.trim() || !password}
            >
              {state === 'loading' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
