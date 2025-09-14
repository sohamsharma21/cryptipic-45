/**
 * Biometric authentication utilities using WebAuthn API
 * Provides defense-grade biometric authentication
 */

export interface BiometricCredential {
  id: string;
  rawId: ArrayBuffer;
  response: AuthenticatorAttestationResponse;
  type: 'public-key';
}

export interface BiometricAssertionResult {
  id: string;
  rawId: ArrayBuffer;
  response: AuthenticatorAssertionResponse;
  type: 'public-key';
}

export class BiometricAuth {
  private static isSupported(): boolean {
    return !!(
      window.PublicKeyCredential &&
      navigator.credentials &&
      navigator.credentials.create &&
      navigator.credentials.get
    );
  }

  /**
   * Check if biometric authentication is available
   */
  static async isAvailable(): Promise<boolean> {
    if (!this.isSupported()) return false;

    try {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      return available;
    } catch (error) {
      console.warn('[Biometric] Availability check failed:', error);
      return false;
    }
  }

  /**
   * Register biometric credentials for a user
   */
  static async register(userId: string, userName: string, displayName: string): Promise<BiometricCredential> {
    if (!this.isSupported()) {
      throw new Error('Biometric authentication not supported');
    }

    const challenge = this.generateChallenge();
    
    const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
      challenge,
      rp: {
        name: 'CryptiPic Defense',
        id: window.location.hostname,
      },
      user: {
        id: new TextEncoder().encode(userId),
        name: userName,
        displayName: displayName,
      },
      pubKeyCredParams: [
        {
          alg: -7, // ES256
          type: 'public-key',
        },
        {
          alg: -257, // RS256
          type: 'public-key',
        },
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required',
        residentKey: 'preferred',
      },
      timeout: 60000,
      attestation: 'direct',
    };

    try {
      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions,
      }) as PublicKeyCredential;

      if (!credential) {
        throw new Error('Failed to create biometric credential');
      }

      return {
        id: credential.id,
        rawId: credential.rawId,
        response: credential.response as AuthenticatorAttestationResponse,
        type: credential.type as 'public-key',
      };
    } catch (error) {
      throw new Error(`Biometric registration failed: ${error}`);
    }
  }

  /**
   * Authenticate using biometric credentials
   */
  static async authenticate(credentialId?: string): Promise<BiometricAssertionResult> {
    if (!this.isSupported()) {
      throw new Error('Biometric authentication not supported');
    }

    const challenge = this.generateChallenge();
    
    const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
      challenge,
      allowCredentials: credentialId ? [{
        id: this.base64ToArrayBuffer(credentialId),
        type: 'public-key',
        transports: ['internal'],
      }] : [],
      userVerification: 'required',
      timeout: 60000,
    };

    try {
      const assertion = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions,
      }) as PublicKeyCredential;

      if (!assertion) {
        throw new Error('Biometric authentication failed');
      }

      return {
        id: assertion.id,
        rawId: assertion.rawId,
        response: assertion.response as AuthenticatorAssertionResponse,
        type: assertion.type as 'public-key',
      };
    } catch (error) {
      throw new Error(`Biometric authentication failed: ${error}`);
    }
  }

  /**
   * Generate cryptographic challenge
   */
  private static generateChallenge(): ArrayBuffer {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return array.buffer;
  }

  /**
   * Convert base64 string to ArrayBuffer
   */
  private static base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Convert ArrayBuffer to base64 string
   */
  static arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Store biometric credential securely
   */
  static storeCredential(userId: string, credential: BiometricCredential): void {
    const credentialData = {
      id: credential.id,
      rawId: this.arrayBufferToBase64(credential.rawId),
      userId,
      createdAt: Date.now(),
    };

    localStorage.setItem(`biometric_${userId}`, JSON.stringify(credentialData));
  }

  /**
   * Retrieve stored biometric credential
   */
  static getStoredCredential(userId: string): any {
    const stored = localStorage.getItem(`biometric_${userId}`);
    return stored ? JSON.parse(stored) : null;
  }

  /**
   * Remove biometric credential
   */
  static removeCredential(userId: string): void {
    localStorage.removeItem(`biometric_${userId}`);
  }
}