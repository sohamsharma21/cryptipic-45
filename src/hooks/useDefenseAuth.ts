import { useState, useEffect, createContext, useContext } from 'react';
import { User, UserRole, ClassificationLevel } from '@/types/defense';
import { useAudit } from '@/components/defense/AuditLogger';

interface DefenseAuthContextType {
  currentUser: User | null;
  hasRole: (role: UserRole) => boolean;
  hasClearance: (level: ClassificationLevel) => boolean;
  canAccess: (requiredRole?: UserRole, requiredClearance?: ClassificationLevel) => boolean;
  loginAsUser: (userData: Partial<User>) => void;
  logout: () => void;
}

const DefenseAuthContext = createContext<DefenseAuthContextType | undefined>(undefined);

const roleHierarchy: Record<UserRole, number> = {
  viewer: 1,
  operator: 2,
  supervisor: 3,
  admin: 4,
};

const clearanceHierarchy: Record<ClassificationLevel, number> = {
  UNCLASSIFIED: 1,
  CUI: 2,
  CONFIDENTIAL: 3,
  SECRET: 4,
  TOP_SECRET: 5,
};

export const useDefenseAuth = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { logEvent } = useAudit();

  useEffect(() => {
    // Load user from localStorage on init
    const savedUser = localStorage.getItem('defense_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        logEvent('LOGIN', `User ${user.email} session restored`, undefined, true);
      } catch (error) {
        console.error('Failed to restore user session:', error);
        localStorage.removeItem('defense_user');
      }
    }
  }, [logEvent]);

  const hasRole = (role: UserRole): boolean => {
    if (!currentUser) return false;
    return roleHierarchy[currentUser.role] >= roleHierarchy[role];
  };

  const hasClearance = (level: ClassificationLevel): boolean => {
    if (!currentUser) return false;
    return clearanceHierarchy[currentUser.clearanceLevel] >= clearanceHierarchy[level];
  };

  const canAccess = (requiredRole?: UserRole, requiredClearance?: ClassificationLevel): boolean => {
    if (!currentUser) return false;
    
    const hasRequiredRole = !requiredRole || hasRole(requiredRole);
    const hasRequiredClearance = !requiredClearance || hasClearance(requiredClearance);
    
    return hasRequiredRole && hasRequiredClearance;
  };

  const loginAsUser = (userData: Partial<User>) => {
    const user: User = {
      id: userData.id || crypto.randomUUID(),
      email: userData.email || 'test@defense.gov',
      role: userData.role || 'operator',
      clearanceLevel: userData.clearanceLevel || 'CUI',
      department: userData.department || 'Information Systems',
      isActive: userData.isActive ?? true,
      lastLogin: new Date(),
      mfaEnabled: userData.mfaEnabled ?? true,
    };

    setCurrentUser(user);
    localStorage.setItem('defense_user', JSON.stringify(user));
    logEvent('LOGIN', `User ${user.email} logged in with role ${user.role}`, undefined, true);
  };

  const logout = () => {
    if (currentUser) {
      logEvent('LOGOUT', `User ${currentUser.email} logged out`, undefined, true);
    }
    setCurrentUser(null);
    localStorage.removeItem('defense_user');
  };

  return {
    currentUser,
    hasRole,
    hasClearance,
    canAccess,
    loginAsUser,
    logout,
  };
};