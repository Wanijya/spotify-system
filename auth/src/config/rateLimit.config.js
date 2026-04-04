/**
 * Rate Limiting Configuration for Auth Service
 *
 * Purpose:
 * - Prevent brute force attacks on authentication endpoints
 * - Prevent spam registrations
 * - Protect OAuth endpoints from abuse
 *
 * All values are designed for security-first approach
 */

export const rateLimitConfig = {
  // Global fallback limit (catches all undefined routes)
  global: {
    windowMs: 15 * 60 * 1000,  // 15 minutes
    maxRequests: 100,
    message: "Too many requests, please try again later"
  },

  // Authentication endpoints - STRICT limits for security
  login: {
    windowMs: 15 * 60 * 1000,   // 15 minutes
    maxRequests: 5,              // 5 login attempts per window
    message: "Too many login attempts, please try again after 15 minutes"
  },

  register: {
    windowMs: 60 * 60 * 1000,   // 1 hour
    maxRequests: 3,              // 3 registrations per hour
    message: "Too many registration attempts, please try again after 1 hour"
  },

  googleOAuth: {
    windowMs: 15 * 60 * 1000,   // 15 minutes
    maxRequests: 10,             // 10 OAuth attempts
    message: "Too many OAuth attempts, please try again later"
  },

  // User profile endpoints - moderate limits
  profile: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 30,
    message: "Too many profile requests"
  },

  logout: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 10,
    message: "Too many logout requests"
  },

  // Password reset endpoints - STRICT limits to prevent abuse & email enumeration
  forgotPassword: {
    windowMs: 15 * 60 * 1000,   // 15 minutes
    maxRequests: 3,              // 3 requests per window (prevents email spam)
    message: "Too many password reset requests, please try again after 15 minutes"
  },

  resetPassword: {
    windowMs: 15 * 60 * 1000,   // 15 minutes
    maxRequests: 5,              // 5 attempts per window (moderate for token validation)
    message: "Too many password reset attempts, please try again after 15 minutes"
  }
};

/**
 * Helper function to create rate limiter options
 * Includes standard headers for client-side handling
 */
export const createLimiter = (config) => ({
  windowMs: config.windowMs,
  max: config.maxRequests,
  message: {
    error: config.message,
    retryAfterMs: config.windowMs
  },
  standardHeaders: true,    // Return rate limit info in headers
  legacyHeaders: false,     // Disable X-RateLimit-* legacy headers
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
