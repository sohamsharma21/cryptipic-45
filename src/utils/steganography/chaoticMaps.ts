/**
 * Chaotic Map-Based Randomization for Steganography
 * Implements various chaotic maps for secure, pseudo-random embedding locations
 */

export interface ChaoticMapOptions {
  seed: number;
  iterations: number;
  mapType: 'logistic' | 'tent' | 'henon' | 'arnold';
  parameters?: { [key: string]: number };
}

export const DEFAULT_CHAOTIC_OPTIONS: ChaoticMapOptions = {
  seed: 0.5,
  iterations: 1000,
  mapType: 'logistic',
  parameters: { r: 3.99 }
};

/**
 * Logistic Map: x(n+1) = r * x(n) * (1 - x(n))
 * Classic chaotic map with excellent randomization properties
 */
export class LogisticMap {
  private x: number;
  private r: number;

  constructor(seed: number = 0.5, r: number = 3.99) {
    this.x = seed;
    this.r = r;
  }

  next(): number {
    this.x = this.r * this.x * (1 - this.x);
    return this.x;
  }

  generateSequence(length: number): number[] {
    const sequence: number[] = [];
    for (let i = 0; i < length; i++) {
      sequence.push(this.next());
    }
    return sequence;
  }
}

/**
 * Tent Map: More uniform distribution than logistic map
 * x(n+1) = μ * min(x(n), 1-x(n))
 */
export class TentMap {
  private x: number;
  private mu: number;

  constructor(seed: number = 0.5, mu: number = 2.0) {
    this.x = seed;
    this.mu = mu;
  }

  next(): number {
    this.x = this.mu * Math.min(this.x, 1 - this.x);
    return this.x;
  }

  generateSequence(length: number): number[] {
    const sequence: number[] = [];
    for (let i = 0; i < length; i++) {
      sequence.push(this.next());
    }
    return sequence;
  }
}

/**
 * Hénon Map: 2D chaotic map for enhanced randomization
 * x(n+1) = 1 - a*x(n)^2 + y(n)
 * y(n+1) = b*x(n)
 */
export class HenonMap {
  private x: number;
  private y: number;
  private a: number;
  private b: number;

  constructor(seedX: number = 0.1, seedY: number = 0.1, a: number = 1.4, b: number = 0.3) {
    this.x = seedX;
    this.y = seedY;
    this.a = a;
    this.b = b;
  }

  next(): { x: number, y: number } {
    const newX = 1 - this.a * this.x * this.x + this.y;
    const newY = this.b * this.x;
    this.x = newX;
    this.y = newY;
    return { x: this.x, y: this.y };
  }

  generateSequence(length: number): number[] {
    const sequence: number[] = [];
    for (let i = 0; i < length; i++) {
      const point = this.next();
      // Combine x and y for single value, normalize to [0,1]
      sequence.push((Math.abs(point.x) + Math.abs(point.y)) % 1);
    }
    return sequence;
  }
}

/**
 * Arnold Cat Map: 2D area-preserving chaotic map
 * Used for pixel position scrambling
 */
export class ArnoldCatMap {
  private width: number;
  private height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  /**
   * Apply Arnold Cat Map transformation to coordinates
   */
  transform(x: number, y: number, iterations: number = 1): { x: number, y: number } {
    let newX = x;
    let newY = y;

    for (let i = 0; i < iterations; i++) {
      const tempX = (newX + newY) % this.width;
      const tempY = (newX + 2 * newY) % this.height;
      newX = tempX;
      newY = tempY;
    }

    return { x: Math.floor(newX), y: Math.floor(newY) };
  }

  /**
   * Generate scrambled pixel positions
   */
  generateScrambledPositions(totalPixels: number, iterations: number = 5): number[] {
    const positions: number[] = [];
    
    for (let i = 0; i < totalPixels; i++) {
      const x = i % this.width;
      const y = Math.floor(i / this.width);
      
      const scrambled = this.transform(x, y, iterations);
      const newPosition = scrambled.y * this.width + scrambled.x;
      
      positions.push(newPosition);
    }

    return positions;
  }
}

/**
 * Chaotic Sequence Generator
 * Main interface for generating chaotic sequences for steganography
 */
export class ChaoticSequenceGenerator {
  private options: ChaoticMapOptions;
  
  constructor(options: Partial<ChaoticMapOptions> = {}) {
    this.options = { ...DEFAULT_CHAOTIC_OPTIONS, ...options };
  }

