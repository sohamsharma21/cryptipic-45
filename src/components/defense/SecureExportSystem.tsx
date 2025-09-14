import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useDefenseAuth } from '@/hooks/useDefenseAuth';
import { useAudit } from '@/components/defense/AuditLogger';
import { SecurePackage, ClassificationLevel } from '@/types/defense';
import { AES256Crypto } from '@/utils/crypto/aes256';
import { Download, Package, Shield, Lock, FileImage, Eye, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExportFormat {
  name: string;
  extension: string;
  description: string;
  encrypted: boolean;
  classification: ClassificationLevel[];
}

const exportFormats: ExportFormat[] = [
  {
    name: 'Defense Package (.dpkg)',
    extension: 'dpkg',
    description: 'Military-grade encrypted package with digital signatures',
    encrypted: true,
    classification: ['SECRET', 'TOP_SECRET', 'CONFIDENTIAL'],
  },
  {
    name: 'Secure Archive (.sarch)',
    extension: 'sarch',
    description: 'AES-256 encrypted archive with metadata',
    encrypted: true,
    classification: ['CUI', 'CONFIDENTIAL', 'SECRET'],
  },
  {
    name: 'Standard Package (.pkg)',
    extension: 'pkg',
    description: 'Basic encrypted package for general use',
    encrypted: true,
    classification: ['UNCLASSIFIED', 'CUI'],
  },
  {
    name: 'Portable Image (.png)',
    extension: 'png',
    description: 'Standard image with embedded steganographic data',
    encrypted: false,
    classification: ['UNCLASSIFIED'],
  },
];

const SecureExportSystem: React.FC = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>(exportFormats[0]);
  const [exportPassword, setExportPassword] = useState('');
  const [packageName, setPackageName] = useState('');
  const [packageDescription, setPackageDescription] = useState('');
  const [recentExports, setRecentExports] = useState<SecurePackage[]>([]);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  
  const { currentUser } = useDefenseAuth();
  const { logEvent } = useAudit();
  const { toast } = useToast();

  useEffect(() => {
    // Load recent exports from localStorage
    const saved = localStorage.getItem('secure_exports');
    if (saved) {
      try {
        setRecentExports(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load recent exports:', error);
      }
    }
  }, []);

  const generateSecurePackage = async (): Promise<SecurePackage> => {
    if (!currentUser) throw new Error('User not authenticated');

    const packageData = {
      name: packageName || `Package_${Date.now()}`,
      description: packageDescription,
      classification: currentUser.clearanceLevel,
      createdBy: currentUser.email,
      createdAt: new Date(),
      format: selectedFormat.name,
      metadata: {
        version: '1.0.0',
        algorithm: 'AES-256-GCM',
        keyDerivation: 'PBKDF2',
        iterations: 100000,
        creator: currentUser.email,
        department: currentUser.department,
      },
    };

    // Simulate image data (in real app, this would come from the steganography process)
    const mockImageData = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==`;
    
    const packagePayload = JSON.stringify({
      ...packageData,
      imageData: mockImageData,
    });

    // Encrypt the package if format requires it
    let encryptedData = packagePayload;
    let signature = '';
    
    if (selectedFormat.encrypted && exportPassword) {
      try {
        encryptedData = AES256Crypto.encrypt(packagePayload, exportPassword);
        signature = AES256Crypto.generateHMAC(encryptedData, exportPassword);
      } catch (error) {
        throw new Error(`Encryption failed: ${error}`);
      }
    }

    const securePackage: SecurePackage = {
      id: crypto.randomUUID(),
      name: packageData.name,
      createdBy: currentUser.email,
      createdAt: new Date(),
      classification: currentUser.clearanceLevel,
      imageData: mockImageData,
      encryptedMetadata: encryptedData,
      signature,
      checksum: btoa(encryptedData).slice(0, 16),
    };

    return securePackage;
  };

  const handleExport = async () => {
    if (!currentUser) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please authenticate to export packages",
      });
      return;
    }

    if (selectedFormat.encrypted && !exportPassword) {
      toast({
        variant: "destructive",
        title: "Password Required",
        description: "Please provide an encryption password for secure export",
      });
      return;
    }

    setIsExporting(true);
    setExportProgress(0);

    try {
      // Simulate export progress
      const progressInterval = setInterval(() => {
        setExportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      // Generate secure package
      const securePackage = await generateSecurePackage();
      
      // Simulate final processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      setExportProgress(100);

      // Create downloadable file
      const exportData = {
        package: securePackage,
        format: selectedFormat,
        exported: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${securePackage.name}.${selectedFormat.extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Save to recent exports
      const updatedExports = [securePackage, ...recentExports.slice(0, 9)];
      setRecentExports(updatedExports);
      localStorage.setItem('secure_exports', JSON.stringify(updatedExports));

      // Log the export event
      logEvent(
        'EXPORT',
        `Exported secure package: ${securePackage.name} (${selectedFormat.name})`,
        currentUser.clearanceLevel,
        true
      );

      toast({
        title: "Export Successful",
        description: `Package "${securePackage.name}" exported successfully`,
      });

      setExportDialogOpen(false);
      resetForm();

    } catch (error) {
      logEvent(
        'EXPORT',
        `Export failed: ${error}`,
        currentUser.clearanceLevel,
        false
      );

      toast({
        variant: "destructive",
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const resetForm = () => {
    setPackageName('');
    setPackageDescription('');
    setExportPassword('');
    setSelectedFormat(exportFormats[0]);
  };

  const getClassificationBadge = (classification: ClassificationLevel) => {
    const colors = {
      UNCLASSIFIED: 'bg-green-100 text-green-800',
      CUI: 'bg-blue-100 text-blue-800',
      CONFIDENTIAL: 'bg-yellow-100 text-yellow-800',
      SECRET: 'bg-orange-100 text-orange-800',
      TOP_SECRET: 'bg-red-100 text-red-800',
    };

    return (
      <Badge className={colors[classification]}>
        {classification}
      </Badge>
    );
  };

  const canUseFormat = (format: ExportFormat): boolean => {
    if (!currentUser) return false;
    return format.classification.includes(currentUser.clearanceLevel);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Secure Export System</h2>
          <p className="text-muted-foreground">Export steganographic packages with military-grade encryption</p>
        </div>
        <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              New Export
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Secure Export Package</DialogTitle>
              <DialogDescription>
                Configure and export your steganographic data with military-grade security
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="packageName">Package Name</Label>
                  <Input
                    id="packageName"
                    value={packageName}
                    onChange={(e) => setPackageName(e.target.value)}
                    placeholder="Enter package name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="classification">Classification Level</Label>
                  <div className="flex items-center h-10 px-3 border border-input rounded-md bg-background">
                    {currentUser && getClassificationBadge(currentUser.clearanceLevel)}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={packageDescription}
                  onChange={(e) => setPackageDescription(e.target.value)}
                  placeholder="Optional package description"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="format">Export Format</Label>
                <Select 
                  value={selectedFormat.name} 
                  onValueChange={(value) => {
                    const format = exportFormats.find(f => f.name === value);
                    if (format) setSelectedFormat(format);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {exportFormats.map((format) => (
                      <SelectItem 
                        key={format.name} 
                        value={format.name}
                        disabled={!canUseFormat(format)}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{format.name}</span>
                          {format.encrypted && <Lock className="h-3 w-3 ml-2" />}
                          {!canUseFormat(format) && <AlertTriangle className="h-3 w-3 ml-2 text-yellow-500" />}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">{selectedFormat.description}</p>
              </div>

              {selectedFormat.encrypted && (
                <div className="space-y-2">
                  <Label htmlFor="password">Encryption Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={exportPassword}
                    onChange={(e) => setExportPassword(e.target.value)}
                    placeholder="Enter strong encryption password"
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum 12 characters required for security compliance
                  </p>
                </div>
              )}

              {isExporting && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Exporting Package...</span>
                    <span className="text-sm text-muted-foreground">{Math.round(exportProgress)}%</span>
                  </div>
                  <Progress value={exportProgress} />
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setExportDialogOpen(false)}
                  disabled={isExporting}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleExport}
                  disabled={isExporting || (selectedFormat.encrypted && exportPassword.length < 12)}
                >
                  {isExporting ? 'Exporting...' : 'Export Package'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="formats" className="w-full">
        <TabsList>
          <TabsTrigger value="formats">Export Formats</TabsTrigger>
          <TabsTrigger value="recent">Recent Exports</TabsTrigger>
        </TabsList>

        <TabsContent value="formats" className="space-y-4">
          <div className="grid gap-4">
            {exportFormats.map((format) => {
              const canUse = canUseFormat(format);
              return (
                <Card key={format.name} className={!canUse ? 'opacity-50' : ''}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        {format.name}
                        {format.encrypted && <Lock className="h-3 w-3" />}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {canUse ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        )}
                        <Badge variant={format.encrypted ? 'default' : 'secondary'}>
                          {format.encrypted ? 'Encrypted' : 'Standard'}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{format.description}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">Supported Classifications:</span>
                      {format.classification.map(cls => (
                        <Badge 
                          key={cls} 
                          variant="outline" 
                          className="text-xs"
                        >
                          {cls}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          {recentExports.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <FileImage className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No recent exports found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {recentExports.map((pkg) => (
                <Card key={pkg.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{pkg.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        {getClassificationBadge(pkg.classification)}
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Created by:</span>
                        <span>{pkg.createdBy}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date:</span>
                        <span>{pkg.createdAt.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Checksum:</span>
                        <span className="font-mono">{pkg.checksum}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecureExportSystem;