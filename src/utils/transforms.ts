// Discrete Cosine Transform (DCT) implementation
// Based on the JPEG DCT algorithm

/**
 * Apply Discrete Cosine Transform to a block of data
 * @param block Input block (typically 8x8)
 * @returns DCT coefficients
 */
export function dct(block: number[]): number[] {
  const N = Math.sqrt(block.length);
  const output = new Array(block.length).fill(0);
  
  for (let v = 0; v < N; v++) {
    for (let u = 0; u < N; u++) {
      let sum = 0;
      
      for (let y = 0; y < N; y++) {
        for (let x = 0; x < N; x++) {
          const cos1 = Math.cos(((2 * x + 1) * u * Math.PI) / (2 * N));
          const cos2 = Math.cos(((2 * y + 1) * v * Math.PI) / (2 * N));
          sum += block[y * N + x] * cos1 * cos2;
        }
      }
      
      let alpha_u = u === 0 ? 1 / Math.sqrt(N) : Math.sqrt(2 / N);
      let alpha_v = v === 0 ? 1 / Math.sqrt(N) : Math.sqrt(2 / N);
      
      output[v * N + u] = alpha_u * alpha_v * sum;
    }
  }
  
  return output;
}

/**
 * Apply Inverse Discrete Cosine Transform to DCT coefficients
 * @param coeffs DCT coefficients
 * @returns Reconstructed block
 */
export function idct(coeffs: number[]): number[] {
  const N = Math.sqrt(coeffs.length);
  const output = new Array(coeffs.length).fill(0);
  
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      let sum = 0;
      
      for (let v = 0; v < N; v++) {
        for (let u = 0; u < N; u++) {
          const alpha_u = u === 0 ? 1 / Math.sqrt(N) : Math.sqrt(2 / N);
          const alpha_v = v === 0 ? 1 / Math.sqrt(N) : Math.sqrt(2 / N);
          
          const cos1 = Math.cos(((2 * x + 1) * u * Math.PI) / (2 * N));
          const cos2 = Math.cos(((2 * y + 1) * v * Math.PI) / (2 * N));
          
          sum += alpha_u * alpha_v * coeffs[v * N + u] * cos1 * cos2;
        }
      }
      
      // Clamp values between 0 and 255
      output[y * N + x] = Math.max(0, Math.min(255, sum));
    }
  }
  
  return output;
}

// Enhanced Discrete Wavelet Transform (DWT) implementation
/**
 * Apply forward Discrete Wavelet Transform to a 1D array of data
 * @param data Input data array
 * @returns Object containing approximation and detail coefficients
 */
export function dwt(data: number[]): { approximation: number[], details: number[] } {
  const length = data.length;
  const halfLength = length / 2;
  
  const approximation = new Array(halfLength);
  const details = new Array(halfLength);
  
  // Simple Haar wavelet transform
  for (let i = 0; i < halfLength; i++) {
    const idx = i * 2;
    approximation[i] = (data[idx] + data[idx + 1]) / Math.sqrt(2);
    details[i] = (data[idx] - data[idx + 1]) / Math.sqrt(2);
  }
  
  return { approximation, details };
}

/**
 * Apply inverse Discrete Wavelet Transform to reconstruct original data
 * @param approximation Approximation coefficients
 * @param details Detail coefficients
 * @returns Reconstructed data array
 */
export function idwt(approximation: number[], details: number[]): number[] {
  const halfLength = approximation.length;
  const result = new Array(halfLength * 2);
  
  // Inverse Haar wavelet transform
  for (let i = 0; i < halfLength; i++) {
    const idx = i * 2;
    result[idx] = (approximation[i] + details[i]) / Math.sqrt(2);
    result[idx + 1] = (approximation[i] - details[i]) / Math.sqrt(2);
  }
  
  return result;
}

/**
 * Apply 2D DWT transform to image data
 * @param data Image data array (should be square, power of 2 dimension)
 * @param width Width of the image data
 * @returns Transformed coefficients
 */
