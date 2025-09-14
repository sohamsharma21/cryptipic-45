import React, { useEffect, useState, createContext, useContext, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useAudit } from '@/components/defense/AuditLogger';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, Shield, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SessionContextType {
  timeRemaining: number;
  isWarning: boolean;
  extendSession: () => void;
  terminateSession: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

interface SessionManagerProps {
  children: React.ReactNode;
  onSessionTimeout: () => void;
  sessionTimeoutMinutes?: number;
  warningMinutes?: number;
  userEmail?: string;
}

export const SessionManager: React.FC<SessionManagerProps> = ({
  children,
  onSessionTimeout,
  sessionTimeoutMinutes = 30, // NIST SP 800-171 recommends 30 minutes max
  warningMinutes = 5,
  userEmail = ''
}) => {
  const [timeRemaining, setTimeRemaining] = useState(sessionTimeoutMinutes * 60);
  const [isWarning, setIsWarning] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const { toast } = useToast();
  const { logEvent } = useAudit();

  // Track user activity
  const updateActivity = useCallback(() => {
    setLastActivity(Date.now());
    setTimeRemaining(sessionTimeoutMinutes * 60);
    setIsWarning(false);
  }, [sessionTimeoutMinutes]);

  // Extend session manually
  const extendSession = useCallback(() => {
    updateActivity();
    logEvent('SESSION_EXTENDED', `Session extended for ${userEmail}`, 'CUI');
    toast({
      title: "Session Extended",
      description: `Your session has been extended by ${sessionTimeoutMinutes} minutes.`,
    });
  }, [updateActivity, logEvent, userEmail, sessionTimeoutMinutes, toast]);

  // Terminate session
  const terminateSession = useCallback(() => {
    logEvent('SESSION_TERMINATED', `Session terminated for ${userEmail}`, 'CUI');
    onSessionTimeout();
  }, [logEvent, userEmail, onSessionTimeout]);

  // Activity listeners
  useEffect(() => {
    const activities = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const resetTimer = () => {
      updateActivity();
    };

    // Add throttling to prevent excessive updates
    let throttleTimer: NodeJS.Timeout;
    const throttledReset = () => {
      if (throttleTimer) clearTimeout(throttleTimer);
      throttleTimer = setTimeout(resetTimer, 1000); // Throttle to 1 second
    };

    activities.forEach(activity => {
      document.addEventListener(activity, throttledReset, true);
    });

    return () => {
      activities.forEach(activity => {
        document.removeEventListener(activity, throttledReset, true);
      });
      if (throttleTimer) clearTimeout(throttleTimer);
    };
  }, [updateActivity]);

  // Session countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - lastActivity) / 1000);
      const remaining = Math.max(0, (sessionTimeoutMinutes * 60) - elapsed);
      
      setTimeRemaining(remaining);
      
      // Show warning
      if (remaining <= warningMinutes * 60 && remaining > 0) {
        setIsWarning(true);
      }
      
      // Auto-logout when time expires
      if (remaining <= 0) {
        logEvent('SESSION_TIMEOUT', `Session timed out for ${userEmail}`, 'CUI');
        toast({
          variant: "destructive",
          title: "Session Expired",
          description: "Your session has expired due to inactivity. Please log in again.",
        });
        onSessionTimeout();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastActivity, sessionTimeoutMinutes, warningMinutes, onSessionTimeout, userEmail, logEvent, toast]);

  // Log session start
  useEffect(() => {
    logEvent('SESSION_STARTED', `Session started for ${userEmail}`, 'CUI');
  }, [logEvent, userEmail]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const contextValue: SessionContextType = {
    timeRemaining,
    isWarning,
    extendSession,
    terminateSession
  };

  return (
    <SessionContext.Provider value={contextValue}>
      {isWarning && (
        <Alert className="fixed bottom-4 right-4 w-96 z-50 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-400">
          <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Session Warning</div>
                <div className="text-sm">
                  Your session will expire in {formatTime(timeRemaining)}
                </div>
              </div>
              <div className="flex space-x-2 ml-4">
                <Button 
                  size="sm" 
                  onClick={extendSession}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  Extend
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={terminateSession}
                  className="border-yellow-600 text-yellow-600 hover:bg-yellow-50"
                >
                  <LogOut className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Session info in header */}
      <div className="fixed top-[120px] right-4 z-40">
        <div className="bg-background/80 backdrop-blur-sm border rounded px-2 py-1 text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Shield className="h-3 w-3" />
            <span>Session: {formatTime(timeRemaining)}</span>
          </div>
        </div>
      </div>
      
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionManager');
  }
  return context;
};