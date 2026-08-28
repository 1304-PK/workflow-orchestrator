// Entire code for the worker. Run multiple instances for multiple workers.
const { claimTask, heartbeat, completeTask, failTask } = require("./workerFunctions.js")
const crypto = require("crypto")

const order_fulfillment_tasks = require("../tasks/order_fulfillment.js")

const workerId = crypto.randomUUID()

const main = async () => {
    console.log(`Worker initiated with id: ${workerId}. Polling...`)

    let task = null;

    while (true) {
        try {
            task = await claimTask()

            if (!task) {
                console.log("Couldn't find active task.")
                await new Promise(resolve => setTimeout(resolve, 1000))
                continue;
            }

            console.log(`Picked up task with task id: ${task.id}`)

            const taskResult = await order_fulfillment_tasks[task.task_type]()

            if (!taskResult.success) {
                await failTask(task.id, taskResult.error)
                console.log(`Task failed with id: ${task.id}`)
                continue;
            }

            await completeTask(task.id, JSON.stringify(taskResult))
            console.log(`Task completed with id: ${task.id}`)
        }

        catch (err) {
            console.log(`Worker with id ${workerId} faced error: ${err.message}`)

            if (task){
                try{
                    await failTask(task.id, err.message)
                }
                catch(cleanUpErr){
                    console.log(`Task cleanup failed for task: ${task.id}: ${cleanUpErr.message}`)
                }
            }

        }
    }
}

main()