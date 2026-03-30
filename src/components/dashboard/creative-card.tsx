'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Creative, ApprovalQueueItem } from '@/types/database'

interface CreativeCardProps {
  creative: Creative
  approval?: ApprovalQueueItem | null
  qaScore?: number | null
}

const STATUS_MAP: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  draft: { label: 'Borrador', variant: 'secondary' },
  review: { label: 'En Revisión', variant: 'default' },
  approved: { label: 'Aprobado', variant: 'default' },
  published: { label: 'Publicado', variant: 'outline' },
  archived: { label: 'Archivado', variant: 'secondary' },
}

const APPROVAL_STATUS_MAP: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pendiente', variant: 'secondary' },
  approved: { label: 'Aprobado', variant: 'default' },
  rejected: { label: 'Rechazado', variant: 'destructive' },
  revision_requested: { label: 'Cambios', variant: 'outline' },
}

function getQAScoreColor(score: number | null | undefined): string {
  if (score == null) return 'bg-gray-400/10 text-gray-600'
  if (score < 4) return 'bg-red-400/10 text-red-600'
  if (score <= 7) return 'bg-yellow-400/10 text-yellow-600'
  return 'bg-green-400/10 text-green-600'
}

export function CreativeCard({ creative, approval, qaScore }: CreativeCardProps) {
  const statusInfo = approval
    ? APPROVAL_STATUS_MAP[approval.status]
    : STATUS_MAP[creative.status] ?? { label: creative.status, variant: 'secondary' }

  return (
    <Link href={`/dashboard/creatives/${creative.id}`}>
      <Card className="group cursor-pointer transition-shadow hover:shadow-md">
        <CardContent className="p-4">
          <div className="mb-3 aspect-video w-full rounded-md bg-muted" />
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-medium">{creative.title}</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {new Date(creative.created_at).toLocaleDateString('es-MX', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
          </div>
          {qaScore != null && (
            <div className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${getQAScoreColor(qaScore)}`}>
              QA: {qaScore.toFixed(1)}/10
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
