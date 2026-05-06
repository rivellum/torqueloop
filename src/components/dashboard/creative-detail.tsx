import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Creative } from '@/types/database'
import { getCreativeTitle, getCreativeStorageUrl, getCreativeMimeType } from '@/types/database'

interface CreativeDetailProps {
  creative: Creative
}

const STATUS_MAP: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  draft: { label: 'Borrador', variant: 'secondary' },
  review: { label: 'En Revisión', variant: 'default' },
  approved: { label: 'Aprobado', variant: 'default' },
  published: { label: 'Publicado', variant: 'outline' },
  archived: { label: 'Archivado', variant: 'secondary' },
}

const TYPE_LABELS: Record<string, string> = {
  ad: 'Anuncio',
  email: 'Email',
  social: 'Social',
  blog: 'Blog',
  video: 'Video',
  landing_page: 'Landing Page',
}

export function CreativeDetail({ creative }: CreativeDetailProps) {
  const statusInfo = STATUS_MAP[creative.status] ?? { label: creative.status, variant: 'secondary' as const }
  const typeLabel = TYPE_LABELS[creative.type] ?? creative.type
  const mediaUrl = getCreativeStorageUrl(creative)
  const mimeType = getCreativeMimeType(creative)
  const isVideo = mimeType?.startsWith('video/') || creative.type === 'video' || mediaUrl?.match(/\.(mp4|mov|webm)$/i)
  const title = getCreativeTitle(creative)
  const duration = creative.content?.duration_seconds as number | undefined
  const dimensions = creative.content?.dimensions as { width: number; height: number } | undefined

  return (
    <div className="space-y-6">
      {/* Media */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-hidden rounded-lg bg-black">
            {mediaUrl ? (
              isVideo ? (
                <video
                  src={mediaUrl}
                  controls
                  className="aspect-video w-full"
                />
              ) : (
                <img
                  src={mediaUrl}
                  alt={title}
                  className="aspect-video w-full object-contain"
                />
              )
            ) : (
              <div className="flex aspect-video items-center justify-center bg-muted">
                <span className="text-muted-foreground">Sin vista previa</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold">{title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{typeLabel}</p>
            </div>
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
          </div>

          {creative.variant_label && (
            <div>
              <h3 className="mb-1 text-sm font-medium text-muted-foreground">Variante</h3>
              <p className="text-sm">{creative.variant_label}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Creado:</span>{' '}
              {new Date(creative.created_at).toLocaleString('es-MX', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </div>
            <div>
              <span className="text-muted-foreground">Actualizado:</span>{' '}
              {new Date(creative.updated_at).toLocaleString('es-MX', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </div>
            {duration && (
              <div>
                <span className="text-muted-foreground">Duración:</span> {duration}s
              </div>
            )}
            {dimensions && (
              <div>
                <span className="text-muted-foreground">Resolución:</span> {dimensions.width}×{dimensions.height}
              </div>
            )}
            {creative.brand_alignment_score != null && (
              <div>
                <span className="text-muted-foreground">Brand Score:</span> {creative.brand_alignment_score.toFixed(1)}/10
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
