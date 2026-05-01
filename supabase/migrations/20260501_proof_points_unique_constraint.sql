-- Add unique constraint on proof_points(workspace_id, label) for idempotent seeding
alter table public.proof_points add constraint proof_points_workspace_label_unique unique (workspace_id, label);
