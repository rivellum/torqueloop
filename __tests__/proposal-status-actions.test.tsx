import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProposalStatusActions } from '@/components/dashboard/proposal-status-actions'

const refresh = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh }),
}))

describe('ProposalStatusActions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => ({ status: 'human_review' }),
    })))
  })

  it('advances a drafting opportunity to human review when drafts exist', async () => {
    const user = userEvent.setup()

    render(
      <ProposalStatusActions
        opportunityId="opp-1"
        status="drafting"
        draftCount={2}
        hasSelectedDraft={false}
        hasApprovedStrategyLock={false}
        hasApprovedSendGate={false}
      />
    )

    await user.click(screen.getByRole('button', { name: /send to human review/i }))

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/proposals/opportunities/opp-1', expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ status: 'human_review' }),
      }))
      expect(refresh).toHaveBeenCalled()
    })
  })

  it('blocks ready-to-send until Strategy Lock is approved', () => {
    render(
      <ProposalStatusActions
        opportunityId="opp-1"
        status="human_review"
        draftCount={1}
        hasSelectedDraft={true}
        hasApprovedStrategyLock={false}
        hasApprovedSendGate={false}
      />
    )

    expect(screen.getByText('Approve the Strategy Lock review first.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /mark ready to send/i })).toBeDisabled()
  })

  it('blocks sent until a draft is selected and Send Gate is approved', () => {
    render(
      <ProposalStatusActions
        opportunityId="opp-1"
        status="ready_to_send"
        draftCount={1}
        hasSelectedDraft={false}
        hasApprovedStrategyLock={true}
        hasApprovedSendGate={false}
      />
    )

    expect(screen.getByText('Before sending: select a draft and approve the Send Gate review.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /mark as sent/i })).toBeDisabled()
  })
})
