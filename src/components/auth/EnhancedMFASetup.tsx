import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Shield, Key, Smartphone, Download, AlertTriangle, CheckCircle2, QrCode } from 'lucide-react';
import { OTPAuth, OTPSecret } from '@/utils/auth/otp';
import { BiometricAuth } from '@/utils/auth/biometric';
import { useAudit } from '@/components/defense/AuditLogger';
import QRCode from 'qrcode';

interface EnhancedMFASetupProps {
  userEmail: string;
  onSetupComplete: (method: 'totp' | 'biometric', data: any) => void;
  onCancel: () => void;
}

const EnhancedMFASetup: React.FC<EnhancedMFASetupProps> = ({ 
  userEmail,
  onSetupComplete, 
  onCancel 
}) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [otpSecret, setOtpSecret] = useState<OTPSecret | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [setupMethod, setSetupMethod] = useState<'totp' | 'biometric'>('totp');
  const [backupCodesDownloaded, setBackupCodesDownloaded] = useState(false);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const { toast } = useToast();
  const { logEvent } = useAudit();

  useEffect(() => {
    const initializeMFA = async () => {
      try {
        setIsGeneratingQR(true);
        
        // Generate TOTP secret immediately
        const secret = OTPAuth.generateSecret(userEmail);
        setOtpSecret(secret);
        
        // Generate QR code
        const issuer = 'CryptiPic Defense';
        const qrUrl = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(userEmail)}?secret=${secret.secret}&issuer=${encodeURIComponent(issuer)}`;
        const qrDataUrl = await QRCode.toDataURL(qrUrl, {
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        setQrCodeDataUrl(qrDataUrl);
        
        // Check biometric availability
        const biometricSupported = await BiometricAuth.isAvailable();
        setBiometricAvailable(biometricSupported);
        
        logEvent('MFA_SETUP_INITIATED', `MFA setup started for ${userEmail}`, 'CUI');
      } catch (error) {
        console.error('Error initializing MFA:', error);
        toast({
          variant: "destructive",
          title: "Initialization Error",
          description: "Failed to initialize MFA setup. Please try again.",
        });
      } finally {
        setIsGeneratingQR(false);
      }
    };
    
    initializeMFA();
  }, [userEmail, logEvent, toast]);

  const verifyTOTP = () => {
    if (!otpSecret || verificationCode.length !== 6) {
      toast({
        variant: "destructive",
        title: "Invalid Code",
        description: "Please enter a 6-digit verification code.",
      });
      return;
    }

    // Verify the TOTP code
    const isValid = OTPAuth.verifyTOTP(verificationCode, otpSecret.secret);
    
    if (isValid) {
      // Store the secret securely
      OTPAuth.storeSecret('current-user', otpSecret);
      
      toast({
        title: "TOTP MFA Setup Complete",
        description: "Multi-factor authentication has been successfully configured.",
      });
      
      logEvent('MFA_SETUP_COMPLETED', `TOTP MFA setup completed for ${userEmail}`, 'CUI', true);
      onSetupComplete('totp', { secret: otpSecret.secret, backupCodes: otpSecret.backupCodes });
    } else {
      toast({
        variant: "destructive",
        title: "Invalid Code",
        description: "The verification code is incorrect. Please try again.",
      });
      
      logEvent('MFA_SETUP_FAILED', `TOTP verification failed for ${userEmail}`, 'CUI', false);
    }
  };

  const setupBiometric = async () => {
    try {
      const credential = await BiometricAuth.register(
        'current-user-id', 
        userEmail, 
        userEmail.split('@')[0]
      );
      
      BiometricAuth.storeCredential('current-user-id', credential);
      
      toast({
        title: "Biometric MFA Setup Complete",
        description: "Biometric authentication has been successfully configured.",
      });
      
      logEvent('MFA_SETUP_COMPLETED', `Biometric MFA setup completed for ${userEmail}`, 'CUI', true);
      onSetupComplete('biometric', { credentialId: credential.id });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Biometric Setup Failed",
        description: error instanceof Error ? error.message : "Failed to setup biometric authentication.",
      });
      
      logEvent('MFA_SETUP_FAILED', `Biometric setup failed for ${userEmail}: ${error}`, 'CUI', false);
    }
  };

  const downloadBackupCodes = () => {
    if (!otpSecret) return;
    
    const codesText = [
      'CryptiPic Defense - MFA Backup Codes',
      `Account: ${userEmail}`,
      `Generated: ${new Date().toLocaleString()}`,
      '',
      'IMPORTANT: Keep these codes secure. Each code can only be used once.',
      '',
      ...otpSecret.backupCodes.map((code, index) => `${index + 1}. ${code}`),
      '',
      'Store these codes in a secure location separate from your device.',
    ].join('\n');
    
    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cryptipic-backup-codes-${userEmail}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setBackupCodesDownloaded(true);
    logEvent('MFA_BACKUP_CODES_DOWNLOADED', `Backup codes downloaded for ${userEmail}`, 'CUI');
  };

  const renderQRCode = () => {
    if (!otpSecret) return null;
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center p-4 bg-muted rounded-lg border">
          {isGeneratingQR ? (
            <div className="text-center space-y-2">
              <QrCode className="h-16 w-16 mx-auto text-muted-foreground animate-pulse" />
              <p className="text-sm text-muted-foreground">Generating QR Code...</p>
            </div>
          ) : qrCodeDataUrl ? (
            <div className="text-center space-y-2">
              <img 
                src={qrCodeDataUrl} 
                alt="TOTP QR Code" 
                className="w-64 h-64 mx-auto border rounded"
              />
              <p className="text-xs text-muted-foreground">
                Compatible with Google Authenticator, Authy, or similar
              </p>
            </div>
          ) : (
            <div className="text-center space-y-2">
              <QrCode className="h-16 w-16 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                QR Code will appear here
              </p>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <Label className="text-sm font-medium">Manual Entry Code:</Label>
          <div className="p-3 bg-muted rounded border font-mono text-sm break-all select-all">
            {otpSecret.secret}
          </div>
          <p className="text-xs text-muted-foreground">
            Use this code if you cannot scan the QR code
          </p>
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="mr-2 h-5 w-5 text-blue-600" />
          Enhanced Multi-Factor Authentication Setup
        </CardTitle>
        <CardDescription>
          Configure NIST SP 800-171 compliant multi-factor authentication for defense-grade security
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 dark:bg-blue-900/20 dark:border-blue-800">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-blue-600 mr-2 mt-0.5 dark:text-blue-400" />
            <div>
              <h4 className="font-medium text-blue-800 dark:text-blue-200">NIST SP 800-171 Requirement</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Multi-factor authentication is required for all privileged accounts and non-privileged 
                accounts accessing covered defense information.
              </p>
            </div>
          </div>
        </div>

        <Tabs value={setupMethod} onValueChange={(value) => setSetupMethod(value as 'totp' | 'biometric')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="totp" className="flex items-center space-x-2">
              <Smartphone className="h-4 w-4" />
              <span>TOTP Authenticator</span>
            </TabsTrigger>
            <TabsTrigger 
              value="biometric" 
              disabled={!biometricAvailable}
              className="flex items-center space-x-2"
            >
              <Key className="h-4 w-4" />
              <span>Biometric</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="totp" className="space-y-6 mt-6">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Step 1: Scan QR Code or Enter Manual Code</Label>
                <div className="mt-2">
                  {renderQRCode()}
                </div>
              </div>

              <div>
                <Label htmlFor="verification-code">Step 2: Enter Verification Code</Label>
                <Input
                  id="verification-code"
                  type="text"
                  placeholder="123456"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="mt-1 font-mono text-center text-lg tracking-widest"
                  maxLength={6}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Step 3: Download Backup Codes</Label>
                <div className="flex items-center space-x-3">
                  <Button
                    onClick={downloadBackupCodes}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download Backup Codes</span>
                  </Button>
                  {backupCodesDownloaded && (
                    <div className="flex items-center space-x-1 text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm">Downloaded</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Backup codes allow access if your authenticator device is unavailable
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button 
                onClick={verifyTOTP} 
                className="flex-1"
                disabled={verificationCode.length !== 6 || !backupCodesDownloaded}
              >
                Verify & Complete TOTP Setup
              </Button>
              <Button variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="biometric" className="space-y-6 mt-6">
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 dark:bg-green-900/20 dark:border-green-800">
                <div className="flex items-start">
                  <Key className="h-5 w-5 text-green-600 mr-2 mt-0.5 dark:text-green-400" />
                  <div>
                    <h4 className="font-medium text-green-800 dark:text-green-200">Biometric Authentication</h4>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      Use your device's built-in biometric capabilities (fingerprint, face recognition, or PIN) 
                      for secure authentication that meets PKI requirements.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center py-8">
                <Key className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Set Up Biometric Authentication</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Your device will prompt you to use your fingerprint, face, or PIN to create a secure credential.
                </p>
                <Button onClick={setupBiometric} size="lg" className="flex items-center space-x-2">
                  <Key className="h-4 w-4" />
                  <span>Register Biometric</span>
                </Button>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EnhancedMFASetup;