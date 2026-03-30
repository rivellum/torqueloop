import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CreativeCard } from '@/components/dashboard/creative-card'
import type { Creative } from '@/types/database'

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

const baseCreative: Creative = {
  id: '1',
  workspace_id: 'ws-1',
  initiative_id: null,
  type: 'ad',
  title: 'Test Creative',
  content: null,
  status: 'review',
  generated_by: 'ai',
  metadata: {},
  created_at: '2026-03-01T00:00:00Z',
  updated_at: '2026-03-01T00:00:00Z',
}

describe('CreativeCard', () => {
  it('renders title', () => {
    render(<CreativeCard creative={baseCreative} />)
    expect(screen.getByText('Test Creative')).toBeInTheDocument()
  })

  it('renders status badge with review label', () => {
    render(<CreativeCard creative={baseCreative} />)
    expect(screen.getByText('En Revisión')).toBeInTheDocument()
  })

  it('renders approved badge', () => {
    render(<CreativeCard creative={{ ...baseCreative, status: 'approved' }} />)
    expect(screen.getByText('Aprobado')).toBeInTheDocument()
  })

  it('renders draft badge', () => {
    render(<CreativeCard creative={{ ...baseCreative, status: 'draft' }} />)
    expect(screen.getByText('Borrador')).toBeInTheDocument()
  })

  it('renders approval badge over creative status', () => {
    render(
      <CreativeCard
        creative={{ ...baseCreative, status: 'review' }}
        approval={{
          id: 'a1',
          workspace_id: 'ws-1',
          creative_id: '1',
          status: 'rejected',
          reviewer_id: null,
          comments: null,
          created_at: '',
          updated_at: '',
        }}
      />,
    )
    expect(screen.getByText('Rechazado')).toBeInTheDocument()
  })

  it('renders QA score when provided', () => {
    render(<CreativeCard creative={baseCreative} qaScore={8.5} />)
    expect(screen.getByText('QA: 8.5/10')).toBeInTheDocument()
  })

  it('does not render QA score when null', () => {
    render(<CreativeCard creative={baseCreative} qaScore={null} />)
    expect(screen.queryByText(/QA:/)).not.toBeInTheDocument()
  })

  it('links to creative detail page', () => {
    render(<CreativeCard creative={baseCreative} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/dashboard/creatives/1')
  })

  it('renders formatted date', () => {
    render(<CreativeCard creative={baseCreative} />)
    expect(screen.getByText(/1 mar/)).toBeInTheDocument()
  })
})
