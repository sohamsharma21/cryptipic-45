
// Common types used throughout the steganography modules

import { DecoyMessage } from '../steganographyAlgorithms';

// Algorithm types - Enhanced with advanced algorithms
export type SteganographyAlgorithm = 
  | 'lsb' 
  | 'dct' 
  | 'dwt' 
  | 'multibit-lsb' 
  | 'mobile-optimized'
  | 'chaotic-lsb'
  | 'hybrid-dct-dwt'
  | 'adaptive-hybrid';

export type EncryptionAlgorithm = 
  | 'aes' 
  | 'chacha20' 
  | 'quantum-resistant'
  | 'enhanced-aes256';

export type CompressionAlgorithm = 
  | 'none'
  | 'huffman' 
  | 'rle' 
  | 'hybrid'
  | 'adaptive';

export type ChaoticMapType = 
  | 'logistic' 
  | 'tent' 
  | 'henon' 
  | 'arnold';

export type SteganographyOptions = {
  algorithm: SteganographyAlgorithm;
  encryption?: {
    algorithm: EncryptionAlgorithm;
    strength: number; // bits
    quantumResistant?: boolean;
  };
  compression?: {
    algorithm: CompressionAlgorithm;
    level: number; // 1-9
  };
  chaotic?: {
    mapType: ChaoticMapType;
    seed?: number;
    iterations: number;
    usePassword?: boolean; // Use password as chaotic seed
  };
  quality?: number; // 1-100
  capacity?: number; // 1-8 bits for multibit-lsb
  expiry?: {
    type: 'time' | 'views';
    value: number;
  };
  isDecoy?: boolean;
  decoyIndex?: number;
  mobileOptimized?: boolean;
  debug?: boolean; // Enable debug mode for additional logging
  advancedSecurity?: boolean; // Enable advanced security features
};

export const DEFAULT_OPTIONS: SteganographyOptions = {
  algorithm: 'adaptive-hybrid',
  encryption: {
    algorithm: 'enhanced-aes256',
    strength: 256,
    quantumResistant: true
  },
  compression: {
    algorithm: 'adaptive',
    level: 5
  },
  chaotic: {
    mapType: 'logistic',
    iterations: 1000,
    usePassword: true
  },
  quality: 90,
  capacity: 2, // Enhanced capacity for better security
  mobileOptimized: true,
  debug: false,
  advancedSecurity: true
};

// Mobile-specific constants
export const MOBILE_MAX_SIZE = 800; // Smaller max dimension for mobile processing
export const MOBILE_QUALITY = 85; // Lower quality setting specifically for mobile
export const MOBILE_BIT_DEPTH = 2; // More robust bit depth for mobile
