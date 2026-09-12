const express = require("express")
const pool = require("../config/pgPool")

const router = express.Router()

router.get("/:taskId/retry", async (req, res) => {
    const { taskId } = req.params
    const client = await pool.connect()

    try {
        await client.query("BEGIN")

        // Lock the task row so another transaction cannot modify it
        // while we are checking its status and performing the retry.
        const { rows } = await client.query(
            `
            SELECT id, workflow_id, status
            FROM tasks_queue
            WHERE id = $1
            FOR UPDATE
            `,
            [taskId]
        )

        if (rows.length === 0) {
            await client.query("ROLLBACK")

            return res.status(404).json({
                errMsg: "Task not found"
            })
        }

        const task = rows[0]

        if (task.status !== "FAILED") {
            await client.query("ROLLBACK")

            return res.status(400).json({
                errMsg: "Task doesn't have failed status"
            })
        }

        // Reset the task so it can be retried.
        const taskUpdate = await client.query(
            `
            UPDATE tasks_queue
            SET
                status = 'PENDING',
                error = NULL,
                attempt_count = 0
            WHERE id = $1
            `,
            [taskId]
        )

        if (taskUpdate.rowCount !== 1) {
            throw new Error("Failed to update task")
        }

        // Set the associated workflow back to RUNNING.
        const workflowUpdate = await client.query(
            `
            UPDATE workflows
            SET status = 'RUNNING'
            WHERE id = $1
            `,
            [task.workflow_id]
        )

        if (workflowUpdate.rowCount !== 1) {
            throw new Error("Failed to update workflow")
        }

        // Both updates succeeded.
        await client.query("COMMIT")

        return res.status(200).json({
            msg: "Task set to retry successfully"
        })
    } catch (err) {
        // If anything failed, undo every database operation
        // performed inside this transaction.
        try {
            await client.query("ROLLBACK")
        } catch (rollbackError) {
            console.error("Rollback failed:", rollbackError)
        }

        console.error("Retry task failed:", err)

        return res.status(500).json({
            errMsg: err.message
        })
    } finally {
        // Always return the client to the pool.
        client.release()
    }
})

module.exports = router