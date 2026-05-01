-- Proposal Factory — proposal_outcomes table
-- Tracks business results from sent proposals

create table if not exists public.proposal_outcomes (
  id             uuid primary key default gen_random_uuid(),
  workspace_id   uuid not null references public.workspaces(id) on delete cascade,
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  outcome_type   text not null
                 check (outcome_type in ('replied', 'call_booked', 'proposal_sent', 'won', 'lost')),
  value          numeric,
  currency       text not null default 'USD',
  loss_reason    text,
  notes          text,
  created_at     timestamptz not null default now()
);

create index idx_proposal_outcomes_opportunity on public.proposal_outcomes(opportunity_id);
create index idx_proposal_outcomes_workspace on public.proposal_outcomes(workspace_id);
create index idx_proposal_outcomes_type on public.proposal_outcomes(workspace_id, outcome_type);

alter table public.proposal_outcomes enable row level security;

create policy "workspace_isolation" on public.proposal_outcomes
  using (workspace_id in (
    select tm.workspace_id from public.team_members tm where tm.user_id = auth.uid()
  ));
