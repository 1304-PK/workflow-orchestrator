-- 1. Enable UUID generation (Supabase usually has this on by default, but explicit is safer)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Define allowed status values as an enum (safer than raw TEXT)
CREATE TYPE task_status AS ENUM (
  'WAITING',
  'PENDING',
  'RUNNING',
  'COMPLETED',
  'FAILED'
);

-- 3. The tasks_queue table itself
CREATE TABLE tasks_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  task_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  result JSONB,
  status task_status NOT NULL DEFAULT 'WAITING',
  sequence_order INT NOT NULL,
  worker_id UUID,
  lease_expires_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT unique_task_order_per_workflow UNIQUE (workflow_id, sequence_order)
);

-- 4. Partial index: only indexes rows that matter for the claim query
CREATE INDEX idx_tasks_queue_pending
  ON tasks_queue (created_at)
  WHERE status = 'PENDING';

-- 5. Index to speed up lease-expiry sweeps
CREATE INDEX idx_tasks_queue_running_lease
  ON tasks_queue (lease_expires_at)
  WHERE status = 'RUNNING';

-- 6. Index for dashboard/debugging queries (all tasks of one workflow, in order)
CREATE INDEX idx_tasks_queue_workflow
  ON tasks_queue (workflow_id, sequence_order);

-- 7. Auto-update `updated_at` on every row change
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_tasks_queue_updated_at
  BEFORE UPDATE ON tasks_queue
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();