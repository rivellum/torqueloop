-- Fix proposal status transition gate checks to use proposal_reviews.status
--
-- PR #17 added DB-level gate enforcement but the trigger function checked a
-- non-existent proposal_reviews.decision column. Re-create the trigger function
-- with the actual proposal_reviews.status column so direct authenticated
-- PostgREST updates are blocked by the intended gates, not by a column error.

CREATE OR REPLACE FUNCTION public.enforce_opportunity_status_transition()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  allowed_from jsonb := '{"intake":["scored","skipped"],"scored":["drafting","skipped"],"drafting":["human_review"],"human_review":["ready_to_send","drafting","skipped"],"ready_to_send":["sent","human_review"],"sent":["replied","lost"],"replied":["call_booked","lost"],"call_booked":["proposal_sent","lost"],"proposal_sent":["won","lost"],"won":[],"lost":[],"skipped":[]}'::jsonb;
  allowed jsonb;
  _role text;
  _has_gate boolean;
BEGIN
  IF old.status = new.status THEN RETURN new; END IF;

  -- Service-role / postgres bypasses all checks for trusted admin/app-layer operations.
  _role := coalesce(nullif(current_setting('request.jwt.claim.role', true), ''), current_user);
  IF _role IN ('service_role', 'postgres') THEN RETURN new; END IF;

  -- 1. Basic transition validity.
  allowed := allowed_from->old.status;
  IF allowed IS NULL OR NOT (allowed ? new.status) THEN
    RAISE EXCEPTION 'Invalid status transition: % to %', old.status, new.status
      USING ERRCODE = 'invalid_parameter_value';
  END IF;

  -- 2. Gate: human_review → ready_to_send requires approved strategy lock review.
  IF new.status = 'ready_to_send' THEN
    SELECT EXISTS(
      SELECT 1 FROM public.proposal_reviews
      WHERE opportunity_id = old.id
        AND review_type = 'proposal_strategy_lock'
        AND status = 'approved'
    ) INTO _has_gate;

    IF NOT _has_gate THEN
      RAISE EXCEPTION 'Cannot move to ready_to_send: approved strategy_lock review required.'
        USING ERRCODE = 'invalid_parameter_value';
    END IF;
  END IF;

  -- 3. Gate: ready_to_send → sent requires approved send gate and a selected draft.
  IF new.status = 'sent' THEN
    SELECT EXISTS(
      SELECT 1 FROM public.proposal_reviews
      WHERE opportunity_id = old.id
        AND review_type = 'proposal_send_gate'
        AND status = 'approved'
    ) INTO _has_gate;

    IF NOT _has_gate THEN
      RAISE EXCEPTION 'Cannot mark as sent: approved send_gate review required.'
        USING ERRCODE = 'invalid_parameter_value';
    END IF;

    SELECT EXISTS(
      SELECT 1 FROM public.proposal_drafts
      WHERE opportunity_id = old.id
        AND selected = true
    ) INTO _has_gate;

    IF NOT _has_gate THEN
      RAISE EXCEPTION 'Cannot mark as sent: at least one selected draft required.'
        USING ERRCODE = 'invalid_parameter_value';
    END IF;
  END IF;

  RETURN new;
END;
$$;
