# CryptiPic Site-Wide Access Gate System

## Overview

CryptiPic now includes a comprehensive site-wide access gate system that provides enterprise-grade security controls for both web and PWA deployments. The system blocks all access to the application until proper authentication is provided.

## Features

### 🔐 Site-Wide Protection
- Complete application lockdown until authentication
- Server-side session validation via Supabase Edge Functions
- PWA-specific cache protection and offline security
- Session-aware caching strategy

### 🛡️ Security Controls
- Brute force protection with configurable lockout
- IP-based rate limiting and geo-restrictions
- Audit logging for all access attempts
- Session management with automatic expiry
- Role-Based Access Control (RBAC)

### 📱 PWA Support
- Protected content caching only after authentication
- Offline mode respects authentication state
- Automatic cache clearing on logout/expiry
- Service worker-based access control

## Setup Instructions

### 1. Environment Variables

Add these environment variables to your Supabase Edge Functions:

```bash
# Required for passcode validation
CRYPTIPIC_ACCESS_PASSCODE=your-secure-passcode-here

# Supabase credentials (automatically configured in Lovable)
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. Database Tables

The system requires these Supabase tables. Run these SQL commands in your Supabase SQL editor:

```sql
-- Access sessions table
CREATE TABLE access_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_token TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  last_accessed TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  user_role TEXT,
  clearance_level TEXT
);

-- Access attempts audit log
CREATE TABLE access_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  success BOOLEAN NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('passcode', 'auth', 'mfa', 'admin')),
  failure_reason TEXT,
  user_agent TEXT,
  geolocation JSONB
);

-- Brute force protection
CREATE TABLE brute_force_protection (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT UNIQUE NOT NULL,
  attempts INTEGER DEFAULT 0,
  last_attempt TIMESTAMPTZ DEFAULT NOW(),
  locked_until TIMESTAMPTZ
);

-- Enable Row Level Security
ALTER TABLE access_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE brute_force_protection ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX idx_access_sessions_token ON access_sessions(session_token);
CREATE INDEX idx_access_sessions_expires ON access_sessions(expires_at);
CREATE INDEX idx_access_attempts_ip ON access_attempts(ip_address);
CREATE INDEX idx_access_attempts_timestamp ON access_attempts(timestamp DESC);
CREATE INDEX idx_brute_force_ip ON brute_force_protection(ip_address);
```

### 3. Edge Functions Deployment

The following edge functions are automatically deployed with your Supabase integration:

- `validate-passcode` - Validates access passcode
- `validate-session` - Validates active sessions
- `extend-session` - Extends session duration
- `invalidate-session` - Terminates sessions
- `log-access-attempt` - Records access attempts
- `get-audit-logs` - Retrieves audit logs (admin only)
- `clear-brute-force` - Clears brute force locks (admin only)
- `access-middleware` - Middleware for protected routes

### 4. Access Configuration

#### Passcode Mode (Default)
```typescript
const config = {
  enableGate: true,           // Enable the access gate
  useFullAuth: false,         // Use simple passcode
  enableMFA: false,           // No MFA required
  sessionDurationHours: 12,   // Session lasts 12 hours
  maxFailedAttempts: 5,       // Lock after 5 failures
  lockoutDurationMinutes: 15, // 15-minute lockout
  enableIPAllowlist: false,   // No IP restrictions
  enableGeoRestrictions: false // No geo restrictions
};
```

#### Full Authentication Mode
```typescript
const config = {
  enableGate: true,
  useFullAuth: true,          // Use email/password auth
  enableMFA: true,            // Enable MFA
  sessionDurationHours: 8,    // Shorter sessions for security
  maxFailedAttempts: 3,       // Stricter failure limit
  lockoutDurationMinutes: 30, // Longer lockout
  enableIPAllowlist: true,    // Restrict IPs
  enableGeoRestrictions: true // Enable geo blocking
};
```

## Usage

### Basic Access Gate
The access gate is automatically enabled for all routes. Users must authenticate before accessing any protected content.

### Role-Based Access Control
```typescript
// Protect components with role requirements
<ProtectedComponent requiredRole="admin">
  <AdminPanel />
</ProtectedComponent>

// Protect components with clearance requirements
<ProtectedComponent requiredClearance="SECRET">
  <ClassifiedContent />
