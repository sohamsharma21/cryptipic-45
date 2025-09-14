import { dct, idct, dwt2d, idwt2d } from './transforms';
import CryptoJS from 'crypto-js';

export interface DecoyMessage {
  message: string;
  password: string;
  index: number;
}

// Helper function to convert a string to binary representation
const textToBinary = (text: string): string => {
  let binary = '';
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i).toString(2).padStart(8, '0');
    binary += charCode;
  }
  return binary;
};

// Helper function to convert binary representation back to a string
const binaryToText = (binary: string): string => {
  let text = '';
  for (let i = 0; i < binary.length; i += 8) {
    const byte = binary.substr(i, 8);
    if (byte === '00000000') {
      // End of message marker
      break;
    }
    const charCode = parseInt(byte, 2);
    text += String.fromCharCode(charCode);
  }
  return text;
};

// Function to encrypt message using specified algorithm
const encryptMessage = (message: string, password: string, algorithm: string = 'aes'): string => {
  if (algorithm === 'aes') {
    return CryptoJS.AES.encrypt(message, password).toString();
  } else if (algorithm === 'chacha20') {
    // Note: This is a simplified version - in production you'd use a proper ChaCha20 implementation
    // ChaCha20 is not directly available in crypto-js, so this is just a placeholder
    const salt = CryptoJS.lib.WordArray.random(16);
    const key = CryptoJS.PBKDF2(password, salt, { keySize: 256/32 });
    return salt.toString() + ':' + CryptoJS.AES.encrypt(message, key).toString();
  }
  
  throw new Error('Unsupported encryption algorithm');
};

/**
 * DCT encoding algorithm for steganography
 * Embeds message bits in the DCT coefficients
 */
export const dctEncode = (data: Uint8ClampedArray, binaryMessage: string, width: number, height: number): Uint8ClampedArray => {
  // Create a copy of the data to avoid modifying the original
  const resultData = new Uint8ClampedArray(data);
  const blockSize = 8; // DCT block size
  
  // Extract message length and add it to binary message
  const messageLengthBinary = binaryMessage.length.toString(2).padStart(32, '0');
  const fullBinary = messageLengthBinary + binaryMessage;
  
  // Calculate how many blocks we need
  const pixelsPerChannel = 3; // RGB channels
  const bitsPerBlock = 1; // Number of bits to hide in each block
  const totalBlocks = Math.ceil(fullBinary.length / bitsPerBlock);
  const blocksPerRow = Math.floor(width / blockSize);
  
  // Check if there's enough space
  const maxBlocks = Math.floor(width / blockSize) * Math.floor(height / blockSize);
  if (totalBlocks > maxBlocks) {
    throw new Error('Message is too large for this image using DCT encoding');
  }
  
  let bitIndex = 0;
  
  // Process each block
  for (let blockY = 0; blockY < Math.floor(height / blockSize) && bitIndex < fullBinary.length; blockY++) {
    for (let blockX = 0; blockX < blocksPerRow && bitIndex < fullBinary.length; blockX++) {
      // Process each color channel separately
      for (let channel = 0; channel < 3 && bitIndex < fullBinary.length; channel++) {
        // Extract the block data for DCT
        const block = new Array(blockSize * blockSize);
        for (let y = 0; y < blockSize; y++) {
          for (let x = 0; x < blockSize; x++) {
            const pixelX = blockX * blockSize + x;
            const pixelY = blockY * blockSize + y;
            const pixelIndex = (pixelY * width + pixelX) * 4 + channel;
            block[y * blockSize + x] = data[pixelIndex];
          }
        }
        
        // Apply DCT
        const dctCoeffs = dct(block);
        
        // Embed bit in mid-frequency coefficient (avoid DC coefficient)
        const bit = parseInt(fullBinary[bitIndex]);
        const coeffIndex = 5; // Mid-frequency coefficient (avoid 0 which is DC)
        
        // Quantize coefficient to even/odd based on bit
        if (bit === 0 && dctCoeffs[coeffIndex] % 2 !== 0) {
          dctCoeffs[coeffIndex] = Math.floor(dctCoeffs[coeffIndex]);
          if (dctCoeffs[coeffIndex] % 2 !== 0) {
            dctCoeffs[coeffIndex]--;
          }
        } else if (bit === 1 && dctCoeffs[coeffIndex] % 2 === 0) {
          dctCoeffs[coeffIndex] = Math.floor(dctCoeffs[coeffIndex]);
          if (dctCoeffs[coeffIndex] % 2 === 0) {
            dctCoeffs[coeffIndex]++;
          }
        }
        
        // Apply inverse DCT
        const idctBlock = idct(dctCoeffs);
        
        // Put the modified block back
        for (let y = 0; y < blockSize; y++) {
          for (let x = 0; x < blockSize; x++) {
            const pixelX = blockX * blockSize + x;
            const pixelY = blockY * blockSize + y;
            const pixelIndex = (pixelY * width + pixelX) * 4 + channel;
            resultData[pixelIndex] = idctBlock[y * blockSize + x];
          }
        }
        
        bitIndex++;
      }
    }
  }
  
  return resultData;
};

