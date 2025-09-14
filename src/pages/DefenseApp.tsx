
import React, { useState, useEffect } from 'react';

import SecurityHeader from '@/components/defense/SecurityHeader';
import RoleBasedAccess from '@/components/auth/RoleBasedAccess';
import ComplianceTracker from '@/components/defense/ComplianceTracker';
import SecurePackageManager from '@/components/defense/SecurePackageManager';
import QuickStartGuide from '@/components/defense/QuickStartGuide';
import VisualAuditLog from '@/components/defense/VisualAuditLog';
import MessageEncoder from '@/components/MessageEncoder';
import MessageDecoder from '@/components/MessageDecoder';
import UserRoleSelector from '@/components/defense/UserRoleSelector';
import SecurityCompliance from '@/components/defense/SecurityCompliance';
import SecureExportSystem from '@/components/defense/SecureExportSystem';
import PerformanceMonitor from '@/components/defense/PerformanceMonitor';
import PWAManagement from '@/components/defense/PWAManagement';
import { User, ClassificationLevel } from '@/types/defense';
import { useDefenseAuth } from '@/hooks/useDefenseAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, FileText, Package, Lock, Activity, Smartphone, Download } from 'lucide-react';
import NISTComplianceValidator from '@/components/compliance/NISTComplianceValidator';

