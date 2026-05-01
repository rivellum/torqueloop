-- Proposal Factory — proposal_reviews table
-- Extends the approval system for proposal-specific reviews

create table if not exists public.proposal_reviews (
  id             uuid primary key default gen_random_uuid(),
  workspace_id   uuid not null references public.workspaces(id) on delete cascade,
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  review_type    text not null
                 check (review_type in ('proposal_strategy_lock', 'proposal_send_gate')),
  status         text not null default 'pending'
                 check (status in ('pending', 'approved', 'rejected', 'revision_requested')),
  reviewer_id    uuid,
  comments       text,
  checks         jsonb not null default '{}',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index idx_proposal_reviews_opportunity on public.proposal_reviews(opportunity_id);
create index idx_proposal_reviews_workspace on public.proposal_reviews(workspace_id);

alter table public.proposal_reviews enable row level security;

create policy "workspace_isolation" on public.proposal_reviews
  using (workspace_id in (
    select tm.workspace_id from public.team_members tm where tm.user_id = auth.uid()
  ));

create trigger set_updated_at before update on public.proposal_reviews
  for each row execute function public.handle_updated_at();