/**
 * DCT decoding algorithm for steganography
 * Extracts message bits from the DCT coefficients
 */
export const dctDecode = (data: Uint8ClampedArray, messageLength: number, width: number, height: number): string => {
  const blockSize = 8; // DCT block size
  const blocksPerRow = Math.floor(width / blockSize);
  const bitsPerBlock = 1;
  
  // First, extract the message length (first 32 bits)
  let lengthBinary = '';
  let bitIndex = 0;
  
  // Extract message length
  for (let blockY = 0; blockY < Math.floor(height / blockSize) && bitIndex < 32; blockY++) {
    for (let blockX = 0; blockX < blocksPerRow && bitIndex < 32; blockX++) {
      // Process each color channel separately
      for (let channel = 0; channel < 3 && bitIndex < 32; channel++) {
        // Extract the block data for DCT
        const block = new Array(blockSize * blockSize);
        for (let y = 0; y < blockSize; y++) {
          for (let x = 0; x < blockSize; x++) {
            const pixelX = blockX * blockSize + x;
            const pixelY = blockY * blockSize + y;
            const pixelIndex = (pixelY * width + pixelX) * 4 + channel;
            block[y * blockSize + x] = data[pixelIndex];
          }
        }
        
        // Apply DCT
        const dctCoeffs = dct(block);
        
        // Extract bit from mid-frequency coefficient
        const coeffIndex = 5;
        const bit = dctCoeffs[coeffIndex] % 2 === 0 ? 0 : 1;
        lengthBinary += bit.toString();
        
        bitIndex++;
      }
    }
  }
  
  // Parse the message length
  const actualMessageLength = parseInt(lengthBinary, 2);
  
  // Continue extraction for the actual message
  let messageBinary = '';
  bitIndex = 32; // Start after the length bits
  
  // Calculate how many blocks we need to process
  const totalBitsNeeded = actualMessageLength;
  
  // Extract message bits
  for (let blockY = 0; blockY < Math.floor(height / blockSize) && messageBinary.length < totalBitsNeeded; blockY++) {
    for (let blockX = 0; blockX < blocksPerRow && messageBinary.length < totalBitsNeeded; blockX++) {
      // Skip blocks already processed for length
      if (bitIndex < 32) {
        bitIndex += 3; // 3 channels per block
        continue;
      }
      
      // Process each color channel separately
      for (let channel = 0; channel < 3 && messageBinary.length < totalBitsNeeded; channel++) {
        // Extract the block data for DCT
        const block = new Array(blockSize * blockSize);
        for (let y = 0; y < blockSize; y++) {
          for (let x = 0; x < blockSize; x++) {
            const pixelX = blockX * blockSize + x;
            const pixelY = blockY * blockSize + y;
            const pixelIndex = (pixelY * width + pixelX) * 4 + channel;
            block[y * blockSize + x] = data[pixelIndex];
          }
        }
        
        // Apply DCT
        const dctCoeffs = dct(block);
        
        // Extract bit from mid-frequency coefficient
        const coeffIndex = 5;
        const bit = dctCoeffs[coeffIndex] % 2 === 0 ? 0 : 1;
        messageBinary += bit.toString();
      }
    }
  }
  
  return messageBinary.substring(0, actualMessageLength);
};

