require("dotenv").config()

 const getTaskStatus = async () => {
  await new Promise(resolve => setTimeout(resolve, (process.env.TASK_INTERVAL_MS || 5000)))
  return Math.random() < 1;
}

module.exports = getTaskStatus;