</ProtectedComponent>

// Check access programmatically
const { checkAccess } = useAccessMiddleware();
const result = await checkAccess({
  requiredRole: 'supervisor',
  requiredClearance: 'CONFIDENTIAL'
});
```

### Admin Configuration
Access the admin panel at `/settings` (requires admin role) to:
- Configure security settings
- View audit logs
- Clear brute force locks
- Manage user sessions

## Security Features

### 1. Brute Force Protection
- Configurable failed attempt limits
- Progressive lockout durations
- IP-based tracking and blocking
- Automatic cleanup of expired locks

### 2. Session Management
- Secure session tokens (UUID + timestamp)
- Server-side session validation
- Automatic session expiry
- Session extension with activity tracking

### 3. Audit Logging
- All access attempts logged with metadata
- IP address, user agent, and timestamp tracking
- Success/failure reasons recorded
- Geographic information (optional)

### 4. PWA Security
- Protected content cached only after authentication
- Automatic cache clearing on logout
- Offline mode respects authentication state
- Service worker enforces access controls

## API Endpoints

### Protected Routes
All routes require valid session tokens:
- `/hide` - Hide messages in images
- `/reveal` - Reveal hidden messages
- `/metadata` - View image metadata
- `/defense` - Defense-grade features
- `/settings` - Configuration panel
- `/dashboard` - User dashboard

### Session Validation
```typescript
// Frontend session check
const { isAuthenticated, session } = useAccess();

// Backend validation via middleware
const result = await fetch('/api/protected-endpoint', {
  headers: {
    'Authorization': `Bearer ${session.sessionToken}`,
    'X-Session-Token': session.sessionToken
  }
});
```

## Troubleshooting

### Common Issues

1. **"Session not found" errors**
   - Check that the `access_sessions` table exists
   - Verify Supabase environment variables are set
   - Ensure edge functions are deployed

2. **Infinite loading on access gate**
   - Check browser console for JavaScript errors
   - Verify service worker registration
   - Clear browser cache and localStorage

3. **Lockout issues**
   - Use admin panel to clear brute force locks
   - Check audit logs for failed attempt patterns
   - Verify IP address detection is working

### Development Mode

To disable the access gate during development:
```typescript
// In AccessContext
const defaultConfig = {
  enableGate: false, // Disable for development
  // ... other settings
};
```

### Password Recovery

For passcode recovery:
1. Access Supabase dashboard
2. Update the `CRYPTIPIC_ACCESS_PASSCODE` environment variable
3. Restart edge functions
4. Clear brute force locks if needed

## Security Considerations

### Production Deployment
- Use strong, randomly generated passcodes (64+ characters)
- Enable HTTPS/TLS for all traffic
- Configure IP allowlists for sensitive deployments
- Enable geographic restrictions as needed
- Regularly rotate access passcodes
- Monitor audit logs for suspicious activity

### Passcode Policy
- Minimum 32 characters for production
- Include uppercase, lowercase, numbers, and symbols
- Avoid dictionary words or predictable patterns
- Store securely in environment variables only
- Never commit passcodes to version control

### Session Security
- Sessions are stateless and validated server-side
- Session tokens are cryptographically random
- Automatic expiry prevents stale sessions
- Activity tracking helps detect session hijacking

## Compliance

This access gate system supports:
- **NIST SP 800-171**: Session timeouts, access controls, audit logging
- **GDPR**: Data protection through access controls and audit trails
- **SOC 2**: Security controls and monitoring capabilities
- **HIPAA**: Administrative safeguards and access controls

## Updates and Maintenance

### Rotating Passcodes
1. Generate new secure passcode
2. Update `CRYPTIPIC_ACCESS_PASSCODE` environment variable
3. Test access with new passcode
4. Notify authorized users of change

### Monitoring
- Review audit logs regularly
- Monitor failed attempt patterns
- Check session usage and expiry rates
- Verify brute force protection effectiveness

### Backup and Recovery
- Export audit logs periodically
- Backup access configuration settings
- Document authorized user lists
- Maintain admin access procedures

## Support

For issues or questions:
1. Check the audit logs for access attempt patterns
2. Review browser console for JavaScript errors
3. Verify Supabase edge function deployment status
4. Check environment variable configuration
5. Contact system administrator for lockout recovery
