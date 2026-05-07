'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { setRecoveryPassword } from './actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

type FormState = 'idle' | 'loading' | 'done' | 'error'

export default function ResetPasswordForm() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [state, setState] = useState<FormState>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden.')
      setState('error')
      return
    }

    setState('loading')
    setErrorMessage('')
    const { error } = await setRecoveryPassword(password)

    if (error) {
      setErrorMessage(error)
      setState('error')
      return
    }

    setState('done')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Establece tu contraseña</CardTitle>
          <CardDescription>Crea una contraseña segura para entrar a TorqueLoop con correo y contraseña.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2"><Label htmlFor="password">Nueva contraseña</Label><Input id="password" type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} disabled={state === 'loading' || state === 'done'} required autoFocus /></div>
            <div className="space-y-2"><Label htmlFor="confirmPassword">Confirma tu contraseña</Label><Input id="confirmPassword" type="password" minLength={8} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={state === 'loading' || state === 'done'} required /></div>
            {state === 'done' && <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">Contraseña guardada. Ya puedes ir al dashboard.</div>}
            {state === 'error' && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{errorMessage}</div>}
            <Button type="submit" className="w-full" disabled={state === 'loading' || state === 'done' || password.length < 8 || confirmPassword.length < 8}>{state === 'loading' ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando...</> : 'Guardar contraseña'}</Button>
            {state === 'done' && <Button asChild className="w-full" variant="outline"><Link href="/dashboard">Ir al dashboard</Link></Button>}
            <div className="text-center text-sm"><Link href="/forgot-password" className="text-primary hover:underline">Solicitar un nuevo enlace</Link></div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
