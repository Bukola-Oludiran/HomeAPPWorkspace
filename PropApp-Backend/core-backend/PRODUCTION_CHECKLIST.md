# Production Deployment Checklist

This checklist ensures the HomeAI backend is production-ready with proper security, error handling, and configuration.

---

## 🔒 Security

### Authentication & Authorization
- [ ] Generate strong `JWT_SECRET` (min 256-bit)
- [ ] Set short `JWT_EXPIRES_IN` (15m recommended)
- [ ] Configure `JWT_REFRESH_EXPIRES_IN` appropriately (7d max)
- [ ] Enable rate limiting on auth endpoints
- [ ] Configure CORS with exact frontend domain (no wildcards)

### Secrets Management
- [ ] Store all secrets in environment variables (never in code)
- [ ] Use secret manager (AWS Secrets Manager, HashiCorp Vault)
- [ ] Rotate API keys before production launch
- [ ] Remove any hardcoded test credentials

### Headers & HTTPS
- [ ] Enable HTTPS only (redirect HTTP)
- [ ] Configure security headers (Helmet.js)
- [ ] Set secure cookie flags (`httpOnly`, `secure`, `sameSite`)

---

## ⚙️ Environment Configuration

### Required Environment Variables
```env
# Server
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://user:pass@host:5432/homeai_prod

# Redis (sessions, caching, rate limiting)
REDIS_URL=redis://host:6379

# JWT
JWT_SECRET=<strong-256-bit-secret>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Frontend CORS
FRONTEND_URL=https://homeai.ng

# Payment (REQUIRED for production)
PAYSTACK_SECRET_KEY=sk_live_xxx
PAYSTACK_PUBLIC_KEY=pk_live_xxx

# Identity Verification (REQUIRED for production)
SMILE_IDENTITY_API_KEY=xxx
SMILE_IDENTITY_PARTNER_ID=xxx

# Storage (REQUIRED for production)
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_S3_BUCKET=homeai-uploads-prod
AWS_REGION=eu-west-1

# Communication
TWILIO_ACCOUNT_SID=xxx
TWILIO_AUTH_TOKEN=xxx
SENDGRID_API_KEY=xxx
FCM_SERVER_KEY=xxx

# OAuth (if enabled)
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
```

### Verify No Mock Fallbacks in Production
- [ ] Set `NODE_ENV=production`
- [ ] Factories should throw errors (not fall back to mocks) when credentials missing

**Update factory pattern for production:**
```typescript
// In production, fail fast instead of using mocks
if (env.NODE_ENV === 'production' && !env.PAYSTACK_SECRET_KEY) {
    throw new Error('PAYSTACK_SECRET_KEY required in production');
}
```

---

## 🛡️ Error Handling

### Global Error Handler
- [ ] Sanitize error messages (no stack traces to clients)
- [ ] Log full errors server-side with correlation IDs
- [ ] Return consistent error format per PRD Appendix B

### Service-Level Error Handling
- [ ] Wrap all external API calls in try-catch
- [ ] Implement retry logic with exponential backoff
- [ ] Set timeouts on all HTTP requests (10s default)
- [ ] Handle rate limits from third-party APIs

### Database Error Handling
- [ ] Handle connection pool exhaustion
- [ ] Implement transaction rollbacks on failure
- [ ] Handle unique constraint violations gracefully

---

## 📊 Logging & Monitoring

### Logging
- [ ] Configure Winston for production (JSON format)
- [ ] Set log level to `info` (not `debug`)
- [ ] Include correlation IDs in all logs
- [ ] Mask sensitive data (passwords, tokens)
- [ ] Ship logs to centralized service (CloudWatch, Datadog)

### Monitoring
- [ ] Set up health check endpoint (`/health`)
- [ ] Configure uptime monitoring (UptimeRobot, Pingdom)
- [ ] Set up APM (Application Performance Monitoring)
- [ ] Configure alerting for errors and latency

