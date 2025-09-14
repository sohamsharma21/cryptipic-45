import CryptoJS from 'crypto-js';

export interface EncryptionOptions {
  keySize: number;
  ivSize: number;
  iterations: number;
  mode: string;
  padding: string;
}

export const DEFAULT_AES_OPTIONS: EncryptionOptions = {
  keySize: 256,
  ivSize: 128,
  iterations: 10000,
  mode: 'CBC',
  padding: 'Pkcs7'
};

/**
 * Advanced AES-256 encryption with PBKDF2 key derivation
 * Meets defense-grade security standards
 */
export class AES256Crypto {
  private static generateSalt(size: number = 256): CryptoJS.lib.WordArray {
    return CryptoJS.lib.WordArray.random(size / 8);
  }

  private static generateIV(size: number = 128): CryptoJS.lib.WordArray {
    return CryptoJS.lib.WordArray.random(size / 8);
  }

  private static deriveKey(
    password: string, 
    salt: CryptoJS.lib.WordArray, 
    options: EncryptionOptions
  ): CryptoJS.lib.WordArray {
    return CryptoJS.PBKDF2(password, salt, {
      keySize: options.keySize / 32,
      iterations: options.iterations,
      hasher: CryptoJS.algo.SHA256
    });
  }

  /**
   * Encrypts data using AES-256 with PBKDF2 key derivation
   * @param plaintext The data to encrypt
   * @param password The encryption password
   * @param options Encryption configuration
   * @returns Encrypted data with metadata
   */
  static encrypt(
    plaintext: string, 
    password: string, 
    options: EncryptionOptions = DEFAULT_AES_OPTIONS
  ): string {
    try {
      // Generate random salt and IV
      const salt = this.generateSalt(256);
      const iv = this.generateIV(options.ivSize);
      
      // Derive encryption key using PBKDF2
      const key = this.deriveKey(password, salt, options);
      
      // Configure encryption
      const cfg = {
        iv: iv,
        mode: CryptoJS.mode[options.mode as keyof typeof CryptoJS.mode],
        padding: CryptoJS.pad[options.padding as keyof typeof CryptoJS.pad]
      };
      
      // Encrypt the plaintext
      const encrypted = CryptoJS.AES.encrypt(plaintext, key, cfg);
      
      // Create metadata
      const metadata = {
        algorithm: 'AES-256',
        mode: options.mode,
        padding: options.padding,
        keySize: options.keySize,
        iterations: options.iterations,
        timestamp: Date.now(),
        version: '1.0.0'
      };
      
      // Combine all components
      const result = {
        metadata: CryptoJS.enc.Utf8.parse(JSON.stringify(metadata)),
        salt: salt,
        iv: iv,
        ciphertext: encrypted.ciphertext
      };
      
      // Encode everything as base64
      const combined = CryptoJS.lib.WordArray.create()
        .concat(result.metadata)
        .concat(CryptoJS.lib.WordArray.create([result.metadata.sigBytes]))
        .concat(result.salt)
        .concat(result.iv)
        .concat(result.ciphertext);
      
      return CryptoJS.enc.Base64.stringify(combined);
    } catch (error) {
      throw new Error(`AES-256 encryption failed: ${error}`);
    }
  }

  /**
   * Decrypts AES-256 encrypted data
   * @param encryptedData The encrypted data string
   * @param password The decryption password
   * @returns Decrypted plaintext
   */
  static decrypt(encryptedData: string, password: string): string {
    try {
      // Parse the base64 encoded data
      const combined = CryptoJS.enc.Base64.parse(encryptedData);
      
      // Extract metadata length (last 4 bytes before salt)
      const metadataLength = combined.words[combined.words.length - 1] & 0xFFFFFFFF;
      
      // Extract components
      const metadata = CryptoJS.lib.WordArray.create(
        combined.words.slice(0, Math.ceil(metadataLength / 4))
      );
      metadata.sigBytes = metadataLength;
      
      const remaining = CryptoJS.lib.WordArray.create(
        combined.words.slice(Math.ceil(metadataLength / 4) + 1)
      );
      
      // Parse metadata
      const metadataStr = CryptoJS.enc.Utf8.stringify(metadata);
      const options = JSON.parse(metadataStr);
      
      // Extract salt (32 bytes), IV (16 bytes), and ciphertext
      const salt = CryptoJS.lib.WordArray.create(remaining.words.slice(0, 8));
      salt.sigBytes = 32;
      
      const iv = CryptoJS.lib.WordArray.create(remaining.words.slice(8, 12));
      iv.sigBytes = 16;
      
      const ciphertext = CryptoJS.lib.WordArray.create(remaining.words.slice(12));
      ciphertext.sigBytes = remaining.sigBytes - 48; // Total - salt - IV
      
      // Derive the key using stored parameters
      const key = this.deriveKey(password, salt, options);
      
      // Configure decryption
      const cfg = {
        iv: iv,
        mode: CryptoJS.mode[options.mode as keyof typeof CryptoJS.mode],
        padding: CryptoJS.pad[options.padding as keyof typeof CryptoJS.pad]
      };
      
      // Create cipher params for decryption
      const cipherParams = CryptoJS.lib.CipherParams.create({
        ciphertext: ciphertext
      });
      
      // Decrypt
      const decrypted = CryptoJS.AES.decrypt(cipherParams, key, cfg);
      const plaintext = CryptoJS.enc.Utf8.stringify(decrypted);
      
      if (!plaintext) {
        throw new Error('Invalid password or corrupted data');
      }
      
      return plaintext;
    } catch (error) {
      throw new Error(`AES-256 decryption failed: ${error}`);
    }
  }

  /**
   * Generate a cryptographically secure password
   * @param length Password length (minimum 16)
   * @returns Secure password string
   */
  static generateSecurePassword(length: number = 32): string {
    if (length < 16) {
      throw new Error('Password length must be at least 16 characters');
    }
    
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    const randomWords = CryptoJS.lib.WordArray.random(length);
    let password = '';
    
    for (let i = 0; i < length; i++) {
      const randomIndex = (randomWords.words[Math.floor(i / 4)] >>> ((3 - (i % 4)) * 8)) & 0xFF;
      password += charset[randomIndex % charset.length];
    }
    
    return password;
  }

  /**
   * Generate HMAC-SHA256 signature for data integrity
   * @param data Data to sign
   * @param key Signing key
   * @returns HMAC signature
   */
  static generateHMAC(data: string, key: string): string {
    return CryptoJS.HmacSHA256(data, key).toString(CryptoJS.enc.Hex);
  }

  /**
   * Verify HMAC-SHA256 signature
   * @param data Original data
   * @param signature HMAC signature to verify
   * @param key Signing key
   * @returns True if signature is valid
   */
  static verifyHMAC(data: string, signature: string, key: string): boolean {
    const expected = this.generateHMAC(data, key);
    return expected === signature;
  }
}