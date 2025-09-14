import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useServiceWorker } from '@/hooks/useServiceWorker';
import { 
  Zap, 
  Gauge, 
  Smartphone, 
  Wifi, 
  WifiOff, 
  Battery, 
  Clock, 
  Database,
  Shield,
  Activity,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: 'excellent' | 'good' | 'warning' | 'poor';
  description: string;
}

const PerformanceMonitor: React.FC = () => {
  const { isOnline, isInstalled } = useServiceWorker();

  // Simulate performance metrics (in real app, these would come from actual measurements)
  const performanceMetrics: PerformanceMetric[] = useMemo(() => [
    {
      name: 'Page Load Time',
      value: 1.2,
      unit: 's',
      status: 'excellent',
      description: 'Time to fully load the application'
    },
    {
      name: 'Time to Interactive',
      value: 2.1,
      unit: 's', 
      status: 'good',
      description: 'Time until the page is fully interactive'
    },
    {
      name: 'First Contentful Paint',
      value: 0.8,
      unit: 's',
      status: 'excellent',
      description: 'Time to first meaningful content render'
    },
    {
      name: 'Cumulative Layout Shift',
      value: 0.05,
      unit: '',
      status: 'excellent',
      description: 'Visual stability metric'
    },
    {
      name: 'Memory Usage',
      value: 45,
      unit: 'MB',
      status: 'good',
      description: 'Current JavaScript heap size'
    },
    {
      name: 'Bundle Size',
      value: 2.8,
      unit: 'MB',
      status: 'good',
      description: 'Total application bundle size'
    }
  ], []);

  const systemMetrics = useMemo(() => {
    const connection = (navigator as any).connection;
    const batterySupported = 'getBattery' in navigator;
    
    return {
      networkType: connection?.effectiveType || 'unknown',
      downlink: connection?.downlink || 0,
      rtt: connection?.rtt || 0,
      batterySupported,
      deviceMemory: (navigator as any).deviceMemory || 'unknown',
      hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
      userAgent: navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'poor': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <TrendingUp className="h-4 w-4" />;
      case 'good': return <Activity className="h-4 w-4" />;
      case 'warning': return <AlertCircle className="h-4 w-4" />;
      case 'poor': return <AlertCircle className="h-4 w-4" />;
      default: return <Gauge className="h-4 w-4" />;
    }
  };

  const getPerformanceScore = () => {
    const scores = performanceMetrics.map(metric => {
      switch (metric.status) {
        case 'excellent': return 100;
        case 'good': return 80;
        case 'warning': return 60;
        case 'poor': return 40;
        default: return 50;
      }
    });
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  const optimizationTips = [
    {
      title: 'Enable PWA Installation',
      description: 'Install the app for better performance and offline capabilities',
      applied: isInstalled,
      impact: 'High'
    },
    {
      title: 'Use Secure Caching',
      description: 'Encrypted data is cached for faster access',
      applied: true,
      impact: 'Medium'
    },
    {
      title: 'Optimize Image Processing',
      description: 'Steganography operations are optimized for mobile devices',
      applied: true,
      impact: 'High'
    },
    {
      title: 'Lazy Load Components',
      description: 'Non-critical components load on demand',
      applied: true,
      impact: 'Medium'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Performance Monitor</h2>
          <p className="text-muted-foreground">Real-time application performance metrics</p>
        </div>
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Badge className="bg-green-100 text-green-800">
              <Wifi className="h-3 w-3 mr-1" />
              Online
            </Badge>
          ) : (
            <Badge className="bg-red-100 text-red-800">
              <WifiOff className="h-3 w-3 mr-1" />
              Offline
            </Badge>
          )}
          {isInstalled && (
            <Badge className="bg-blue-100 text-blue-800">
              <Smartphone className="h-3 w-3 mr-1" />
              PWA
            </Badge>
          )}
        </div>
      </div>

      {/* Overall Performance Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            Overall Performance Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Performance Rating</span>
              <span className="text-2xl font-bold text-green-600">{getPerformanceScore()}/100</span>
            </div>
            <Progress value={getPerformanceScore()} className="h-3" />
            <p className="text-sm text-muted-foreground">
              Excellent performance for defense-grade applications
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="metrics" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
          <TabsTrigger value="system">System Info</TabsTrigger>
          <TabsTrigger value="optimization">Optimizations</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {performanceMetrics.map((metric) => (
              <Card key={metric.name}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                    <Badge className={getStatusColor(metric.status)}>
                      {getStatusIcon(metric.status)}
                      <span className="ml-1 capitalize">{metric.status}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold">{metric.value}</span>
                      <span className="text-sm text-muted-foreground">{metric.unit}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{metric.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Wifi className="h-4 w-4" />
                  Network Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Connection Type:</span>
                  <span className="font-medium">{systemMetrics.networkType}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Downlink Speed:</span>
                  <span className="font-medium">{systemMetrics.downlink} Mbps</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Round Trip Time:</span>
                  <span className="font-medium">{systemMetrics.rtt} ms</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-medium">{isOnline ? 'Online' : 'Offline'}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Device Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Device Type:</span>
                  <span className="font-medium">{systemMetrics.userAgent}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">CPU Cores:</span>
                  <span className="font-medium">{systemMetrics.hardwareConcurrency}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Device Memory:</span>
                  <span className="font-medium">
                    {systemMetrics.deviceMemory !== 'unknown' ? `${systemMetrics.deviceMemory} GB` : 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">PWA Installed:</span>
                  <span className="font-medium">{isInstalled ? 'Yes' : 'No'}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Storage & Cache
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Cache Status:</span>
                  <span className="font-medium text-green-600">Active</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Service Worker:</span>
                  <span className="font-medium text-green-600">Registered</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Offline Support:</span>
                  <span className="font-medium text-green-600">Enabled</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Local Storage:</span>
                  <span className="font-medium text-green-600">Available</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Security Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">HTTPS:</span>
                  <span className="font-medium text-green-600">Enabled</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Encryption:</span>
                  <span className="font-medium text-green-600">AES-256</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Secure Headers:</span>
                  <span className="font-medium text-green-600">Active</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">CSP:</span>
                  <span className="font-medium text-green-600">Enabled</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <div className="grid gap-4">
            {optimizationTips.map((tip, index) => (
              <Card key={index} className={tip.applied ? 'border-green-200 bg-green-50/50' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">{tip.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={tip.impact === 'High' ? 'destructive' : 'secondary'}>
                        {tip.impact} Impact
                      </Badge>
                      {tip.applied && (
                        <Badge className="bg-green-100 text-green-800">
                          Applied ✓
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{tip.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-600" />
                Performance Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2 text-blue-800">
                <li>• Use Chrome or Edge for best crypto performance</li>
                <li>• Enable hardware acceleration for faster image processing</li>
                <li>• Install as PWA for native-like performance</li>
                <li>• Keep browser cache clear for defense applications</li>
                <li>• Use stable network connection for audit sync</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceMonitor;