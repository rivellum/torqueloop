import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const migration = readFileSync(
  join(process.cwd(), 'supabase/migrations/20260505_fix_proposal_status_transition_gate_columns.sql'),
  'utf8'
)

describe('proposal DB transition gate migration', () => {
  it('checks approved proposal reviews using the real status column', () => {
    expect(migration).toContain("review_type = 'proposal_strategy_lock'")
    expect(migration).toContain("review_type = 'proposal_send_gate'")
    expect(migration).toContain("status = 'approved'")
    expect(migration).not.toContain("decision = 'approved'")
  })

  it('enforces selected draft and invalid-skip guards in the DB trigger', () => {
    expect(migration).toContain("selected = true")
    expect(migration).toContain("allowed_from")
    expect(migration).toContain("RAISE EXCEPTION 'Invalid status transition")
    expect(migration).toContain("Cannot mark as sent: at least one selected draft required.")
  })
})
