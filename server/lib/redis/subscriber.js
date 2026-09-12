const createRedisClient = require("../../conig/redis");

const CHANNEL = "task_event";

const redisClient = createRedisClient();

async function subscribeToMessages() {
  await redisClient.connect();

  console.log("Subscriber connected to Redis");


  await redisClient.subscribe(CHANNEL, (message) => {
    try {
      const payload = JSON.parse(message);

      console.log("Received message:", payload);
    } catch (error) {
      console.error("Failed to parse message:", error);
    }
  });

  console.log(`Subscribed to channel: ${CHANNEL}`);
}

subscribeToMessages().catch((error) => {
  console.error("Subscriber failed:", error);
}); 