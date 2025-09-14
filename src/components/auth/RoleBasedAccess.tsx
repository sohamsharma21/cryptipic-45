
import React from 'react';
import { UserRole, ClassificationLevel } from '@/types/defense';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield } from 'lucide-react';

interface RoleBasedAccessProps {
  userRole: UserRole;
  userClearance: ClassificationLevel;
  requiredRole?: UserRole;
  requiredClearance?: ClassificationLevel;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

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

const RoleBasedAccess: React.FC<RoleBasedAccessProps> = ({
  userRole,
  userClearance,
  requiredRole,
  requiredClearance,
  children,
  fallback,
}) => {
  const hasRequiredRole = !requiredRole || roleHierarchy[userRole] >= roleHierarchy[requiredRole];
  const hasRequiredClearance = !requiredClearance || clearanceHierarchy[userClearance] >= clearanceHierarchy[requiredClearance];

  const hasAccess = hasRequiredRole && hasRequiredClearance;

  if (!hasAccess) {
    return fallback || (
      <Alert className="border-red-200 bg-red-50">
        <Shield className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          Access Denied: Insufficient privileges or clearance level required.
          {requiredRole && ` Required role: ${requiredRole}.`}
          {requiredClearance && ` Required clearance: ${requiredClearance}.`}
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
};

export default RoleBasedAccess;
