import Redis from "ioredis";
import config from "../config/config.js";

// Initialize Redis Client with graceful fallback settings
const redis = new Redis({
  host: config.REDIS_HOST || "localhost",
  port: config.REDIS_PORT || 6379,
  password: config.REDIS_PASSWORD || undefined,
  // Limit retries so the app doesn't hang forever if Redis is down
  maxRetriesPerRequest: 1,
  retryStrategy: (times) => {
    // Retry up to 3 times, then give up to avoid crashing the node process
    if (times > 3) {
      console.warn("Redis is persistently down. Caching will be skipped.");
      return null;
    }
    return Math.min(times * 50, 2000);
  }
});

redis.on("error", (err) => {
  console.warn("Redis Error (Cache skipped):", err.message);
});

redis.on("connect", () => {
  console.log("Redis cache connected successfully.");
});

// Helper to get data from cache
export const getCache = async (key) => {
  try {
    if (redis.status === "ready") {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    }
  } catch (err) {
    console.error(`Error reading cache for key ${key}:`, err.message);
  }
  return null;
};

// Helper to set data to cache (default expiry 1 hour)
export const setCache = async (key, value, expireInSeconds = 3600) => {
  try {
    if (redis.status === "ready") {
      await redis.set(key, JSON.stringify(value), "EX", expireInSeconds);
    }
  } catch (err) {
    console.error(`Error setting cache for key ${key}:`, err.message);
  }
};

// Helper to clear a specific cache key
export const invalidateCache = async (key) => {
  try {
    if (redis.status === "ready") {
      await redis.del(key);
    }
  } catch (err) {
    console.error(`Error clearing cache for key ${key}:`, err.message);
  }
};

export default redis;
