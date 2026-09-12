-- Remove the old lease sweeper
SELECT cron.unschedule('sweep-expired-task-leases');


-- Create new lease sweeper
CREATE OR REPLACE FUNCTION sweep_expired_leases()
RETURNS void AS $$
DECLARE
  task_record RECORD;
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
      updated_at = now()
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

SELECT cron.schedule('sweep-expired-task-leases', '* * * * *', 'SELECT sweep_expired_leases();');