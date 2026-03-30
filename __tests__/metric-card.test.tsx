import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MetricCard } from '@/components/dashboard/metric-card'

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

describe('MetricCard', () => {
  it('renders title and value', () => {
    render(<MetricCard title="Active Campaigns" value={42} />)
    expect(screen.getByText('Active Campaigns')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('renders string value', () => {
    render(<MetricCard title="Status" value="Running" />)
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Running')).toBeInTheDocument()
  })

  it('shows positive trend indicator', () => {
    render(<MetricCard title="Leads" value={100} change={15} trend="up" />)
    expect(screen.getByText('+15%')).toBeInTheDocument()
  })

  it('shows negative trend indicator', () => {
    render(<MetricCard title="Spend" value={500} change={-5} trend="down" />)
    expect(screen.getByText('-5%')).toBeInTheDocument()
  })

  it('renders icon when provided', () => {
    render(
      <MetricCard
        title="Leads"
        value={50}
        icon={<span data-testid="test-icon">📊</span>}
      />
    )
    expect(screen.getByTestId('test-icon')).toBeInTheDocument()
  })

  it('does not show trend when no change provided', () => {
    render(<MetricCard title="Leads" value={50} />)
    // Should not have any trend-related text
    expect(screen.queryByText(/%$/)).not.toBeInTheDocument()
  })
})
