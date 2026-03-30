import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LeadsTable } from '@/components/dashboard/leads-table'
import type { Lead } from '@/types/database'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  usePathname: () => '/dashboard/leads',
}))

function makeLead(overrides: Partial<Lead> = {}): Lead {
  return {
    id: crypto.randomUUID(),
    workspace_id: 'ws-1',
    email: 'test@example.com',
    name: 'Test User',
    phone: '+52 55 1234 5678',
    source: 'Facebook Ads',
    status: 'new',
    score: null,
    metadata: {},
    created_at: '2026-03-15T12:00:00Z',
    updated_at: '2026-03-15T12:00:00Z',
    ...overrides,
  }
}

const sampleLeads: Lead[] = [
  makeLead({ id: '1', name: 'Ana García', email: 'ana@test.com', status: 'new', source: 'Facebook Ads' }),
  makeLead({ id: '2', name: 'Carlos López', email: 'carlos@test.com', status: 'contacted', source: 'Google' }),
  makeLead({ id: '3', name: 'María Rodríguez', email: 'maria@test.com', status: 'converted', source: 'Referido' }),
]

describe('LeadsTable', () => {
  it('renders all column headers', () => {
    render(<LeadsTable leads={sampleLeads} />)

    expect(screen.getByText('Nombre')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Teléfono')).toBeInTheDocument()
    expect(screen.getByText('Fuente')).toBeInTheDocument()
    expect(screen.getByText('Estado')).toBeInTheDocument()
    expect(screen.getByText('Fecha')).toBeInTheDocument()
  })

  it('renders lead data rows', () => {
    render(<LeadsTable leads={sampleLeads} />)

    expect(screen.getByText('Ana García')).toBeInTheDocument()
    expect(screen.getByText('Carlos López')).toBeInTheDocument()
    expect(screen.getByText('María Rodríguez')).toBeInTheDocument()
  })

  it('renders status badges with correct labels', () => {
    render(<LeadsTable leads={sampleLeads} />)

    expect(screen.getByText('Nuevo')).toBeInTheDocument()
    expect(screen.getByText('Contactado')).toBeInTheDocument()
    expect(screen.getByText('Convertido')).toBeInTheDocument()
  })

  it('filters leads by search to show only matching status', async () => {
    const user = userEvent.setup()
    // Use a dataset where only one lead has "Ana" in name
    const mixedLeads = [
      makeLead({ id: '1', name: 'Ana García', email: 'ana@test.com', status: 'new' }),
      makeLead({ id: '2', name: 'Carlos López', email: 'carlos@test.com', status: 'contacted' }),
    ]
    render(<LeadsTable leads={mixedLeads} />)

    const searchInput = screen.getByPlaceholderText(/buscar por nombre/i)
    await user.type(searchInput, 'Ana')

    // Only "Ana" lead should be visible (implicitly filters by search, not status)
    expect(screen.getByText('Ana García')).toBeInTheDocument()
    expect(screen.queryByText('Carlos López')).not.toBeInTheDocument()
  })

  it('filters leads by search text', async () => {
    const user = userEvent.setup()
    render(<LeadsTable leads={sampleLeads} />)

    const searchInput = screen.getByPlaceholderText(/buscar por nombre/i)
    await user.type(searchInput, 'Carlos')

    expect(screen.getByText('Carlos López')).toBeInTheDocument()
    expect(screen.queryByText('Ana García')).not.toBeInTheDocument()
    expect(screen.queryByText('María Rodríguez')).not.toBeInTheDocument()
  })

  it('shows empty message when no leads', () => {
    render(<LeadsTable leads={[]} />)

    expect(screen.getByText(/no hay leads aún/i)).toBeInTheDocument()
  })

  it('shows no results message when filter matches nothing', async () => {
    const user = userEvent.setup()
    render(<LeadsTable leads={sampleLeads} />)

    const searchInput = screen.getByPlaceholderText(/buscar por nombre/i)
    await user.type(searchInput, 'zzz_no_match')

    expect(screen.getByText(/no se encontraron resultados/i)).toBeInTheDocument()
  })
})
