import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAccess } from '@/context/AccessContext';
import { useToast } from '@/components/ui/use-toast';
import { Settings, Shield, Clock, Users, AlertTriangle, Save, RotateCcw } from 'lucide-react';
import ProtectedComponent from '@/components/access/ProtectedComponent';

const AccessConfigPanel: React.FC = () => {
  const { config, updateConfig, getAuditLogs, clearBruteForce } = useAccess();
  const { toast } = useToast();
  const [localConfig, setLocalConfig] = useState(config);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  useEffect(() => {
    const hasConfigChanges = JSON.stringify(localConfig) !== JSON.stringify(config);
    setHasChanges(hasConfigChanges);
  }, [localConfig, config]);

  const loadAuditLogs = async () => {
    setIsLoading(true);
    try {
      const logs = await getAuditLogs();
      setAuditLogs(logs.slice(0, 50)); // Show last 50 attempts
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load audit logs",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    setIsLoading(true);
    try {
      await updateConfig(localConfig);
      toast({
        title: "Configuration Updated",
        description: "Access control settings have been saved successfully.",
      });
      setHasChanges(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update configuration",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetConfig = () => {
    setLocalConfig(config);
    setHasChanges(false);
  };

  const handleClearBruteForce = async () => {
    setIsLoading(true);
    try {
      await clearBruteForce();
      await loadAuditLogs(); // Refresh logs
      toast({
        title: "Brute Force Protection Cleared",
        description: "All failed attempt counters have been reset.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to clear brute force protection",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusBadge = (success: boolean) => {
    return success ? (
      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
        Success
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
        Failed
      </Badge>
    );
  };

  return (
    <ProtectedComponent requiredRole="admin">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Access Control Configuration</h1>
            <p className="text-muted-foreground">Manage security settings and monitor access attempts</p>
          </div>
          {hasChanges && (
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleResetConfig} disabled={isLoading}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button onClick={handleSaveConfig} disabled={isLoading}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          )}
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general">General Settings</TabsTrigger>
            <TabsTrigger value="security">Security Controls</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring & Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>General Configuration</span>
                </CardTitle>
                <CardDescription>
                  Basic access control settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="enableGate">Enable Access Gate</Label>
                        <p className="text-sm text-muted-foreground">
                          Require authentication to access the application
                        </p>
                      </div>
                      <Switch
                        id="enableGate"
                        checked={localConfig.enableGate}
                        onCheckedChange={(checked) =>
                          setLocalConfig(prev => ({ ...prev, enableGate: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="useFullAuth">Use Full Authentication</Label>
                        <p className="text-sm text-muted-foreground">
                          Enable email/password login instead of passcode
                        </p>
                      </div>
                      <Switch
                        id="useFullAuth"
                        checked={localConfig.useFullAuth}
                        onCheckedChange={(checked) =>
                          setLocalConfig(prev => ({ ...prev, useFullAuth: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="enableMFA">Enable Multi-Factor Authentication</Label>
                        <p className="text-sm text-muted-foreground">
                          Require additional verification for login
                        </p>
                      </div>
                      <Switch
                        id="enableMFA"
                        checked={localConfig.enableMFA}
                        onCheckedChange={(checked) =>
                          setLocalConfig(prev => ({ ...prev, enableMFA: checked }))
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="sessionDuration">Session Duration (Hours)</Label>
                      <Input
                        id="sessionDuration"
                        type="number"
                        min="1"
                        max="48"
                        value={localConfig.sessionDurationHours}
                        onChange={(e) =>
                          setLocalConfig(prev => ({ 
                            ...prev, 
                            sessionDurationHours: parseInt(e.target.value) || 12 
                          }))
                        }
                      />
                      <p className="text-sm text-muted-foreground">
                        How long sessions remain valid (1-48 hours)
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Security Controls</span>
                </CardTitle>
                <CardDescription>
                  Brute force protection and advanced security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="maxFailedAttempts">Max Failed Attempts</Label>
                      <Input
                        id="maxFailedAttempts"
                        type="number"
                        min="3"
                        max="20"
                        value={localConfig.maxFailedAttempts}
                        onChange={(e) =>
                          setLocalConfig(prev => ({ 
                            ...prev, 
                            maxFailedAttempts: parseInt(e.target.value) || 5 
                          }))
                        }
                      />
                      <p className="text-sm text-muted-foreground">
                        Number of failed attempts before lockout (3-20)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lockoutDuration">Lockout Duration (Minutes)</Label>
                      <Input
                        id="lockoutDuration"
                        type="number"
                        min="5"
                        max="1440"
                        value={localConfig.lockoutDurationMinutes}
                        onChange={(e) =>
                          setLocalConfig(prev => ({ 
                            ...prev, 
                            lockoutDurationMinutes: parseInt(e.target.value) || 15 
                          }))
                        }
                      />
                      <p className="text-sm text-muted-foreground">
                        How long to lock out after max attempts (5-1440 minutes)
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="enableIPAllowlist">IP Allowlist</Label>
                        <p className="text-sm text-muted-foreground">
                          Restrict access to specific IP addresses
                        </p>
                      </div>
                      <Switch
                        id="enableIPAllowlist"
                        checked={localConfig.enableIPAllowlist}
                        onCheckedChange={(checked) =>
                          setLocalConfig(prev => ({ ...prev, enableIPAllowlist: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="enableGeoRestrictions">Geographic Restrictions</Label>
                        <p className="text-sm text-muted-foreground">
                          Block access from certain countries/regions
                        </p>
                      </div>
                      <Switch
                        id="enableGeoRestrictions"
                        checked={localConfig.enableGeoRestrictions}
                        onCheckedChange={(checked) =>
                          setLocalConfig(prev => ({ ...prev, enableGeoRestrictions: checked }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Security Note:</strong> Changes to security settings take effect immediately. 
                    Ensure you have alternative access methods configured before enabling restrictive settings.
                  </AlertDescription>
                </Alert>

                <div className="pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={handleClearBruteForce}
                    disabled={isLoading}
                    className="flex items-center space-x-2"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Clear All Brute Force Locks</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Access Monitoring</span>
                </CardTitle>
                <CardDescription>
                  View recent access attempts and audit logs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Recent Access Attempts</h3>
                  <Button onClick={loadAuditLogs} disabled={isLoading}>
                    <Clock className="w-4 h-4 mr-2" />
                    Refresh Logs
                  </Button>
                </div>

                <div className="space-y-2">
                  {auditLogs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No audit logs available</p>
                      <p className="text-sm">Click "Refresh Logs" to load recent attempts</p>
                    </div>
                  ) : (
                    auditLogs.map((log, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          {getStatusBadge(log.success)}
                          <div>
                            <p className="font-medium">{log.method?.toUpperCase()} Attempt</p>
                            <p className="text-sm text-muted-foreground">
                              IP: {log.ip_address} • {formatTimestamp(log.timestamp)}
                            </p>
                          </div>
                        </div>
                        {!log.success && log.failure_reason && (
                          <div className="text-sm text-red-600 dark:text-red-400">
                            {log.failure_reason}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedComponent>
  );
};

export default AccessConfigPanel;