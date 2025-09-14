import React from 'react';
import { useAccess } from '@/context/AccessContext';
import AccessGate from './AccessGate';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, fallback }) => {
  const { isGateEnabled, isAuthenticated } = useAccess();

  // If gate is disabled, always allow access
  if (!isGateEnabled) {
    return <>{children}</>;
  }

  // If authenticated, show protected content
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Show access gate or fallback
  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <AccessGate 
      onAccessGranted={() => {
        // The context will handle the state update
        // Component will re-render when isAuthenticated becomes true
      }} 
    />
  );
};

export default ProtectedRoute;