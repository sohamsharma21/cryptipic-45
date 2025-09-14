/**
 * Advanced Compression Algorithms for Steganography
 * Implements Huffman coding and other compression techniques to optimize payload size
 */

export interface CompressionOptions {
  algorithm: 'huffman' | 'rle' | 'lzw' | 'hybrid';
  level: number; // 1-9, higher = better compression
  adaptiveThreshold?: number;
}

export const DEFAULT_COMPRESSION_OPTIONS: CompressionOptions = {
  algorithm: 'huffman',
  level: 5,
  adaptiveThreshold: 0.7
};

/**
 * Huffman Coding Implementation
 * Provides optimal compression based on character frequency analysis
 */
export class HuffmanCoder {
  private frequencyTable: Map<string, number> = new Map();
  private codeTable: Map<string, string> = new Map();
  private tree: HuffmanNode | null = null;

  /**
   * Build frequency table from input text
   */
  private buildFrequencyTable(text: string): void {
    this.frequencyTable.clear();
    
    for (const char of text) {
      const count = this.frequencyTable.get(char) || 0;
      this.frequencyTable.set(char, count + 1);
    }
  }

  /**
   * Build Huffman tree from frequency table
   */
  private buildHuffmanTree(): HuffmanNode | null {
    const nodes: HuffmanNode[] = [];
    
    // Create leaf nodes for each character
    for (const [char, freq] of this.frequencyTable.entries()) {
      nodes.push(new HuffmanNode(char, freq));
    }

    // Handle edge case: single character
    if (nodes.length === 1) {
      const root = new HuffmanNode('', nodes[0].frequency);
      root.left = nodes[0];
      return root;
    }

    // Build tree by combining lowest frequency nodes
    while (nodes.length > 1) {
      // Sort by frequency (ascending)
      nodes.sort((a, b) => a.frequency - b.frequency);
      
      // Take two lowest frequency nodes
      const left = nodes.shift()!;
      const right = nodes.shift()!;
      
      // Create new internal node
      const merged = new HuffmanNode('', left.frequency + right.frequency);
      merged.left = left;
      merged.right = right;
      
      // Add back to nodes
      nodes.push(merged);
    }

    return nodes[0] || null;
  }

  /**
   * Generate Huffman codes from tree
   */
  private generateCodes(node: HuffmanNode, code: string = ''): void {
    if (!node) return;

    // Leaf node - store the code
    if (node.char !== '') {
      this.codeTable.set(node.char, code || '0'); // Handle single character case
      return;
    }

    // Internal node - traverse children
    if (node.left) this.generateCodes(node.left, code + '0');
    if (node.right) this.generateCodes(node.right, code + '1');
  }

  /**
   * Compress text using Huffman coding
   */
  compress(text: string): { compressed: string; header: string } {
    if (text.length === 0) {
      return { compressed: '', header: '' };
    }

    // Build frequency table and Huffman tree
    this.buildFrequencyTable(text);
    this.tree = this.buildHuffmanTree();
    this.codeTable.clear();
    
    if (this.tree) {
      this.generateCodes(this.tree);
    }

    // Encode the text
    let compressed = '';
    for (const char of text) {
      compressed += this.codeTable.get(char) || '';
    }

    // Create header with frequency table for decompression
    const header = this.serializeFrequencyTable();

    return { compressed, header };
  }

  /**
   * Decompress Huffman-encoded text
   */
  decompress(compressed: string, header: string): string {
    if (compressed.length === 0) return '';

    // Deserialize frequency table and rebuild tree
    this.deserializeFrequencyTable(header);
    this.tree = this.buildHuffmanTree();
    
    if (!this.tree) return '';

    // Handle single character case
    if (this.tree.char !== '') {
      return this.tree.char.repeat(compressed.length);
    }

    // Decode the compressed string
    let decoded = '';
    let current = this.tree;
    
    for (const bit of compressed) {
      current = (bit === '0') ? current.left! : current.right!;
      
      // Leaf node reached
      if (current.char !== '') {
        decoded += current.char;
        current = this.tree; // Reset to root
      }
    }

    return decoded;
  }

  /**
   * Serialize frequency table to string
   */
  private serializeFrequencyTable(): string {
    const entries: string[] = [];
    
    for (const [char, freq] of this.frequencyTable.entries()) {
      // Escape special characters
      const escapedChar = char.charCodeAt(0).toString(16).padStart(4, '0');
      entries.push(`${escapedChar}:${freq}`);
    }
    
    return entries.join(',');
  }

  /**
   * Deserialize frequency table from string
   */
  private deserializeFrequencyTable(header: string): void {
    this.frequencyTable.clear();
    
    if (header.length === 0) return;

    const entries = header.split(',');
    for (const entry of entries) {
      const [charCode, freqStr] = entry.split(':');
      if (charCode && freqStr) {
        const char = String.fromCharCode(parseInt(charCode, 16));
        const freq = parseInt(freqStr, 10);
        this.frequencyTable.set(char, freq);
      }
    }
  }

