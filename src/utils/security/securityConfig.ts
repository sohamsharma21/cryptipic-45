/**
 * Security Configuration for CryptiPic Defense Platform
 * Centralized security settings and vulnerability mitigations
 */

export interface SecurityConfig {
  // Development server security
  devServer: {
    allowedHosts: string[];
    disableHostCheck: boolean;
    https: boolean;
  };
  
  // Content Security Policy
  csp: {
    directives: Record<string, string[]>;
    reportOnly: boolean;
  };
  
  // Input validation
  validation: {
    maxFileSize: number;
    allowedFileTypes: string[];
    maxMessageLength: number;
    passwordMinLength: number;
  };
  
  // Rate limiting
  rateLimit: {
    maxAttempts: number;
    windowMs: number;
    blockDurationMs: number;
  };
  
  // Session security
  session: {
    secure: boolean;
    httpOnly: boolean;
    sameSite: 'strict' | 'lax' | 'none';
    maxAge: number;
  };
}

export const SECURITY_CONFIG: SecurityConfig = {
  devServer: {
    allowedHosts: ['localhost', '127.0.0.1'],
    disableHostCheck: false,
    https: false, // Set to true in production
  },
  
  csp: {
    directives: {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Only for development
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'", 'data:', 'blob:'],
      'connect-src': ["'self'", 'https://*.supabase.co'],
      'font-src': ["'self'"],
      'object-src': ["'none'"],
      'media-src': ["'self'"],
      'frame-src': ["'none'"],
    },
    reportOnly: true, // Set to false in production
  },
  
  validation: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedFileTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    maxMessageLength: 10 * 1024, // 10KB
    passwordMinLength: 8,
  },
  
  rateLimit: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 15 * 60 * 1000, // 15 minutes
  },
  
  session: {
    secure: true, // HTTPS only in production
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 12 * 60 * 60 * 1000, // 12 hours
  },
};

/**
 * Security utilities for vulnerability mitigation
 */
export class SecurityUtils {
  /**
   * Sanitize user input to prevent XSS
   */
  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }
  
  /**
   * Validate file upload for security
   */
  static validateFileUpload(file: File): { valid: boolean; error?: string } {
    // Check file type
    if (!SECURITY_CONFIG.validation.allowedFileTypes.includes(file.type)) {
      return { valid: false, error: 'Invalid file type' };
    }
    
    // Check file size
    if (file.size > SECURITY_CONFIG.validation.maxFileSize) {
      return { valid: false, error: 'File too large' };
    }
    
    // Check filename for path traversal
    if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
      return { valid: false, error: 'Invalid filename' };
    }
    
    return { valid: true };
  }
  
  /**
   * Generate secure random token
   */
  static generateSecureToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    
    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length];
    }
    
    return result;
  }
  
  /**
   * Hash password securely
   */
  static async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  /**
   * Validate password strength
   */
  static validatePasswordStrength(password: string): { strong: boolean; score: number; feedback: string[] } {
    const feedback: string[] = [];
    let score = 0;
    
    if (password.length >= SECURITY_CONFIG.validation.passwordMinLength) {
      score += 1;
    } else {
      feedback.push(`Password must be at least ${SECURITY_CONFIG.validation.passwordMinLength} characters long`);
    }
    
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password must contain lowercase letters');
    }
    
    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password must contain uppercase letters');
    }
    
    if (/[0-9]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password must contain numbers');
    }
    
    if (/[^A-Za-z0-9]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password must contain special characters');
    }
    
    return {
      strong: score >= 4,
      score,
      feedback
    };
  }
  
  /**
   * Check for common security vulnerabilities
   */
  static checkForVulnerabilities(): { vulnerabilities: string[]; recommendations: string[] } {
    const vulnerabilities: string[] = [];
    const recommendations: string[] = [];
    
    // Check for development server vulnerabilities
    if (window.location.protocol === 'http:' && window.location.hostname !== 'localhost') {
      vulnerabilities.push('Unencrypted connection detected');
      recommendations.push('Use HTTPS in production');
    }
    
    // Check for insecure content
    if (document.querySelector('script[src^="http:"]')) {
      vulnerabilities.push('Mixed content detected');
      recommendations.push('Use HTTPS for all resources');
    }
    
    // Check for missing security headers
    const metaCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (!metaCSP) {
      vulnerabilities.push('Missing Content Security Policy');
      recommendations.push('Implement CSP headers');
    }
    
    return { vulnerabilities, recommendations };
  }
}

/**
 * Development server security configuration
 * Mitigates esbuild vulnerability in development
 */
export const DEV_SERVER_SECURITY = {
  // Disable host checking only for localhost
  disableHostCheck: false,
  
  // Allow only specific hosts
  allowedHosts: ['localhost', '127.0.0.1'],
  
  // Use HTTPS in production
  https: process.env.NODE_ENV === 'production',
  
  // Additional security headers
  headers: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  },
};

/**
 * Production security recommendations
 */
export const PRODUCTION_SECURITY_RECOMMENDATIONS = [
  'Enable HTTPS with valid SSL certificate',
  'Implement Content Security Policy (CSP)',
  'Use secure session cookies',
  'Enable HTTP Strict Transport Security (HSTS)',
  'Implement rate limiting',
  'Use Web Application Firewall (WAF)',
  'Regular security audits and penetration testing',
  'Keep all dependencies updated',
  'Implement proper error handling without information disclosure',
  'Use environment variables for sensitive configuration',
];
