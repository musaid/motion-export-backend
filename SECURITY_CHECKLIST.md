# Production Security Checklist

## Before Deployment

### Environment Variables
- [ ] Set strong `PLUGIN_API_KEY` (not the default)
- [ ] Set unique `LICENSE_SALT` (random 32+ character string)
- [ ] Set secure `ADMIN_PASSWORD`
- [ ] Set proper `SESSION_SECRET`
- [ ] Verify `DATABASE_URL` uses SSL connection
- [ ] Set `NODE_ENV=production`

### Database
- [ ] Run migrations: `npm run db:migrate`
- [ ] Ensure database has SSL enabled
- [ ] Set up database backups
- [ ] Restrict database access to backend only

### API Security
- [ ] Update allowed origins in `security.server.ts` (remove localhost)
- [ ] Verify rate limiting is appropriate for your scale
- [ ] Test API endpoints reject requests without API key
- [ ] Test API endpoints reject requests from unauthorized origins

### Stripe
- [ ] Use production Stripe keys
- [ ] Configure webhook endpoint in Stripe dashboard
- [ ] Test webhook signature verification

### Plugin Configuration
- [ ] Update `API_BASE_URL` in plugin config to production URL
- [ ] Match `API_KEY` in plugin with backend `PLUGIN_API_KEY`
- [ ] Build and test plugin with production settings

## Security Features Implemented

✅ **API Authentication**: All API requests require valid API key
✅ **CORS Protection**: Only allows requests from Figma domains
✅ **Rate Limiting**: Prevents abuse and DoS attacks
✅ **License Key Hashing**: Keys stored as SHA-256 hashes
✅ **Server-side Device ID**: Prevents client manipulation
✅ **Input Validation**: All inputs sanitized and validated
✅ **Minimal Data Collection**: Only essential events tracked
✅ **No Double Counting**: Usage incremented in one place only

## Testing Commands

```bash
# Test API without key (should fail)
curl -X POST https://your-domain.com/api/validate \
  -H "Content-Type: application/json" \
  -d '{"figmaUserId":"test"}'

# Test API with wrong origin (should fail)  
curl -X POST https://your-domain.com/api/validate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -H "Origin: https://evil.com" \
  -d '{"figmaUserId":"test"}'

# Test rate limiting (run multiple times quickly)
for i in {1..50}; do
  curl -X POST https://your-domain.com/api/validate \
    -H "Content-Type: application/json" \
    -H "X-API-Key: your-api-key" \
    -H "Origin: https://www.figma.com" \
    -d '{"figmaUserId":"test"}'
done
```

## Monitoring

- Set up error logging service (e.g., Sentry)
- Monitor API response times
- Track failed authentication attempts
- Monitor database performance
- Set up alerts for unusual activity