/**
 * DWT encoding algorithm for steganography
 * Embeds message bits in the DWT coefficients (detail bands)
 */
export const dwtEncode = (data: Uint8ClampedArray, binaryMessage: string, width: number, height: number): Uint8ClampedArray => {
  // Create a copy of the data to avoid modifying the original
  const resultData = new Uint8ClampedArray(data);
  
  // We'll process the image in blocks to apply the DWT
  const blockSize = 8; // Must be power of 2
  
  // Extract message length and add it to binary message
  const messageLengthBinary = binaryMessage.length.toString(2).padStart(32, '0');
  const fullBinary = messageLengthBinary + binaryMessage;
  
  // Calculate how many blocks we need
  const bitsPerBlock = 3; // Number of bits to hide in each block
  const totalBlocks = Math.ceil(fullBinary.length / bitsPerBlock);
  const blocksPerRow = Math.floor(width / blockSize);
  
  // Check if there's enough space
  const maxBlocks = Math.floor(width / blockSize) * Math.floor(height / blockSize);
  if (totalBlocks > maxBlocks) {
    throw new Error('Message is too large for this image using DWT encoding');
  }
  
  let bitIndex = 0;
  
  // Process each block
  for (let blockY = 0; blockY < Math.floor(height / blockSize) && bitIndex < fullBinary.length; blockY++) {
    for (let blockX = 0; blockX < blocksPerRow && bitIndex < fullBinary.length; blockX++) {
      // Extract the block data for DWT (we'll use the red channel for simplicity)
      const block = new Uint8ClampedArray(blockSize * blockSize * 4);
      
      for (let y = 0; y < blockSize; y++) {
        for (let x = 0; x < blockSize; x++) {
          const srcX = blockX * blockSize + x;
          const srcY = blockY * blockSize + y;
          const srcIdx = (srcY * width + srcX) * 4;
          const dstIdx = (y * blockSize + x) * 4;
          
          // Copy RGBA values
          block[dstIdx] = data[srcIdx];
          block[dstIdx + 1] = data[srcIdx + 1];
          block[dstIdx + 2] = data[srcIdx + 2];
          block[dstIdx + 3] = data[srcIdx + 3];
        }
      }
      
      // Apply 2D DWT to the block
      const dwtCoeffs = dwt2d(block, blockSize);
      
      // Embed bits in the high frequency bands (HL, LH, HH)
      // We'll modify the least significant bits of some coefficients
      for (let i = 0; i < 3 && bitIndex < fullBinary.length; i++) {
        const bit = parseInt(fullBinary[bitIndex]);
        
        // Select which band to modify based on the bit position
        let bandToModify;
        let x = 0, y = 0;
        
        switch (i % 3) {
          case 0: bandToModify = dwtCoeffs.hl; x = 1; y = 1; break;
          case 1: bandToModify = dwtCoeffs.lh; x = 2; y = 1; break;
          case 2: bandToModify = dwtCoeffs.hh; x = 1; y = 2; break;
        }
        
        // Quantize coefficient to even/odd based on bit
        const coeff = bandToModify[y][x];
        const roundedCoeff = Math.round(coeff);
        
        if (bit === 0 && roundedCoeff % 2 !== 0) {
          bandToModify[y][x] = roundedCoeff - 1;
        } else if (bit === 1 && roundedCoeff % 2 === 0) {
          bandToModify[y][x] = roundedCoeff + 1;
        } else {
          bandToModify[y][x] = roundedCoeff; // No change needed
        }
        
        bitIndex++;
      }
      
      // Apply inverse 2D DWT to get the modified block
      const modifiedBlock = idwt2d(dwtCoeffs, blockSize);
      
      // Put the modified block back into the result data
      for (let y = 0; y < blockSize; y++) {
        for (let x = 0; x < blockSize; x++) {
          const srcIdx = (y * blockSize + x) * 4;
          const dstX = blockX * blockSize + x;
          const dstY = blockY * blockSize + y;
          const dstIdx = (dstY * width + dstX) * 4;
          
          // Copy only RGB values, preserve original alpha
          resultData[dstIdx] = modifiedBlock[srcIdx];
          resultData[dstIdx + 1] = modifiedBlock[srcIdx + 1];
          resultData[dstIdx + 2] = modifiedBlock[srcIdx + 2];
          // Alpha channel is untouched
        }
      }
    }
  }
  
  return resultData;
};

