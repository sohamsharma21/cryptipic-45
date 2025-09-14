
import React, { createContext, useContext, useCallback } from 'react';
import { AuditLog, SecurityEvent, ClassificationLevel } from '@/types/defense';

interface AuditContextType {
  logEvent: (event: SecurityEvent, details: string, classification?: ClassificationLevel, success?: boolean) => void;
  getAuditLogs: () => AuditLog[];
}

const AuditContext = createContext<AuditContextType | undefined>(undefined);

export const AuditProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const logEvent = useCallback((
    event: SecurityEvent,
    details: string,
    classification?: ClassificationLevel,
    success: boolean = true
  ) => {
    const auditLog: AuditLog = {
      id: crypto.randomUUID(),
      userId: 'current-user-id', // This would come from auth context
      userEmail: 'user@defense.gov', // This would come from auth context
      event,
      timestamp: new Date(),
      details,
      ipAddress: 'Unknown', // Would be captured from request
      userAgent: navigator.userAgent,
      classification,
      success,
    };

    // Store in secure audit log (in production, this would be sent to a secure backend)
    const existingLogs = JSON.parse(localStorage.getItem('defense_audit_logs') || '[]');
    existingLogs.push(auditLog);
    localStorage.setItem('defense_audit_logs', JSON.stringify(existingLogs));

    // In production, also send to secure audit service
    console.log('AUDIT LOG:', auditLog);
  }, []);

  const getAuditLogs = useCallback((): AuditLog[] => {
    return JSON.parse(localStorage.getItem('defense_audit_logs') || '[]');
  }, []);

  return (
    <AuditContext.Provider value={{ logEvent, getAuditLogs }}>
      {children}
    </AuditContext.Provider>
  );
};

export const useAudit = () => {
  const context = useContext(AuditContext);
  if (!context) {
    throw new Error('useAudit must be used within an AuditProvider');
  }
  return context;
};
