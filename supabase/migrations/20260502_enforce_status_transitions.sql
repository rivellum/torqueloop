-- Enforce status transitions AND gate conditions at the DB level
-- Prevents authenticated clients from bypassing workflow via direct PostgREST PATCH
-- Service-role (used by the app layer) can still bypass for admin operations
--
-- Gate enforcement:
--   human_review → ready_to_send  requires approved proposal_strategy_lock review
--   ready_to_send → sent          requires approved proposal_send_gate review
--                                  AND at least one selected proposal_draft

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

  -- Service-role / postgres bypasses all checks (app-layer admin operations)
  _role := coalesce(nullif(current_setting('request.jwt.claim.role', true), ''), current_user);
  IF _role IN ('service_role', 'postgres') THEN RETURN new; END IF;

  -- 1. Check basic transition validity
  allowed := allowed_from->old.status;
  IF allowed IS NULL OR NOT (allowed ? new.status) THEN
    RAISE EXCEPTION 'Invalid status transition: % to %', old.status, new.status
      USING ERRCODE = 'invalid_parameter_value';
  END IF;

  -- 2. Gate: human_review → ready_to_send requires approved strategy_lock
  IF new.status = 'ready_to_send' THEN
    SELECT EXISTS(
      SELECT 1 FROM public.proposal_reviews
      WHERE opportunity_id = old.id
        AND review_type = 'proposal_strategy_lock'
        AND decision = 'approved'
    ) INTO _has_gate;
    IF NOT _has_gate THEN
      RAISE EXCEPTION 'Cannot move to ready_to_send: approved strategy_lock review required.'
        USING ERRCODE = 'invalid_parameter_value';
    END IF;
  END IF;

  -- 3. Gate: ready_to_send → sent requires approved send_gate + selected draft
  IF new.status = 'sent' THEN
    -- Check for approved send_gate review
    SELECT EXISTS(
      SELECT 1 FROM public.proposal_reviews
      WHERE opportunity_id = old.id
        AND review_type = 'proposal_send_gate'
        AND decision = 'approved'
    ) INTO _has_gate;
    IF NOT _has_gate THEN
      RAISE EXCEPTION 'Cannot mark as sent: approved send_gate review required.'
        USING ERRCODE = 'invalid_parameter_value';
    END IF;

    -- Check for at least one selected draft
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

DROP TRIGGER IF EXISTS enforce_status_transition ON public.opportunities;
CREATE TRIGGER enforce_status_transition
  BEFORE UPDATE ON public.opportunities
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_opportunity_status_transition();
