'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import { ExternalLink, Megaphone, Globe, Facebook, Chrome } from 'lucide-react'
import type { CampaignWithMetrics } from '@/lib/queries/campaigns'

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  planning: { label: 'Planificación', variant: 'outline' },
  active: { label: 'Activa', variant: 'default' },
  paused: { label: 'Pausada', variant: 'secondary' },
  completed: { label: 'Completada', variant: 'outline' },
  cancelled: { label: 'Cancelada', variant: 'destructive' },
}

const CHANNEL_ICONS: Record<string, React.ReactNode> = {
  meta: <Facebook className="h-3.5 w-3.5" />,
  facebook: <Facebook className="h-3.5 w-3.5" />,
  google: <Chrome className="h-3.5 w-3.5" />,
  tiktok: <Globe className="h-3.5 w-3.5" />,
}

function formatMXN(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString('es-MX')
}

function getChannelUrl(channel: string): string | null {
  switch (channel.toLowerCase()) {
    case 'meta':
    case 'facebook':
      return 'https://business.facebook.com/adsmanager'
    case 'google':
      return 'https://ads.google.com/aw/overview'
    default:
      return null
  }
}

export interface CampaignRowProps {
  campaign: CampaignWithMetrics
}

export function CampaignRow({ campaign }: CampaignRowProps) {
  const statusConfig = STATUS_CONFIG[campaign.status] ?? STATUS_CONFIG.planning

  const cpa =
    campaign.conversions > 0
      ? campaign.spend / campaign.conversions
      : 0

  const primaryChannel = campaign.channels[0] ?? campaign.channel ?? ''

  return (
    <TableRow>
      <TableCell className="font-medium">{campaign.name}</TableCell>
      <TableCell>
        <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
      </TableCell>
      <TableCell>
        {campaign.budget != null ? formatMXN(campaign.budget) : '—'}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5">
          {campaign.channels.length > 0
            ? campaign.channels.map((ch) => (
                <span
                  key={ch}
                  title={ch}
                  className="inline-flex items-center justify-center h-6 w-6 rounded bg-muted"
                >
                  {CHANNEL_ICONS[ch.toLowerCase()] ?? (
                    <Megaphone className="h-3.5 w-3.5" />
                  )}
                </span>
              ))
            : campaign.channel
              ? (
                <span
                  title={campaign.channel}
                  className="inline-flex items-center justify-center h-6 w-6 rounded bg-muted"
                >
                  {CHANNEL_ICONS[campaign.channel.toLowerCase()] ?? (
                    <Megaphone className="h-3.5 w-3.5" />
                  )}
                </span>
              )
              : '—'}
        </div>
      </TableCell>
      <TableCell>
        <div className="text-xs space-y-0.5">
          <div>
            <span className="text-muted-foreground">Impresiones:</span>{' '}
            {formatNumber(campaign.impressions)}
          </div>
          <div>
            <span className="text-muted-foreground">Clicks:</span>{' '}
            {formatNumber(campaign.clicks)}
          </div>
          {cpa > 0 && (
            <div>
              <span className="text-muted-foreground">CPA:</span>{' '}
              {formatMXN(cpa)}
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>
        {primaryChannel && getChannelUrl(primaryChannel) ? (
          <Button variant="ghost" size="sm" asChild>
            <a
              href={getChannelUrl(primaryChannel)!}
              target="_blank"
              rel="noopener noreferrer"
            >
              Ver en{' '}
              {primaryChannel.charAt(0).toUpperCase() + primaryChannel.slice(1)}
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </Button>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </TableCell>
    </TableRow>
  )
}
