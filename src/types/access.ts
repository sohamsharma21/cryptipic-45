export interface AccessConfig {
  enableGate: boolean;
  useFullAuth: boolean;
  enableMFA: boolean;
  sessionDurationHours: number;
  maxFailedAttempts: number;
  lockoutDurationMinutes: number;
  enableIPAllowlist: boolean;
  enableGeoRestrictions: boolean;
}

export interface AccessSession {
  id: string;
  userId?: string;
  isAuthenticated: boolean;
  sessionToken: string;
  expiresAt: Date;
  createdAt: Date;
  ipAddress?: string;
  userAgent?: string;
  role?: string;
  clearanceLevel?: string;
}

export interface AccessAttempt {
  id: string;
  ipAddress: string;
  timestamp: Date;
  success: boolean;
  method: 'passcode' | 'auth' | 'mfa';
  failureReason?: string;
  userAgent?: string;
  geolocation?: {
    ip: string;
    country?: string;
    region?: string;
    city?: string;
  };
}

export interface BruteForceState {
  attempts: number;
  lastAttempt: Date;
  lockedUntil?: Date;
  ipAddress: string;
}

export interface AccessContextType {
  isGateEnabled: boolean;
  isAuthenticated: boolean;
  session: AccessSession | null;
  isLocked: boolean;
  lockoutTimeRemaining: number;
  config: AccessConfig;
  
  // Actions
  validatePasscode: (passcode: string) => Promise<boolean>;
  authenticate: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  extendSession: () => Promise<boolean>;
  checkBruteForce: () => boolean;
  
  // Admin actions
  updateConfig: (config: Partial<AccessConfig>) => Promise<void>;
  getAuditLogs: () => Promise<AccessAttempt[]>;
  clearBruteForce: (ipAddress?: string) => Promise<void>;
}