  /**
   * Calculate compression ratio
   */
  getCompressionRatio(originalSize: number, compressedSize: number): number {
    if (originalSize === 0) return 0;
    return (originalSize - compressedSize) / originalSize;
  }

  /**
   * Estimate optimal compression for given text
   */
  estimateCompression(text: string): { ratio: number; recommendedAlgorithm: string } {
    const { compressed } = this.compress(text);
    const originalBits = text.length * 8;
    const compressedBits = compressed.length;
    const ratio = this.getCompressionRatio(originalBits, compressedBits);

    // Recommend algorithm based on compression effectiveness
    let recommendedAlgorithm = 'huffman';
    if (ratio < 0.1) recommendedAlgorithm = 'rle'; // Poor compression, try RLE
    if (ratio > 0.5) recommendedAlgorithm = 'huffman'; // Good compression

    return { ratio, recommendedAlgorithm };
  }
}

/**
 * Huffman Tree Node
 */
class HuffmanNode {
  char: string;
  frequency: number;
  left: HuffmanNode | null = null;
  right: HuffmanNode | null = null;

  constructor(char: string, frequency: number) {
    this.char = char;
    this.frequency = frequency;
  }
}

/**
 * Run-Length Encoding (RLE) Implementation
 * Effective for data with many consecutive repeated characters
 */
export class RunLengthEncoder {
  /**
   * Compress using Run-Length Encoding
   */
  compress(text: string): string {
    if (text.length === 0) return '';

    let compressed = '';
    let currentChar = text[0];
    let count = 1;

    for (let i = 1; i < text.length; i++) {
      if (text[i] === currentChar) {
        count++;
      } else {
        // Encode the run
        compressed += this.encodeRun(currentChar, count);
        currentChar = text[i];
        count = 1;
      }
    }

    // Don't forget the last run
    compressed += this.encodeRun(currentChar, count);

    return compressed;
  }

  /**
   * Decompress RLE-encoded text
   */
  decompress(compressed: string): string {
    let decompressed = '';
    let i = 0;

    while (i < compressed.length) {
      // Read count
      let countStr = '';
      while (i < compressed.length && compressed[i] >= '0' && compressed[i] <= '9') {
        countStr += compressed[i];
        i++;
      }

      // Read character (handle escape sequences)
      if (i < compressed.length) {
        let char = compressed[i];
        if (char === '\\' && i + 1 < compressed.length) {
          char = compressed[i + 1]; // Escaped character
          i += 2;
        } else {
          i++;
        }

        const count = parseInt(countStr, 10) || 1;
        decompressed += char.repeat(count);
      }
    }

    return decompressed;
  }

  /**
   * Encode a single run
   */
  private encodeRun(char: string, count: number): string {
    // Escape special characters
    const escapedChar = char === '\\' ? '\\\\' : char;
    
    // Only include count if > 1 for better compression
    return count > 1 ? `${count}${escapedChar}` : escapedChar;
  }
}

/**
 * Hybrid Compression Algorithm
 * Combines multiple compression techniques for optimal results
 */
export class HybridCompressor {
  private huffman = new HuffmanCoder();
  private rle = new RunLengthEncoder();

  /**
   * Compress using the best algorithm for the given data
   */
  compress(text: string, options: CompressionOptions = DEFAULT_COMPRESSION_OPTIONS): {
    compressed: string;
    algorithm: string;
    header: string;
    metadata: any;
  } {
    // Test different compression algorithms
    const results = [
      this.testHuffman(text),
      this.testRLE(text),
      this.testHybridApproach(text)
    ];

    // Select best compression result
    const best = results.reduce((a, b) => 
      a.compressedSize < b.compressedSize ? a : b
    );

    return {
      compressed: best.compressed,
      algorithm: best.algorithm,
      header: best.header,
      metadata: {
        originalSize: text.length * 8,
        compressedSize: best.compressedSize,
        compressionRatio: (text.length * 8 - best.compressedSize) / (text.length * 8),
        algorithm: best.algorithm
      }
    };
  }

  /**
   * Decompress hybrid-compressed data
   */
  decompress(compressed: string, algorithm: string, header: string): string {
    switch (algorithm) {
      case 'huffman':
        return this.huffman.decompress(compressed, header);
      case 'rle':
        return this.rle.decompress(compressed);
      case 'hybrid':
        return this.decompressHybrid(compressed, header);
      default:
        throw new Error(`Unknown compression algorithm: ${algorithm}`);
    }
  }

  /**
   * Test Huffman compression
   */
  private testHuffman(text: string) {
    const result = this.huffman.compress(text);
    return {
      compressed: result.compressed,
      header: result.header,
      compressedSize: result.compressed.length,
      algorithm: 'huffman'
    };
  }

  /**
   * Test RLE compression
   */
  private testRLE(text: string) {
    const compressed = this.rle.compress(text);
    return {
      compressed,
      header: '',
      compressedSize: compressed.length * 8, // Convert to bits
      algorithm: 'rle'
    };
  }

