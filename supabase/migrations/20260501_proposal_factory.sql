-- Proposal Factory — Supabase migration
-- Creates: opportunities, opportunity_scores, proposal_drafts, proof_points, proposal_packages
-- Run against your Supabase project. Adjust schema/public as needed.

-- ─── opportunities ──────────────────────────────────────────────────────────

create table if not exists public.opportunities (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  lead_id      uuid references public.leads(id) on delete set null,
  initiative_id uuid references public.initiatives(id) on delete set null,
  channel_id   uuid references public.channels(id) on delete set null,
  source       text,
  external_url text,
  title        text not null,
  company_name text,
  description  text,
  budget_min   numeric,
  budget_max   numeric,
  currency     text not null default 'USD',
  status       text not null default 'intake'
               check (status in (
                 'intake','scored','drafting','human_review','ready_to_send',
                 'sent','replied','call_booked','proposal_sent','won','lost','skipped'
               )),
  posted_at    timestamptz,
  deadline_at  timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index idx_opportunities_workspace on public.opportunities(workspace_id);
create index idx_opportunities_status on public.opportunities(workspace_id, status);

alter table public.opportunities enable row level security;

create policy "workspace_isolation" on public.opportunities
  using (workspace_id in (
    select tm.workspace_id from public.team_members tm where tm.user_id = auth.uid()
  ));

-- ─── opportunity_scores ─────────────────────────────────────────────────────

create table if not exists public.opportunity_scores (
  id               uuid primary key default gen_random_uuid(),
  workspace_id     uuid not null references public.workspaces(id) on delete cascade,
  opportunity_id   uuid not null references public.opportunities(id) on delete cascade,
  total_score      int not null,
  icp_fit          int not null default 0,
  problem_fit      int not null default 0,
  budget_fit       int not null default 0,
  proof_match      int not null default 0,
  urgency          int not null default 0,
  authority_signal int not null default 0,
  competition_edge int not null default 0,
  red_flags        text[] not null default '{}',
  recommendation   text,
  model_version    text not null default 'v1',
  created_at       timestamptz not null default now()
);

create index idx_scores_opportunity on public.opportunity_scores(opportunity_id);
create index idx_scores_workspace on public.opportunity_scores(workspace_id);

alter table public.opportunity_scores enable row level security;

create policy "workspace_isolation" on public.opportunity_scores
  using (workspace_id in (
    select tm.workspace_id from public.team_members tm where tm.user_id = auth.uid()
  ));

-- ─── proposal_drafts ────────────────────────────────────────────────────────

create table if not exists public.proposal_drafts (
  id             uuid primary key default gen_random_uuid(),
  workspace_id   uuid not null references public.workspaces(id) on delete cascade,
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  draft_type     text not null
                 check (draft_type in (
                   'cover_letter','application_answer','qwilr_letter',
                   'proposal_scope','proposal_email','follow_up'
                 )),
  variant_name   text,
  angle          text,
  body           text not null,
  score          int,
  selected       boolean not null default false,
  created_by     uuid,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index idx_drafts_opportunity on public.proposal_drafts(opportunity_id);
create index idx_drafts_workspace on public.proposal_drafts(workspace_id);

alter table public.proposal_drafts enable row level security;

create policy "workspace_isolation" on public.proposal_drafts
  using (workspace_id in (
    select tm.workspace_id from public.team_members tm where tm.user_id = auth.uid()
  ));

-- ─── proof_points ───────────────────────────────────────────────────────────

create table if not exists public.proof_points (
  id                uuid primary key default gen_random_uuid(),
  workspace_id      uuid not null references public.workspaces(id) on delete cascade,
  label             text not null,
  metric            text not null,
  client_context    text,
  problem_type      text,
  service_category  text,
  best_fit          text,
  do_not_use_when   text,
  source_note       text,
  active            boolean not null default true
);

create index idx_proof_points_workspace on public.proof_points(workspace_id);
create index idx_proof_points_active on public.proof_points(workspace_id, active) where active = true;

alter table public.proof_points enable row level security;

create policy "workspace_isolation" on public.proof_points
  using (workspace_id in (
    select tm.workspace_id from public.team_members tm where tm.user_id = auth.uid()
  ));

-- ─── proposal_packages ──────────────────────────────────────────────────────

create table if not exists public.proposal_packages (
  id                 uuid primary key default gen_random_uuid(),
  workspace_id       uuid not null references public.workspaces(id) on delete cascade,
  opportunity_id     uuid not null references public.opportunities(id) on delete cascade,
  selected_draft_id  uuid references public.proposal_drafts(id) on delete set null,
  package_status     text not null default 'drafting'
                     check (package_status in ('drafting','ready','sent','follow_up_due','closed')),
  price_recommendation text,
  pricing_notes      text,
  send_gate_status   text not null default 'pending'
                     check (send_gate_status in ('pending','passed','blocked')),
  send_gate_checks   jsonb not null default '{}',
  sent_at            timestamptz,
  follow_up_at       timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index idx_packages_opportunity on public.proposal_packages(opportunity_id);
create index idx_packages_workspace on public.proposal_packages(workspace_id);

alter table public.proposal_packages enable row level security;

create policy "workspace_isolation" on public.proposal_packages
  using (workspace_id in (
    select tm.workspace_id from public.team_members tm where tm.user_id = auth.uid()
  ));

-- ─── updated_at trigger ─────────────────────────────────────────────────────

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at before update on public.opportunities
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.proposal_drafts
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.proposal_packages
  for each row execute function public.handle_updated_at();
