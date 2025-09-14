import { useCallback } from 'react';
import { useAccess } from '@/context/AccessContext';
import { supabase } from '@/integrations/supabase/client';

interface AccessCheckOptions {
  path?: string;
  method?: string;
  requiredRole?: string;
  requiredClearance?: string;
}

interface AccessCheckResult {
  authorized: boolean;
  reason?: string;
  requiresAuth?: boolean;
  requiresRole?: string;
  requiresClearance?: string;
}

export const useAccessMiddleware = () => {
  const { session } = useAccess();

  const checkAccess = useCallback(async (options: AccessCheckOptions = {}): Promise<AccessCheckResult> => {
    try {
      const { data, error } = await supabase.functions.invoke('access-middleware', {
        body: {
          sessionToken: session?.sessionToken,
          path: options.path || window.location.pathname,
          method: options.method || 'GET',
          requiredRole: options.requiredRole,
          requiredClearance: options.requiredClearance,
        }
      });

      if (error) {
        console.error('Access check error:', error);
        return {
          authorized: false,
          reason: 'Access check failed',
          requiresAuth: true
        };
      }

      return data as AccessCheckResult;
    } catch (error) {
      console.error('Access middleware error:', error);
      return {
        authorized: false,
        reason: 'Network error during access check',
        requiresAuth: true
      };
    }
  }, [session]);

  const requireRole = useCallback((role: string) => {
    return checkAccess({ requiredRole: role });
  }, [checkAccess]);

  const requireClearance = useCallback((clearance: string) => {
    return checkAccess({ requiredClearance: clearance });
  }, [checkAccess]);

  const protectPath = useCallback((path: string, role?: string, clearance?: string) => {
    return checkAccess({ 
      path, 
      requiredRole: role, 
      requiredClearance: clearance 
    });
  }, [checkAccess]);

  return {
    checkAccess,
    requireRole,
    requireClearance,
    protectPath,
  };
};