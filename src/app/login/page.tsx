'use client'

import { useState } from 'react'
import { sendMagicLink } from './actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Loader2, CheckCircle2 } from 'lucide-react'

type FormState = 'idle' | 'loading' | 'success' | 'error'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<FormState>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return

    setState('loading')
    setErrorMessage('')

    const { error } = await sendMagicLink(email.trim())

    if (error) {
      setErrorMessage(error)
      setState('error')
    } else {
      setState('success')
    }
  }

  if (state === 'success') {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-xl">Revisa tu correo</CardTitle>
            <CardDescription className="text-base">
              Te enviamos un enlace a{' '}
              <span className="font-medium text-foreground">{email}</span>.
              Revisa tu bandeja de entrada.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setState('idle')
                setEmail('')
              }}
            >
              Usar otro correo
            </Button>
          </CardContent>
        </Card>
      </div>
    )
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
            Ingresa tu correo para recibir un enlace mágico
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

            {state === 'error' && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {errorMessage || 'Ocurrió un error. Intenta de nuevo.'}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={state === 'loading' || !email.trim()}
            >
              {state === 'loading' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar enlace mágico'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
