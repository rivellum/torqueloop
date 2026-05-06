import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CampaignRow } from '@/components/dashboard/campaign-row'
import type { CampaignWithMetrics } from '@/lib/queries/campaigns'

const baseCampaign: CampaignWithMetrics = {
  id: '1',
  workspace_id: 'ws-1',
  name: 'Campaña Verano 2026',
  description: null,
  status: 'active',
  start_date: null,
  end_date: null,
  budget: 50000,
  channel: 'meta',
  channels: ['meta', 'google'],
  impressions: 150000,
  clicks: 3200,
  conversions: 85,
  spend: 28500,
  created_at: '2026-01-01',
  updated_at: '2026-01-01',
}

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

describe('CampaignRow', () => {
  it('renders campaign name', () => {
    render(
      <table>
        <tbody>
          <CampaignRow campaign={baseCampaign} />
        </tbody>
      </table>
    )
    expect(screen.getByText('Campaña Verano 2026')).toBeInTheDocument()
  })

  it('renders budget in MXN format', () => {
    render(
      <table>
        <tbody>
          <CampaignRow campaign={baseCampaign} />
        </tbody>
      </table>
    )
    // 50000 should be formatted as $50,000
    expect(screen.getByText('$50,000')).toBeInTheDocument()
  })

  it('renders status badge for active campaign', () => {
    render(
      <table>
        <tbody>
          <CampaignRow campaign={baseCampaign} />
        </tbody>
      </table>
    )
    expect(screen.getByText('Activa')).toBeInTheDocument()
  })

  it('renders status badge for paused campaign', () => {
    render(
      <table>
        <tbody>
          <CampaignRow campaign={{ ...baseCampaign, status: 'paused' }} />
        </tbody>
      </table>
    )
    expect(screen.getByText('Pausada')).toBeInTheDocument()
  })

  it('renders status badge for cancelled campaign', () => {
    render(
      <table>
        <tbody>
          <CampaignRow campaign={{ ...baseCampaign, status: 'cancelled' }} />
        </tbody>
      </table>
    )
    expect(screen.getByText('Cancelada')).toBeInTheDocument()
  })

  it('renders dash when budget is null', () => {
    render(
      <table>
        <tbody>
          <CampaignRow campaign={{ ...baseCampaign, budget: null }} />
        </tbody>
      </table>
    )
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('renders impression and click counts', () => {
    render(
      <table>
        <tbody>
          <CampaignRow campaign={baseCampaign} />
        </tbody>
      </table>
    )
    expect(screen.getByText(/150.0K/)).toBeInTheDocument()
    expect(screen.getByText(/3.2K/)).toBeInTheDocument()
  })

  it('renders CPA when conversions exist', () => {
    render(
      <table>
        <tbody>
          <CampaignRow campaign={baseCampaign} />
        </tbody>
      </table>
    )
    // CPA = 28500 / 85 = ~335.29
    expect(screen.getByText(/CPA/)).toBeInTheDocument()
  })

  it('renders external link to Meta', () => {
    render(
      <table>
        <tbody>
          <CampaignRow campaign={baseCampaign} />
        </tbody>
      </table>
    )
    const link = screen.getByRole('link', { name: /Ver en Meta/i })
    expect(link).toHaveAttribute('href', 'https://business.facebook.com/adsmanager')
    expect(link).toHaveAttribute('target', '_blank')
  })
})
