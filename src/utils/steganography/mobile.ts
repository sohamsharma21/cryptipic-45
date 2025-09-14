
import { SteganographyOptions, MOBILE_BIT_DEPTH } from './types';
import { debugLog } from './helpers';

/**
 * Special encoding algorithm optimized for mobile devices
 * Uses multiple bits and redundancy techniques to ensure data survives mobile compression
 * @param data Image data array
 * @param binary Binary message to encode
 * @param offset Starting position in the data array
 * @param options Encoding options
 * @returns The ending position after encoding
 */
export const encodeMobileOptimized = (
  data: Uint8ClampedArray, 
  binary: string, 
  offset: number,
  options: SteganographyOptions
): number => {
  debugLog('Using mobile optimized encoding algorithm', null, options);
  
  // Use a higher bit depth for mobile to create more noticeable changes
  // that can survive compression
  const bitDepth = options.capacity || MOBILE_BIT_DEPTH;
  const mask = (1 << bitDepth) - 1;
  const inverseMask = ~mask & 0xFF;
  
  // Add redundancy - store each bit multiple times
  const REDUNDANCY = 3; // Store each bit 3 times
  
  for (let i = 0; i < binary.length; i++) {
    if (offset >= data.length - (REDUNDANCY * 4)) {
      throw new Error('Image is not large enough for this message');
    }
    
    const bit = parseInt(binary[i]);
    
    // Store the same bit in multiple consecutive bytes
    for (let r = 0; r < REDUNDANCY; r++) {
      // Use 2 bits for each redundant copy to make it more robust
      data[offset] = (data[offset] & inverseMask) | (bit ? mask : 0);
      offset += 1;
    }
    
    // Add a small offset between bits to avoid pattern detection by compression algorithms
    offset += 1;
  }
  
  debugLog(`Mobile encoding complete: used ${offset} bytes`, null, options);
  return offset;
};

/**
 * Special decoding algorithm optimized for mobile devices
 * Uses redundancy and error correction to recover data from compressed images
 * @param data Image data array
 * @param messageLength Length of the binary message
 * @param offset Starting position in the data array
 * @param options Decoding options
 * @returns The decoded binary message
 */
export const decodeMobileOptimized = (
  data: Uint8ClampedArray, 
  messageLength: number,
  offset: number,
  options: SteganographyOptions
): string => {
  debugLog('Using mobile optimized decoding algorithm', null, options);
  
  // Use same parameters as encoding
  const bitDepth = options.capacity || MOBILE_BIT_DEPTH;
  const mask = (1 << bitDepth) - 1;
  const REDUNDANCY = 3;
  
  let binary = '';
  
  for (let i = 0; i < messageLength; i++) {
    if (offset >= data.length - (REDUNDANCY * 4)) {
      break;
    }
    
    // Read all redundant copies
    let votes = 0;
    for (let r = 0; r < REDUNDANCY; r++) {
      // Extract bit using mask
      const bits = data[offset] & mask;
      votes += bits > 0 ? 1 : 0;
      offset += 1;
    }
    
    // Majority vote to determine the actual bit
    binary += votes > (REDUNDANCY / 2) ? '1' : '0';
    
    // Skip the spacing offset
    offset += 1;
  }
  
  debugLog(`Mobile decoding complete: got ${binary.length} bits`, null, options);
  return binary;
};