### Metrics
- [ ] Track API response times
- [ ] Monitor database query performance
- [ ] Track payment success/failure rates
- [ ] Monitor third-party API latencies

---

## 🗄️ Database

### PostgreSQL Setup
- [ ] Use managed PostgreSQL (AWS RDS, DigitalOcean, Supabase)
- [ ] Enable SSL connections
- [ ] Configure connection pooling (PgBouncer or built-in)
- [ ] Set up automated backups (daily minimum)
- [ ] Test backup restoration procedure

### Migrations
- [ ] Run all migrations before deployment
- [ ] Verify migration rollback scripts work
- [ ] Do NOT run seed in production

### Indexes
- [ ] Verify indexes exist for common queries
- [ ] Add indexes for foreign keys
- [ ] Monitor slow query logs

---

## 🚀 Performance

### Caching
- [ ] Configure Redis for session storage
- [ ] Cache frequently accessed data (property listings)
- [ ] Implement cache invalidation strategy

### Rate Limiting
- [ ] Configure rate limits per endpoint
- [ ] Higher limits for authenticated users
- [ ] Stricter limits for auth endpoints

### Connection Limits
- [ ] Set database connection pool limits
- [ ] Configure Redis connection pool
- [ ] Set HTTP keep-alive timeouts

---

## 🔌 Third-Party Integrations

### Payment (Paystack)
- [ ] Use live API keys (not test keys)
- [ ] Configure webhook URL and secret
- [ ] Test payment flow end-to-end
- [ ] Set up webhook signature verification

### Identity Verification (Smile Identity)
- [ ] Use production API credentials
- [ ] Configure callback URLs
- [ ] Test verification flow end-to-end

### Storage (AWS S3)
- [ ] Configure bucket policies (private by default)
- [ ] Enable server-side encryption
- [ ] Set up CDN (CloudFront) for media delivery
- [ ] Configure CORS for direct uploads

### Communication
- [ ] Verify sender domains (SendGrid, Twilio)
- [ ] Test email delivery to major providers
- [ ] Configure SMS sender ID

---

## 📦 Deployment

### Pre-Deployment
- [ ] Run `npm run build` successfully
- [ ] Run `npm test` with all tests passing
- [ ] Run `npx tsc --noEmit` with no errors
- [ ] Review and test all environment variables

### Deployment Steps
```bash
# 1. Build
npm run build

# 2. Run migrations
npm run prisma:migrate:deploy

# 3. Start server
npm start
```

### Post-Deployment
- [ ] Verify health endpoint responds
- [ ] Test critical user flows (register, login, payment)
- [ ] Check logs for errors
- [ ] Verify webhooks are receiving events

---

## 🧪 Testing

### Pre-Production Testing
- [ ] Load testing (Artillery, k6)
- [ ] Security scan (OWASP ZAP, Snyk)
- [ ] Penetration testing (if applicable)
- [ ] API contract testing

### Staging Environment
- [ ] Deploy to staging first
- [ ] Test with production-like data
- [ ] Verify all integrations work

---

## 📋 Files to Update for Production

| File | Changes Needed |
|------|----------------|
| `src/integrations/*/index.ts` | Fail fast if credentials missing |
| `src/common/middleware/error.ts` | Sanitize error responses |
| `src/config/env.ts` | Mark production-required vars |
| `src/index.ts` | Remove development-only routes |
| `.env` | All production credentials |

---

## 🚨 Do NOT Deploy Until

1. ✅ All REQUIRED environment variables are set
2. ✅ Database migrations are applied
3. ✅ Payment integration tested with live credentials
4. ✅ Identity verification tested end-to-end
5. ✅ CORS configured for production frontend URL
6. ✅ SSL/HTTPS configured
7. ✅ Logging and monitoring in place
8. ✅ Backup strategy verified

---

## Version History

| Date | Version | Notes |
|------|---------|-------|
| 2024-01-08 | 1.0 | Initial checklist |
