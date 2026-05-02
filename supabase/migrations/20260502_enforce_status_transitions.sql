-- Enforce status transitions at the DB level
-- Prevents authenticated clients from bypassing workflow via direct PostgREST PATCH
-- Service-role (used by the app layer) can still bypass for admin operations
-- Note: NOT SECURITY DEFINER — current_setting reflects the PostgREST session role

CREATE OR REPLACE FUNCTION public.enforce_opportunity_status_transition()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  allowed_from jsonb := '{"intake":["scored","skipped"],"scored":["drafting","skipped"],"drafting":["human_review"],"human_review":["ready_to_send","drafting","skipped"],"ready_to_send":["sent","human_review"],"sent":["replied","lost"],"replied":["call_booked","lost"],"call_booked":["proposal_sent","lost"],"proposal_sent":["won","lost"],"won":[],"lost":[],"skipped":[]}'::jsonb;
  allowed jsonb;
  _role text;
BEGIN
  IF old.status = new.status THEN RETURN new; END IF;
  _role := coalesce(nullif(current_setting('request.jwt.claim.role', true), ''), current_user);
  IF _role IN ('service_role', 'postgres') THEN RETURN new; END IF;
  allowed := allowed_from->old.status;
  IF allowed IS NULL OR NOT (allowed ? new.status) THEN
    RAISE EXCEPTION 'Invalid status transition: % to %', old.status, new.status USING ERRCODE = 'invalid_parameter_value';
  END IF;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS enforce_status_transition ON public.opportunities;
CREATE TRIGGER enforce_status_transition
  BEFORE UPDATE ON public.opportunities
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_opportunity_status_transition();
