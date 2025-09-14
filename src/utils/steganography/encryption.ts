
import { EncryptionAlgorithm } from './types';
import { AES256Crypto } from '../crypto/aes256';

// Legacy encryption support with AES-256 upgrade
export const encryptMessage = (message: string, password: string, algorithm: EncryptionAlgorithm = 'aes'): string => {
  if (algorithm === 'aes') {
    // Use defense-grade AES-256 encryption
    return AES256Crypto.encrypt(message, password);
  } else if (algorithm === 'chacha20') {
    // For now, fallback to AES-256 as ChaCha20 implementation would require additional libraries
    // In production, integrate proper ChaCha20 implementation
    console.warn('ChaCha20 not implemented, using AES-256 fallback');
    return AES256Crypto.encrypt(message, password);
  }
  
  throw new Error('Unsupported encryption algorithm');
};

// Enhanced decryption with AES-256 support
export const decryptMessage = (encrypted: string, password: string, algorithm: EncryptionAlgorithm = 'aes'): string => {
  try {
    if (algorithm === 'aes') {
      // Try AES-256 first, fallback to legacy if needed
      return AES256Crypto.decrypt(encrypted, password);
    } else if (algorithm === 'chacha20') {
      // Fallback to AES-256
      console.warn('ChaCha20 not implemented, using AES-256 fallback');
      return AES256Crypto.decrypt(encrypted, password);
    }
    
    throw new Error('Unsupported encryption algorithm');
  } catch (error) {
    // Try legacy decryption as fallback for backwards compatibility
    if (encrypted.includes(':')) {
      // Legacy format detection
      console.warn('Attempting legacy decryption fallback');
      throw new Error('Legacy decryption not supported - please re-encode with current version');
    }
    throw error;
  }
};
