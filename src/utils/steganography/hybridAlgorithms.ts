/**
 * Hybrid Steganography Algorithms
 * Combines multiple embedding techniques with chaotic randomization
 */

import { SteganographyOptions } from './types';
import { ChaoticSequenceGenerator } from './chaoticMaps';
import { AdvancedCompressionManager } from './advancedCompression';
import { dct, idct, dwt2d, idwt2d } from '../transforms';
import { debugLog } from './helpers';

export interface HybridEmbeddingResult {
  data: Uint8ClampedArray;
  metadata: {
    algorithm: string;
    chaoticSeed: number;
    compressionInfo: any;
    embeddingPositions: number[];
    redundancy: number;
  };
}

/**
 * Adaptive Hybrid Steganography Algorithm
 * Intelligently selects the best combination of techniques based on image and message characteristics
 */
export class AdaptiveHybridSteganography {
  private chaoticGenerator: ChaoticSequenceGenerator;
  private compressionManager: AdvancedCompressionManager;

  constructor() {
    this.chaoticGenerator = new ChaoticSequenceGenerator();
    this.compressionManager = new AdvancedCompressionManager();
  }

  /**
   * Encode message using adaptive hybrid approach
   */
  encode(
    data: Uint8ClampedArray,
    message: string,
    password: string | undefined,
    options: SteganographyOptions,
    width: number,
    height: number
  ): HybridEmbeddingResult {
    try {
      debugLog('Starting adaptive hybrid encoding', null, options);

      // Step 1: Analyze image characteristics
      const imageAnalysis = this.analyzeImage(data, width, height);
      
      // Step 2: Analyze message characteristics
      const messageAnalysis = this.analyzeMessage(message);

      // Step 3: Compress message optimally
      const compressionResult = this.compressionManager.compressMessage(message, {
        algorithm: (options.compression?.algorithm === 'none' ? 'huffman' : options.compression?.algorithm) || 'huffman',
        level: options.compression?.level || 5
      });

      // Step 4: Select optimal embedding strategy
      const strategy = this.selectEmbeddingStrategy(imageAnalysis, messageAnalysis, options);

      // Step 5: Generate chaotic embedding positions
      const embeddingPositions = this.generateChaoticPositions(
        width * height,
        compressionResult.compressedData.length * 8 + 256, // Extra space for metadata
        password,
        options
      );

      // Step 6: Apply hybrid embedding
      const embeddedData = this.applyHybridEmbedding(
        data,
        compressionResult.compressedData,
        compressionResult.compressionInfo,
        embeddingPositions,
        strategy,
        width,
        height,
        options
      );

      return {
        data: embeddedData,
        metadata: {
          algorithm: strategy.primaryAlgorithm,
          chaoticSeed: embeddingPositions[0],
          compressionInfo: compressionResult.compressionInfo,
          embeddingPositions: embeddingPositions.slice(0, 100), // Store first 100 for verification
          redundancy: strategy.redundancy
        }
      };
    } catch (error) {
      debugLog('Adaptive hybrid encoding error:', error, options);
      throw error;
    }
  }

  /**
   * Decode message using adaptive hybrid approach
   */
  decode(
    data: Uint8ClampedArray,
    password: string | undefined,
    options: SteganographyOptions,
    width: number,
    height: number
  ): { message: string; metadata: any } {
    try {
      debugLog('Starting adaptive hybrid decoding', null, options);

      // Step 1: Extract embedded metadata
      const metadata = this.extractEmbeddedMetadata(data, password, options, width, height);

      // Step 2: Regenerate chaotic positions
      const embeddingPositions = this.generateChaoticPositions(
        width * height,
        metadata.messageLength,
        password,
        options
      );

      // Step 3: Extract compressed message
      const compressedMessage = this.extractHybridMessage(
        data,
        embeddingPositions,
        metadata,
        width,
        height,
        options
      );

      // Step 4: Decompress message
      const decompressedMessage = this.compressionManager.decompressMessage(
        compressedMessage,
        metadata.compressionInfo
      );

      return {
        message: decompressedMessage,
        metadata: metadata
      };
    } catch (error) {
      debugLog('Adaptive hybrid decoding error:', error, options);
      throw error;
    }
  }

