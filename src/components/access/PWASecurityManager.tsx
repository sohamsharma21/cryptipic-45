import React, { useEffect, useState } from 'react';
import { useAccess } from '@/context/AccessContext';
import { useServiceWorker } from '@/hooks/useServiceWorker';
import { useToast } from '@/components/ui/use-toast';

interface PWASecurityManagerProps {
  children: React.ReactNode;
}

const PWASecurityManager: React.FC<PWASecurityManagerProps> = ({ children }) => {
  const { isAuthenticated, session } = useAccess();
  const { isOnline } = useServiceWorker();
  const { toast } = useToast();
  const [offlineAccessWarningShown, setOfflineAccessWarningShown] = useState(false);

  // Clear sensitive data from cache when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      clearProtectedCache();
    }
  }, [isAuthenticated]);

  // Handle offline access control
  useEffect(() => {
    if (!isOnline && isAuthenticated && session) {
      const sessionExpiry = new Date(session.expiresAt);
      const now = new Date();
      
      if (sessionExpiry <= now && !offlineAccessWarningShown) {
        toast({
          variant: "destructive",
          title: "Offline Session Expired",
          description: "Your session has expired. Please connect to the internet to re-authenticate.",
        });
        setOfflineAccessWarningShown(true);
        
        // Clear expired session data from cache
        clearProtectedCache();
      }
    }
  }, [isOnline, isAuthenticated, session, offlineAccessWarningShown, toast]);

  const clearProtectedCache = async () => {
    try {
      // Clear application caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        const protectedCacheNames = cacheNames.filter(name => 
          name.includes('protected') || 
          name.includes('authenticated') ||
          name.includes('sensitive')
        );
        
        await Promise.all(
          protectedCacheNames.map(name => caches.delete(name))
        );
      }

      // Clear sensitive localStorage items (keep only session for re-validation)
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.includes('encrypted_') ||
          key.includes('sensitive_') ||
          key.includes('protected_')
        )) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));

      // Clear sensitive sessionStorage
      if (sessionStorage) {
        sessionStorage.clear();
      }

      // Send message to service worker to clear protected caches
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'CLEAR_PROTECTED_CACHE',
          authenticated: isAuthenticated
        });
      }
      
    } catch (error) {
      console.error('Error clearing protected cache:', error);
    }
  };

  // Register message handler for service worker communications
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'AUTHENTICATION_REQUIRED') {
          toast({
            variant: "destructive",
            title: "Authentication Required",
            description: "Please log in to access this content.",
          });
        } else if (event.data.type === 'CACHE_CLEARED') {
          console.log('Protected cache cleared by service worker');
        }
      };

      navigator.serviceWorker.addEventListener('message', handleMessage);
      
      return () => {
        navigator.serviceWorker.removeEventListener('message', handleMessage);
      };
    }
  }, [toast]);

  // Send authentication status to service worker
  useEffect(() => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'AUTH_STATUS_UPDATE',
        authenticated: isAuthenticated,
        sessionToken: session?.sessionToken,
        sessionExpiry: session?.expiresAt
      });
    }
  }, [isAuthenticated, session]);

  return <>{children}</>;
};

export default PWASecurityManager;
