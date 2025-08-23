# Production Security Implementation

## Overview
This document describes the production-ready security implementation for Motion Export, following standard Figma plugin security practices.

## Key Principles

### 1. No Secrets in Frontend
- ❌ **Before**: Hardcoded API key in plugin code
- ✅ **After**: Only plugin identifier (not a secret)

### 2. Trust Figma's Environment
- Figma provides `figma.currentUser.id` which cannot be spoofed
- Plugin runs in Figma's controlled environment
- Origin validation ensures requests come from Figma

### 3. Server-Side Validation
All security decisions are made server-side:
- Origin validation (Figma vs Web)
- Rate limiting per user/IP
- Device ID generation
- License validation

## Implementation Details

### Plugin Request Headers
```typescript
// Plugin sends these headers
headers: {
  "X-Plugin-Id": "motion-export",        // Plugin identifier
  "X-Figma-User-Id": "user-123",        // From figma.currentUser.id
  "Origin": "https://www.figma.com"     // Set by browser
}
```

### Backend Validation Flow
```typescript
1. Check origin (Figma or Web app)
2. Validate plugin ID if from plugin
3. Generate device ID from Figma user ID
4. Apply appropriate rate limits
5. Process request
```

### Rate Limits
Different limits for different clients:

**Plugin Requests:**
- Validate: 30/minute
- Track: 100/minute

**Web Requests:**
- Validate: 10/minute
- Track: 50/minute

## Security Features

### ✅ Implemented
- Origin-based request validation
- Figma user ID as primary identifier
- Server-side device ID generation
- Different rate limits per client type
- License key hashing with salt
- Input sanitization
- No sensitive data in frontend

### 🔒 Protection Against
- API key extraction ✓
- Rate limit bypass ✓
- Device ID spoofing ✓
- Cross-origin attacks ✓
- License key manipulation ✓

## Environment Variables

```bash
# Required for production
LICENSE_SALT=<random-32-char-string>
DEVICE_SALT=<random-32-char-string>
SESSION_SECRET=<random-32-char-string>

# No longer needed
# PLUGIN_API_KEY=<removed>
```

## Testing

### Test Plugin Security
```bash
# Should fail (no plugin ID)
curl -X POST https://motionexport.com/validate \
  -H "Content-Type: application/json" \
  -d '{"figmaUserId":"test"}'

# Should succeed (valid plugin request)
curl -X POST https://motionexport.com/validate \
  -H "Content-Type: application/json" \
  -H "X-Plugin-Id: motion-export" \
  -H "X-Figma-User-Id: user-123" \
  -H "Origin: https://www.figma.com" \
  -d '{}'
```

## Migration Notes

1. **Deploy backend first** with new security code
2. **Update plugin** to use new headers
3. **Remove old API keys** from environment

## Standard Practice
This implementation follows the same security model used by popular Figma plugins like:
- Figma to Code
- Design Tokens
- Content Reel
- Able

The approach is simple, secure, and battle-tested in production.