/**
 * DWT decoding algorithm for steganography
 * Extracts message bits from the DWT coefficients
 */
export const dwtDecode = (data: Uint8ClampedArray, width: number, height: number): string => {
  const blockSize = 8;
  const blocksPerRow = Math.floor(width / blockSize);
  const bitsPerBlock = 3;
  
  // First, extract the message length (first 32 bits)
  let lengthBinary = '';
  let bitIndex = 0;
  let blockCounter = 0;
  
  // Extract message length
  while (lengthBinary.length < 32) {
    const blockX = blockCounter % blocksPerRow;
    const blockY = Math.floor(blockCounter / blocksPerRow);
    
    if (blockY >= Math.floor(height / blockSize)) {
      throw new Error('Could not read message length');
    }
    
    // Extract the block data
    const block = new Uint8ClampedArray(blockSize * blockSize * 4);
    for (let y = 0; y < blockSize; y++) {
      for (let x = 0; x < blockSize; x++) {
        const srcX = blockX * blockSize + x;
        const srcY = blockY * blockSize + y;
        const srcIdx = (srcY * width + srcX) * 4;
        const dstIdx = (y * blockSize + x) * 4;
        
        // Copy RGBA values
        block[dstIdx] = data[srcIdx];
        block[dstIdx + 1] = data[srcIdx + 1];
        block[dstIdx + 2] = data[srcIdx + 2];
        block[dstIdx + 3] = data[srcIdx + 3];
      }
    }
    
    // Apply 2D DWT to the block
    const dwtCoeffs = dwt2d(block, blockSize);
    
    // Extract bits from the high frequency bands
    for (let i = 0; i < bitsPerBlock && lengthBinary.length < 32; i++) {
      let bandToRead;
      let x = 0, y = 0;
      
      switch (i % 3) {
        case 0: bandToRead = dwtCoeffs.hl; x = 1; y = 1; break;
        case 1: bandToRead = dwtCoeffs.lh; x = 2; y = 1; break;
        case 2: bandToRead = dwtCoeffs.hh; x = 1; y = 2; break;
      }
      
      // Extract bit from coefficient
      const coeff = bandToRead[y][x];
      const roundedCoeff = Math.round(coeff);
      const bit = roundedCoeff % 2 === 0 ? 0 : 1;
      
      lengthBinary += bit.toString();
    }
    
    blockCounter++;
  }
  
  // Parse the message length
  const messageLength = parseInt(lengthBinary, 2);
  
  if (messageLength <= 0 || messageLength > width * height) {
    throw new Error('Invalid message length detected');
  }
  
  // Continue extraction for the actual message
  let messageBinary = '';
  
  // Extract message bits
  while (messageBinary.length < messageLength) {
    const blockX = blockCounter % blocksPerRow;
    const blockY = Math.floor(blockCounter / blocksPerRow);
    
    if (blockY >= Math.floor(height / blockSize)) {
      break; // Reached the end of the image
    }
    
    // Extract the block data
    const block = new Uint8ClampedArray(blockSize * blockSize * 4);
    for (let y = 0; y < blockSize; y++) {
      for (let x = 0; x < blockSize; x++) {
        const srcX = blockX * blockSize + x;
        const srcY = blockY * blockSize + y;
        const srcIdx = (srcY * width + srcX) * 4;
        const dstIdx = (y * blockSize + x) * 4;
        
        // Copy RGBA values
        block[dstIdx] = data[srcIdx];
        block[dstIdx + 1] = data[srcIdx + 1];
        block[dstIdx + 2] = data[srcIdx + 2];
        block[dstIdx + 3] = data[srcIdx + 3];
      }
    }
    
    // Apply 2D DWT to the block
    const dwtCoeffs = dwt2d(block, blockSize);
    
    // Extract bits from the high frequency bands
    for (let i = 0; i < bitsPerBlock && messageBinary.length < messageLength; i++) {
      let bandToRead;
      let x = 0, y = 0;
      
      switch (i % 3) {
        case 0: bandToRead = dwtCoeffs.hl; x = 1; y = 1; break;
        case 1: bandToRead = dwtCoeffs.lh; x = 2; y = 1; break;
        case 2: bandToRead = dwtCoeffs.hh; x = 1; y = 2; break;
      }
      
      // Extract bit from coefficient
      const coeff = bandToRead[y][x];
      const roundedCoeff = Math.round(coeff);
      const bit = roundedCoeff % 2 === 0 ? 0 : 1;
      
      messageBinary += bit.toString();
    }
    
    blockCounter++;
  }
  
  return messageBinary.substring(0, messageLength);
};

