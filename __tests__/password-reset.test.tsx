import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ForgotPasswordForm from '@/app/forgot-password/forgot-password-form'
import ResetPasswordForm from '@/app/reset-password/reset-password-form'

const mockRefresh = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}))

vi.mock('@/app/forgot-password/actions', () => ({
  sendPasswordReset: vi.fn(),
}))

vi.mock('@/app/reset-password/actions', () => ({
  setRecoveryPassword: vi.fn(),
}))

import { sendPasswordReset } from '@/app/forgot-password/actions'
import { setRecoveryPassword } from '@/app/reset-password/actions'

const mockSendPasswordReset = vi.mocked(sendPasswordReset)
const mockSetRecoveryPassword = vi.mocked(setRecoveryPassword)

describe('Password recovery forms', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('requests a password recovery email', async () => {
    const user = userEvent.setup()
    mockSendPasswordReset.mockResolvedValue({ error: null })

    render(<ForgotPasswordForm />)

    await user.type(screen.getByLabelText('Correo electrónico'), 'User@Test.com')
    await user.click(screen.getByRole('button', { name: 'Enviar enlace de recuperación' }))

    await waitFor(() => {
      expect(mockSendPasswordReset).toHaveBeenCalledWith('User@Test.com')
      expect(screen.getByText(/recibirás un enlace/)).toBeInTheDocument()
    })
  })

  it('requires matching passwords before updating recovery password', async () => {
    const user = userEvent.setup()
    render(<ResetPasswordForm />)

    await user.type(screen.getByLabelText('Nueva contraseña'), 'password123')
    await user.type(screen.getByLabelText('Confirma tu contraseña'), 'different123')
    await user.click(screen.getByRole('button', { name: 'Guardar contraseña' }))

    expect(await screen.findByText('Las contraseñas no coinciden.')).toBeInTheDocument()
    expect(mockSetRecoveryPassword).not.toHaveBeenCalled()
  })

  it('sets the recovery password when both entries match', async () => {
    const user = userEvent.setup()
    mockSetRecoveryPassword.mockResolvedValue({ error: null })

    render(<ResetPasswordForm />)

    await user.type(screen.getByLabelText('Nueva contraseña'), 'password123')
    await user.type(screen.getByLabelText('Confirma tu contraseña'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Guardar contraseña' }))

    await waitFor(() => {
      expect(mockSetRecoveryPassword).toHaveBeenCalledWith('password123')
      expect(screen.getByText('Contraseña guardada. Ya puedes ir al dashboard.')).toBeInTheDocument()
    })
    expect(mockRefresh).toHaveBeenCalled()
  })
})
