'use client'

import Link from 'next/link'
import { useState } from 'react'
import { sendPasswordReset } from './actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

type FormState = 'idle' | 'loading' | 'sent' | 'error'

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<FormState>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmedEmail = email.trim()
    if (!trimmedEmail) return

    setState('loading')
    setErrorMessage('')

    const { error } = await sendPasswordReset(trimmedEmail)

    if (error) {
      setErrorMessage(error)
      setState('error')
      return
    }

    setState('sent')
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Recupera tu contraseña</CardTitle>
          <CardDescription>Te enviaremos un enlace seguro para crear o cambiar tu contraseña.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input id="email" type="email" placeholder="tu@empresa.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={state === 'loading' || state === 'sent'} required autoFocus />
            </div>
            {state === 'sent' && <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">Si el correo existe en TorqueLoop, recibirás un enlace para establecer tu contraseña.</div>}
            {state === 'error' && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{errorMessage}</div>}
            <Button type="submit" className="w-full" disabled={state === 'loading' || state === 'sent' || !email.trim()}>
              {state === 'loading' ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enviando...</> : 'Enviar enlace de recuperación'}
            </Button>
            <div className="text-center text-sm"><Link href="/login" className="text-primary hover:underline">Volver a iniciar sesión</Link></div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
