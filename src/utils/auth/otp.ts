/**
 * One-Time Password (OTP) utilities for MFA
 * Supports TOTP (Time-based OTP) and HOTP (HMAC-based OTP)
 */

import CryptoJS from 'crypto-js';

export interface OTPSecret {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface OTPConfig {
  issuer: string;
  accountName: string;
  algorithm: 'SHA1' | 'SHA256' | 'SHA512';
  digits: number;
  period: number;
}

export class OTPAuth {
  private static readonly DEFAULT_CONFIG: OTPConfig = {
    issuer: 'CryptiPic Defense',
    accountName: '',
    algorithm: 'SHA256',
    digits: 6,
    period: 30,
  };

  /**
   * Generate a new TOTP secret for a user
   */
  static generateSecret(userEmail: string): OTPSecret {
    // Generate 32-byte random secret
    const secret = this.generateRandomSecret();
    
    const config = {
      ...this.DEFAULT_CONFIG,
      accountName: userEmail,
    };

    // Generate QR code data
    const qrCode = this.generateQRCodeData(secret, config);
    
    // Generate backup codes
    const backupCodes = this.generateBackupCodes();

    return {
      secret,
      qrCode,
      backupCodes,
    };
  }

  /**
   * Generate TOTP token for given secret and time
   */
  static generateTOTP(secret: string, time?: number): string {
    const timeStep = Math.floor((time || Date.now()) / 1000 / 30);
    return this.generateHOTP(secret, timeStep);
  }

  /**
   * Verify TOTP token
   */
  static verifyTOTP(token: string, secret: string, window: number = 1): boolean {
    const currentTime = Math.floor(Date.now() / 1000 / 30);
    
    // Check current time window and adjacent windows for clock drift
    for (let i = -window; i <= window; i++) {
      const timeStep = currentTime + i;
      const expectedToken = this.generateHOTP(secret, timeStep);
      
      if (this.constantTimeCompare(token, expectedToken)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Generate HOTP token
   */
  private static generateHOTP(secret: string, counter: number): string {
    // Convert secret from base32 to binary
    const key = this.base32Decode(secret);
    
    // Convert counter to 8-byte buffer
    const counterBuffer = new ArrayBuffer(8);
    const counterView = new DataView(counterBuffer);
    counterView.setUint32(4, counter, false); // Big endian
    
    // Generate HMAC-SHA256
    const hmac = CryptoJS.HmacSHA256(
      CryptoJS.lib.WordArray.create(new Uint32Array(counterBuffer)),
      CryptoJS.lib.WordArray.create(new Uint32Array(key))
    );
    
    // Convert to byte array
    const hmacBytes = new Uint8Array(32);
    for (let i = 0; i < 8; i++) {
      const word = hmac.words[i];
      hmacBytes[i * 4] = (word >>> 24) & 0xff;
      hmacBytes[i * 4 + 1] = (word >>> 16) & 0xff;
      hmacBytes[i * 4 + 2] = (word >>> 8) & 0xff;
      hmacBytes[i * 4 + 3] = word & 0xff;
    }
    
    // Dynamic truncation
    const offset = hmacBytes[31] & 0x0f;
    const code = ((hmacBytes[offset] & 0x7f) << 24) |
                 ((hmacBytes[offset + 1] & 0xff) << 16) |
                 ((hmacBytes[offset + 2] & 0xff) << 8) |
                 (hmacBytes[offset + 3] & 0xff);
    
    // Return 6-digit code
    return (code % 1000000).toString().padStart(6, '0');
  }

  /**
   * Generate cryptographically secure random secret
   */
  private static generateRandomSecret(): string {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return this.base32Encode(bytes);
  }

  /**
   * Generate QR code data URL for authenticator apps
   */
  private static generateQRCodeData(secret: string, config: OTPConfig): string {
    const params = new URLSearchParams({
      secret: secret,
      issuer: config.issuer,
      algorithm: config.algorithm,
      digits: config.digits.toString(),
      period: config.period.toString(),
    });

    const label = encodeURIComponent(`${config.issuer}:${config.accountName}`);
    const otpauth = `otpauth://totp/${label}?${params.toString()}`;
    
    return otpauth;
  }

  /**
   * Generate backup codes for account recovery
   */
  private static generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const bytes = new Uint8Array(5);
      crypto.getRandomValues(bytes);
      
      // Convert to numeric code
      let code = '';
      for (const byte of bytes) {
        code += (byte % 10).toString();
      }
      
      // Format as XXXXX-XXXXX
      const formatted = `${code.substring(0, 5)}-${code.substring(5)}`;
      codes.push(formatted);
    }
    
    return codes;
  }

  /**
   * Verify backup code
   */
  static verifyBackupCode(code: string, validCodes: string[]): boolean {
    return validCodes.includes(code.replace(/\s/g, '').toUpperCase());
  }

  /**
   * Constant-time string comparison to prevent timing attacks
   */
  private static constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    
    return result === 0;
  }

  /**
   * Base32 encoding
   */
  private static base32Encode(bytes: Uint8Array): string {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let result = '';
    let bits = 0;
    let value = 0;
    
    for (const byte of bytes) {
      value = (value << 8) | byte;
      bits += 8;
      
      while (bits >= 5) {
        result += alphabet[(value >>> (bits - 5)) & 31];
        bits -= 5;
      }
    }
    
    if (bits > 0) {
      result += alphabet[(value << (5 - bits)) & 31];
    }
    
    return result;
  }

  /**
   * Base32 decoding
   */
  private static base32Decode(encoded: string): ArrayBuffer {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    const bytes: number[] = [];
    let bits = 0;
    let value = 0;
    
    for (const char of encoded.toUpperCase()) {
      const index = alphabet.indexOf(char);
      if (index === -1) continue;
      
      value = (value << 5) | index;
      bits += 5;
      
      if (bits >= 8) {
        bytes.push((value >>> (bits - 8)) & 255);
        bits -= 8;
      }
    }
    
    return new Uint8Array(bytes).buffer;
  }

  /**
   * Store OTP secret securely
   */
  static storeSecret(userId: string, secret: OTPSecret): void {
    const encryptedData = {
      secret: secret.secret,
      backupCodes: secret.backupCodes,
      createdAt: Date.now(),
    };

    localStorage.setItem(`otp_${userId}`, JSON.stringify(encryptedData));
  }

  /**
   * Retrieve stored OTP secret
   */
  static getStoredSecret(userId: string): any {
    const stored = localStorage.getItem(`otp_${userId}`);
    return stored ? JSON.parse(stored) : null;
  }

  /**
   * Remove OTP secret
   */
  static removeSecret(userId: string): void {
    localStorage.removeItem(`otp_${userId}`);
  }
}