/**
 * Encodes multiple messages within a single image (main message plus decoys)
 */
export const encodeWithDecoys = async (
  imageFile: File,
  mainMessage: string,
  mainPassword: string | undefined,
  decoys: DecoyMessage[],
  options: any = {}
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // Create canvas and load image
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Load image
      img.onload = async () => {
        // Set canvas size to match image
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw the image on the canvas
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          
          // Get image data
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          
          // Check image capacity
          const totalPixels = canvas.width * canvas.height;
          const maxBits = totalPixels * 3; // 3 channels RGB
          
          // First encode main message
          let mainBinaryMessage = '';
          if (mainMessage) {
            // Add metadata for main message
            const mainMetadata = {
              ver: '2.0',
              alg: options.algorithm || 'lsb',
              enc: mainPassword ? (options.encryption?.algorithm || 'aes') : null,
              exp: options.expiry || null,
              dec: false,
              idx: 0
            };
            
            // Process main message
            let processedMainMessage = mainMessage;
            if (mainPassword && mainPassword.length > 0) {
              const encAlgorithm = options.encryption?.algorithm || 'aes';
              processedMainMessage = encryptMessage(mainMessage, mainPassword, encAlgorithm);
            }
            
            // Create full message with metadata
            const prefix = mainPassword && mainPassword.length > 0 ? 'ENC:' : 'RAW:';
            processedMainMessage = prefix + JSON.stringify(mainMetadata) + '::' + processedMainMessage;
            
            // Convert to binary
            mainBinaryMessage = textToBinary(processedMainMessage) + '00000000'; // Add null terminator
          }
          
          // Convert decoy messages to binary and add metadata
          const decoyBinaryMessages: { binary: string; index: number }[] = [];
          for (const decoy of decoys) {
            if (!decoy.message || decoy.message.trim() === '') continue;
            
            // Add metadata for decoy
            const decoyMetadata = {
              ver: '2.0',
              alg: options.algorithm || 'lsb',
              enc: decoy.password ? (options.encryption?.algorithm || 'aes') : null,
              exp: options.expiry || null,
              dec: true,
              idx: decoy.index
            };
            
            // Process decoy message
            let processedDecoyMessage = decoy.message;
            if (decoy.password && decoy.password.length > 0) {
              const encAlgorithm = options.encryption?.algorithm || 'aes';
              processedDecoyMessage = encryptMessage(decoy.message, decoy.password, encAlgorithm);
            }
            
            // Create full message with metadata
            const prefix = decoy.password && decoy.password.length > 0 ? 'ENC:' : 'RAW:';
            processedDecoyMessage = prefix + JSON.stringify(decoyMetadata) + '::' + processedDecoyMessage;
            
            // Convert to binary and add null terminator
            const decoyBinary = textToBinary(processedDecoyMessage) + '00000000';
            
            decoyBinaryMessages.push({
              binary: decoyBinary,
              index: decoy.index
            });
          }
          
          // Check if messages will fit in the image
          const totalBits = mainBinaryMessage.length + decoyBinaryMessages.reduce((sum, d) => sum + d.binary.length, 0);
          if (totalBits > maxBits * 0.75) {
            reject(new Error('Messages are too large for this image'));
            return;
          }
          
          // Store the offset where each message starts
          let mainOffset = 36; // Start after the length and algorithm bits
          const decoyOffsets = new Map<number, number>();
          
          // Encode main message
          if (mainBinaryMessage) {
            // Embed message length at the start
            const messageLengthBinary = mainBinaryMessage.length.toString(2).padStart(32, '0');
            for (let i = 0; i < 32; i++) {
              const bit = parseInt(messageLengthBinary[i]);
              data[i] = (data[i] & 0xFE) | bit;
            }
            
            // Embed algorithm identifier (4 bits)
            const algorithmId = {
              'lsb': '0000',
              'dct': '0001',
              'dwt': '0010',
              'multibit-lsb': '0011'
            }[options.algorithm || 'lsb'] || '0000';
            
            for (let i = 0; i < 4; i++) {
              const bit = parseInt(algorithmId[i]);
              data[32 + i] = (data[32 + i] & 0xFE) | bit;
            }
            
            // Embed main message using LSB
            for (let i = 0; i < mainBinaryMessage.length; i++) {
              if (mainOffset >= data.length) {
                reject(new Error('Image is not large enough for the main message'));
                return;
              }
              
              const bit = parseInt(mainBinaryMessage[i]);
              data[mainOffset] = (data[mainOffset] & 0xFE) | bit;
              mainOffset++;
            }
          }
          
          // Calculate starting position for decoys
          let currentOffset = mainOffset + 100; // Add some spacing between messages
          
          // Encode each decoy message
          for (const decoyMessage of decoyBinaryMessages) {
            decoyOffsets.set(decoyMessage.index, currentOffset);
            
            // Embed decoy message
            for (let i = 0; i < decoyMessage.binary.length; i++) {
              if (currentOffset >= data.length) {
                reject(new Error('Image is not large enough for all decoy messages'));
                return;
              }
              
              const bit = parseInt(decoyMessage.binary[i]);
              data[currentOffset] = (data[currentOffset] & 0xFE) | bit;
              currentOffset++;
            }
            
            // Add some spacing between messages
            currentOffset += 100;
          }
          
          // Put modified pixel data back to canvas
          ctx.putImageData(imageData, 0, 0);
          
          // Convert canvas to data URL
          const outputImageType = imageFile.type === 'image/jpeg' ? 'image/jpeg' : 'image/png';
          let quality = options.quality ? options.quality / 100 : 0.9;
          
          // PNG doesn't support quality parameter
          const dataURL = outputImageType === 'image/png' 
            ? canvas.toDataURL(outputImageType) 
            : canvas.toDataURL(outputImageType, quality);
          
          resolve(dataURL);
        } else {
          reject(new Error('Could not get canvas context'));
        }
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      
      // Set the source of the image to the provided file
      img.src = URL.createObjectURL(imageFile);
    } catch (error) {
      reject(error);
    }
  });
};
