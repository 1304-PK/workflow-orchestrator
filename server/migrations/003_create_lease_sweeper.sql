SELECT cron.schedule(
  'sweep-expired-task-leases',
  '* * * * *',
  $$
    UPDATE tasks_queue
    SET status = CASE
        WHEN attempt_count >= max_attempts THEN 'FAILED'::task_status
        ELSE 'PENDING'::task_status
    END,
    worker_id = NULL,
    lease_expires_at = NULL,
    updated_at = now()
    WHERE status = 'RUNNING'
      AND lease_expires_at < now();
  $$
);