const DefenseApp: React.FC = () => {
  const { currentUser } = useDefenseAuth();
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    
    // Check if offline
    setIsOfflineMode(!navigator.onLine);
    
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    const handleOffline = () => setIsOfflineMode(true);
    const handleOnline = () => setIsOfflineMode(false);
    
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background">
        <SecurityHeader 
          classification="UNCLASSIFIED"
          userRole="viewer"
          userEmail="guest@defense.gov"
          department="Authentication"
        />
        <div className="pt-20 px-4 flex items-center justify-center min-h-[calc(100vh-5rem)]">
          <UserRoleSelector />
        </div>
      </div>
    );
  }

  const operationsGuide = {
    title: "Operations Quick Start",
    steps: [
      "Verify your security clearance level matches the required classification",
      "Select the appropriate operation (Hide or Reveal messages)",
      "Upload your image file using the secure file uploader",
      "Enter your message and encryption key for hiding operations",
      "Review security settings before proceeding",
      "Download the processed image to your secure storage"
    ],
    securityTips: [
      "Always use strong encryption keys (minimum 12 characters)",
      "Verify image integrity before and after processing",
      "Use only approved image formats (PNG, JPEG)",
      "Never share encryption keys through unsecured channels",
      "Log all operations for audit compliance",
      "Regularly rotate encryption keys per security policy"
    ],
    warnings: [
      "Do not use personal images for classified operations",
      "Ensure proper disposal of temporary files",
      "Report any system anomalies immediately"
    ]
  };

  return (
    
      <div className="min-h-screen bg-background">
        <SecurityHeader 
          classification={currentUser.clearanceLevel}
          userRole={currentUser.role}
          userEmail={currentUser.email}
          department={currentUser.department}
          isOfflineMode={isOfflineMode}
          lastLogin={currentUser.lastLogin}
        />
        
        <div className="pt-40 px-2 sm:px-4 lg:px-6 pb-8">
          <div className="max-w-7xl mx-auto">
            {/* Mobile Device Indicator */}
            {isMobile && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/20 dark:border-blue-800">
                <div className="flex items-center space-x-2">
                  <Smartphone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm text-blue-800 dark:text-blue-200">
                    Mobile field environment detected. Optimized interface active.
                  </span>
                </div>
              </div>
            )}

            <div className="mb-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                    Defense Steganography System
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Secure message hiding for defense operations
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className={`role-indicator ${currentUser.role}`}>
                    <Users className="h-4 w-4 mr-1" />
                    {currentUser.role.toUpperCase()}
                  </div>
                </div>
              </div>
            </div>

            <Tabs defaultValue="operations" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-7 h-auto">
                <TabsTrigger value="operations" className="flex items-center space-x-2 py-3">
                  <Lock className="h-4 w-4" />
                  <span className="hidden sm:inline">Operations</span>
                </TabsTrigger>
                <TabsTrigger value="packages" className="flex items-center space-x-2 py-3">
                  <Package className="h-4 w-4" />
                  <span className="hidden sm:inline">Packages</span>
                </TabsTrigger>
                <TabsTrigger value="compliance" className="flex items-center space-x-2 py-3">
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">Compliance</span>
                </TabsTrigger>
                <TabsTrigger value="audit" className="flex items-center space-x-2 py-3">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Audit</span>
                </TabsTrigger>
                <TabsTrigger value="admin" className="flex items-center space-x-2 py-3">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Admin</span>
                </TabsTrigger>
                <TabsTrigger value="export" className="flex items-center space-x-2 py-3">
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Export</span>
                </TabsTrigger>
                <TabsTrigger value="performance" className="flex items-center space-x-2 py-3">
                  <Activity className="h-4 w-4" />
                  <span className="hidden sm:inline">Performance</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="operations" className="space-y-6">
                <QuickStartGuide {...operationsGuide} />
                
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  <div className="xl:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card className="bg-card">
                        <CardHeader>
                          <CardTitle className="flex items-center text-card-foreground">
                            <Lock className="mr-2 h-5 w-5 text-blue-600" />
                            Hide Secret Messages
                          </CardTitle>
                          <CardDescription>
                            Embed classified messages in images using AES-256 encryption
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <RoleBasedAccess
                            userRole={currentUser.role}
                            userClearance={currentUser.clearanceLevel}
                            requiredRole="operator"
                          >
                            <MessageEncoder />
                          </RoleBasedAccess>
                        </CardContent>
                      </Card>

                      <Card className="bg-card">
                        <CardHeader>
                          <CardTitle className="flex items-center text-card-foreground">
                            <Activity className="mr-2 h-5 w-5 text-green-600" />
                            Reveal Secret Messages
                          </CardTitle>
                          <CardDescription>
                            Extract and decrypt hidden messages from images
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <RoleBasedAccess
                            userRole={currentUser.role}
                            userClearance={currentUser.clearanceLevel}
                            requiredRole="operator"
                          >
                            <MessageDecoder />
                          </RoleBasedAccess>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                  
                  <div className="xl:col-span-1">
                    <VisualAuditLog compact={true} maxEntries={8} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="packages">
                <QuickStartGuide
                  title="Package Management Guide"
                  steps={[
                    "Create new secure packages with embedded messages",
                    "Manage existing packages and their metadata",
                    "Export packages for secure distribution",
                    "Import packages from trusted sources",
                    "Verify package integrity and signatures"
                  ]}
                  securityTips={[
                    "Always verify digital signatures before opening packages",
                    "Use secure channels for package distribution",
                    "Maintain package audit trails",
                    "Regular backup of critical packages"
                  ]}
                />
                <RoleBasedAccess
                  userRole={currentUser.role}
                  userClearance={currentUser.clearanceLevel}
                  requiredRole="operator"
                >
                  <SecurePackageManager />
                </RoleBasedAccess>
              </TabsContent>

              <TabsContent value="compliance">
                <RoleBasedAccess
                  userRole={currentUser.role}
                  userClearance={currentUser.clearanceLevel}
                  requiredRole="supervisor"
                >
                  <SecurityCompliance />
                  <NISTComplianceValidator />
                  <ComplianceTracker />
                </RoleBasedAccess>
              </TabsContent>

              <TabsContent value="audit">
                <QuickStartGuide
                  title="Audit Log Management"
                  steps={[
                    "Review recent system activities",
                    "Filter logs by event type or user",
                    "Export audit logs for compliance reporting",
                    "Investigate security incidents",
                    "Generate audit summaries"
                  ]}
                  securityTips={[
                    "Review audit logs daily for anomalies",
                    "Secure audit log storage and access",
                    "Maintain log retention per policy",
                    "Correlate events across systems"
                  ]}
                />
                <RoleBasedAccess
                  userRole={currentUser.role}
                  userClearance={currentUser.clearanceLevel}
                  requiredRole="supervisor"
                >
                  <VisualAuditLog maxEntries={50} />
                </RoleBasedAccess>
              </TabsContent>

              <TabsContent value="admin">
                <QuickStartGuide
                  title="System Administration Guide"
                  steps={[
                    "Manage user accounts and permissions",
                    "Configure system security settings",
                    "Monitor system performance",
                    "Backup and recovery operations",
                    "Update system components"
                  ]}
                  securityTips={[
                    "Regular security updates and patches",
                    "Principle of least privilege for users",
                    "Strong password policies",
                    "Multi-factor authentication enforcement"
                  ]}
                  warnings={[
                    "Administrative changes affect all users",
                    "Always backup before major changes",
                    "Test changes in non-production environment first"
                  ]}
                />
                <RoleBasedAccess
                  userRole={currentUser.role}
                  userClearance={currentUser.clearanceLevel}
                  requiredRole="admin"
                >
                  <Card className="bg-card">
                    <CardHeader>
                      <CardTitle className="text-card-foreground">System Administration</CardTitle>
                      <CardDescription>
                        Manage users, roles, and system settings
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <Card className="p-4">
                            <div className="flex items-center space-x-2">
                              <Users className="h-5 w-5 text-primary" />
                              <span className="font-medium text-foreground">User Management</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                              Manage user accounts, roles, and permissions
                            </p>
                          </Card>
                          <Card className="p-4">
                            <div className="flex items-center space-x-2">
                              <Shield className="h-5 w-5 text-primary" />
                              <span className="font-medium text-foreground">Security Settings</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                              Configure security policies and settings
                            </p>
                          </Card>
                          <Card className="p-4">
                            <div className="flex items-center space-x-2">
                              <Activity className="h-5 w-5 text-primary" />
                              <span className="font-medium text-foreground">System Monitor</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                              Monitor system performance and health
                            </p>
                          </Card>
                        </div>
                        
                        <PWAManagement />
                      </div>
                    </CardContent>
                  </Card>
                </RoleBasedAccess>
              </TabsContent>

              <TabsContent value="export">
                <RoleBasedAccess
                  userRole={currentUser.role}
                  userClearance={currentUser.clearanceLevel}
                  requiredRole="operator"
                >
                  <SecureExportSystem />
                </RoleBasedAccess>
              </TabsContent>

              <TabsContent value="performance">
                <RoleBasedAccess
                  userRole={currentUser.role}
                  userClearance={currentUser.clearanceLevel}
                  requiredRole="supervisor"
                >
                  <PerformanceMonitor />
                </RoleBasedAccess>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    
  );
};

export default DefenseApp;
