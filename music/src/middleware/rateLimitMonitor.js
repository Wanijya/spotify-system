/**
 * Rate Limit Monitoring Middleware
 *
 * Logs rate limit hits for:
 * - Abuse detection
 * - Capacity planning
 * - Security monitoring
 */

export const rateLimitMonitor = (req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;

    if (res.statusCode === 429) {
      const logEntry = {
        timestamp: new Date().toISOString(),
        event: 'RATE_LIMIT_HIT',
        service: 'music',
        port: 3001,
        ip: req.ip || req.connection.remoteAddress,
        path: req.path,
        method: req.method,
        userAgent: req.get('user-agent'),
        responseTime: `${duration}ms`,
        rateLimit: {
          limit: res.getHeader('X-RateLimit-Limit'),
          remaining: res.getHeader('X-RateLimit-Remaining'),
          reset: res.getHeader('X-RateLimit-Reset')
        }
      };

      console.error('RATE_LIMIT_HIT', JSON.stringify(logEntry));
    }
  });

  next();
};

export default rateLimitMonitor;
