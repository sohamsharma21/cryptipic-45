
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Shield, Key, Smartphone } from 'lucide-react';

interface MFASetupProps {
  onSetupComplete: (secret: string) => void;
  onCancel: () => void;
}

const MFASetup: React.FC<MFASetupProps> = ({ onSetupComplete, onCancel }) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const { toast } = useToast();

  const generateMFASecret = () => {
    // Generate a base32 secret for TOTP
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setSecret(secret);
    
    // Generate QR code data
    const qrData = `otpauth://totp/DefenseStego?secret=${secret}&issuer=DefenseStego`;
    setQrCode(qrData);
  };

  const verifyMFA = () => {
    if (verificationCode.length !== 6) {
      toast({
        variant: "destructive",
        title: "Invalid Code",
        description: "Please enter a 6-digit verification code.",
      });
      return;
    }

    // In a real implementation, you would verify the TOTP code here
    toast({
      title: "MFA Setup Complete",
      description: "Multi-factor authentication has been successfully configured.",
    });
    onSetupComplete(secret);
  };

  React.useEffect(() => {
    generateMFASecret();
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="mr-2 h-5 w-5 text-blue-600" />
          Multi-Factor Authentication Setup
        </CardTitle>
        <CardDescription>
          Secure your account with TOTP-based two-factor authentication
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <Key className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800">Security Notice</h4>
              <p className="text-sm text-yellow-700 mt-1">
                This is required for defense-grade security compliance. Store your backup codes securely.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">1. Scan QR Code with Authenticator App</Label>
            <div className="mt-2 p-4 bg-gray-100 rounded-lg text-center">
              <Smartphone className="h-8 w-8 mx-auto mb-2 text-gray-600" />
              <p className="text-sm text-gray-600">QR Code would be displayed here</p>
              <p className="text-xs text-gray-500 mt-1">Use Google Authenticator, Authy, or similar</p>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">2. Manual Entry (Alternative)</Label>
            <div className="mt-2 p-3 bg-gray-50 rounded border font-mono text-sm break-all">
              {secret}
            </div>
          </div>

          <div>
            <Label htmlFor="verification-code">3. Enter Verification Code</Label>
            <Input
              id="verification-code"
              type="text"
              placeholder="123456"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="mt-1"
              maxLength={6}
            />
          </div>
        </div>

        <div className="flex space-x-3">
          <Button onClick={verifyMFA} className="flex-1 bg-blue-600 hover:bg-blue-700">
            Verify & Complete Setup
          </Button>
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MFASetup;
