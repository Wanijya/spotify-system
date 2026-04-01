# Rate Limiting Documentation

## Overview

This document defines rate limits for the Spotify System microservices architecture. Rate limiting serves four key purposes:

1. **Prevent abuse and DDoS attacks** - Limit requests from malicious actors
2. **Ensure fair resource allocation** - Prevent single users from monopolizing resources
3. **Protect authentication endpoints** - Prevent brute force and credential stuffing attacks
4. **Enable capacity planning** - Predict infrastructure needs based on known limits

---

## Architecture

Each service implements rate limiting using `express-rate-limit` with:
- **Global fallback limits** - Applied to all routes by default
- **Route-specific limits** - Override global limits for specific endpoints
- **Monitoring middleware** - Logs all 429 responses for analysis

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────┐
│   Request   │────▶│   Global    │────▶│  Route-Specific │
│             │     │   Limit     │     │  Limit (if any) │
└─────────────┘     └─────────────┘     └─────────────────┘
                           │                    │
                           ▼                    ▼
                    ┌─────────────────────────────────┐
                    │     Rate Limit Monitor          │
                    │  (logs 429 responses to console)│
                    └─────────────────────────────────┘
```

---

## Configuration Reference

### Auth Service (Port 3000)

| Endpoint | Limit | Window | Max Requests/Hour | Purpose |
|----------|-------|--------|-------------------|---------|
| `POST /api/auth/login` | 5 | 15 min | 20 | Brute force prevention |
| `POST /api/auth/register` | 3 | 60 min | 3 | Spam prevention |
| `GET /api/auth/google/*` | 10 | 15 min | 40 | OAuth abuse prevention |
| `GET /api/auth/me` | 30 | 15 min | 120 | Profile access |
| `POST /api/auth/logout` | 10 | 15 min | 40 | Logout flood prevention |
| **All other routes** | **100** | **15 min** | **400** | **Default protection** |

**Why these values:**
- Login: 5 attempts per 15 min = allows legitimate users but blocks brute force (typical password has ~65 bits of entropy, 5 attempts makes cracking infeasible)
- Register: 3 per hour prevents spam accounts while allowing genuine signups
- OAuth: Higher limit because redirects may fail due to user cancellation

---

### Music Service (Port 3001)

| Endpoint | Limit | Window | Max Requests/Hour | Purpose |
|----------|-------|--------|-------------------|---------|
| `POST /api/music/upload` | 10 | 60 min | 10 | Bandwidth/storage protection |
| `GET /api/music/` | 100 | 15 min | 400 | Music library browsing |
| `GET /api/music/get-details/:id` | 100 | 15 min | 400 | Music details (cached) |
| `GET /api/music/artist-musics` | 50 | 15 min | 200 | Artist dashboard |
| `POST /api/music/playlist` | 50 | 15 min | 200 | Playlist creation |
| `GET /api/music/playlist/*` | 100 | 15 min | 400 | Playlist retrieval |

**Why these values:**
- Upload: 10/hour = allows artists to upload albums without excessive S3 costs
- Streaming: 300/15min = supports ~20 playback operations per minute (play, pause, seek, skip)
- Playlist: Moderate limits for CRUD operations

---

### Notification Service (Port 3002)

| Endpoint | Limit | Window | Max Requests/Hour | Purpose |
|----------|-------|--------|-------------------|---------|
| `POST /*email*` | 5 | 60 min | 5 | Email cost + reputation |
| `Socket.IO connections` | 50 | 15 min | 200 | Connection flood prevention |
| `Sync events` | 100 | 15 min | 400 | Real-time sync |
| `Play events` | 100 | 15 min | 400 | Playback notifications |
| **All other routes** | **100** | **15 min** | **400** | **Default protection** |

**Why these values:**
- Email: Very strict due to SMTP costs and sender reputation
- Socket: Higher limits for real-time features (core functionality)

---

## Response Format

When a client exceeds the rate limit, they receive:

### HTTP Response
```
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 100
X-RateLimit-Reset: 1617712800
Retry-After: 900
Content-Type: application/json

{
  "error": "Too many requests, please try again later",
  "retryAfter": 900,
  "rateLimit": {
    "limit": 100,
    "resetIn": 900000
  }
}
```

### Response Headers
| Header | Description |
|--------|-------------|
| `X-RateLimit-Limit` | Maximum requests allowed in window |
| `X-RateLimit-Reset` | Unix timestamp when limit resets |
| `Retry-After` | Seconds to wait before retrying |

---

## Client Implementation Guide

### Handling 429 Responses

```javascript
// Frontend example (axios)
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'];
      const resetIn = error.response.data?.rateLimit?.resetIn;

      // Show user-friendly message
      toast.error(
        `Too many requests. Please wait ${Math.ceil(retryAfter / 60)} minutes.`
      );

      // Implement exponential backoff
      return new Promise((_, reject) => {
        setTimeout(() => reject(error), retryAfter * 1000);
      });
    }
    return Promise.reject(error);
  }
);
```

### Best Practices

1. **Check headers before errors** - Monitor `X-RateLimit-Remaining` to preemptively slow down
2. **Implement exponential backoff** - Start with 1s, double each retry (1s, 2s, 4s, 8s...)
3. **Cache aggressively** - Reduce API calls by caching responses
4. **Debounce user actions** - Don't fire API calls on every keystroke/click

---

## Monitoring

### Log Format

Rate limit hits are logged as JSON:

```json
{
  "timestamp": "2026-04-01T12:00:00.000Z",
  "event": "RATE_LIMIT_HIT",
  "service": "auth",
  "port": 3000,
  "ip": "192.168.1.100",
  "path": "/api/auth/login",
  "method": "POST",
  "userAgent": "Mozilla/5.0...",
  "responseTime": "45ms",
  "rateLimit": {
    "limit": 5,
    "remaining": 0,
    "reset": 1617712800
  }
}
```

### Production Monitoring

In production, logs should be shipped to:
- **CloudWatch** (AWS)
- **DataDog** (APM + Logs)
- **Sentry** (Error tracking)

### Alerting Thresholds

| Metric | Threshold | Action |
|--------|-----------|--------|
| 429 responses > 1% of total | Warning | Review limits |
| 429 responses > 5% of total | Critical | Scale or adjust limits |
| Same IP hitting limits 10+ times | Alert | Potential abuse, consider IP ban |

---

## Configuration Files

| Service | Config File |
|---------|-------------|
| Auth | `auth/src/config/rateLimit.config.js` |
| Music | `music/src/config/rateLimit.config.js` |
| Notification | `notification/src/config/rateLimit.config.js` |

### Updating Rate Limits

1. Edit the appropriate `rateLimit.config.js` file
2. Update this documentation to match
3. Deploy changes
4. Monitor 429 rates for 24-48 hours
5. Adjust if necessary

---

## Security Considerations

### IP-Based Limiting

Current implementation uses IP-based rate limiting. This means:
- **NAT networks** (offices, schools) share a limit
- **Mobile networks** may have many users behind one IP
- **CDN/Proxy** users all appear as one IP

### Recommended Enhancements

For production, consider:

1. **User-based limiting** (after authentication)
   ```javascript
   keyGenerator: (req) => req.user?.id || req.ip
   ```

2. **Redis store** (for distributed services)
   ```javascript
   import RedisStore from 'rate-limit-redis'
   store: new RedisStore({ client: redisClient })
   ```

3. **Geographic limits** (stricter in high-abuse regions)

4. **Progressive limits** (stricter after repeated violations)

---

## Troubleshooting

### "I'm getting 429 errors too quickly"

1. Check which endpoint you're hitting
2. Verify your request rate (add logging)
3. Implement request queuing
4. Add caching layer

### "Legitimate users are being blocked"

1. Check if user is behind NAT (shared IP)
2. Consider implementing user-based limiting
3. Increase limits for authenticated users
4. Add whitelist for premium users

### "How do I test rate limiting locally?"

```bash
# Quick test with curl
for i in {1..10}; do
  curl -v http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"test"}'
done
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-04-01 | Initial implementation with route-specific limits |
