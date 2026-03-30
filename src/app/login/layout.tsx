import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Iniciar sesión',
  description: 'Inicia sesión en TorqueLoop',
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="absolute left-6 top-6 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
          <span className="text-sm font-bold text-primary-foreground">TL</span>
        </div>
        <span className="text-lg font-semibold tracking-tight">TorqueLoop</span>
      </div>
      {children}
    </div>
  )
}
