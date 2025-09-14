import React from 'react';
import { Button } from '@/components/ui/button';
import { useServiceWorker } from '@/hooks/useServiceWorker';
import { Download, Smartphone, Wifi, WifiOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const PWAInstallButton: React.FC = () => {
  const { 
    isInstallable, 
    isInstalled, 
    isOnline, 
    installApp,
    requestNotificationPermission 
  } = useServiceWorker();

  const handleInstall = async () => {
    const installed = await installApp();
    if (installed) {
      // Request notification permission after successful install
      await requestNotificationPermission();
    }
  };

  if (isInstalled) {
    return (
      <div className="flex items-center space-x-2">
        <Badge variant="default" className="bg-green-600 text-white">
          <Smartphone className="w-3 h-3 mr-1" />
          Installed
        </Badge>
        <div className="flex items-center">
          {isOnline ? (
            <Wifi className="w-4 h-4 text-green-600" />
          ) : (
            <WifiOff className="w-4 h-4 text-orange-600" />
          )}
        </div>
      </div>
    );
  }

  if (!isInstallable) {
    return (
      <div className="flex items-center space-x-2">
        <Badge variant="outline">
          PWA Ready
        </Badge>
        <div className="flex items-center">
          {isOnline ? (
            <Wifi className="w-4 h-4 text-green-600" />
          ) : (
            <WifiOff className="w-4 h-4 text-orange-600" />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Button 
        onClick={handleInstall}
        size="sm"
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        <Download className="w-4 h-4 mr-2" />
        Install App
      </Button>
      <div className="flex items-center">
        {isOnline ? (
          <Wifi className="w-4 h-4 text-green-600" />
        ) : (
          <WifiOff className="w-4 h-4 text-orange-600" />
        )}
      </div>
    </div>
  );
};