-- TorqueLoop Creative QA / Congruency Engine
-- Add qa_score and qa_scored_at columns to the creatives table
-- Date: 2026-03-30

ALTER TABLE creatives
  ADD COLUMN IF NOT EXISTS qa_score JSONB,
  ADD COLUMN IF NOT EXISTS qa_scored_at TIMESTAMPTZ;

-- Index for filtering scored creatives
CREATE INDEX IF NOT EXISTS idx_creatives_qa_scored_at
  ON creatives (qa_scored_at)
  WHERE qa_scored_at IS NOT NULL;

-- GIN index for querying inside the qa_score JSONB
CREATE INDEX IF NOT EXISTS idx_creatives_qa_score_gin
  ON creatives
  USING GIN (qa_score jsonb_path_ops)
  WHERE qa_score IS NOT NULL;
