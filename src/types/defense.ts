
// Defense-specific types and interfaces

export type UserRole = 'admin' | 'supervisor' | 'operator' | 'viewer';
export type ClassificationLevel = 'UNCLASSIFIED' | 'CUI' | 'CONFIDENTIAL' | 'SECRET' | 'TOP_SECRET';
export type SecurityEvent = 'LOGIN' | 'LOGOUT' | 'ENCODE' | 'DECODE' | 'EXPORT' | 'IMPORT' | 'ACCESS_DENIED' | 
  'MFA_SETUP_INITIATED' | 'MFA_SETUP_COMPLETED' | 'MFA_SETUP_FAILED' | 'MFA_BACKUP_CODES_DOWNLOADED' |
  'SESSION_EXTENDED' | 'SESSION_TERMINATED' | 'SESSION_TIMEOUT' | 'SESSION_STARTED' |
  'COMPLIANCE_ASSESSMENT_STARTED' | 'COMPLIANCE_ASSESSMENT_COMPLETED' | 'COMPLIANCE_ASSESSMENT_FAILED' | 'COMPLIANCE_REPORT_EXPORTED' |
  'DATA_EXTRACTION_STARTED' | 'DATA_EXTRACTION_COMPLETED' | 'DATA_EXTRACTION_FAILED' | 'DATA_EXPORT';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  clearanceLevel: ClassificationLevel;
  department: string;
  isActive: boolean;
  lastLogin?: Date;
  mfaEnabled: boolean;
}

export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  event: SecurityEvent;
  timestamp: Date;
  details: string;
  ipAddress: string;
  userAgent: string;
  classification?: ClassificationLevel;
  success: boolean;
}

export interface MessageMetadata {
  id: string;
  author: string;
  timestamp: Date;
  classification: ClassificationLevel;
  department: string;
  expiryDate?: Date;
  digitalSignature: string;
  checksum: string;
  version: string;
}

export interface SecurePackage {
  id: string;
  name: string;
  createdBy: string;
  createdAt: Date;
  classification: ClassificationLevel;
  imageData: string;
  encryptedMetadata: string;
  signature: string;
  checksum: string;
}

export interface ComplianceReport {
  id: string;
  generatedAt: Date;
  generatedBy: string;
  period: { start: Date; end: Date };
  totalOperations: number;
  failedOperations: number;
  securityViolations: number;
  complianceScore: number;
  recommendations: string[];
}
