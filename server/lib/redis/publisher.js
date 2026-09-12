const createRedisClient = require("../../config/redis")

const redisClient = createRedisClient()

const CHANNEL = "task_event"

const publishMessage = async (payload) => {
    if (!redisClient.isOpen){
        await redisClient.connect()
    }

    await redisClient.publish(
        CHANNEL,
        JSON.stringify(payload)
    )
}

module.exports = {
    publishMessage
}