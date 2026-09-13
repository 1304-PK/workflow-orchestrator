require("dotenv").config()
const { Pool } = require('pg');

const {publishMessage} = require("../lib/redis/publisher")

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

  if (rows[0]){
    const payload = {
      tasks: [rows[0]],
      workflow: {}
    }

    await publishMessage(payload)

    return rows[0]
  }

  return null
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
      RETURNING *;
      `,
      [result, taskId]
    );

    const { workflow_id } = rows[0];

    const { rows: unblockedTaskRows } = await client.query(
      `
  UPDATE tasks_queue AS task
  SET status = 'PENDING',
      payload = task.payload || COALESCE(
        (
          SELECT jsonb_object_agg(key, value)
          FROM tasks_queue AS dependency,
               jsonb_each(dependency.result)
          WHERE dependency.workflow_id = task.workflow_id
            AND dependency.task_type = ANY(task.depends_on)
            AND dependency.status = 'COMPLETED'
        ),
        '{}'::jsonb
      ),
      updated_at = now()
  WHERE task.workflow_id = $1
    AND task.status = 'WAITING'
    AND NOT EXISTS (
      SELECT 1
      FROM unnest(task.depends_on) AS dependency_type
      WHERE NOT EXISTS (
        SELECT 1
        FROM tasks_queue AS dependency
        WHERE dependency.workflow_id = task.workflow_id
          AND dependency.task_type = dependency_type
          AND dependency.status = 'COMPLETED'
      )
    )
  RETURNING task.*;
  `,
      [workflow_id]
    );

    // if no task exists after this one, the workflow is done
    const { rows: workflowRows } = await client.query(
      `
      UPDATE workflows
      SET status = 'COMPLETED', completed_at = now()
      WHERE id = $1
        AND NOT EXISTS (
          SELECT 1 FROM tasks_queue
          WHERE workflow_id = $1 AND status != 'COMPLETED'
          )
        RETURNING *;
      `,
      [workflow_id]
    );

    await client.query('COMMIT');

    const payload = {
      tasks: [rows[0], ...unblockedTaskRows],
      workflow: workflowRows[0] || {}
    }

    await publishMessage(payload)

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
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const result = await pool.query(
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
    WHERE id = $2
    RETURNING *;
    `,
      [errorMessage, taskId]
    );

    const task = result.rows[0]

    const changedTasks = [task]
    let changedWorkflow = {}

    if (task && task.attempt_count >= task.max_attempts) {
      const { rows: workflowRows } = await client.query(
        `UPDATE workflows
      SET
      status = 'FAILED'::status_enum,
      updated_at = now()
      WHERE id = $1
      RETURNING *
      `,
        [task.workflow_id]
      )

      changedWorkflow = workflowRows[0] || {}
    }

    await client.query('COMMIT')

    await publishMessage({
      tasks: changedTasks,
      workflow: changedWorkflow
    })
  } catch (err) {
    await client.query("ROLLBACK")
    throw err
  } finally {
    client.release();
  }

}

module.exports = { claimTask, heartbeat, completeTask, failTask };