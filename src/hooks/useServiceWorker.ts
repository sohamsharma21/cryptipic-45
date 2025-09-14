import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ServiceWorkerState {
  registration: ServiceWorkerRegistration | null;
  isOnline: boolean;
  isInstallable: boolean;
  isInstalled: boolean;
  updateAvailable: boolean;
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const useServiceWorker = () => {
  const [state, setState] = useState<ServiceWorkerState>({
    registration: null,
    isOnline: navigator.onLine,
    isInstallable: false,
    isInstalled: false,
    updateAvailable: false,
  });
  
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      registerServiceWorker();
    }

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches || 
        window.matchMedia('(display-mode: minimal-ui)').matches) {
      setState(prev => ({ ...prev, isInstalled: true }));
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setState(prev => ({ ...prev, isInstallable: true }));
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      setState(prev => ({ ...prev, isInstalled: true, isInstallable: false }));
      setDeferredPrompt(null);
      
      toast({
        title: "CryptiPic Installed",
        description: "App installed successfully. You can now use it offline.",
      });
    };

    // Listen for online/offline changes
    const handleOnline = () => setState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setState(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });

      setState(prev => ({ ...prev, registration }));

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setState(prev => ({ ...prev, updateAvailable: true }));
              
              toast({
                title: "Update Available",
                description: "A new version of CryptiPic is available. Refresh to update.",
              });
            }
          });
        }
      });

      console.log('[PWA] Service Worker registered successfully');
    } catch (error) {
      console.error('[PWA] Service Worker registration failed:', error);
    }
  };

  const installApp = async () => {
    if (!deferredPrompt) return false;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setState(prev => ({ ...prev, isInstallable: false }));
        setDeferredPrompt(null);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('[PWA] Install prompt failed:', error);
      return false;
    }
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      console.warn('[PWA] Notifications not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('[PWA] Notification permission request failed:', error);
      return false;
    }
  };

  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (Notification.permission === 'granted' && state.registration) {
      state.registration.showNotification(title, {
        icon: '/lovable-uploads/390e3f59-0f90-4390-a0eb-d404f3b7abaf.png',
        badge: '/lovable-uploads/390e3f59-0f90-4390-a0eb-d404f3b7abaf.png',
        tag: 'cryptipic-notification',
        requireInteraction: false,
        ...options,
      });
    }
  };

  const scheduleBackgroundSync = (tag: string) => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        // Background sync API is experimental, use feature detection
        if ('sync' in registration) {
          return (registration as any).sync.register(tag);
        }
      }).catch((error) => {
        console.error('[PWA] Background sync registration failed:', error);
      });
    }
  };

  return {
    ...state,
    installApp,
    requestNotificationPermission,
    sendNotification,
    scheduleBackgroundSync,
  };
};