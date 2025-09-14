
import { SteganographyOptions, DEFAULT_OPTIONS } from './types';
import { isMobileDevice, debugLog, optimizeImageForMobile, binaryToText } from './helpers';
import { decryptMessage } from './encryption';
import { applyDecodingAlgorithm } from './algorithms';

// Function to decode a message from an image
export const decodeMessage = async (
  imageFile: File,
  password?: string,
  decoyIndex?: number
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const isMobile = isMobileDevice();
      const options: SteganographyOptions = { 
        ...DEFAULT_OPTIONS, 
        algorithm: 'lsb',
        debug: true // Enable debug mode for decoding
      };
      
      debugLog('Starting message decode process', null, options);
      debugLog(`Running on ${isMobile ? 'mobile' : 'desktop'} device`, null, options);
      
      // Create canvas and load image
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Load image
      img.onload = () => {
        try {
          // Set canvas size to match image
          canvas.width = img.width;
          canvas.height = img.height;
          
          debugLog(`Original image size: ${img.width}x${img.height}`, null, options);
          
          // Draw the image on the canvas
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            
            // Apply image optimizations for mobile if needed
            const workingCanvas = isMobile ? optimizeImageForMobile(canvas, options) : canvas;
            debugLog(`Working canvas size: ${workingCanvas.width}x${workingCanvas.height}`, null, options);
            
            const workingCtx = workingCanvas.getContext('2d');
            
            if (!workingCtx) {
              reject(new Error('Could not get canvas context'));
              return;
            }
            
            // Get image data
            const imageData = workingCtx.getImageData(0, 0, workingCanvas.width, workingCanvas.height);
            const data = imageData.data;
            
            debugLog(`Image data length: ${data.length} bytes`, null, options);
            
            // Extract message length (first 32 bits)
            let messageLengthBinary = '';
            for (let i = 0; i < 32; i++) {
              messageLengthBinary += (data[i] & 1).toString();
            }
            const messageLength = parseInt(messageLengthBinary, 2);
            
            debugLog(`Detected message length: ${messageLength} bits`, null, options);
            
            // Check if message length is valid
            if (messageLength <= 0 || messageLength > data.length) {
              reject(new Error('No hidden message found or the image is corrupted'));
              return;
            }
            
            // Extract algorithm identifier (4 bits)
            let algorithmIdBinary = '';
            for (let i = 0; i < 4; i++) {
              algorithmIdBinary += (data[32 + i] & 1).toString();
            }
            
            // Extract capacity/bit depth (4 bits)
            let capacityBinary = '';
            for (let i = 0; i < 4; i++) {
              capacityBinary += (data[36 + i] & 1).toString();
            }
            const capacity = parseInt(capacityBinary, 2) || 1;
            
            // Map binary identifier to algorithm
            const algorithmMap: Record<string, string> = {
              '0000': 'lsb',
              '0001': 'dct',
              '0010': 'dwt',
              '0011': 'multibit-lsb',
              '0100': 'mobile-optimized',
              '0101': 'chaotic-lsb',
              '0110': 'hybrid-dct-dwt',
              '0111': 'adaptive-hybrid'
            };
            
            const algorithm = algorithmMap[algorithmIdBinary] || 'lsb';
            
            debugLog(`Detected algorithm: ${algorithm}`, null, options);
            debugLog(`Detected bit depth/capacity: ${capacity}`, null, options);
            
            // Update options with detected parameters
            options.algorithm = algorithm as any;
            options.capacity = capacity;
            
            // Extract message from data
            let offset = 40; // Start after the length, algorithm, and capacity bits
            
            try {
              // Apply the detected decoding algorithm
              const binaryMessage = applyDecodingAlgorithm(
                data,
                messageLength,
                offset,
                algorithm,
                capacity,
                options,
                workingCanvas.width,
                workingCanvas.height
              );
              
              debugLog(`Decoded binary length: ${binaryMessage.length} bits`, null, options);
              
              // Convert binary to text
              let message = binaryToText(binaryMessage);
              debugLog(`Raw decoded message length: ${message.length} characters`, null, options);
              
              // Check if message is in the new format with metadata
              if (message.startsWith('ENC:') || message.startsWith('RAW:')) {
                const isEncrypted = message.startsWith('ENC:');
                
                // Split metadata and actual message
                const parts = message.substring(4).split('::');
                if (parts.length < 2) {
                  reject(new Error('Message format is invalid'));
                  return;
                }
                
                try {
                  // Parse metadata
                  const metadata = JSON.parse(parts[0]);
                  message = parts[1];
                  
                  debugLog('Extracted metadata:', metadata, options);
                  
                  // Check if expiry is set and message has expired
                  if (metadata.exp) {
                    if (metadata.exp.type === 'time') {
                      const expiryTime = new Date(metadata.exp.value);
                      if (expiryTime < new Date()) {
                        reject(new Error('This message has expired'));
                        return;
                      }
                    }
                  }
                  
                  // Check if this is a decoy message and we're looking for a specific index
                  if (decoyIndex !== undefined && metadata.idx !== decoyIndex) {
                    reject(new Error('Decoy message with specified index not found'));
                    return;
                  }
                  
                  // Handle encrypted message
                  if (isEncrypted) {
                    // Check if password provided
                    if (!password || password.length === 0) {
                      resolve('ENCRYPTED'); // Signal that message is encrypted but no password
                      return;
                    }
                    
                    // Try to decrypt with the specified algorithm
                    const encAlgorithm = metadata.enc || 'aes';
                    
                    try {
                      debugLog(`Attempting to decrypt message using ${encAlgorithm}`, null, options);
                      const decrypted = decryptMessage(
                        message, 
                        password, 
                        encAlgorithm as any
                      );
                      
                      if (decrypted.length === 0) {
                        reject(new Error('Incorrect password'));
                        return;
                      }
                      
                      debugLog(`Successfully decrypted message: ${decrypted.length} characters`, null, options);
                      resolve(decrypted);
                    } catch (error) {
                      debugLog('Decryption error:', error, options);
                      reject(new Error('Incorrect password or corrupted message'));
                    }
                  } else {
                    debugLog(`Successfully decoded unencrypted message: ${message.length} characters`, null, options);
                    resolve(message);
                  }
                } catch (e) {
                  debugLog('Metadata parsing error:', e, options);
                  // Fallback to legacy format handling
                  if (isEncrypted) {
                    if (!password || password.length === 0) {
                      resolve('ENCRYPTED');
                      return;
                    }
                    
                    try {
                      const decrypted = decryptMessage(message, password);
                      
                      if (decrypted.length === 0) {
                        reject(new Error('Incorrect password'));
                        return;
                      }
                      
                      resolve(decrypted);
                    } catch (error) {
                      reject(new Error('Incorrect password or corrupted message'));
                    }
                  } else {
                    resolve(message);
                  }
                }
              } else {
                // Legacy format without metadata
                debugLog('Using legacy format without metadata', null, options);
                resolve(message);
              }
            } catch (error) {
              debugLog('Decoding algorithm error:', error, options);
              reject(new Error(`Error during decoding: ${error.message}`));
            }
          } else {
            reject(new Error('Could not get canvas context'));
          }
        } catch (error) {
          debugLog('General decoding error:', error, options);
          reject(error);
        }
      };
      
      img.onerror = () => {
        debugLog('Failed to load image', null, options);
        reject(new Error('Failed to load image'));
      };
      
      // Set the source of the image to the provided file
      img.src = URL.createObjectURL(imageFile);
    } catch (error) {
      reject(error);
    }
  });
};