  /**
   * Test hybrid approach (RLE + Huffman)
   */
  private testHybridApproach(text: string) {
    // First apply RLE
    const rleCompressed = this.rle.compress(text);
    
    // Then apply Huffman to RLE result
    const huffmanResult = this.huffman.compress(rleCompressed);
    
    return {
      compressed: huffmanResult.compressed,
      header: `RLE+HUFFMAN|${huffmanResult.header}`,
      compressedSize: huffmanResult.compressed.length,
      algorithm: 'hybrid'
    };
  }

  /**
   * Decompress hybrid (RLE + Huffman) data
   */
  private decompressHybrid(compressed: string, header: string): string {
    const [type, huffmanHeader] = header.split('|');
    
    if (type === 'RLE+HUFFMAN') {
      // First decompress Huffman
      const huffmanDecompressed = this.huffman.decompress(compressed, huffmanHeader);
      
      // Then decompress RLE
      return this.rle.decompress(huffmanDecompressed);
    }
    
    throw new Error(`Unknown hybrid compression type: ${type}`);
  }
}

/**
 * Advanced Compression Manager
 * Main interface for compression operations in steganography
 */
export class AdvancedCompressionManager {
  private hybridCompressor = new HybridCompressor();

  /**
   * Compress message with optimal algorithm selection
   */
  compressMessage(message: string, options: Partial<CompressionOptions> = {}): {
    compressedData: string;
    compressionInfo: {
      algorithm: string;
      header: string;
      originalSize: number;
      compressedSize: number;
      compressionRatio: number;
    };
  } {
    const opts = { ...DEFAULT_COMPRESSION_OPTIONS, ...options };
    
    const result = this.hybridCompressor.compress(message, opts);
    
    return {
      compressedData: result.compressed,
      compressionInfo: {
        algorithm: result.algorithm,
        header: result.header,
        originalSize: result.metadata.originalSize,
        compressedSize: result.metadata.compressedSize,
        compressionRatio: result.metadata.compressionRatio
      }
    };
  }

  /**
   * Decompress message
   */
  decompressMessage(compressedData: string, compressionInfo: any): string {
    return this.hybridCompressor.decompress(
      compressedData,
      compressionInfo.algorithm,
      compressionInfo.header
    );
  }

  /**
   * Calculate space savings from compression
   */
  calculateSpaceSavings(original: string, compressed: string): {
    originalBits: number;
    compressedBits: number;
    spaceSavings: number;
    compressionRatio: number;
  } {
    const originalBits = original.length * 8;
    const compressedBits = compressed.length;
    const spaceSavings = originalBits - compressedBits;
    const compressionRatio = spaceSavings / originalBits;

    return {
      originalBits,
      compressedBits,
      spaceSavings,
      compressionRatio
    };
  }

  /**
   * Recommend compression strategy based on message characteristics
   */
  recommendCompressionStrategy(message: string): {
    recommendedAlgorithm: string;
    estimatedRatio: number;
    reasoning: string;
  } {
    const length = message.length;
    const uniqueChars = new Set(message).size;
    const entropy = this.calculateEntropy(message);
    
    // Analyze message characteristics
    if (entropy < 3.0 && uniqueChars < 20) {
      return {
        recommendedAlgorithm: 'huffman',
        estimatedRatio: 0.4,
        reasoning: 'Low entropy and few unique characters favor Huffman coding'
      };
    }
    
    if (this.hasConsecutiveRepeats(message)) {
      return {
        recommendedAlgorithm: 'hybrid',
        estimatedRatio: 0.6,
        reasoning: 'Consecutive repeats detected, hybrid RLE+Huffman recommended'
      };
    }
    
    if (length > 1000) {
      return {
        recommendedAlgorithm: 'hybrid',
        estimatedRatio: 0.3,
        reasoning: 'Large message benefits from hybrid compression'
      };
    }
    
    return {
      recommendedAlgorithm: 'huffman',
      estimatedRatio: 0.25,
      reasoning: 'Default Huffman coding for general text'
    };
  }

  /**
   * Calculate Shannon entropy of message
   */
  private calculateEntropy(message: string): number {
    const freq: { [key: string]: number } = {};
    const length = message.length;
    
    // Count character frequencies
    for (const char of message) {
      freq[char] = (freq[char] || 0) + 1;
    }
    
    // Calculate entropy
    let entropy = 0;
    for (const count of Object.values(freq)) {
      const p = count / length;
      entropy -= p * Math.log2(p);
    }
    
    return entropy;
  }

  /**
   * Check for consecutive repeated characters
   */
  private hasConsecutiveRepeats(message: string): boolean {
    let consecutiveCount = 0;
    for (let i = 1; i < message.length; i++) {
      if (message[i] === message[i - 1]) {
        consecutiveCount++;
        if (consecutiveCount >= 3) return true;
      } else {
        consecutiveCount = 0;
      }
    }
    return false;
  }
}