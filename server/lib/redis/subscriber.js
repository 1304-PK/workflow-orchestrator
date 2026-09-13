const createRedisClient = require("../../config/redis");

const redisClient = createRedisClient();

async function subscribe(callback) {
  try {
    if (!redisClient.isReady) {
      await redisClient.connect();
      console.log("Subscriber connected to Redis");
    }

    await redisClient.subscribe("task_event", (message) => {
      try {
        
        callback(message);
      } catch (error) {
        console.error("Failed to process message:", error);
      }
    });

    console.log(`Subscribed to channel: task_event}`);
  } catch (error) {
    console.error("Subscriber failed:", error);
  }
}

module.exports = {
  subscribe
};