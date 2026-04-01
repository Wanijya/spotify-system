# Capacity Planning Document

## Overview

This document provides calculations for infrastructure sizing based on rate limiting configuration. Use this to:
- Size server instances
- Plan database connections
- Estimate bandwidth needs
- Set scaling triggers

---

## Rate Limits Summary

### Maximum Requests Per User Per Hour

| Service | Endpoint Category | Max Requests/Hour |
|---------|-------------------|-------------------|
| **Auth** | Login | 20 |
| | Register | 3 |
| | OAuth | 40 |
| | Profile | 120 |
| **Music** | Upload | 10 |
| | Stream/Browse | 400 |
| | Playlist | 200-400 |
| **Notification** | Email | 5 |
| | Sync Events | 400 |

### Theoretical Maximum Load

Assuming a single user hitting ALL limits simultaneously (worst case):

```
Auth:       20 + 3 + 40 + 120 = 183 req/hr
Music:      10 + 400 + 400    = 810 req/hr
Notification: 5 + 400         = 405 req/hr
-----------------------------------------
Total:      1,398 requests/hour per user
```

**Realistic estimate** (normal user behavior):
- Auth: 10 req/hr (login once, occasional profile check)
- Music: 200 req/hr (browsing + playback)
- Notification: 50 req/hr (occasional sync)
- **Total: ~260 requests/hour per active user**

---

## Infrastructure Sizing

### Scenario: 1,000 Concurrent Users

#### Request Volume

| Metric | Calculation | Result |
|--------|-------------|--------|
| Requests/hour | 1,000 users × 260 req/hr | 260,000 req/hr |
| Requests/minute | 260,000 / 60 | ~4,333 req/min |
| Requests/second | 260,000 / 3,600 | ~72 req/sec |

#### Recommended Capacity (2x buffer)

| Metric | Recommended |
|--------|-------------|
| Peak requests/second | **150 req/sec** |
| Requests/minute | **9,000 req/min** |
| Requests/hour | **520,000 req/hr** |

---

### Scenario: 10,000 Concurrent Users

#### Request Volume

| Metric | Calculation | Result |
|--------|-------------|--------|
| Requests/hour | 10,000 users × 260 req/hr | 2,600,000 req/hr |
| Requests/minute | 2,600,000 / 60 | ~43,333 req/min |
| Requests/second | 2,600,000 / 3,600 | ~722 req/sec |

#### Recommended Capacity (2x buffer)

| Metric | Recommended |
|--------|-------------|
| Peak requests/second | **1,500 req/sec** |
| Requests/minute | **90,000 req/min** |
| Requests/hour | **5,200,000 req/hr** |

---

## Database Connection Pool Sizing

### MongoDB Atlas

Each service maintains its own connection pool. Recommended sizing:

| Service | Connections/Instance | Instances | Total Connections |
|---------|---------------------|-----------|-------------------|
| Auth | 50 | 2 | 100 |
| Music | 100 | 3 | 300 |
| Notification | 50 | 2 | 100 |
| **Total** | | | **500** |

**Formula:**
```
Connections per instance = (Max Requests/sec per instance) × 2
Minimum pool size = 10 connections
Maximum pool size = calculated value
```

### MongoDB Atlas Tier Recommendation

| User Count | Recommended Tier | Reason |
|------------|------------------|--------|
| < 1,000 | M10 (Shared RAM) | Low traffic |
| 1,000-10,000 | M30 (4GB RAM) | Moderate traffic |
| 10,000-100,000 | M50 (16GB RAM) | High traffic |
| > 100,000 | Sharded Cluster | Scale horizontally |

---

## Bandwidth Estimates

### Upload Traffic (Music Service)

| Metric | Value |
|--------|-------|
| Max uploads/user/hour | 10 |
| Average file size | 5 MB |
| Users (scenario) | 1,000 |
| **Upload bandwidth/hour** | **50 GB/hour** |
| **Upload bandwidth/second** | **~14 MB/sec (112 Mbps)** |

### Download Traffic (Presigned URLs)

| Metric | Value |
|--------|-------|
| Avg music file | 5 MB |
| Presigned URL limit | 50/15min = 200/hour |
| Estimated actual streams | 20/hour/user |
| **Download bandwidth/hour** | **100 GB/hour (1,000 users)** |

### AWS S3 Cost Estimate

| Metric | 1,000 Users | 10,000 Users |
|--------|-------------|--------------|
| Storage/month | 500 GB | 5,000 GB |
| Upload/month | 50 GB | 500 GB |
| Download/month | 1,000 GB | 10,000 GB |
| **Estimated cost** | **~$30/month** | **~$300/month** |

---

## Redis Sizing (Notification Service)

### Memory Requirements

