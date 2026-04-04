/**
 * Rate Limiting Configuration for Music Service
 *
 * Purpose:
 * - Allow frequent playback operations (streaming needs)
 * - Limit uploads to prevent storage/bandwidth abuse
 * - Protect playlist operations
 *
 * More permissive than auth service - UX focused
 */

export const rateLimitConfig = {
  // Global fallback limit
  global: {
    windowMs: 15 * 60 * 1000,  // 15 minutes
    maxRequests: 100,
    message: "Too many requests, please try again later"
  },

  // Music upload - STRICT (bandwidth/storage protection)
  upload: {
    windowMs: 60 * 60 * 1000,   // 1 hour
    maxRequests: 10,             // 10 uploads per hour
    message: "Too many uploads, please try again after 1 hour"
  },

  // Music streaming/playback - PERMISSIVE (core functionality)
  stream: {
    windowMs: 15 * 60 * 1000,   // 15 minutes
    maxRequests: 300,            // 300 playback operations
    message: "Too many playback requests, please slow down"
  },

  // Get music by ID - moderate (caching should reduce load)
  getMusic: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 100,
    message: "Too many music requests"
  },

  // Artist music - moderate
  artistMusic: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 50,
    message: "Too many requests"
  },

  // Playlist operations - moderate
  playlist: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 50,             // 50 playlist operations
    message: "Too many playlist operations, please try again later"
  },

  // Get playlist - lighter limit
  getPlaylist: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 100,
    message: "Too many playlist requests"
  },

  // Presigned URLs - moderate (S3 cost protection)
  presignedUrl: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 50,
    message: "Too many URL requests"
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
