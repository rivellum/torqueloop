-- Fix infinite recursion in team_members RLS policy
-- Root cause: team_members policy self-references team_members, causing infinite recursion
-- Solution: create a security_definer function to bypass RLS for workspace lookups

-- 1. Create helper function (bypasses RLS)
create or replace function public.get_user_workspace_ids()
returns setof uuid
language sql
security definer
set search_path = public
stable
as $$
  select workspace_id from team_members where user_id = auth.uid();
$$;

-- 2. Drop broken team_members policy
drop policy if exists team_member_access on public.team_members;

-- 3. Recreate team_members policy using the function
create policy "team_member_access" on public.team_members
  for select using (workspace_id in (select public.get_user_workspace_ids()));

-- 4. Update proposal table policies to use the function
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'opportunities', 'opportunity_scores', 'proposal_drafts',
    'proof_points', 'proposal_packages', 'proposal_reviews', 'proposal_outcomes'
  ]) LOOP
    EXECUTE format('drop policy if exists workspace_isolation on public.%I', t);
    EXECUTE format('create policy workspace_isolation on public.%I for all using (workspace_id in (select public.get_user_workspace_ids()))', t);
  END LOOP;
END $$;

-- 5. Also fix leads and workspaces policies
drop policy if exists leads_access on public.leads;
drop policy if exists workspace_isolation on public.leads;
create policy "leads_access" on public.leads
  for all using (workspace_id in (select public.get_user_workspace_ids()));

drop policy if exists workspace_access on public.workspaces;
create policy "workspace_access" on public.workspaces
  for select using (id in (select public.get_user_workspace_ids()));
