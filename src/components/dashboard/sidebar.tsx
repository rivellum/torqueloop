'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Film, Megaphone, Globe, Users, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Resumen', icon: LayoutDashboard },
  { href: '/dashboard/creatives', label: 'Creativos', icon: Film },
  { href: '/dashboard/initiatives', label: 'Campañas', icon: Megaphone },
  { href: '/dashboard/landing-pages', label: 'Landing Pages', icon: Globe },
  { href: '/dashboard/leads', label: 'Leads', icon: Users },
  { href: '/dashboard/approvals', label: 'Aprobaciones', icon: CheckCircle },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex h-screen w-64 flex-col border-r bg-background">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">TL</span>
        </div>
        <span className="font-semibold text-lg">TorqueLoop</span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = item.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

export { navItems }
