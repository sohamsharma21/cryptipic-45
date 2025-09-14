
import { SteganographyOptions } from './types';
import { debugLog } from './helpers';
import { dctEncode, dctDecode, dwtEncode, dwtDecode } from '../steganographyAlgorithms';
import { encodeMobileOptimized, decodeMobileOptimized } from './mobile';

/**
 * Multi-bit LSB encoding algorithm
 * Uses multiple bits per color channel to store more data
 * @param data Image data array
 * @param binary Binary message to encode
 * @param bitDepth Number of bits to use per color channel (1-8)
 * @param offset Starting position in the data array
 * @returns The ending position after encoding
 */
export const encodeMultibitLSB = (data: Uint8ClampedArray, binary: string, bitDepth: number, offset: number): number => {
  const mask = (1 << bitDepth) - 1; // Create a mask like 000..00111 with bitDepth 1's
  const inverseMask = ~mask & 0xFF; // Inverse mask like 111..11000
  
  for (let i = 0; i < binary.length; i += bitDepth) {
    if (offset >= data.length) {
      throw new Error('Image is not large enough for this message');
    }
    
    // Get bitDepth bits from the binary message
    const bits = parseInt(binary.substr(i, bitDepth), 2);
    
    // Apply the bits to the image data
    data[offset] = (data[offset] & inverseMask) | bits;
    offset += 1;
  }
  
  return offset;
};

/**
 * Multi-bit LSB decoding algorithm
 * @param data Image data array
 * @param messageLength Length of the binary message
 * @param bitDepth Number of bits used per color channel (1-8)
 * @param offset Starting position in the data array
 * @returns The decoded binary message
 */
export const decodeMultibitLSB = (data: Uint8ClampedArray, messageLength: number, bitDepth: number, offset: number): string => {
  const mask = (1 << bitDepth) - 1; // Create a mask like 000..00111 with bitDepth 1's
  let binary = '';
  
  for (let i = 0; i < messageLength; i += bitDepth) {
    if (offset >= data.length) {
      break;
    }
    
    // Extract bitDepth bits from the image data
    const bits = data[offset] & mask;
    
    // Convert to binary string and pad with leading zeros
    binary += bits.toString(2).padStart(bitDepth, '0');
    offset += 1;
  }
  
  return binary;
};

/**
 * Main function to apply encoding algorithm based on selected option
 */
export const applyEncodingAlgorithm = (
  data: Uint8ClampedArray,
  binary: string,
  offset: number,
  options: SteganographyOptions,
  canvasWidth: number,
  canvasHeight: number
): Uint8ClampedArray => {
  try {
    debugLog(`Applying ${options.algorithm} encoding algorithm`, null, options);
    
    if (options.algorithm === 'lsb') {
      // Traditional LSB - 1 bit per byte
      debugLog('Using standard LSB encoding', null, options);
      for (let i = 0; i < binary.length; i++) {
        if (offset >= data.length) {
          throw new Error('Image is not large enough for this message');
        }
        
        const bit = parseInt(binary[i]);
        data[offset] = (data[offset] & 0xFE) | bit; // Set the LSB
        offset += 1;
      }
      return data;
    } else if (options.algorithm === 'mobile-optimized') {
      // Mobile optimized encoding
      encodeMobileOptimized(data, binary, offset, options);
      return data;
    } else if (options.algorithm === 'chaotic-lsb' || options.algorithm === 'adaptive-hybrid') {
      // Use enhanced chaotic LSB for new algorithms
      for (let i = 0; i < binary.length; i++) {
        if (offset >= data.length) {
          throw new Error('Image is not large enough for this message');
        }
        const bit = parseInt(binary[i]);
        data[offset] = (data[offset] & 0xFE) | bit;
        offset += 2; // Skip every other pixel for security
      }
      return data;
    } else if (options.algorithm === 'multibit-lsb') {
      // Multi-bit LSB - multiple bits per byte
      const bitDepth = options.capacity || 1;
      encodeMultibitLSB(data, binary, bitDepth, offset);
      return data;
    } else if (options.algorithm === 'dct') {
      // DCT algorithm implementation
      return dctEncode(data, binary, canvasWidth, canvasHeight);
    } else if (options.algorithm === 'dwt') {
      // DWT implementation
      return dwtEncode(data, binary, canvasWidth, canvasHeight);
    }
    
    throw new Error(`Unsupported algorithm: ${options.algorithm}`);
  } catch (error) {
    debugLog('Encoding algorithm error:', error, options);
    throw error;
  }
};

/**
 * Main function to apply decoding algorithm based on detected options
 */
export const applyDecodingAlgorithm = (
  data: Uint8ClampedArray,
  messageLength: number,
  offset: number,
  algorithm: string,
  capacity: number,
  options: SteganographyOptions,
  canvasWidth: number,
  canvasHeight: number
): string => {
  try {
    debugLog(`Applying ${algorithm} decoding algorithm`, null, options);
    
    if (algorithm === 'lsb') {
      // Traditional LSB - 1 bit per byte
      debugLog('Using standard LSB decoding', null, options);
      let binary = '';
      for (let i = 0; i < messageLength; i++) {
        if (offset >= data.length) {
          break;
        }
        
        binary += (data[offset] & 1).toString();
        offset += 1;
      }
      return binary;
    } else if (algorithm === 'mobile-optimized') {
      // Mobile optimized decoding
      return decodeMobileOptimized(data, messageLength, offset, options);
    } else if (algorithm === 'multibit-lsb') {
      // Multi-bit LSB decoding
      return decodeMultibitLSB(data, messageLength, capacity, offset);
    } else if (algorithm === 'dct') {
      // DCT decoding
      return dctDecode(data, messageLength, canvasWidth, canvasHeight);
    } else if (algorithm === 'dwt') {
      // DWT decoding
      return dwtDecode(data, canvasWidth, canvasHeight);
    }
    
    throw new Error(`Unsupported algorithm: ${algorithm}`);
  } catch (error) {
    debugLog('Decoding algorithm error:', error, options);
    throw error;
  }
};
