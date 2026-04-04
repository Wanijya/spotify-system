/**
 * Rate Limiting Configuration for Notification Service
 *
 * Purpose:
 * - Prevent email spam
 * - Protect WebSocket connections
 * - Limit sync events to prevent abuse
 *
 * Email limits are strict (cost + reputation)
 */

export const rateLimitConfig = {
  // Global fallback limit
  global: {
    windowMs: 15 * 60 * 1000,  // 15 minutes
    maxRequests: 100,
    message: "Too many requests, please try again later"
  },

  // Email sending - VERY STRICT (cost + sender reputation)
  email: {
    windowMs: 60 * 60 * 1000,   // 1 hour
    maxRequests: 5,              // 5 emails per hour per user
    message: "Too many email requests, please try again after 1 hour"
  },

  // Socket.IO connections - moderate
  socket: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 50,
    message: "Too many connection attempts"
  },

  // Sync events - moderate (real-time feature)
  sync: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 100,
    message: "Too many sync events"
  },

  // Play events - permissive (core feature)
  play: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 100,
    message: "Too many play events"
  }
};

/**
 * Helper function to create rate limiter options
 */
export const createLimiter = (config) => ({
  windowMs: config.windowMs,
  max: config.maxRequests,
  message: {
    error: config.message,
    retryAfterMs: config.windowMs
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: config.message,
      retryAfter: Math.ceil(config.windowMs / 1000),
      rateLimit: {
        limit: config.maxRequests,
        resetIn: config.windowMs
      }
    });
  }
});

export default rateLimitConfig;