  /**
   * Generate a chaotic sequence for embedding positions with security enhancements
   */
  async generateEmbeddingPositions(
    totalPositions: number, 
    requiredPositions: number,
    password?: string
  ): Promise<number[]> {
    // Security: Validate inputs
    if (totalPositions <= 0 || requiredPositions <= 0) {
      throw new Error('Invalid position parameters');
    }
    
    if (requiredPositions > totalPositions * 0.25) {
      throw new Error('Required positions exceed safe embedding capacity');
    }

    // Use secure password-to-seed conversion if password provided
    let seed = this.options.seed;
    if (password) {
      seed = await this.passwordToSeed(password);
    }

    let sequence: number[] = [];
    
    switch (this.options.mapType) {
      case 'logistic':
        const logistic = new LogisticMap(seed, this.options.parameters?.r || 3.99);
        sequence = logistic.generateSequence(requiredPositions * 2); // Generate extra for filtering
        break;
        
      case 'tent':
        const tent = new TentMap(seed, this.options.parameters?.mu || 2.0);
        sequence = tent.generateSequence(requiredPositions * 2);
        break;
        
      case 'henon':
        const henon = new HenonMap(seed, seed * 0.7, 
          this.options.parameters?.a || 1.4, 
          this.options.parameters?.b || 0.3);
        sequence = henon.generateSequence(requiredPositions * 2);
        break;
        
      case 'arnold':
        // For Arnold map, we need image dimensions
        const width = Math.sqrt(totalPositions);
        const height = width;
        const arnold = new ArnoldCatMap(width, height);
        return arnold.generateScrambledPositions(totalPositions, this.options.iterations)
          .slice(0, requiredPositions);
        
      default:
        throw new Error(`Unsupported chaotic map type: ${this.options.mapType}`);
    }

    // Convert chaotic values to position indices
    const positions = sequence
      .map(val => Math.floor(val * totalPositions))
      .filter((pos, index, arr) => arr.indexOf(pos) === index) // Remove duplicates
      .slice(0, requiredPositions);

    // If we don't have enough unique positions, fill with remaining positions
    if (positions.length < requiredPositions) {
      const usedPositions = new Set(positions);
      for (let i = 0; i < totalPositions && positions.length < requiredPositions; i++) {
        if (!usedPositions.has(i)) {
          positions.push(i);
        }
      }
    }

    return positions.slice(0, requiredPositions);
  }

  /**
   * Security: Secure password-to-seed conversion using crypto primitives
   */
  private async passwordToSeed(password: string): Promise<number> {
    try {
      // Use Web Crypto API for secure hashing
      const encoder = new TextEncoder();
      const data = encoder.encode(password + 'chaotic-salt-v2');
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = new Uint8Array(hashBuffer);
      
      // Convert first 4 bytes to number and normalize
      let hash = 0;
      for (let i = 0; i < 4; i++) {
        hash = (hash << 8) | hashArray[i];
      }
      
      // Normalize to (0, 1) range, avoiding exactly 0 or 1
      const normalized = (Math.abs(hash) % 999999) / 1000000 + 0.000001;
      return normalized;
    } catch (error) {
      // Fallback to less secure but compatible method
      console.warn('Crypto API unavailable, using fallback hash');
      let hash = 0;
      for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return (Math.abs(hash) % 999999) / 1000000 + 0.000001;
    }
  }

  /**
   * Generate chaotic key stream for encryption enhancement with security improvements
   */
  async generateKeyStream(length: number, password?: string): Promise<Uint8Array> {
    // Security: Validate length
    if (length <= 0 || length > 1048576) { // Max 1MB
      throw new Error('Invalid key stream length');
    }

    const seed = password ? await this.passwordToSeed(password) : this.options.seed;
    const logistic = new LogisticMap(seed, 3.99);
    
    const keyStream = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      keyStream[i] = Math.floor(logistic.next() * 256);
    }
    
    return keyStream;
  }
}

/**
 * Utility functions for chaotic randomization
 */
export const chaoticUtils = {
  /**
   * Shuffle array using chaotic sequence
   */
  chaoticShuffle<T>(array: T[], seed: number = 0.5): T[] {
    const shuffled = [...array];
    const logistic = new LogisticMap(seed);
    
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(logistic.next() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled;
  },

  /**
   * Generate chaotic permutation matrix for image scrambling
   */
  generatePermutationMatrix(size: number, iterations: number = 5): number[] {
    const arnold = new ArnoldCatMap(size, size);
    return arnold.generateScrambledPositions(size * size, iterations);
  },

  /**
   * Validate chaotic parameters for security
   */
  validateChaoticParameters(mapType: string, parameters: any): boolean {
    switch (mapType) {
      case 'logistic':
        const r = parameters?.r || 3.99;
        return r > 3.57 && r <= 4.0; // Chaotic regime
        
      case 'tent':
        const mu = parameters?.mu || 2.0;
        return mu > 1.0 && mu <= 2.0; // Chaotic regime
        
      case 'henon':
        const a = parameters?.a || 1.4;
        const b = parameters?.b || 0.3;
        return a > 1.0 && a < 1.5 && b > 0.0 && b < 0.5; // Chaotic regime
        
      default:
        return false;
    }
  }
};