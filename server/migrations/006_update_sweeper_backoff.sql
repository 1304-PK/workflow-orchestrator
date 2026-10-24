-- Update sweep_expired_leases to set next_attempt_at with exponential backoff + jitter.
-- Uses CREATE OR REPLACE so the existing cron schedule keeps firing without re-scheduling.

CREATE OR REPLACE FUNCTION sweep_expired_leases()
RETURNS void AS $$
DECLARE
  task_record RECORD;
  base_delay  NUMERIC := 5;    -- seconds, keep in sync with RETRY_BASE_DELAY_SECONDS
  max_delay   NUMERIC := 300;  -- seconds, keep in sync with RETRY_MAX_DELAY_SECONDS
BEGIN
  FOR task_record IN
    UPDATE tasks_queue
    SET
      status = CASE
        WHEN attempt_count >= max_attempts
          THEN 'FAILED'::task_status
        ELSE 'PENDING'::task_status
      END,
      worker_id = NULL,
      lease_expires_at = NULL,
      updated_at = now(),
      next_attempt_at = CASE
        WHEN attempt_count >= max_attempts THEN NULL
        ELSE now() + (
          LEAST(max_delay, base_delay * POWER(2, attempt_count)) / 2.0
          * (1 + RANDOM())
        ) * interval '1 second'
      END
    WHERE status = 'RUNNING'
      AND lease_expires_at < now()
    RETURNING id, workflow_id, attempt_count, max_attempts
  LOOP
    IF task_record.attempt_count >= task_record.max_attempts THEN
      UPDATE workflows
      SET status = 'FAILED', updated_at = now()
      WHERE id = task_record.workflow_id;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