export function dwt2d(data: Uint8ClampedArray, width: number): {
  ll: number[][],  // Low-Low (approximation)
  lh: number[][],  // Low-High (horizontal details)
  hl: number[][],  // High-Low (vertical details)
  hh: number[][]   // High-High (diagonal details)
} {
  const height = data.length / (width * 4); // Account for RGBA
  const size = Math.min(width, height);
  
  // Create coefficient arrays
  const ll = Array(Math.ceil(size/2)).fill(0).map(() => Array(Math.ceil(size/2)).fill(0));
  const lh = Array(Math.ceil(size/2)).fill(0).map(() => Array(Math.ceil(size/2)).fill(0));
  const hl = Array(Math.ceil(size/2)).fill(0).map(() => Array(Math.ceil(size/2)).fill(0));
  const hh = Array(Math.ceil(size/2)).fill(0).map(() => Array(Math.ceil(size/2)).fill(0));
  
  // Process rows first
  const rowTempApprox = Array(Math.ceil(size/2)).fill(0).map(() => Array(size).fill(0));
  const rowTempDetails = Array(Math.ceil(size/2)).fill(0).map(() => Array(size).fill(0));
  
  // Extract R channel for simplicity (could be extended to handle all channels)
  for (let y = 0; y < size; y++) {
    const row = new Array(size);
    for (let x = 0; x < size; x++) {
      const idx = (y * width + x) * 4;
      row[x] = data[idx]; // R channel
    }
    
    // Apply 1D DWT to each row
    const halfSize = Math.ceil(size/2);
    for (let i = 0; i < halfSize; i++) {
      const idx = i * 2;
      if (idx + 1 < size) {
        rowTempApprox[y][i] = (row[idx] + row[idx + 1]) / Math.sqrt(2);
        rowTempDetails[y][i] = (row[idx] - row[idx + 1]) / Math.sqrt(2);
      } else {
        // Handle odd-length arrays
        rowTempApprox[y][i] = row[idx] / Math.sqrt(2);
        rowTempDetails[y][i] = row[idx] / Math.sqrt(2);
      }
    }
  }
  
  // Process columns next
  const halfSize = Math.ceil(size/2);
  for (let x = 0; x < halfSize; x++) {
    // Process approximation coefficients
    for (let y = 0; y < halfSize; y++) {
      const colApprox = new Array(halfSize);
      const colDetail = new Array(halfSize);
      
      for (let i = 0; i < halfSize; i++) {
        colApprox[i] = rowTempApprox[i][x];
        colDetail[i] = rowTempDetails[i][x];
      }
      
      // Apply 1D DWT to approximation columns
      for (let i = 0; i < halfSize/2; i++) {
        const idx = i * 2;
        if (idx + 1 < halfSize) {
          ll[i][y] = (colApprox[idx] + colApprox[idx + 1]) / Math.sqrt(2);
          lh[i][y] = (colApprox[idx] - colApprox[idx + 1]) / Math.sqrt(2);
          hl[i][y] = (colDetail[idx] + colDetail[idx + 1]) / Math.sqrt(2);
          hh[i][y] = (colDetail[idx] - colDetail[idx + 1]) / Math.sqrt(2);
        } else {
          // Handle odd-length arrays
          ll[i][y] = colApprox[idx] / Math.sqrt(2);
          lh[i][y] = colApprox[idx] / Math.sqrt(2);
          hl[i][y] = colDetail[idx] / Math.sqrt(2);
          hh[i][y] = colDetail[idx] / Math.sqrt(2);
        }
      }
    }
  }
  
  return { ll, lh, hl, hh };
}

/**
 * Apply inverse 2D DWT to reconstruct image data
 * @param coeffs DWT coefficients
 * @param width Target width of the reconstructed data
 * @returns Reconstructed image data
 */
export function idwt2d(
  coeffs: {
    ll: number[][],
    lh: number[][],
    hl: number[][],
    hh: number[][]
  },
  width: number
): Uint8ClampedArray {
  const { ll, lh, hl, hh } = coeffs;
  const halfSize = ll.length;
  const size = halfSize * 2;
  
  // Allocate memory for the reconstructed data (RGBA)
  const reconstructed = new Uint8ClampedArray(size * size * 4);
  
  // Temporary arrays for row processing
  const rowTempApprox = Array(size).fill(0).map(() => Array(halfSize).fill(0));
  const rowTempDetails = Array(size).fill(0).map(() => Array(halfSize).fill(0));
  
  // Inverse column transform
  for (let y = 0; y < halfSize; y++) {
    for (let x = 0; x < halfSize; x++) {
      // Process each 2x2 block of coefficients
      const approxCoeff = ll[y][x];
      const horizCoeff = lh[y][x];
      const vertCoeff = hl[y][x];
      const diagCoeff = hh[y][x];
      
      // Inverse column transform
      rowTempApprox[y*2][x] = (approxCoeff + vertCoeff) / Math.sqrt(2);
      rowTempApprox[y*2+1][x] = (approxCoeff - vertCoeff) / Math.sqrt(2);
      rowTempDetails[y*2][x] = (horizCoeff + diagCoeff) / Math.sqrt(2);
      rowTempDetails[y*2+1][x] = (horizCoeff - diagCoeff) / Math.sqrt(2);
    }
  }
  
  // Inverse row transform and set pixel values
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < halfSize; x++) {
      // Combine approximation and detail coefficients
      const approxCoeff = rowTempApprox[y][x];
      const detailCoeff = rowTempDetails[y][x];
      
      // Inverse row transform
      const idx1 = (y * width + x*2) * 4;
      const idx2 = (y * width + x*2+1) * 4;
      
      // Set RGBA values
      const value1 = Math.max(0, Math.min(255, Math.round((approxCoeff + detailCoeff) / Math.sqrt(2))));
      const value2 = Math.max(0, Math.min(255, Math.round((approxCoeff - detailCoeff) / Math.sqrt(2))));
      
      // Set all channels to the same value for simplicity
      reconstructed[idx1] = value1;     // R
      reconstructed[idx1+1] = value1;   // G
      reconstructed[idx1+2] = value1;   // B
      reconstructed[idx1+3] = 255;      // A
      
      reconstructed[idx2] = value2;     // R
      reconstructed[idx2+1] = value2;   // G
      reconstructed[idx2+2] = value2;   // B
      reconstructed[idx2+3] = 255;      // A
    }
  }
  
  return reconstructed;
}
