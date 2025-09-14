import React, { useEffect, useState } from 'react';
import { useAccess } from '@/context/AccessContext';
import { SessionManager } from '@/components/auth/SessionManager';
import AccessGate from './AccessGate';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Loader2 } from 'lucide-react';

interface SiteWideAccessGateProps {
  children: React.ReactNode;
}

const SiteWideAccessGate: React.FC<SiteWideAccessGateProps> = ({ children }) => {
  const { isGateEnabled, isAuthenticated, session } = useAccess();
  const [isLoading, setIsLoading] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    // Give the access context time to initialize and check stored sessions
    const initTimer = setTimeout(() => {
      setIsLoading(false);
      setHasInitialized(true);
    }, 1000);

    return () => clearTimeout(initTimer);
  }, []);

  // Show loading screen while initializing
  if (!hasInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-blue-950 dark:to-indigo-950">
        <Card className="w-full max-w-sm">
          <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
            <div className="relative">
              <Shield className="w-12 h-12 text-primary" />
              <Loader2 className="w-4 h-4 text-primary animate-spin absolute -top-1 -right-1" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">CryptiPic</h3>
              <p className="text-sm text-muted-foreground">Initializing secure access...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If gate is disabled, allow direct access
  if (!isGateEnabled) {
    return <>{children}</>;
  }

  // If not authenticated, show access gate
  if (!isAuthenticated) {
    return (
      <AccessGate 
        onAccessGranted={() => {
          // The context will handle the state update
          // Component will re-render when isAuthenticated becomes true
        }} 
      />
    );
  }

  // If authenticated, wrap in session manager and show app
  return (
    <SessionManager
      onSessionTimeout={() => {
        // Force a page reload to reset the app state
        window.location.reload();
      }}
      sessionTimeoutMinutes={30}
      warningMinutes={5}
      userEmail={session?.userId || 'user'}
    >
      {children}
    </SessionManager>
  );
};

export default SiteWideAccessGate;