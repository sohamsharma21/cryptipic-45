
import { SteganographyOptions } from './types';

// Helper function to check if we're running on a mobile device
export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         window.innerWidth < 768;
};

// Helper function to log debug information
export const debugLog = (message: string, data?: any, options?: SteganographyOptions): void => {
  if (options?.debug) {
    console.log(`[Steg Debug] ${message}`, data || '');
  }
};

// Helper function to convert a string to binary representation
export const textToBinary = (text: string): string => {
  let binary = '';
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i).toString(2).padStart(8, '0');
    binary += charCode;
  }
  return binary;
};

// Helper function to convert binary representation back to a string
export const binaryToText = (binary: string): string => {
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

// Optimized image processing for mobile devices
export const optimizeImageForMobile = (
  canvas: HTMLCanvasElement, 
  options: SteganographyOptions
): HTMLCanvasElement => {
  const isMobile = isMobileDevice();
  
  if (isMobile) {
    const MAX_SIZE = options.mobileOptimized ? 800 : 1200;
    let width = canvas.width;
    let height = canvas.height;
    
    debugLog(`Original image size: ${width}x${height}`, null, options);
    
    // Resize if image is too large for mobile
    if (width > MAX_SIZE || height > MAX_SIZE) {
      if (width > height) {
        height = Math.floor((height / width) * MAX_SIZE);
        width = MAX_SIZE;
      } else {
        width = Math.floor((width / height) * MAX_SIZE);
        height = MAX_SIZE;
      }
      
      debugLog(`Resizing image for mobile: ${width}x${height}`, null, options);
      
      // Create a new canvas with resized dimensions
      const resizedCanvas = document.createElement('canvas');
      resizedCanvas.width = width;
      resizedCanvas.height = height;
      
      // Draw original image to new canvas with resizing
      const ctx = resizedCanvas.getContext('2d');
      if (ctx) {
        // Use better quality image interpolation
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(canvas, 0, 0, width, height);
        return resizedCanvas;
      }
    }
  }
  
  return canvas;
};

// Function to download a Data URL as a file
export const downloadImage = (dataUrl: string, fileName: string): void => {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName;
  link.click();
};

// Set the favicon to the uploaded image
export const setAppIcon = (imageUrl: string): void => {
  // Get reference to the favicon link element
  let favicon = document.querySelector("link[rel='icon']") as HTMLLinkElement;
  
  // If no favicon exists, create one
  if (!favicon) {
    favicon = document.createElement('link');
    favicon.rel = 'icon';
    document.head.appendChild(favicon);
  }
  
  // Update favicon href
  favicon.href = imageUrl;
  favicon.type = 'image/png';
};
