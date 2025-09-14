/**
 * Comprehensive Error Handling and Validation System
 * Provides defense-grade error handling and validation for CryptiPic
 */

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface SecurityError {
  type: 'authentication' | 'authorization' | 'encryption' | 'validation' | 'network';
  message: string;
  code: string;
  timestamp: number;
  context?: any;
}

export class CryptiPicErrorHandler {
  private static instance: CryptiPicErrorHandler;
  private errorLog: SecurityError[] = [];
  private maxLogSize = 1000;

  static getInstance(): CryptiPicErrorHandler {
    if (!CryptiPicErrorHandler.instance) {
      CryptiPicErrorHandler.instance = new CryptiPicErrorHandler();
    }
    return CryptiPicErrorHandler.instance;
  }

  /**
   * Validate file upload
   */
  validateFileUpload(file: File): ValidationError[] {
    const errors: ValidationError[] = [];

    // File size validation
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      errors.push({
        field: 'file',
        message: 'File size exceeds maximum limit of 50MB',
        code: 'FILE_TOO_LARGE',
        severity: 'high'
      });
    }

    // File type validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/bmp', 'image/tiff', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      errors.push({
        field: 'file',
        message: 'Unsupported file type. Only JPEG, PNG, BMP, TIFF, and WebP are allowed',
        code: 'INVALID_FILE_TYPE',
        severity: 'high'
      });
    }

    // File name validation
    if (!file.name || file.name.length === 0) {
      errors.push({
        field: 'file',
        message: 'File name is required',
        code: 'MISSING_FILE_NAME',
        severity: 'medium'
      });
    }

    // Check for suspicious file names
    const suspiciousPatterns = /\.(exe|bat|cmd|scr|pif|vbs|js|jar|php|asp|aspx)$/i;
    if (suspiciousPatterns.test(file.name)) {
      errors.push({
        field: 'file',
        message: 'Suspicious file extension detected',
        code: 'SUSPICIOUS_FILE',
        severity: 'critical'
      });
    }

    return errors;
  }

  /**
   * Validate message content
   */
  validateMessage(message: string): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!message || message.trim().length === 0) {
      errors.push({
        field: 'message',
        message: 'Message cannot be empty',
        code: 'EMPTY_MESSAGE',
        severity: 'medium'
      });
    }

    if (message.length > 10000) {
      errors.push({
        field: 'message',
        message: 'Message exceeds maximum length of 10,000 characters',
        code: 'MESSAGE_TOO_LONG',
        severity: 'medium'
      });
    }

    // Check for potential security issues
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /eval\s*\(/i,
      /document\.cookie/i
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(message)) {
        errors.push({
          field: 'message',
          message: 'Message contains potentially dangerous content',
          code: 'DANGEROUS_CONTENT',
          severity: 'high'
        });
        break;
      }
    }

    return errors;
  }

  /**
   * Validate password strength
   */
  validatePassword(password: string): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!password || password.length < 8) {
      errors.push({
        field: 'password',
        message: 'Password must be at least 8 characters long',
        code: 'PASSWORD_TOO_SHORT',
        severity: 'high'
      });
    }

    if (password.length > 128) {
      errors.push({
        field: 'password',
        message: 'Password exceeds maximum length of 128 characters',
        code: 'PASSWORD_TOO_LONG',
        severity: 'medium'
      });
    }

    // Check password complexity
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase) {
      errors.push({
        field: 'password',
        message: 'Password must contain at least one uppercase letter',
        code: 'PASSWORD_NO_UPPERCASE',
        severity: 'medium'
      });
    }

    if (!hasLowerCase) {
      errors.push({
        field: 'password',
        message: 'Password must contain at least one lowercase letter',
        code: 'PASSWORD_NO_LOWERCASE',
        severity: 'medium'
      });
    }

    if (!hasNumbers) {
      errors.push({
        field: 'password',
        message: 'Password must contain at least one number',
        code: 'PASSWORD_NO_NUMBERS',
        severity: 'medium'
      });
    }

    if (!hasSpecialChar) {
      errors.push({
        field: 'password',
        message: 'Password must contain at least one special character',
        code: 'PASSWORD_NO_SPECIAL',
        severity: 'medium'
      });
    }

    // Check for common passwords
    const commonPasswords = [
      'password', '123456', 'password123', 'admin', 'qwerty',
      'letmein', 'welcome', 'monkey', 'dragon', 'master'
    ];

    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push({
        field: 'password',
        message: 'Password is too common and easily guessable',
        code: 'COMMON_PASSWORD',
        severity: 'high'
      });
    }

    return errors;
  }

  /**
   * Validate encryption parameters
   */
  validateEncryptionParams(params: {
    algorithm: string;
    keySize: number;
    mode: string;
  }): ValidationError[] {
    const errors: ValidationError[] = [];

    const validAlgorithms = ['AES-256', 'ChaCha20', 'AES-128'];
    if (!validAlgorithms.includes(params.algorithm)) {
      errors.push({
        field: 'algorithm',
        message: 'Invalid encryption algorithm',
        code: 'INVALID_ALGORITHM',
        severity: 'critical'
      });
    }

    const validKeySizes = [128, 192, 256];
    if (!validKeySizes.includes(params.keySize)) {
      errors.push({
        field: 'keySize',
        message: 'Invalid key size. Must be 128, 192, or 256 bits',
        code: 'INVALID_KEY_SIZE',
        severity: 'critical'
      });
    }

    const validModes = ['CBC', 'GCM', 'CTR', 'OFB'];
    if (!validModes.includes(params.mode)) {
      errors.push({
        field: 'mode',
        message: 'Invalid encryption mode',
        code: 'INVALID_MODE',
        severity: 'critical'
      });
    }

    return errors;
  }

  /**
   * Log security error
   */
  logSecurityError(error: SecurityError): void {
    this.errorLog.push(error);
    
    // Maintain log size limit
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(-this.maxLogSize);
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('[Security Error]', error);
    }

    // Send to security monitoring service in production
    if (import.meta.env.PROD) {
      this.sendToSecurityService(error);
    }
  }

  /**
   * Handle authentication errors
   */
  handleAuthError(error: any): SecurityError {
    const securityError: SecurityError = {
      type: 'authentication',
      message: error.message || 'Authentication failed',
      code: error.code || 'AUTH_ERROR',
      timestamp: Date.now(),
      context: {
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        url: window.location.href
      }
    };

    this.logSecurityError(securityError);
    return securityError;
  }

  /**
   * Handle encryption errors
   */
  handleEncryptionError(error: any): SecurityError {
    const securityError: SecurityError = {
      type: 'encryption',
      message: error.message || 'Encryption operation failed',
      code: error.code || 'ENCRYPTION_ERROR',
      timestamp: Date.now(),
      context: {
        algorithm: error.algorithm,
        keySize: error.keySize,
        operation: error.operation
      }
    };

    this.logSecurityError(securityError);
    return securityError;
  }

  /**
   * Handle validation errors
   */
  handleValidationError(errors: ValidationError[]): SecurityError {
    const criticalErrors = errors.filter(e => e.severity === 'critical');
    
    const securityError: SecurityError = {
      type: 'validation',
      message: criticalErrors.length > 0 
        ? 'Critical validation errors detected'
        : 'Validation errors detected',
      code: criticalErrors.length > 0 ? 'CRITICAL_VALIDATION_ERROR' : 'VALIDATION_ERROR',
      timestamp: Date.now(),
      context: {
        errorCount: errors.length,
        criticalCount: criticalErrors.length,
        errors: errors.map(e => ({ field: e.field, code: e.code }))
      }
    };

    this.logSecurityError(securityError);
    return securityError;
  }

  /**
   * Get error statistics
   */
  getErrorStatistics(): {
    totalErrors: number;
    errorsByType: Record<string, number>;
    recentErrors: SecurityError[];
    criticalErrors: SecurityError[];
  } {
    const errorsByType: Record<string, number> = {};
    
    this.errorLog.forEach(error => {
      errorsByType[error.type] = (errorsByType[error.type] || 0) + 1;
    });

    const recentErrors = this.errorLog.slice(-10);
    const criticalErrors = this.errorLog.filter(error => 
      error.context?.criticalCount > 0 || 
      error.code.includes('CRITICAL')
    );

    return {
      totalErrors: this.errorLog.length,
      errorsByType,
      recentErrors,
      criticalErrors
    };
  }

  /**
   * Clear error log
   */
  clearErrorLog(): void {
    this.errorLog = [];
  }

  /**
   * Send error to security service
   */
  private async sendToSecurityService(error: SecurityError): Promise<void> {
    try {
      // In a real implementation, this would send to a security monitoring service
      console.log('[Security Service] Would send error:', error);
      
      // Example implementation with fetch
      // await fetch('/api/security/log', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(error)
      // });
    } catch (err) {
      console.error('[Security Service] Failed to send error:', err);
    }
  }

  /**
   * Validate steganography parameters
   */
  validateSteganographyParams(params: {
    algorithm: string;
    capacity: number;
    imageSize: number;
  }): ValidationError[] {
    const errors: ValidationError[] = [];

    const validAlgorithms = ['LSB', 'DCT', 'DWT', 'Chaotic', 'Hybrid'];
    if (!validAlgorithms.includes(params.algorithm)) {
      errors.push({
        field: 'algorithm',
        message: 'Invalid steganography algorithm',
        code: 'INVALID_STEGO_ALGORITHM',
        severity: 'high'
      });
    }

    // Check capacity vs image size
    const maxCapacity = Math.floor(params.imageSize * 0.1); // 10% of image size
    if (params.capacity > maxCapacity) {
      errors.push({
        field: 'capacity',
        message: `Capacity exceeds maximum safe limit of ${maxCapacity} bytes`,
        code: 'CAPACITY_EXCEEDED',
        severity: 'high'
      });
    }

    if (params.capacity <= 0) {
      errors.push({
        field: 'capacity',
        message: 'Capacity must be greater than 0',
        code: 'INVALID_CAPACITY',
        severity: 'medium'
      });
    }

    return errors;
  }

  /**
   * Validate network request
   */
  validateNetworkRequest(url: string, method: string): ValidationError[] {
    const errors: ValidationError[] = [];

    // Validate URL
    try {
      new URL(url);
    } catch {
      errors.push({
        field: 'url',
        message: 'Invalid URL format',
        code: 'INVALID_URL',
        severity: 'high'
      });
    }

    // Check for HTTPS
    if (!url.startsWith('https://')) {
      errors.push({
        field: 'url',
        message: 'Only HTTPS URLs are allowed for security',
        code: 'NON_HTTPS_URL',
        severity: 'critical'
      });
    }

    // Validate method
    const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    if (!validMethods.includes(method.toUpperCase())) {
      errors.push({
        field: 'method',
        message: 'Invalid HTTP method',
        code: 'INVALID_METHOD',
        severity: 'medium'
      });
    }

    return errors;
  }
}

// Export singleton instance
export const errorHandler = CryptiPicErrorHandler.getInstance();
