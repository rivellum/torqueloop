import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginForm from '@/app/login/login-form'

const mockReplace = vi.fn()
const mockRefresh = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: mockReplace, refresh: mockRefresh }),
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('@/app/login/actions', () => ({
  loginWithPassword: vi.fn(),
}))

import { loginWithPassword } from '@/app/login/actions'

const mockLoginWithPassword = vi.mocked(loginWithPassword)

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the login form with Spanish text', () => {
    render(<LoginForm />)

    expect(screen.getByText('Inicia sesión')).toBeInTheDocument()
    expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument()
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument()
  })

  it('renders the TorqueLoop logo', () => {
    render(<LoginForm />)
    expect(screen.getByText('TL')).toBeInTheDocument()
  })

  it('shows loading state while submitting', async () => {
    const user = userEvent.setup()

    mockLoginWithPassword.mockReturnValue(new Promise(() => {}))

    render(<LoginForm />)

    await user.type(screen.getByLabelText('Correo electrónico'), 'test@example.com')
    await user.type(screen.getByLabelText('Contraseña'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(screen.getByText('Entrando...')).toBeInTheDocument()
    })
  })

  it('redirects to the default dashboard after successful submit', async () => {
    const user = userEvent.setup()

    mockLoginWithPassword.mockResolvedValue({ error: null })

    render(<LoginForm />)

    await user.type(screen.getByLabelText('Correo electrónico'), 'user@test.com')
    await user.type(screen.getByLabelText('Contraseña'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/dashboard')
    })
    expect(mockRefresh).toHaveBeenCalled()
  })

  it('shows error state when submit fails', async () => {
    const user = userEvent.setup()

    mockLoginWithPassword.mockResolvedValue({ error: 'Correo o contraseña incorrectos.' })

    render(<LoginForm />)

    await user.type(screen.getByLabelText('Correo electrónico'), 'bad@test.com')
    await user.type(screen.getByLabelText('Contraseña'), 'wrong-password')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(screen.getByText('Correo o contraseña incorrectos.')).toBeInTheDocument()
    })
  })

  it('passes the continuation path to the password login flow', async () => {
    const user = userEvent.setup()

    mockLoginWithPassword.mockResolvedValue({ error: null })

    render(<LoginForm next="/dashboard/proposals" />)

    await user.type(screen.getByLabelText('Correo electrónico'), 'user@test.com')
    await user.type(screen.getByLabelText('Contraseña'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(mockLoginWithPassword).toHaveBeenCalledWith('user@test.com', 'password123')
      expect(mockReplace).toHaveBeenCalledWith('/dashboard/proposals')
    })
  })

  it('disables submit button when credentials are incomplete', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    expect(screen.getByRole('button', { name: 'Entrar' })).toBeDisabled()

    await user.type(screen.getByLabelText('Correo electrónico'), 'user@test.com')
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeDisabled()
  })
})
