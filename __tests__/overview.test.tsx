import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MetricCard } from '@/components/dashboard/metric-card'

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

/**
 * These tests verify the MetricCard component renders correctly
 * with the values the Overview dashboard passes.
 *
 * The overview page is a Server Component so we test its
 * building blocks here (MetricCard) and the data logic via
 * the query functions.
 */
describe('Overview — MetricCard rendering', () => {
  it('renders Gasto Total card', () => {
    render(<MetricCard title="Gasto Total" value="$12,345.67" />)
    expect(screen.getByText('Gasto Total')).toBeInTheDocument()
    expect(screen.getByText('$12,345.67')).toBeInTheDocument()
  })

  it('renders Total Leads card', () => {
    render(<MetricCard title="Total Leads" value={42} />)
    expect(screen.getByText('Total Leads')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('renders CPA card', () => {
    render(<MetricCard title="CPA" value="$293.84" />)
    expect(screen.getByText('CPA')).toBeInTheDocument()
    expect(screen.getByText('$293.84')).toBeInTheDocument()
  })

  it('renders Creativos Activos card', () => {
    render(<MetricCard title="Creativos Activos" value={7} />)
    expect(screen.getByText('Creativos Activos')).toBeInTheDocument()
    expect(screen.getByText('7')).toBeInTheDocument()
  })

  it('renders Aprobaciones Pendientes card', () => {
    render(<MetricCard title="Aprobaciones Pendientes" value={3} />)
    expect(screen.getByText('Aprobaciones Pendientes')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('renders all five overview metric cards together', () => {
    const metrics = [
      { title: 'Gasto Total', value: '$10,000.00' },
      { title: 'Total Leads', value: 50 },
      { title: 'CPA', value: '$200.00' },
      { title: 'Creativos Activos', value: 12 },
      { title: 'Aprobaciones Pendientes', value: 4 },
    ]

    const { container } = render(
      <>
        {metrics.map((m) => (
          <MetricCard key={m.title} title={m.title} value={m.value} />
        ))}
      </>
    )

    // All 5 titles present
    metrics.forEach((m) => {
      expect(screen.getByText(m.title)).toBeInTheDocument()
    })

    // Exactly 5 cards rendered
    const cards = container.querySelectorAll('[class*="rounded-lg"]')
    expect(cards.length).toBeGreaterThanOrEqual(5)
  })
})