  /**
   * Analyze image characteristics for optimal algorithm selection
   */
  private analyzeImage(data: Uint8ClampedArray, width: number, height: number) {
    const analysis = {
      entropy: 0,
      edgeDensity: 0,
      textureComplexity: 0,
      colorVariance: 0,
      noiseLevel: 0,
      capacityEstimate: 0
    };

    // Calculate entropy
    const histogram = new Array(256).fill(0);
    for (let i = 0; i < data.length; i += 4) {
      const gray = Math.floor((data[i] + data[i + 1] + data[i + 2]) / 3);
      histogram[gray]++;
    }

    const totalPixels = width * height;
    for (const count of histogram) {
      if (count > 0) {
        const p = count / totalPixels;
        analysis.entropy -= p * Math.log2(p);
      }
    }

    // Calculate edge density using simple gradient
    let edgeCount = 0;
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        const current = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
        const right = (data[idx + 4] + data[idx + 5] + data[idx + 6]) / 3;
        const down = (data[idx + width * 4] + data[idx + width * 4 + 1] + data[idx + width * 4 + 2]) / 3;
        
        if (Math.abs(current - right) > 30 || Math.abs(current - down) > 30) {
          edgeCount++;
        }
      }
    }
    analysis.edgeDensity = edgeCount / totalPixels;

    // Estimate embedding capacity
    analysis.capacityEstimate = totalPixels * (analysis.entropy / 8) * (1 + analysis.edgeDensity);

    debugLog('Image analysis complete:', analysis);
    return analysis;
  }

  /**
   * Analyze message characteristics
   */
  private analyzeMessage(message: string) {
    const analysis = {
      length: message.length,
      entropy: 0,
      redundancy: 0,
      compressibility: 0
    };

    // Calculate entropy
    const freq: { [key: string]: number } = {};
    for (const char of message) {
      freq[char] = (freq[char] || 0) + 1;
    }

    for (const count of Object.values(freq)) {
      const p = count / message.length;
      analysis.entropy -= p * Math.log2(p);
    }

    // Estimate compressibility
    analysis.compressibility = Math.max(0, (8 - analysis.entropy) / 8);
    analysis.redundancy = 1 - analysis.compressibility;

    debugLog('Message analysis complete:', analysis);
    return analysis;
  }

  /**
   * Select optimal embedding strategy
   */
  private selectEmbeddingStrategy(imageAnalysis: any, messageAnalysis: any, options: SteganographyOptions) {
    const strategy = {
      primaryAlgorithm: 'hybrid-dct-dwt',
      secondaryAlgorithm: 'chaotic-lsb',
      redundancy: 1,
      errorCorrection: false,
      adaptiveCapacity: 1
    };

    // High entropy images favor frequency domain methods
    if (imageAnalysis.entropy > 6) {
      strategy.primaryAlgorithm = 'hybrid-dct-dwt';
      strategy.adaptiveCapacity = 2;
    }

    // Low entropy images favor spatial domain with chaotic embedding
    if (imageAnalysis.entropy < 4) {
      strategy.primaryAlgorithm = 'chaotic-lsb';
      strategy.adaptiveCapacity = 1;
    }

    // High edge density images can handle higher capacity
    if (imageAnalysis.edgeDensity > 0.3) {
      strategy.adaptiveCapacity = Math.min(3, strategy.adaptiveCapacity + 1);
      strategy.errorCorrection = true;
    }

    // Large messages need redundancy
    if (messageAnalysis.length > 1000) {
      strategy.redundancy = 2;
      strategy.errorCorrection = true;
    }

    debugLog('Selected embedding strategy:', strategy);
    return strategy;
  }

  /**
   * Generate chaotic embedding positions
   */
  private generateChaoticPositions(
    totalPositions: number,
    requiredBits: number,
    password: string | undefined,
    options: SteganographyOptions
  ): number[] {
    if (options.chaotic) {
      this.chaoticGenerator = new ChaoticSequenceGenerator({
        mapType: options.chaotic.mapType,
        seed: options.chaotic.seed || 0.5,
        iterations: options.chaotic.iterations
      });
    }

    const positions = this.chaoticGenerator.generateEmbeddingPositions(
      totalPositions,
      Math.ceil(requiredBits / 3), // Account for RGB channels
      password
    );

    debugLog(`Generated ${positions.length} chaotic positions`, null, options);
    return positions;
  }

  /**
   * Apply hybrid embedding using multiple algorithms
   */
  private applyHybridEmbedding(
    data: Uint8ClampedArray,
    compressedMessage: string,
    compressionInfo: any,
    positions: number[],
    strategy: any,
    width: number,
    height: number,
    options: SteganographyOptions
  ): Uint8ClampedArray {
    const result = new Uint8ClampedArray(data);

    // Create message envelope with metadata
    const messageEnvelope = {
      compressed: compressedMessage,
      compressionInfo: compressionInfo,
      strategy: strategy,
      timestamp: Date.now(),
      checksum: this.calculateChecksum(compressedMessage)
    };

    const envelopeString = JSON.stringify(messageEnvelope);
    const messageBinary = this.stringToBinary(envelopeString);

    debugLog(`Embedding ${messageBinary.length} bits using ${strategy.primaryAlgorithm}`, null, options);

    // Apply primary embedding algorithm
    if (strategy.primaryAlgorithm === 'hybrid-dct-dwt') {
      return this.applyHybridFrequencyDomain(result, messageBinary, width, height, positions, options);
    } else if (strategy.primaryAlgorithm === 'chaotic-lsb') {
      return this.applyChaoticLSB(result, messageBinary, positions, strategy.adaptiveCapacity, options);
    }

    return result;
  }

  /**
   * Apply hybrid frequency domain embedding (DCT + DWT)
   */
  private applyHybridFrequencyDomain(
    data: Uint8ClampedArray,
    binary: string,
    width: number,
    height: number,
    positions: number[],
    options: SteganographyOptions
  ): Uint8ClampedArray {
    const result = new Uint8ClampedArray(data);
    const blockSize = 8;
    let bitIndex = 0;

    // Interleave DCT and DWT embedding
    for (let i = 0; i < positions.length && bitIndex < binary.length; i++) {
      const position = positions[i];
      const blockX = Math.floor((position % width) / blockSize) * blockSize;
      const blockY = Math.floor(Math.floor(position / width) / blockSize) * blockSize;

      if (blockX + blockSize <= width && blockY + blockSize <= height) {
        if (i % 2 === 0) {
          // Apply DCT embedding
          bitIndex = this.embedDCTBlock(result, binary, bitIndex, blockX, blockY, blockSize, width, options);
        } else {
          // Apply DWT embedding
          bitIndex = this.embedDWTBlock(result, binary, bitIndex, blockX, blockY, blockSize, width, options);
        }
      }
    }

    return result;
  }

  /**
   * Apply chaotic LSB embedding with adaptive capacity
   */
  private applyChaoticLSB(
    data: Uint8ClampedArray,
    binary: string,
    positions: number[],
    capacity: number,
    options: SteganographyOptions
  ): Uint8ClampedArray {
    const result = new Uint8ClampedArray(data);
    let bitIndex = 0;

    for (let i = 0; i < positions.length && bitIndex < binary.length; i++) {
      const pixelIndex = positions[i] * 4; // Convert to RGBA index
      
      if (pixelIndex + 2 < result.length) {
        // Embed in RGB channels (skip alpha)
        for (let channel = 0; channel < 3 && bitIndex < binary.length; channel++) {
          // Use adaptive capacity (1-3 bits per channel)
          for (let bit = 0; bit < capacity && bitIndex < binary.length; bit++) {
            const binaryBit = parseInt(binary[bitIndex]);
            const currentByte = result[pixelIndex + channel];
            
            // Set the appropriate bit position (LSB, 2nd LSB, etc.)
            const mask = ~(1 << bit) & 0xFF;
            result[pixelIndex + channel] = (currentByte & mask) | (binaryBit << bit);
            
            bitIndex++;
          }
        }
      }
    }

    debugLog(`Embedded ${bitIndex} bits using chaotic LSB`, null, options);
    return result;
  }

  /**
   * Embed bits in DCT block
   */
  private embedDCTBlock(
    data: Uint8ClampedArray,
    binary: string,
    bitIndex: number,
    blockX: number,
    blockY: number,
    blockSize: number,
    width: number,
    options: SteganographyOptions
  ): number {
    // Extract block for each channel
    for (let channel = 0; channel < 3 && bitIndex < binary.length; channel++) {
      const block = new Array(blockSize * blockSize);
      
      // Extract block
      for (let y = 0; y < blockSize; y++) {
        for (let x = 0; x < blockSize; x++) {
          const pixelIndex = ((blockY + y) * width + (blockX + x)) * 4 + channel;
          block[y * blockSize + x] = data[pixelIndex];
        }
      }

      // Apply DCT
      const dctCoeffs = dct(block);

      // Embed bit in mid-frequency coefficient
      if (bitIndex < binary.length) {
        const bit = parseInt(binary[bitIndex]);
        const coeffIndex = 5 + (channel * 2); // Different coeff for each channel
        
        // Quantize to embed bit
        if (bit === 0 && dctCoeffs[coeffIndex] % 2 !== 0) {
          dctCoeffs[coeffIndex]--;
        } else if (bit === 1 && dctCoeffs[coeffIndex] % 2 === 0) {
          dctCoeffs[coeffIndex]++;
        }

        bitIndex++;
      }

      // Apply inverse DCT
      const idctBlock = idct(dctCoeffs);

      // Put block back
      for (let y = 0; y < blockSize; y++) {
        for (let x = 0; x < blockSize; x++) {
          const pixelIndex = ((blockY + y) * width + (blockX + x)) * 4 + channel;
          data[pixelIndex] = Math.max(0, Math.min(255, Math.round(idctBlock[y * blockSize + x])));
        }
      }
    }

    return bitIndex;
  }

  /**
   * Embed bits in DWT block
   */
  private embedDWTBlock(
    data: Uint8ClampedArray,
    binary: string,
    bitIndex: number,
    blockX: number,
    blockY: number,
    blockSize: number,
    width: number,
    options: SteganographyOptions
  ): number {
    // Extract RGBA block
    const block = new Uint8ClampedArray(blockSize * blockSize * 4);
    
    for (let y = 0; y < blockSize; y++) {
      for (let x = 0; x < blockSize; x++) {
        const srcIdx = ((blockY + y) * width + (blockX + x)) * 4;
        const dstIdx = (y * blockSize + x) * 4;
        
        for (let c = 0; c < 4; c++) {
          block[dstIdx + c] = data[srcIdx + c];
        }
      }
    }

    // Apply DWT
    const dwtCoeffs = dwt2d(block, blockSize);

    // Embed bits in high-frequency subbands
    const subbands = [dwtCoeffs.hl, dwtCoeffs.lh, dwtCoeffs.hh];
    
    for (let band = 0; band < subbands.length && bitIndex < binary.length; band++) {
      const subband = subbands[band];
      
      if (bitIndex < binary.length) {
        const bit = parseInt(binary[bitIndex]);
        const coeff = subband[1][1]; // Use coefficient at position (1,1)
        
        // Quantize coefficient
        if (bit === 0 && Math.round(coeff) % 2 !== 0) {
          subband[1][1] = Math.round(coeff) - 1;
        } else if (bit === 1 && Math.round(coeff) % 2 === 0) {
          subband[1][1] = Math.round(coeff) + 1;
        }
        
        bitIndex++;
      }
    }

    // Apply inverse DWT
    const idwtBlock = idwt2d(dwtCoeffs, blockSize);

    // Put block back (only RGB channels)
    for (let y = 0; y < blockSize; y++) {
      for (let x = 0; x < blockSize; x++) {
        const srcIdx = (y * blockSize + x) * 4;
        const dstIdx = ((blockY + y) * width + (blockX + x)) * 4;
        
        for (let c = 0; c < 3; c++) {
          data[dstIdx + c] = Math.max(0, Math.min(255, Math.round(idwtBlock[srcIdx + c])));
        }
      }
    }

    return bitIndex;
  }

  /**
   * Extract embedded metadata from image header
   */
  private extractEmbeddedMetadata(
    data: Uint8ClampedArray,
    password: string | undefined,
    options: SteganographyOptions,
    width: number,
    height: number
  ): any {
    // Extract first 1024 bits for metadata using simple LSB
    let metadataBinary = '';
    for (let i = 0; i < Math.min(1024 / 3, data.length / 4); i++) {
      const pixelIndex = i * 4;
      for (let channel = 0; channel < 3 && metadataBinary.length < 1024; channel++) {
        metadataBinary += (data[pixelIndex + channel] & 1).toString();
      }
    }

    try {
      const metadataString = this.binaryToString(metadataBinary);
      const metadata = JSON.parse(metadataString);
      return metadata;
    } catch (error) {
      throw new Error('Failed to extract metadata: corrupted or wrong password');
    }
  }

  /**
   * Extract message using hybrid algorithms
   */
  private extractHybridMessage(
    data: Uint8ClampedArray,
    positions: number[],
    metadata: any,
    width: number,
    height: number,
    options: SteganographyOptions
  ): string {
    // Implementation depends on the strategy used during embedding
    // This is a simplified version - full implementation would check metadata.strategy
    
    let extractedBinary = '';
    const capacity = metadata.strategy?.adaptiveCapacity || 1;

    for (let i = 0; i < positions.length && extractedBinary.length < metadata.messageLength; i++) {
      const pixelIndex = positions[i] * 4;
      
      if (pixelIndex + 2 < data.length) {
        for (let channel = 0; channel < 3 && extractedBinary.length < metadata.messageLength; channel++) {
          for (let bit = 0; bit < capacity && extractedBinary.length < metadata.messageLength; bit++) {
            const extractedBit = (data[pixelIndex + channel] >> bit) & 1;
            extractedBinary += extractedBit.toString();
          }
        }
      }
    }

    return this.binaryToString(extractedBinary);
  }

  /**
   * Utility: String to binary conversion
   */
  private stringToBinary(str: string): string {
    return str.split('').map(char => 
      char.charCodeAt(0).toString(2).padStart(8, '0')
    ).join('');
  }

  /**
   * Utility: Binary to string conversion
   */
  private binaryToString(binary: string): string {
    let result = '';
    for (let i = 0; i < binary.length; i += 8) {
      const byte = binary.substr(i, 8);
      if (byte.length === 8) {
        result += String.fromCharCode(parseInt(byte, 2));
      }
    }
    return result;
  }

  /**
   * Calculate checksum for message integrity
   */
  private calculateChecksum(message: string): string {
    let hash = 0;
    for (let i = 0; i < message.length; i++) {
      const char = message.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }
}