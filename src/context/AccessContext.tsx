import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AccessContextType, AccessConfig, AccessSession, AccessAttempt, BruteForceState } from '@/types/access';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

const defaultConfig: AccessConfig = {
  enableGate: true,
  useFullAuth: false,
  enableMFA: false,
  sessionDurationHours: 12,
  maxFailedAttempts: 5,
  lockoutDurationMinutes: 15,
  enableIPAllowlist: false,
  enableGeoRestrictions: false,
};

const AccessContext = createContext<AccessContextType | undefined>(undefined);

export const AccessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [session, setSession] = useState<AccessSession | null>(null);
  const [config, setConfig] = useState<AccessConfig>(defaultConfig);
  const [bruteForceState, setBruteForceState] = useState<BruteForceState | null>(null);
  const [lockoutTimeRemaining, setLockoutTimeRemaining] = useState(0);
  const { toast } = useToast();

  // Load configuration and session on startup
  useEffect(() => {
    loadConfiguration();
    loadSession();
    loadBruteForceState();
  }, []);

  // Update lockout timer
  useEffect(() => {
    if (bruteForceState?.lockedUntil) {
      const interval = setInterval(() => {
        const remaining = Math.max(0, bruteForceState.lockedUntil!.getTime() - Date.now());
        setLockoutTimeRemaining(remaining);
        
        if (remaining === 0) {
          setBruteForceState(prev => prev ? { ...prev, lockedUntil: undefined } : null);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [bruteForceState?.lockedUntil]);

  const loadConfiguration = async () => {
    try {
      const stored = localStorage.getItem('cryptipic_access_config');
      if (stored) {
        setConfig({ ...defaultConfig, ...JSON.parse(stored) });
      }
    } catch (error) {
      console.error('Failed to load access configuration:', error);
    }
  };

  const loadSession = async () => {
    try {
      const stored = localStorage.getItem('cryptipic_session');
      if (stored) {
        const parsedSession: AccessSession = JSON.parse(stored);
        
        // Check if session is still valid
        if (new Date(parsedSession.expiresAt) > new Date()) {
          // Verify session with server
          const { data, error } = await supabase.functions.invoke('validate-session', {
            body: { sessionToken: parsedSession.sessionToken }
          });

          if (!error && data?.valid) {
            setSession(parsedSession);
            setIsAuthenticated(true);
          } else {
            // Session invalid, clear it
            localStorage.removeItem('cryptipic_session');
          }
        } else {
          // Session expired, clear it
          localStorage.removeItem('cryptipic_session');
        }
      }
    } catch (error) {
      console.error('Failed to load session:', error);
      localStorage.removeItem('cryptipic_session');
    }
  };

  const loadBruteForceState = () => {
    try {
      const stored = localStorage.getItem('cryptipic_brute_force');
      if (stored) {
        const state: BruteForceState = JSON.parse(stored);
        // Convert date strings back to Date objects
        state.lastAttempt = new Date(state.lastAttempt);
        if (state.lockedUntil) {
          state.lockedUntil = new Date(state.lockedUntil);
        }
        setBruteForceState(state);
      }
    } catch (error) {
      console.error('Failed to load brute force state:', error);
    }
  };

  const saveBruteForceState = (state: BruteForceState) => {
    localStorage.setItem('cryptipic_brute_force', JSON.stringify(state));
    setBruteForceState(state);
  };

  const getCurrentIP = async (): Promise<string> => {
    try {
      // In production, this would be handled server-side
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  };

  const logAccessAttempt = async (success: boolean, method: 'passcode' | 'auth' | 'mfa', failureReason?: string) => {
    try {
      const ipAddress = await getCurrentIP();
      
      const attempt: AccessAttempt = {
        id: crypto.randomUUID(),
        ipAddress,
        timestamp: new Date(),
        success,
        method,
        failureReason,
        userAgent: navigator.userAgent,
      };

      // Store in Supabase via edge function
      await supabase.functions.invoke('log-access-attempt', {
        body: attempt
      });

      // Update brute force tracking
      if (!success) {
        const current = bruteForceState || {
          attempts: 0,
          lastAttempt: new Date(),
          ipAddress,
        };

        const newAttempts = current.attempts + 1;
        const newState: BruteForceState = {
          ...current,
          attempts: newAttempts,
          lastAttempt: new Date(),
          ipAddress,
        };

        // Check if we should lock out
        if (newAttempts >= config.maxFailedAttempts) {
          newState.lockedUntil = new Date(Date.now() + config.lockoutDurationMinutes * 60 * 1000);
          toast({
            variant: "destructive",
            title: "Account Locked",
            description: `Too many failed attempts. Locked for ${config.lockoutDurationMinutes} minutes.`,
          });
        }

        saveBruteForceState(newState);
      } else {
        // Clear brute force state on successful attempt
        if (bruteForceState) {
          localStorage.removeItem('cryptipic_brute_force');
          setBruteForceState(null);
        }
      }
    } catch (error) {
      console.error('Failed to log access attempt:', error);
    }
  };

  const checkBruteForce = useCallback((): boolean => {
    if (!bruteForceState) return false;
    
    if (bruteForceState.lockedUntil && bruteForceState.lockedUntil > new Date()) {
      return true;
    }
    
    return false;
  }, [bruteForceState]);

  const validatePasscode = async (passcode: string): Promise<boolean> => {
    if (checkBruteForce()) {
      toast({
        variant: "destructive",
        title: "Account Locked",
        description: "Please wait before trying again.",
      });
      return false;
    }

    try {
      // Validate passcode via edge function
      const { data, error } = await supabase.functions.invoke('validate-passcode', {
        body: { passcode }
      });

      if (error) throw error;

      if (data?.valid) {
        // Create session
        const newSession: AccessSession = {
          id: crypto.randomUUID(),
          isAuthenticated: true,
          sessionToken: data.sessionToken,
          expiresAt: new Date(Date.now() + config.sessionDurationHours * 60 * 60 * 1000),
          createdAt: new Date(),
          ipAddress: await getCurrentIP(),
          userAgent: navigator.userAgent,
        };

        localStorage.setItem('cryptipic_session', JSON.stringify(newSession));
        setSession(newSession);
        setIsAuthenticated(true);

        await logAccessAttempt(true, 'passcode');
        
        toast({
          title: "Access Granted",
          description: "Welcome to CryptiPic",
        });

        return true;
      } else {
        await logAccessAttempt(false, 'passcode', 'Invalid passcode');
        return false;
      }
    } catch (error: any) {
      await logAccessAttempt(false, 'passcode', error.message);
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Invalid passcode. Please try again.",
      });
      return false;
    }
  };

  const authenticate = async (email: string, password: string): Promise<boolean> => {
    if (checkBruteForce()) {
      toast({
        variant: "destructive",
        title: "Account Locked",
        description: "Please wait before trying again.",
      });
      return false;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user && data.session) {
        const newSession: AccessSession = {
          id: crypto.randomUUID(),
          userId: data.user.id,
          isAuthenticated: true,
          sessionToken: data.session.access_token,
          expiresAt: new Date(data.session.expires_at! * 1000),
          createdAt: new Date(),
          ipAddress: await getCurrentIP(),
          userAgent: navigator.userAgent,
        };

        localStorage.setItem('cryptipic_session', JSON.stringify(newSession));
        setSession(newSession);
        setIsAuthenticated(true);

        await logAccessAttempt(true, 'auth');
        
        return true;
      }

      return false;
    } catch (error: any) {
      await logAccessAttempt(false, 'auth', error.message);
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: error.message || "Invalid credentials",
      });
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      if (config.useFullAuth && session?.userId) {
        await supabase.auth.signOut();
      }

      // Invalidate session on server
      if (session?.sessionToken) {
        await supabase.functions.invoke('invalidate-session', {
          body: { sessionToken: session.sessionToken }
        });
      }

      localStorage.removeItem('cryptipic_session');
      setSession(null);
      setIsAuthenticated(false);

      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const extendSession = async (): Promise<boolean> => {
    if (!session) return false;

    try {
      const { data, error } = await supabase.functions.invoke('extend-session', {
        body: { sessionToken: session.sessionToken }
      });

      if (!error && data?.valid) {
        const extendedSession = {
          ...session,
          expiresAt: new Date(Date.now() + config.sessionDurationHours * 60 * 60 * 1000)
        };

        localStorage.setItem('cryptipic_session', JSON.stringify(extendedSession));
        setSession(extendedSession);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to extend session:', error);
      return false;
    }
  };

  const updateConfig = async (newConfig: Partial<AccessConfig>): Promise<void> => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    localStorage.setItem('cryptipic_access_config', JSON.stringify(updatedConfig));
  };

  const getAuditLogs = async (): Promise<AccessAttempt[]> => {
    try {
      const { data, error } = await supabase.functions.invoke('get-audit-logs');
      
      if (error) throw error;
      
      return data?.logs || [];
    } catch (error) {
      console.error('Failed to get audit logs:', error);
      return [];
    }
  };

  const clearBruteForce = async (ipAddress?: string): Promise<void> => {
    try {
      if (ipAddress) {
        await supabase.functions.invoke('clear-brute-force', {
          body: { ipAddress }
        });
      } else {
        localStorage.removeItem('cryptipic_brute_force');
        setBruteForceState(null);
        setLockoutTimeRemaining(0);
      }

      toast({
        title: "Brute Force Protection Cleared",
        description: "Access attempts have been reset.",
      });
    } catch (error) {
      console.error('Failed to clear brute force protection:', error);
    }
  };

  const value: AccessContextType = {
    isGateEnabled: config.enableGate,
    isAuthenticated,
    session,
    isLocked: checkBruteForce(),
    lockoutTimeRemaining,
    config,
    validatePasscode,
    authenticate,
    logout,
    extendSession,
    checkBruteForce,
    updateConfig,
    getAuditLogs,
    clearBruteForce,
  };

  return (
    <AccessContext.Provider value={value}>
      {children}
    </AccessContext.Provider>
  );
};

export const useAccess = () => {
  const context = useContext(AccessContext);
  if (!context) {
    throw new Error('useAccess must be used within an AccessProvider');
  }
  return context;
};