
import { SteganographyOptions, DEFAULT_OPTIONS, MOBILE_QUALITY } from './types'; 
import { isMobileDevice, debugLog, optimizeImageForMobile, textToBinary } from './helpers';
import { encryptMessage } from './encryption';
import { applyEncodingAlgorithm } from './algorithms';
import { encodeWithDecoys, DecoyMessage } from '../steganographyAlgorithms';

// Function to encode a message within an image using the selected algorithm
export const encodeMessage = async (
  imageFile: File,
  message: string,
  password?: string,
  options: Partial<SteganographyOptions> = {}
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const finalOptions = { ...DEFAULT_OPTIONS, ...options } as SteganographyOptions;
      
      // Check if we're on mobile and apply special optimizations
      const isMobile = isMobileDevice();
      if (isMobile && finalOptions.mobileOptimized !== false) {
        // For mobile, use mobile-optimized algorithm by default
        if (!options.algorithm) {
          finalOptions.algorithm = 'mobile-optimized';
          debugLog('Automatically selected mobile-optimized algorithm', null, finalOptions);
        }
        
        // Lower quality for better performance on mobile
        if (!options.quality) {
          finalOptions.quality = MOBILE_QUALITY;
          debugLog(`Set mobile quality to ${MOBILE_QUALITY}`, null, finalOptions);
        }
      }
      
      debugLog('Encoding message with options:', finalOptions, finalOptions);
      
      // Encrypt message if password is provided
      let processedMessage = message;
      let encryptionAlgo = 'aes';
      
      if (password && password.length > 0) {
        encryptionAlgo = finalOptions.encryption?.algorithm || 'aes';
        debugLog(`Encrypting message using ${encryptionAlgo}`, null, finalOptions);
        processedMessage = encryptMessage(message, password, encryptionAlgo as any);
      }
      
      // Add metadata about encoding
      const metadata = {
        ver: '2.0',
        alg: finalOptions.algorithm,
        enc: password ? encryptionAlgo : null,
        exp: finalOptions.expiry,
        dec: finalOptions.isDecoy,
        idx: finalOptions.decoyIndex,
        cap: finalOptions.capacity,
        mob: isMobile ? 1 : 0, // Flag to indicate if encoded on mobile
        ts: new Date().getTime() // Timestamp
      };
      
      debugLog('Encoding with metadata:', metadata, finalOptions);
      
      // Add a delimiter to indicate encoding specifics
      const prefix = password && password.length > 0 ? 'ENC:' : 'RAW:';
      processedMessage = prefix + JSON.stringify(metadata) + '::' + processedMessage;
      
      // Convert message to binary representation
      const binaryMessage = textToBinary(processedMessage) + '00000000'; // Add null terminator
      debugLog(`Binary message length: ${binaryMessage.length} bits`, null, finalOptions);
      
      // Create canvas and load image
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Load image
      img.onload = () => {
        // Set canvas size to match image
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw the image on the canvas
        if (ctx) {
          debugLog(`Original image size: ${img.width}x${img.height}`, null, finalOptions);
          
          ctx.drawImage(img, 0, 0);
          
          // Apply mobile optimizations if needed
          const workingCanvas = (isMobile && finalOptions.mobileOptimized !== false) 
            ? optimizeImageForMobile(canvas, finalOptions) 
            : canvas;
          
          debugLog(`Working canvas size: ${workingCanvas.width}x${workingCanvas.height}`, null, finalOptions);
          
          const workingCtx = workingCanvas.getContext('2d');
          
          if (!workingCtx) {
            reject(new Error('Could not get canvas context'));
            return;
          }
          
          // Get image data
          const imageData = workingCtx.getImageData(0, 0, workingCanvas.width, workingCanvas.height);
          const data = imageData.data;
          
          debugLog(`Image data length: ${data.length} bytes`, null, finalOptions);
          
          // Check if there's enough space in the image to store the message
          let requiredBits = binaryMessage.length;
          
          if (finalOptions.algorithm === 'mobile-optimized') {
            // Mobile optimized requires more space due to redundancy
            requiredBits = binaryMessage.length * 4; // 4x more space for redundancy
          } else if (finalOptions.algorithm === 'multibit-lsb') {
            requiredBits = Math.ceil(binaryMessage.length / (finalOptions.capacity || 1));
          }
          
          debugLog(`Required bits for storage: ${requiredBits}`, null, finalOptions);
          
          if (requiredBits > data.length * 0.75) {
            reject(new Error('Message is too large for this image'));
            return;
          }
          
          // Embed the message length first (32 bits for more capacity)
          const messageLengthBinary = binaryMessage.length.toString(2).padStart(32, '0');
          for (let i = 0; i < 32; i++) {
            // Change the LSB of the first 32 bytes
            const bit = parseInt(messageLengthBinary[i]);
            data[i] = (data[i] & 0xFE) | bit;
          }
          
          // Embed algorithm identifier (4 bits)
          const algorithmId = {
            'lsb': '0000',
            'dct': '0001',
            'dwt': '0010',
            'multibit-lsb': '0011',
            'mobile-optimized': '0100',
            'chaotic-lsb': '0101',
            'hybrid-dct-dwt': '0110',
            'adaptive-hybrid': '0111'
          }[finalOptions.algorithm] || '0000';
          
          debugLog(`Using algorithm ID: ${algorithmId}`, null, finalOptions);
          
          for (let i = 0; i < 4; i++) {
            const bit = parseInt(algorithmId[i]);
            data[32 + i] = (data[32 + i] & 0xFE) | bit;
          }
          
          // Embed capacity/bit depth (4 bits)
          const capacityBinary = (finalOptions.capacity || 1).toString(2).padStart(4, '0');
          for (let i = 0; i < 4; i++) {
            const bit = parseInt(capacityBinary[i]);
            data[36 + i] = (data[36 + i] & 0xFE) | bit;
          }
          
          // Embed message bits in the data according to the algorithm
          let offset = 40; // Start after the length, algorithm, and capacity bits
          
          try {
            // Apply the selected encoding algorithm
            const encodedData = applyEncodingAlgorithm(
              data,
              binaryMessage,
              offset,
              finalOptions,
              workingCanvas.width,
              workingCanvas.height
            );
            
            // Copy encoded data back to image data if needed
            for (let i = 0; i < data.length; i++) {
              data[i] = encodedData[i];
            }
            
            // Put modified pixel data back to canvas
            workingCtx.putImageData(imageData, 0, 0);
            
            // Convert canvas to data URL with specified quality
            const outputImageType = imageFile.type === 'image/jpeg' ? 'image/jpeg' : 'image/png';
            let quality = finalOptions.quality ? finalOptions.quality / 100 : 0.9;
            
            // Lower quality on mobile to reduce file size if not specified
            if (isMobile && finalOptions.mobileOptimized !== false && !options.quality) {
              quality = 0.8;
            }
            
            debugLog(`Converting to ${outputImageType} with quality ${quality}`, null, finalOptions);
            
            // PNG doesn't support quality parameter
            const dataURL = outputImageType === 'image/png' 
              ? workingCanvas.toDataURL(outputImageType) 
              : workingCanvas.toDataURL(outputImageType, quality);
            
            resolve(dataURL);
          } catch (error) {
            debugLog('Encoding error:', error, finalOptions);
            reject(error);
          }
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

// Function to encode multiple messages (one main and multiple decoys) within an image
export const encodeMultipleMessages = async (
  imageFile: File,
  mainMessage: string,
  mainPassword: string | undefined,
  decoys: DecoyMessage[],
  options: Partial<SteganographyOptions> = {}
): Promise<string> => {
  try {
    // Apply mobile optimizations
    const isMobile = isMobileDevice();
    if (isMobile && options.mobileOptimized !== false) {
      // For mobile, use mobile-optimized algorithm for better results
      if (!options.algorithm) {
        options.algorithm = 'mobile-optimized';
      }
      
      // Set appropriate quality for mobile
      if (!options.quality) {
        options.quality = MOBILE_QUALITY;
      }
    }
    
    return await encodeWithDecoys(imageFile, mainMessage, mainPassword, decoys, options);
  } catch (error) {
    throw error;
  }
};