| Data Type | Size/Entry | Entries | Total |
|-----------|------------|---------|-------|
| Sync state | 1 KB | 1,000 | 1 MB |
| Session data | 500 B | 1,000 | 500 KB |
| Rate limit counters | 100 B | 10,000 | 1 MB |
| **Total** | | | **~3 MB** |

**Recommended:** Redis Labs 30MB free tier is sufficient for 1,000 users

---

## Scaling Triggers

### Horizontal Scaling (Add More Instances)

| Metric | Warning | Critical | Action |
|--------|---------|----------|--------|
| CPU utilization | > 70% | > 85% | Add instance |
| Memory utilization | > 75% | > 90% | Add instance |
| Request latency (p95) | > 300ms | > 500ms | Add instance |
| 429 responses | > 2% | > 5% | Add instance or increase limits |

### Vertical Scaling (Upgrade Instance)

| Metric | Warning | Critical | Action |
|--------|---------|----------|--------|
| Database connections | > 80% of pool | > 95% | Increase pool or upgrade tier |
| Redis memory | > 70% | > 90% | Upgrade Redis plan |

### Auto-Scaling Configuration (AWS ECS Example)

```json
{
  "autoScaling": {
    "minCapacity": 2,
    "maxCapacity": 10,
    "targetCPU": 70,
    "targetMemory": 75,
    "scaleInCooldown": 300,
    "scaleOutCooldown": 60
  }
}
```

---

## Load Testing Guidelines

### k6 Load Test Script

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '5m', target: 100 },   // Ramp to 100 users
    { duration: '10m', target: 100 },  // Stay at 100 users
    { duration: '5m', target: 500 },   // Ramp to 500 users
    { duration: '10m', target: 500 },  // Stay at 500 users
    { duration: '5m', target: 1000 },  // Ramp to 1000 users
    { duration: '10m', target: 1000 }, // Stay at 1000 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% under 500ms
    http_req_failed: ['rate<0.01'],    // < 1% failures
  },
};

export default function () {
  // Test login endpoint (strictest limit)
  const loginRes = http.post('http://localhost:3000/api/auth/login', {
    email: 'test@test.com',
    password: 'password123',
  });

  check(loginRes, {
    'login status is 200 or 429': (r) =>
      r.status === 200 || r.status === 429,
  });

  sleep(1);
}
```

### Success Criteria

| Metric | Target |
|--------|--------|
| p95 latency | < 500ms |
| p99 latency | < 1000ms |
| Error rate | < 1% |
| 429 rate | < 5% |

---

## Cost Estimates (Monthly)

### Infrastructure Costs (1,000 users)

| Service | Provider | Tier | Cost/Month |
|---------|----------|------|------------|
| MongoDB Atlas | MongoDB | M30 | $60 |
| Redis Labs | Redis | 30MB | Free |
| CloudAMQP | CloudAMQP | Lemur | Free |
| AWS S3 | AWS | Standard | ~$30 |
| **Total** | | | **~$90/month** |

### Infrastructure Costs (10,000 users)

| Service | Provider | Tier | Cost/Month |
|---------|----------|------|------------|
| MongoDB Atlas | MongoDB | M50 | $189 |
| Redis Labs | Redis | 100MB | $9 |
| CloudAMQP | CloudAMQP | Tiger | $79 |
| AWS S3 | AWS | Standard | ~$300 |
| **Total** | | | **~$577/month** |

---

## Monitoring Dashboard

### Key Metrics to Track

1. **Request Rate**
   - Requests/second (per service)
   - Requests/minute (per endpoint)

2. **Error Rates**
   - 429 responses (rate limit hits)
   - 500 responses (server errors)
   - 401/403 responses (auth failures)

3. **Latency**
   - p50, p95, p99 response times
   - Database query times
   - External API times (S3, OAuth)

4. **Resource Utilization**
   - CPU per service
   - Memory per service
   - Database connections
   - Redis memory

### Grafana Dashboard Panels

```
Panel 1: Request Rate (requests/second)
Panel 2: 429 Rate (% of total requests)
Panel 3: p95 Latency (ms)
Panel 4: Error Rate (%)
Panel 5: CPU Utilization (%)
Panel 6: Memory Utilization (%)
Panel 7: Database Connections (active/max)
Panel 8: Active Users (estimated)
```

---

## Emergency Procedures

### When 429 Rate Spikes > 10%

1. **Immediate:** Check if it's an attack or legitimate traffic
2. **If attack:** Enable WAF rules, consider temporary IP bans
3. **If legitimate:** Scale horizontally (add instances)
4. **Long-term:** Adjust rate limits or implement user-based limiting

### When Latency > 1s

1. Check database connection pool saturation
2. Check Redis memory usage
3. Check external API latency (S3, OAuth)
4. Consider caching more aggressively

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-04-01 | Initial capacity planning based on rate limit config |
