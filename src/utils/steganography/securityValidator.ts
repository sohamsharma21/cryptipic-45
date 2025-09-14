/**
 * Security Validation Utilities for Enhanced Steganography System
 * Provides comprehensive input validation and security checks
 */

export class SecurityValidator {
  
  /**
   * Validate password strength and security requirements
   */
  static validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (password.length > 128) {
      errors.push('Password too long (max 128 characters)');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    // Check for common weak passwords
    const weakPasswords = [
      'password', '12345678', 'qwerty123', 'admin123', 'password123',
      'letmein123', 'welcome123', 'monkey123', '123456789', 'password1'
    ];
    
    if (weakPasswords.includes(password.toLowerCase())) {
      errors.push('Password is too common and easily guessable');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Validate message content for security issues
   */
  static validateMessage(message: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (message.length === 0) {
      errors.push('Message cannot be empty');
    }
    
    if (message.length > 100000) { // 100KB text limit
      errors.push('Message too long (max 100,000 characters)');
    }
    
    // Check for potential XSS patterns
    const xssPatterns = [
      /<script\b/i,
      /javascript:/i,
      /vbscript:/i,
      /onload\s*=/i,
      /onerror\s*=/i,
      /onclick\s*=/i
    ];
    
    for (const pattern of xssPatterns) {
      if (pattern.test(message)) {
        errors.push('Message contains potentially unsafe content');
        break;
      }
    }
    
    // Check for SQL injection patterns
    const sqlPatterns = [
      /(\bor\b|\band\b)\s+\w+\s*=\s*\w+/i,
      /union\s+select/i,
      /drop\s+table/i,
      /delete\s+from/i,
      /insert\s+into/i
    ];
    
    for (const pattern of sqlPatterns) {
      if (pattern.test(message)) {
        errors.push('Message contains potentially unsafe database commands');
        break;
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Validate image file for security compliance
   */
  static validateImageFile(file: File): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      errors.push('Invalid file type. Only JPEG, PNG, and WebP images are allowed');
    }
    
    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      errors.push('File too large. Maximum size is 10MB');
    }
    
    if (file.size < 1024) {
      errors.push('File too small. Minimum size is 1KB');
    }
    
    // Validate filename for security
    if (!/^[a-zA-Z0-9._-]+\.(jpg|jpeg|png|webp)$/i.test(file.name)) {
      errors.push('Invalid filename. Use only alphanumeric characters, dots, hyphens, and underscores');
    }
    
    // Check for potential path traversal
    if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
      errors.push('Filename contains invalid characters');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Validate steganography options for security compliance
   */
  static validateOptions(options: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Validate compression level
    if (options.compression?.level && (options.compression.level < 1 || options.compression.level > 9)) {
      errors.push('Compression level must be between 1 and 9');
    }
    
    // Validate chaotic iterations
    if (options.chaotic?.iterations && (options.chaotic.iterations < 100 || options.chaotic.iterations > 10000)) {
      errors.push('Chaotic iterations must be between 100 and 10,000');
    }
    
    // Validate encryption strength
    if (options.encryption?.strength && ![128, 192, 256].includes(options.encryption.strength)) {
      errors.push('Encryption strength must be 128, 192, or 256 bits');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Rate limiting to prevent abuse
   */
  static checkRateLimit(userId: string, operation: string): { allowed: boolean; remaining: number } {
    const key = `${userId}_${operation}`;
    const now = Date.now();
    const window = 60000; // 1 minute window
    const maxRequests = operation === 'encode' ? 10 : 20; // Lower limit for encoding
    
    // Get stored rate limit data from sessionStorage
    const stored = sessionStorage.getItem(`ratelimit_${key}`);
    let requests: number[] = stored ? JSON.parse(stored) : [];
    
    // Clean old requests outside the window
    requests = requests.filter(timestamp => now - timestamp < window);
    
    if (requests.length >= maxRequests) {
      return { allowed: false, remaining: 0 };
    }
    
    // Add current request
    requests.push(now);
    sessionStorage.setItem(`ratelimit_${key}`, JSON.stringify(requests));
    
    return { allowed: true, remaining: maxRequests - requests.length };
  }
  
  /**
   * Sanitize user input to prevent injection attacks
   */
  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: URLs
      .replace(/vbscript:/gi, '') // Remove vbscript: URLs
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim();
  }
  
  /**
   * Generate secure random ID for tracking
   */
  static generateSecureId(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  
  /**
   * Check if the current environment is secure
   */
  static checkEnvironmentSecurity(): { secure: boolean; warnings: string[] } {
    const warnings: string[] = [];
    
    // Check if running over HTTPS in production
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      warnings.push('Application should be served over HTTPS for security');
    }
    
    // Check if crypto API is available
    if (!window.crypto || !window.crypto.subtle) {
      warnings.push('Web Crypto API not available - some security features may be limited');
    }
    
    // Check Content Security Policy
    if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
      warnings.push('Content Security Policy not detected');
    }
    
    return {
      secure: warnings.length === 0,
      warnings
    };
  }
}

/**
 * Security audit logger for tracking security events
 */
export class SecurityAuditLogger {
  private static logs: Array<{
    timestamp: number;
    level: 'info' | 'warning' | 'error';
    event: string;
    details: any;
    userId?: string;
  }> = [];
  
  static log(level: 'info' | 'warning' | 'error', event: string, details: any = {}, userId?: string) {
    const logEntry = {
      timestamp: Date.now(),
      level,
      event,
      details,
      userId
    };
    
    this.logs.push(logEntry);
    
    // Keep only last 1000 logs to prevent memory issues
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Security ${level.toUpperCase()}] ${event}:`, details);
    }
  }
  
  static getLogs(limit: number = 100): typeof SecurityAuditLogger.logs {
    return this.logs.slice(-limit);
  }
  
  static getSecurityEvents(hours: number = 24): typeof SecurityAuditLogger.logs {
    const cutoff = Date.now() - (hours * 60 * 60 * 1000);
    return this.logs.filter(log => log.timestamp > cutoff && log.level !== 'info');
  }
  
  static clearLogs() {
    this.logs = [];
  }
}
