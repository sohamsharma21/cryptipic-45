
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { SecurePackage, ClassificationLevel } from '@/types/defense';
import { useAudit } from './AuditLogger';
import { Package, Download, Upload, Lock, FileCheck } from 'lucide-react';

const SecurePackageManager: React.FC = () => {
  const [packages, setPackages] = useState<SecurePackage[]>([]);
  const [packageName, setPackageName] = useState('');
  const [classification, setClassification] = useState<ClassificationLevel>('UNCLASSIFIED');
  const { toast } = useToast();
  const { logEvent } = useAudit();

  const createSecurePackage = async (imageData: string, metadata: any) => {
    if (!packageName.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Package name is required.",
      });
      return;
    }

    try {
      // Generate digital signature and checksum
      const signature = await generateSignature(imageData + JSON.stringify(metadata));
      const checksum = await generateChecksum(imageData);

      const securePackage: SecurePackage = {
        id: crypto.randomUUID(),
        name: packageName,
        createdBy: 'current-user@defense.gov',
        createdAt: new Date(),
        classification,
        imageData,
        encryptedMetadata: JSON.stringify(metadata), // In production, this would be encrypted
        signature,
        checksum,
      };

      setPackages(prev => [...prev, securePackage]);
      setPackageName('');

      logEvent('EXPORT', `Secure package created: ${packageName}`, classification);

      toast({
        title: "Success",
        description: "Secure package created successfully.",
      });
    } catch (error) {
      logEvent('EXPORT', `Failed to create secure package: ${packageName}`, classification, false);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create secure package.",
      });
    }
  };

  const exportPackage = (pkg: SecurePackage) => {
    const exportData = {
      ...pkg,
      exportedAt: new Date(),
      exportedBy: 'current-user@defense.gov',
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pkg.name}-${pkg.id}.dpkg`;
    a.click();
    URL.revokeObjectURL(url);

    logEvent('EXPORT', `Package exported: ${pkg.name}`, pkg.classification);
  };

  const importPackage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        // Verify package integrity
        const isValid = await verifyPackageIntegrity(data);
        if (!isValid) {
          throw new Error('Package integrity verification failed');
        }

        setPackages(prev => [...prev, data]);
        logEvent('IMPORT', `Package imported: ${data.name}`, data.classification);

        toast({
          title: "Success",
          description: "Secure package imported successfully.",
        });
      } catch (error) {
        logEvent('IMPORT', `Failed to import package: ${file.name}`, undefined, false);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to import package. File may be corrupted or invalid.",
        });
      }
    };
    reader.readAsText(file);
  };

  const generateSignature = async (data: string): Promise<string> => {
    // In production, this would use proper cryptographic signing
    return btoa(data).slice(0, 32);
  };

  const generateChecksum = async (data: string): Promise<string> => {
    // In production, this would use SHA-256 or similar
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  };

  const verifyPackageIntegrity = async (pkg: SecurePackage): Promise<boolean> => {
    // In production, this would verify the digital signature and checksum
    return !!(pkg.signature && pkg.checksum && pkg.imageData && pkg.encryptedMetadata);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="mr-2 h-5 w-5 text-blue-600" />
            Secure Package Manager
          </CardTitle>
          <CardDescription>
            Export and import encrypted data packages for secure transfer
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="package-name">Package Name</Label>
                <Input
                  id="package-name"
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                  placeholder="Enter package name"
                />
              </div>
              
              <div>
                <Label htmlFor="classification">Classification Level</Label>
                <Select value={classification} onValueChange={(value: ClassificationLevel) => setClassification(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UNCLASSIFIED">UNCLASSIFIED</SelectItem>
                    <SelectItem value="CUI">CUI</SelectItem>
                    <SelectItem value="CONFIDENTIAL">CONFIDENTIAL</SelectItem>
                    <SelectItem value="SECRET">SECRET</SelectItem>
                    <SelectItem value="TOP_SECRET">TOP SECRET</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={() => createSecurePackage('sample-image-data', { test: 'metadata' })}
                className="w-full"
              >
                <Lock className="mr-2 h-4 w-4" />
                Create Secure Package
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="import-file">Import Package</Label>
                <Input
                  id="import-file"
                  type="file"
                  accept=".dpkg,.json"
                  onChange={importPackage}
                />
              </div>
              
              <Button variant="outline" className="w-full">
                <Upload className="mr-2 h-4 w-4" />
                Select File to Import
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Existing Packages</h4>
            {packages.length === 0 ? (
              <p className="text-gray-500 text-sm">No packages created yet.</p>
            ) : (
              <div className="space-y-2">
                {packages.map((pkg) => (
                  <div key={pkg.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{pkg.name}</div>
                      <div className="text-sm text-gray-500">
                        {pkg.classification} • Created {pkg.createdAt.toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FileCheck className="h-4 w-4 text-green-600" />
                      <Button
                        size="sm"
                        onClick={() => exportPackage(pkg)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Export
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurePackageManager;
