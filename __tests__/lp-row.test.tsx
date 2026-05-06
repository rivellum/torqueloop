import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LPRow } from '@/components/dashboard/lp-row'
import type { LandingPageData } from '@/lib/queries/campaigns'

const baseLP: LandingPageData = {
  id: 'lp-1',
  name: 'LP Recluta Verano',
  slug: 'recluta-verano-2026',
  status: 'published',
  visits: 1250,
  conversions: 87,
  ab_test_status: 'En progreso',
  created_at: '2026-01-01',
}

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

describe('LPRow', () => {
  it('renders landing page name', () => {
    render(
      <table>
        <tbody>
          <LPRow landingPage={baseLP} />
        </tbody>
      </table>
    )
    expect(screen.getByText('LP Recluta Verano')).toBeInTheDocument()
  })

  it('renders slug as a link', () => {
    render(
      <table>
        <tbody>
          <LPRow landingPage={baseLP} />
        </tbody>
      </table>
    )
    const slugLink = screen.getByText('/lp/recluta-verano-2026')
    expect(slugLink).toBeInTheDocument()
    expect(slugLink.closest('a')).toHaveAttribute('href', '/lp/recluta-verano-2026')
    expect(slugLink.closest('a')).toHaveAttribute('target', '_blank')
  })

  it('calculates conversion rate correctly', () => {
    render(
      <table>
        <tbody>
          <LPRow landingPage={baseLP} />
        </tbody>
      </table>
    )
    // 87 / 1250 * 100 = 6.96 → 7.0%
    expect(screen.getByText('7.0%')).toBeInTheDocument()
  })

  it('renders zero conversion rate when no visits', () => {
    render(
      <table>
        <tbody>
          <LPRow landingPage={{ ...baseLP, visits: 0, conversions: 0 }} />
        </tbody>
      </table>
    )
    expect(screen.getByText('0.0%')).toBeInTheDocument()
  })

  it('renders status badge for published LP', () => {
    render(
      <table>
        <tbody>
          <LPRow landingPage={baseLP} />
        </tbody>
      </table>
    )
    expect(screen.getByText('Publicada')).toBeInTheDocument()
  })

  it('renders status badge for draft LP', () => {
    render(
      <table>
        <tbody>
          <LPRow landingPage={{ ...baseLP, status: 'draft' }} />
        </tbody>
      </table>
    )
    expect(screen.getByText('Borrador')).toBeInTheDocument()
  })

  it('renders visits and conversions counts', () => {
    render(
      <table>
        <tbody>
          <LPRow landingPage={baseLP} />
        </tbody>
      </table>
    )
    expect(screen.getByText('1,250')).toBeInTheDocument()
    expect(screen.getByText('87')).toBeInTheDocument()
  })

  it('renders A/B test status', () => {
    render(
      <table>
        <tbody>
          <LPRow landingPage={baseLP} />
        </tbody>
      </table>
    )
    expect(screen.getByText('En progreso')).toBeInTheDocument()
  })

  it('renders dash when no A/B test', () => {
    render(
      <table>
        <tbody>
          <LPRow landingPage={{ ...baseLP, ab_test_status: null }} />
        </tbody>
      </table>
    )
    const cells = screen.getAllByText('—')
    expect(cells.length).toBeGreaterThan(0)
  })

  it('renders Ver LP button linking to LP page', () => {
    render(
      <table>
        <tbody>
          <LPRow landingPage={baseLP} />
        </tbody>
      </table>
    )
    const link = screen.getByRole('link', { name: /Ver LP/i })
    expect(link).toHaveAttribute('href', '/lp/recluta-verano-2026')
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('highlights conversion rate green when above 5%', () => {
    const highConverting: LandingPageData = {
      ...baseLP,
      visits: 100,
      conversions: 10, // 10%
    }
    render(
      <table>
        <tbody>
          <LPRow landingPage={highConverting} />
        </tbody>
      </table>
    )
    const rate = screen.getByText('10.0%')
    expect(rate.className).toContain('text-emerald-600')
  })
})
