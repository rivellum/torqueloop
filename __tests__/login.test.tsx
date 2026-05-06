import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from '@/app/login/page'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

// Mock the server action
vi.mock('@/app/login/actions', () => ({
  sendMagicLink: vi.fn(),
}))

import { sendMagicLink } from '@/app/login/actions'

const mockSendMagicLink = vi.mocked(sendMagicLink)

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the login form with Spanish text', () => {
    render(<LoginPage />)

    expect(screen.getByText('Inicia sesión')).toBeInTheDocument()
    expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Enviar enlace mágico' })
    ).toBeInTheDocument()
  })

  it('renders the TorqueLoop logo', () => {
    render(<LoginPage />)
    expect(screen.getByText('TL')).toBeInTheDocument()
  })

  it('shows loading state while submitting', async () => {
    const user = userEvent.setup()

    // Never-resolving promise to keep loading state
    mockSendMagicLink.mockReturnValue(new Promise(() => {}))

    render(<LoginPage />)

    await user.type(screen.getByLabelText('Correo electrónico'), 'test@example.com')
    await user.click(screen.getByRole('button', { name: 'Enviar enlace mágico' }))

    await waitFor(() => {
      expect(screen.getByText('Enviando...')).toBeInTheDocument()
    })
  })

  it('shows success state after successful submit', async () => {
    const user = userEvent.setup()

    mockSendMagicLink.mockResolvedValue({ error: null })

    render(<LoginPage />)

    await user.type(screen.getByLabelText('Correo electrónico'), 'user@test.com')
    await user.click(screen.getByRole('button', { name: 'Enviar enlace mágico' }))

    await waitFor(() => {
      expect(screen.getByText('Revisa tu correo')).toBeInTheDocument()
    })

    expect(
      screen.getByText(/Te enviamos un enlace a/)
    ).toBeInTheDocument()
    expect(screen.getByText('user@test.com')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Usar otro correo' })
    ).toBeInTheDocument()
  })

  it('shows error state when submit fails', async () => {
    const user = userEvent.setup()

    mockSendMagicLink.mockResolvedValue({ error: 'Correo no válido' })

    render(<LoginPage />)

    await user.type(screen.getByLabelText('Correo electrónico'), 'bad@test.com')
    await user.click(screen.getByRole('button', { name: 'Enviar enlace mágico' }))

    await waitFor(() => {
      expect(screen.getByText('Correo no válido')).toBeInTheDocument()
    })
  })

  it('resets form when "Usar otro correo" is clicked', async () => {
    const user = userEvent.setup()

    mockSendMagicLink.mockResolvedValue({ error: null })

    render(<LoginPage />)

    await user.type(screen.getByLabelText('Correo electrónico'), 'user@test.com')
    await user.click(screen.getByRole('button', { name: 'Enviar enlace mágico' }))

    await waitFor(() => {
      expect(screen.getByText('Revisa tu correo')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Usar otro correo' }))

    expect(screen.getByText('Inicia sesión')).toBeInTheDocument()
    expect(screen.getByLabelText('Correo electrónico')).toHaveValue('')
  })

  it('disables submit button when email is empty', () => {
    render(<LoginPage />)
    expect(
      screen.getByRole('button', { name: 'Enviar enlace mágico' })
    ).toBeDisabled()
  })
})
