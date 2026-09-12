// Entire code for the worker. Run multiple instances for multiple workers.
const { claimTask, heartbeat, completeTask, failTask } = require("./workerFunctions.js")
const crypto = require("crypto")

require("dotenv").config()

const TASKS = require("../tasks/index.js")


const temptask = require("./temp.js")

const workerId = crypto.randomUUID()

const heartbeatInterval = Number(process.env.HEARTBEAT_INTERVAL_MS) || 15000

const main = async () => {
    console.log(`Worker initiated with id: ${workerId}. Polling...`)
    
    while (true) {
        let task = null;
        let hbInterval = null
        try {
            task = await claimTask(workerId)

            if (!task) {
                console.log("Couldn't find active task.")
                await new Promise(resolve => setTimeout(resolve, 1000))
                continue;
            }

            console.log(`\nPicked up task with task id: ${task.id} and NAME: ${task.task_type}\n`)

            hbInterval = setInterval(async () => {
                await heartbeat(task.id, workerId)
            }, heartbeatInterval);
            
            const result = await TASKS[task.task_type](task.payload)

            
            if (result.success){
            await completeTask(task.id, JSON.stringify(result.result))
            console.log(`\nTask completed with id: ${task.id}, NAME: ${task.task_type}\n`)
            }

            else{
                await failTask(task.id, result.error)
                console.log(`Task failed with id: ${task.id}, NAME: ${task.task_type}\n`)
            }
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
        finally{
            clearInterval(hbInterval)
        }
    }
}

main()