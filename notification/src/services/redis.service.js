import Redis from "ioredis";
import config from "../config/config.js";

const redisSubscriber = new Redis({
  host: config.REDIS_HOST,
  port: config.REDIS_PORT,
  password: config.REDIS_PASSWORD,
});

redisSubscriber.on("connect", () => {
  console.log("Redis Subscriber connected to Notification Service");
});

export default redisSubscriber;
