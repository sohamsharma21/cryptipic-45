
import CryptoJS from 'crypto-js';
import { ClassificationLevel, MessageMetadata } from '@/types/defense';

export interface DefenseEncryptionOptions {
  algorithm: 'AES-256' | 'ChaCha20';
  keyDerivation: 'PBKDF2' | 'Argon2';
  iterations: number;
  saltLength: number;
  classification: ClassificationLevel;
  metadata: MessageMetadata;
}

export const DEFAULT_DEFENSE_OPTIONS: DefenseEncryptionOptions = {
  algorithm: 'AES-256',
  keyDerivation: 'PBKDF2',
  iterations: 100000, // Higher iterations for defense-grade security
  saltLength: 32,
  classification: 'UNCLASSIFIED',
  metadata: {
    id: '',
    author: '',
    timestamp: new Date(),
    classification: 'UNCLASSIFIED',
    department: '',
    digitalSignature: '',
    checksum: '',
    version: '1.0',
  },
};

export const encryptMessageDefense = (
  message: string,
  password: string,
  options: Partial<DefenseEncryptionOptions> = {}
): string => {
  const opts = { ...DEFAULT_DEFENSE_OPTIONS, ...options };
  
  try {
    // Generate random salt
    const salt = CryptoJS.lib.WordArray.random(opts.saltLength);
    
    // Derive key using PBKDF2 with high iteration count
    const key = CryptoJS.PBKDF2(password, salt, {
      keySize: 256 / 32,
      iterations: opts.iterations,
      hasher: CryptoJS.algo.SHA256,
    });
    
    // Generate IV
    const iv = CryptoJS.lib.WordArray.random(16);
    
    // Create message envelope with metadata
    const envelope = {
      metadata: opts.metadata,
      message: message,
      timestamp: new Date().toISOString(),
      classification: opts.classification,
    };
    
    // Encrypt the envelope
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(envelope), key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    
    // Combine salt, iv, and encrypted data
    const combined = salt.toString() + ':' + iv.toString() + ':' + encrypted.toString();
    
    // Add integrity check
    const hmac = CryptoJS.HmacSHA256(combined, key);
    
    return combined + ':' + hmac.toString();
  } catch (error) {
    throw new Error(`Defense encryption failed: ${error.message}`);
  }
};

export const decryptMessageDefense = (
  encryptedData: string,
  password: string,
  options: Partial<DefenseEncryptionOptions> = {}
): { message: string; metadata: MessageMetadata } => {
  const opts = { ...DEFAULT_DEFENSE_OPTIONS, ...options };
  
  try {
    // Split the encrypted data
    const parts = encryptedData.split(':');
    if (parts.length !== 4) {
      throw new Error('Invalid encrypted data format');
    }
    
    const [saltHex, ivHex, encryptedHex, hmacHex] = parts;
    
    // Parse components
    const salt = CryptoJS.enc.Hex.parse(saltHex);
    const iv = CryptoJS.enc.Hex.parse(ivHex);
    
    // Derive key
    const key = CryptoJS.PBKDF2(password, salt, {
      keySize: 256 / 32,
      iterations: opts.iterations,
      hasher: CryptoJS.algo.SHA256,
    });
    
    // Verify integrity
    const combined = saltHex + ':' + ivHex + ':' + encryptedHex;
    const expectedHmac = CryptoJS.HmacSHA256(combined, key);
    
    if (hmacHex !== expectedHmac.toString()) {
      throw new Error('Data integrity verification failed');
    }
    
    // Decrypt
    const decrypted = CryptoJS.AES.decrypt(encryptedHex, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    
    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
    if (!decryptedText) {
      throw new Error('Decryption failed - invalid password or corrupted data');
    }
    
    // Parse envelope
    const envelope = JSON.parse(decryptedText);
    
    // Verify metadata integrity
    if (!envelope.metadata || !envelope.message) {
      throw new Error('Invalid message envelope');
    }
    
    return {
      message: envelope.message,
      metadata: envelope.metadata,
    };
  } catch (error) {
    throw new Error(`Defense decryption failed: ${error.message}`);
  }
};

export const generateDigitalSignature = async (data: string, privateKey?: string): Promise<string> => {
  // In production, this would use proper digital signature algorithms
  // For now, we'll use HMAC as a simplified signature
  const key = privateKey || 'defense-signature-key';
  const signature = CryptoJS.HmacSHA256(data, key);
  return signature.toString();
};

export const verifyDigitalSignature = async (
  data: string,
  signature: string,
  publicKey?: string
): Promise<boolean> => {
  try {
    const key = publicKey || 'defense-signature-key';
    const expectedSignature = CryptoJS.HmacSHA256(data, key);
    return signature === expectedSignature.toString();
  } catch (error) {
    return false;
  }
};

export const generateChecksum = async (data: string): Promise<string> => {
  const hash = CryptoJS.SHA256(data);
  return hash.toString();
};

export const verifyChecksum = async (data: string, expectedChecksum: string): Promise<boolean> => {
  const actualChecksum = await generateChecksum(data);
  return actualChecksum === expectedChecksum;
};
