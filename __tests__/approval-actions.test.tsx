import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ApprovalActions } from '@/components/dashboard/approval-actions'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

vi.mock('@/lib/supabase-browser', () => ({
  createSupabaseBrowserClient: () => ({
    from: () => ({
      update: () => ({
        eq: () => ({ eq: vi.fn().mockResolvedValue({ error: null }) }),
      }),
    }),
  }),
}))

describe('ApprovalActions', () => {
  const defaultProps = {
    creativeId: 'creative-1',
    workspaceId: 'ws-1',
    currentStatus: 'pending',
  }

  it('renders all three action buttons', () => {
    render(<ApprovalActions {...defaultProps} />)
    expect(screen.getByText('Aprobar')).toBeInTheDocument()
    expect(screen.getByText('Rechazar')).toBeInTheDocument()
    expect(screen.getByText('Solicitar Cambios')).toBeInTheDocument()
  })

  it('renders card title', () => {
    render(<ApprovalActions {...defaultProps} />)
    expect(screen.getByText('Acciones')).toBeInTheDocument()
  })

  it('opens dialog when clicking Aprobar', () => {
    render(<ApprovalActions {...defaultProps} />)
    fireEvent.click(screen.getByText('Aprobar'))
    expect(screen.getByText('Aprobar Creativo')).toBeInTheDocument()
    expect(screen.getByText('Confirmar Aprobación')).toBeInTheDocument()
  })

  it('opens dialog with textarea when clicking Rechazar', () => {
    render(<ApprovalActions {...defaultProps} />)
    fireEvent.click(screen.getByText('Rechazar'))
    expect(screen.getByText('Rechazar Creativo')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Motivo del rechazo/)).toBeInTheDocument()
  })

  it('opens dialog with textarea when clicking Solicitar Cambios', () => {
    render(<ApprovalActions {...defaultProps} />)
    fireEvent.click(screen.getByText('Solicitar Cambios'))
    expect(screen.getAllByText('Solicitar Cambios').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByPlaceholderText(/Describe los cambios/)).toBeInTheDocument()
  })

  it('disables approve button when already approved', () => {
    render(<ApprovalActions {...defaultProps} currentStatus="approved" />)
    expect(screen.getByText('Aprobar')).toBeDisabled()
  })

  it('has cancel button in dialog', () => {
    render(<ApprovalActions {...defaultProps} />)
    fireEvent.click(screen.getByText('Rechazar'))
    expect(screen.getByText('Cancelar')).toBeInTheDocument()
  })
})
