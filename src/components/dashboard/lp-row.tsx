'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import { ExternalLink, FlaskConical } from 'lucide-react'
import type { LandingPageData } from '@/lib/queries/campaigns'

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  draft: { label: 'Borrador', variant: 'outline' },
  review: { label: 'En revisión', variant: 'secondary' },
  approved: { label: 'Aprobada', variant: 'default' },
  published: { label: 'Publicada', variant: 'default' },
  archived: { label: 'Archivada', variant: 'outline' },
}

export interface LPRowProps {
  landingPage: LandingPageData
}

export function LPRow({ landingPage }: LPRowProps) {
  const statusConfig = STATUS_CONFIG[landingPage.status] ?? STATUS_CONFIG.draft

  const conversionRate =
    landingPage.visits > 0
      ? (landingPage.conversions / landingPage.visits) * 100
      : 0

  const lpUrl = `/lp/${landingPage.slug}`

  return (
    <TableRow>
      <TableCell>
        <div>
          <div className="font-medium">{landingPage.name}</div>
          <a
            href={lpUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-primary hover:underline"
          >
            /lp/{landingPage.slug}
          </a>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
      </TableCell>
      <TableCell>{landingPage.visits.toLocaleString('es-MX')}</TableCell>
      <TableCell>{landingPage.conversions.toLocaleString('es-MX')}</TableCell>
      <TableCell>
        <span
          className={
            conversionRate >= 5
              ? 'text-emerald-600 font-medium'
              : conversionRate >= 2
                ? 'text-amber-600'
                : ''
          }
        >
          {conversionRate.toFixed(1)}%
        </span>
      </TableCell>
      <TableCell>
        {landingPage.ab_test_status ? (
          <div className="flex items-center gap-1.5 text-xs">
            <FlaskConical className="h-3.5 w-3.5 text-violet-500" />
            <span>{landingPage.ab_test_status}</span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell>
        <Button variant="ghost" size="sm" asChild>
          <a href={lpUrl} target="_blank" rel="noopener noreferrer">
            Ver LP
            <ExternalLink className="ml-1 h-3 w-3" />
          </a>
        </Button>
      </TableCell>
    </TableRow>
  )
}
