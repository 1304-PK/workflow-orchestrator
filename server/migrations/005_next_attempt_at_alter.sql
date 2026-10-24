-- Add column next attempt at

ALTER TABLE tasks_queue
ADD COLUMN next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Index so claimTask's WHERE clause on next_attempt_at is fast
-- (combined with the existing PENDING partial index logic)

CREATE INDEX idx_tasks_queue_next_attempt
  ON tasks_queue (next_attempt_at)
  WHERE status = 'PENDING';