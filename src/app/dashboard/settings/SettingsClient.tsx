'use client'

import { useTransition } from 'react'
import { signOutAction } from './actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, LogOut } from 'lucide-react'

export default function SettingsPage({
  userEmail,
}: {
  userEmail: string | undefined
}) {
  const [isPending, startTransition] = useTransition()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">
          Administra tu cuenta y preferencias.
        </p>
      </div>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle className="text-base">Cuenta</CardTitle>
          <CardDescription>Información de tu sesión actual</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Correo electrónico
            </p>
            <p className="mt-1 text-sm">{userEmail || '—'}</p>
          </div>

          <div className="border-t pt-4">
            <Button
              variant="destructive"
              onClick={() => startTransition(() => signOutAction())}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="mr-2 h-4 w-4" />
              )}
              Cerrar sesión
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
