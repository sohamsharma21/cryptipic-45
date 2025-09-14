
import React from 'react';
import { ClassificationLevel, UserRole } from '@/types/defense';
import { Shield, AlertTriangle, Lock, User, Clock } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { ThemeToggle } from '@/components/ThemeToggle';

interface SecurityHeaderProps {
  classification: ClassificationLevel;
  userRole: UserRole;
  userEmail: string;
  department: string;
  isOfflineMode?: boolean;
  lastLogin?: Date;
}

const SecurityHeader: React.FC<SecurityHeaderProps> = ({
  classification,
  userRole,
  userEmail,
  department,
  isOfflineMode = false,
  lastLogin
}) => {
  const { isDarkMode } = useTheme();

  const getClassificationColor = (level: ClassificationLevel) => {
    switch (level) {
      case 'UNCLASSIFIED': return 'unclassified';
      case 'CUI': return 'cui';
      case 'CONFIDENTIAL': return 'confidential';
      case 'SECRET': return 'secret';
      case 'TOP_SECRET': return 'top-secret';
      default: return 'unclassified';
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'admin';
      case 'supervisor': return 'supervisor';
      case 'operator': return 'operator';
      case 'viewer': return 'viewer';
      default: return 'viewer';
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 space-y-0">
      {/* Main Security Banner */}
      <div className={`security-banner ${getClassificationColor(classification)}`}>
        <div className="flex items-center justify-center">
          <Shield className="h-4 w-4 mr-2" />
          <span className="text-sm md:text-base font-bold">
            {classification} - AUTHORIZED PERSONNEL ONLY
          </span>
        </div>
      </div>

      {/* Offline Mode Banner */}
      {isOfflineMode && (
        <div className="security-banner bg-gray-100 border-gray-500 text-gray-800 dark:bg-gray-800 dark:border-gray-400 dark:text-gray-200">
          <div className="flex items-center justify-center">
            <Lock className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">
              OFFLINE SECURE MODE - NO NETWORK CONNECTIVITY
            </span>
          </div>
        </div>
      )}

      {/* Warning Banner */}
      <div className="security-banner bg-yellow-100 border-yellow-500 text-yellow-800 dark:bg-yellow-900/50 dark:border-yellow-400 dark:text-yellow-200">
        <div className="flex items-center justify-center">
          <AlertTriangle className="h-4 w-4 mr-2" />
          <span className="text-xs md:text-sm">
            WARNING: This system is for authorized government use only. All activities are monitored and logged.
          </span>
        </div>
      </div>

      {/* User Info Bar */}
      <div className="bg-card border-b border-border px-4 py-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
          <div className="flex flex-col md:flex-row md:items-center space-y-1 md:space-y-0 md:space-x-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">{userEmail}</span>
              <span className={`role-indicator ${getRoleColor(userRole)}`}>
                {userRole.toUpperCase()}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              {department}
            </div>
            {lastLogin && (
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Last login: {lastLogin.toLocaleString()}</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-xs text-muted-foreground">
              Classification: {classification}
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityHeader;
