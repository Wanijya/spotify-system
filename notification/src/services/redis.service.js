import Redis from "ioredis";
import config from "../config/config.js";

const redisClient = new Redis({
  host: config.REDIS_HOST,
  port: config.REDIS_PORT,
  password: config.REDIS_PASSWORD,
});

redisClient.on("connect", () => {
  console.log("Redis connected to Notification Service");
});

redisClient.on("error", (err) => {
  console.error("Redis Error:", err.message);
});

export default redisClient;