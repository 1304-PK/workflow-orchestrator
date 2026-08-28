require("dotenv").config()
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres.lwufoqgmyclrmqkibcay',
  password: String(process.env.SUPABASE_DB_PASS),
  host: "aws-0-ap-southeast-1.pooler.supabase.com",
  port: 5432,
  database: 'postgres',
  max: 5
});


async function claimTask(workerId) {
  const { rows } = await pool.query(
    `
    UPDATE tasks_queue
    SET status = 'RUNNING',
        worker_id = $1,
        lease_expires_at = now() + interval '30 seconds',
        updated_at = now(),
        attempt_count = COALESCE(attempt_count, 0) + 1
    WHERE id = (
      SELECT id FROM tasks_queue
      WHERE status = 'PENDING'
      ORDER BY created_at
      FOR UPDATE SKIP LOCKED
      LIMIT 1
    )
    RETURNING *;
    `,
    [workerId]
  );

  return rows[0] || null;
}


async function heartbeat(taskId, workerId) {
  await pool.query(
    `
    UPDATE tasks_queue
    SET lease_expires_at = now() + interval '30 seconds',
        updated_at = now()
    WHERE id = $1 AND worker_id = $2 AND status = 'RUNNING';
    `,
    [taskId, workerId]
  );
}

/**
 * Marks a task as completed, stores its result,
 * and unblocks the next task in the workflow (WAITING -> PENDING).
 */
async function completeTask(taskId, result) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      `
      UPDATE tasks_queue
      SET status = 'COMPLETED',
          result = $1,
          worker_id = NULL,
          lease_expires_at = NULL,
          updated_at = now(),
          error = NULL
      WHERE id = $2
      RETURNING workflow_id, sequence_order;
      `,
      [result, taskId]
    );

    const { workflow_id, sequence_order } = rows[0];

    await client.query(
      `
      UPDATE tasks_queue
      SET status = 'PENDING', updated_at = now()
      WHERE workflow_id = $1
        AND sequence_order = $2 + 1
        AND status = 'WAITING';
      `,
      [workflow_id, sequence_order]
    );

    // if no task exists after this one, the workflow is done
    await client.query(
      `
      UPDATE workflows
      SET status = 'COMPLETED', completed_at = now()
      WHERE id = $1
        AND NOT EXISTS (
          SELECT 1 FROM tasks_queue
          WHERE workflow_id = $1 AND status != 'COMPLETED'
        );
      `,
      [workflow_id]
    );

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Marks a task as failed and records the error.
 */
async function failTask(taskId, errorMessage) {
  await pool.query(
    `
    UPDATE tasks_queue
    SET status = CASE
      WHEN attempt_count >= max_attempts THEN 'FAILED'::task_status
      ELSE 'PENDING'::task_status
      END,
        error = $1,
        worker_id = NULL,
        lease_expires_at = NULL,
        updated_at = now()
    WHERE id = $2;
    `,
    [errorMessage, taskId]
  );
}

module.exports = { claimTask, heartbeat, completeTask, failTask };