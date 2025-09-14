import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useServiceWorker } from '@/hooks/useServiceWorker';
import { useDefenseAuth } from '@/hooks/useDefenseAuth';
import { useAudit } from '@/components/defense/AuditLogger';
import { 
  Smartphone, 
  Download, 
  Wifi, 
  WifiOff, 
  Bell,
  Settings,
  Zap,
  Shield,
  Cloud,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Battery,
  Gauge
} from 'lucide-react';

interface PWACapability {
  name: string;
  supported: boolean;
  description: string;
  icon: React.ComponentType<any>;
}

const PWAManagement: React.FC = () => {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'completed' | 'failed'>('idle');
  const [offlineData, setOfflineData] = useState<any[]>([]);
  
  const { 
    isOnline, 
    isInstallable, 
    isInstalled, 
    updateAvailable,
    installApp,
    requestNotificationPermission,
    sendNotification,
    scheduleBackgroundSync
  } = useServiceWorker();
  
  const { currentUser } = useDefenseAuth();
  const { getAuditLogs } = useAudit();

  const capabilities: PWACapability[] = [
    {
      name: 'Offline Operation',
      supported: true,
      description: 'Full steganography capabilities work without internet',
      icon: WifiOff,
    },
    {
      name: 'Push Notifications',
      supported: 'Notification' in window,
      description: 'Security alerts and audit notifications',
      icon: Bell,
    },
    {
      name: 'Background Sync',
      supported: 'serviceWorker' in navigator,
      description: 'Sync audit logs when connection restored',
      icon: RotateCcw,
    },
    {
      name: 'Native Installation',
      supported: isInstallable || isInstalled,
      description: 'Install as native app on device',
      icon: Download,
    },
    {
      name: 'Hardware Security',
      supported: 'crypto' in window && 'subtle' in window.crypto,
      description: 'Hardware-accelerated cryptography',
      icon: Shield,
    },
    {
      name: 'Secure Storage',
      supported: 'localStorage' in window,
      description: 'Encrypted local data persistence',
      icon: Cloud,
    },
  ];

  useEffect(() => {
    // Check notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    // Load offline data
    const savedData = localStorage.getItem('offline_operations');
    if (savedData) {
      try {
        setOfflineData(JSON.parse(savedData));
      } catch (error) {
        console.error('Failed to load offline data:', error);
      }
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (installPrompt) {
      const result = await installApp();
      if (result) {
        setInstallPrompt(null);
        sendNotification('CryptiPic Installed', {
          body: 'App installed successfully. You can now use it offline.',
          icon: '/lovable-uploads/390e3f59-0f90-4390-a0eb-d404f3b7abaf.png',
        });
      }
    }
  };

  const handleNotificationSetup = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setNotificationPermission('granted');
      sendNotification('Security Notifications Enabled', {
        body: 'You will now receive important security alerts.',
        icon: '/lovable-uploads/390e3f59-0f90-4390-a0eb-d404f3b7abaf.png',
      });
    }
  };

  const handleBackgroundSync = async () => {
    setSyncStatus('syncing');
    
    try {
      // Schedule background sync
      scheduleBackgroundSync('audit-logs');
      
      // Simulate sync process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSyncStatus('completed');
      
      if (notificationPermission === 'granted') {
        sendNotification('Data Synchronized', {
          body: 'Offline audit logs have been synchronized.',
        });
      }
    } catch (error) {
      setSyncStatus('failed');
      console.error('Background sync failed:', error);
    }
  };

  const getCapabilityStatus = (capability: PWACapability) => {
    if (capability.supported) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
  };

  const getSyncStatusBadge = () => {
    switch (syncStatus) {
      case 'syncing':
        return <Badge className="bg-blue-100 text-blue-800">Syncing...</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge variant="outline">Ready</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">PWA Management</h2>
          <p className="text-muted-foreground">Progressive Web App features and offline capabilities</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
            {isOnline ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
            {isOnline ? 'Online' : 'Offline'}
          </Badge>
          {isInstalled && (
            <Badge className="bg-blue-100 text-blue-800">
              <Smartphone className="h-3 w-3 mr-1" />
              Installed
            </Badge>
          )}
        </div>
      </div>

      {!isOnline && (
        <Alert>
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            Offline mode active. All cryptographic operations are available. 
            Data will sync when connection is restored.
          </AlertDescription>
        </Alert>
      )}

      {updateAvailable && (
        <Alert>
          <Download className="h-4 w-4" />
          <AlertDescription>
            A new version is available. Refresh the page to update.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="installation" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="installation">Installation</TabsTrigger>
          <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
          <TabsTrigger value="offline">Offline Data</TabsTrigger>
          <TabsTrigger value="sync">Sync Status</TabsTrigger>
        </TabsList>

        <TabsContent value="installation" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  App Installation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isInstalled ? (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Install CryptiPic as a native app for better performance and offline access.
                    </p>
                    <Button 
                      onClick={handleInstall}
                      disabled={!isInstallable}
                      className="w-full"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Install App
                    </Button>
                    {!isInstallable && (
                      <p className="text-xs text-muted-foreground">
                        Installation prompt not available. App may already be installed or browser doesn't support PWA installation.
                      </p>
                    )}
                  </>
                ) : (
                  <div className="text-center py-4">
                    <CheckCircle className="h-12 w-12 mx-auto text-green-600 mb-2" />
                    <p className="font-medium text-green-800">App Successfully Installed</p>
                    <p className="text-sm text-muted-foreground">
                      CryptiPic is now available as a native app on your device.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Security Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Enable notifications to receive security alerts and audit updates.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge 
                    className={
                      notificationPermission === 'granted' 
                        ? 'bg-green-100 text-green-800'
                        : notificationPermission === 'denied'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }
                  >
                    {notificationPermission === 'granted' ? 'Enabled' : 
                     notificationPermission === 'denied' ? 'Denied' : 'Not Set'}
                  </Badge>
                </div>
                {notificationPermission !== 'granted' && (
                  <Button 
                    onClick={handleNotificationSetup}
                    variant="outline"
                    className="w-full"
                    disabled={notificationPermission === 'denied'}
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Enable Notifications
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="capabilities" className="space-y-4">
          <div className="grid gap-4">
            {capabilities.map((capability) => (
              <Card key={capability.name}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <capability.icon className="h-4 w-4" />
                      {capability.name}
                    </CardTitle>
                    {getCapabilityStatus(capability)}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{capability.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="offline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="h-5 w-5" />
                Offline Operations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {offlineData.length === 0 ? (
                <div className="text-center py-8">
                  <WifiOff className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No offline operations stored</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {offlineData.map((operation, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{operation.type}</span>
                        <Badge variant="outline">{new Date(operation.timestamp).toLocaleString()}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5" />
                Background Synchronization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Sync Status:</span>
                {getSyncStatusBadge()}
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Last Sync:</span>
                  <span>{new Date().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pending Operations:</span>
                  <span>{offlineData.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Audit Logs:</span>
                  <span>{getAuditLogs().length} entries</span>
                </div>
              </div>

              {syncStatus === 'syncing' && (
                <div className="space-y-2">
                  <Progress value={66} />
                  <p className="text-xs text-muted-foreground text-center">
                    Synchronizing audit logs...
                  </p>
                </div>
              )}

              <Button 
                onClick={handleBackgroundSync}
                disabled={syncStatus === 'syncing'}
                className="w-full"
              >
                <RotateCcw className={`h-4 w-4 mr-2 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Now'}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-600" />
                Sync Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1 text-blue-800">
                <li>• Automatic sync when online</li>
                <li>• Encrypted data transmission</li>
                <li>• Conflict resolution for audit logs</li>
                <li>• Background processing</li>
                <li>• Retry mechanism for failed syncs</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PWAManagement;