import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Shield, Zap, Lock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EnhancedDefenseSteganography } from '@/utils/steganography/enhancedDefense';
import { ChaoticMapType, CompressionAlgorithm, SteganographyAlgorithm } from '@/utils/steganography/types';
import { SecurityValidator, SecurityAuditLogger } from '@/utils/steganography/securityValidator';

interface AdvancedOptions {
  algorithm: SteganographyAlgorithm;
  compressionAlgorithm: CompressionAlgorithm;
  chaoticMap: ChaoticMapType;
  quantumResistant: boolean;
  compressionLevel: number;
  chaoticIterations: number;
}

export function EnhancedSteganographyDemo() {
  const [message, setMessage] = useState('');
  const [password, setPassword] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [encodedImage, setEncodedImage] = useState<string>('');
  const [decodedMessage, setDecodedMessage] = useState('');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [metadata, setMetadata] = useState<any>(null);
  const [options, setOptions] = useState<AdvancedOptions>({
    algorithm: 'adaptive-hybrid',
    compressionAlgorithm: 'hybrid',
    chaoticMap: 'logistic',
    quantumResistant: false,
    compressionLevel: 5,
    chaoticIterations: 1000
  });

  const defenseSteg = new EnhancedDefenseSteganography();

  const handleEncode = async () => {
    // Security: Enhanced input validation with SecurityValidator
    const messageValidation = SecurityValidator.validateMessage(message);
    if (!messageValidation.valid) {
      alert(`Message validation failed:\n${messageValidation.errors.join('\n')}`);
      SecurityAuditLogger.log('warning', 'Invalid message attempted', { errors: messageValidation.errors });
      return;
    }

    const passwordValidation = SecurityValidator.validatePassword(password);
    if (!passwordValidation.valid) {
      alert(`Password validation failed:\n${passwordValidation.errors.join('\n')}`);
      SecurityAuditLogger.log('warning', 'Weak password attempted', { errors: passwordValidation.errors });
      return;
    }

    if (!imageFile) {
      alert('Please select an image file');
      return;
    }

    const fileValidation = SecurityValidator.validateImageFile(imageFile);
    if (!fileValidation.valid) {
      alert(`File validation failed:\n${fileValidation.errors.join('\n')}`);
      SecurityAuditLogger.log('warning', 'Invalid file attempted', { errors: fileValidation.errors });
      return;
    }

    // Security: Rate limiting check
    const userId = SecurityValidator.generateSecureId();
    const rateLimit = SecurityValidator.checkRateLimit(userId, 'encode');
    if (!rateLimit.allowed) {
      alert('Rate limit exceeded. Please wait before trying again.');
      SecurityAuditLogger.log('warning', 'Rate limit exceeded', { operation: 'encode', userId });
      return;
    }

    setProcessing(true);
    setProgress(0);
    SecurityAuditLogger.log('info', 'Encoding started', { messageLength: message.length, algorithm: options.algorithm });

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const result = await defenseSteg.encodeDefenseMessage(
        imageFile,
        message,
        password,
        {
          algorithm: options.algorithm,
          compression: {
            algorithm: options.compressionAlgorithm,
            level: options.compressionLevel
          },
          chaotic: {
            mapType: options.chaoticMap,
            iterations: options.chaoticIterations,
            usePassword: true
          },
          encryption: {
            algorithm: 'enhanced-aes256',
            strength: 256,
            quantumResistant: options.quantumResistant
          },
          advancedSecurity: true,
          debug: false // Security: Disable debug in production
        },
        'UNCLASSIFIED',
        'demo-user'
      );

      clearInterval(progressInterval);
      setProgress(100);
      setEncodedImage(result.encodedImage);
      setMetadata(result.metadata);
      SecurityAuditLogger.log('info', 'Encoding completed successfully', { 
        securityLevel: result.metadata.securityLevel,
        compressionRatio: result.metadata.compressionRatio 
      });
      
    } catch (error) {
      console.error('Encoding failed:', error);
      SecurityAuditLogger.log('error', 'Encoding failed', { error: error.message });
      // Security: Don't expose detailed error information to users
      alert('Encoding failed. Please check your inputs and try again.');
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  };

  const handleDecode = async () => {
    // Security: Enhanced input validation
    if (!imageFile || !password.trim()) {
      alert('Please provide image and password');
      return;
    }

    // Security: Validate password length
    if (password.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }

    // Security: Validate file
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(imageFile.type)) {
      alert('Please select a valid image file');
      return;
    }

    setProcessing(true);
    setProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 15, 90));
      }, 150);

      const result = await defenseSteg.decodeDefenseMessage(
        imageFile,
        password,
        {
          algorithm: options.algorithm,
          chaotic: {
            mapType: options.chaoticMap,
            iterations: options.chaoticIterations,
            usePassword: true
          },
          advancedSecurity: true,
          debug: false // Security: Disable debug
        },
        'demo-user'
      );

      clearInterval(progressInterval);
      setProgress(100);
      setDecodedMessage(result.message);
      setMetadata(result.metadata);

    } catch (error) {
      console.error('Decoding failed:', error);
      // Security: Generic error message
      alert('Decoding failed. Please check your password and image.');
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  };

  const downloadEncodedImage = () => {
    if (!encodedImage) return;
    
    try {
      const link = document.createElement('a');
      // Security: Sanitize filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      link.href = encodedImage;
      link.download = `encoded-image-${timestamp}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    }
  };

  const getSecurityBadgeColor = (level: string) => {
    switch (level) {
      case 'MAXIMUM': return 'bg-red-500';
      case 'HIGH': return 'bg-orange-500';
      case 'MODERATE': return 'bg-yellow-500';
      case 'BASIC': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Enhanced Defense Steganography
        </h1>
        <p className="text-muted-foreground text-lg">
          Military-grade steganography with quantum-resistant encryption, chaotic embedding, and advanced compression
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Message Encoding
            </CardTitle>
            <CardDescription>
              Configure advanced steganography options and encode your message
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="image-upload">Cover Image</Label>
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
            </div>

            <div>
              <Label htmlFor="message">Secret Message</Label>
              <Textarea
                id="message"
                placeholder="Enter your secret message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter encryption password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Algorithm</Label>
                <Select value={options.algorithm} onValueChange={(value: SteganographyAlgorithm) => 
                  setOptions(prev => ({ ...prev, algorithm: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="adaptive-hybrid">Adaptive Hybrid</SelectItem>
                    <SelectItem value="hybrid-dct-dwt">DCT+DWT Hybrid</SelectItem>
                    <SelectItem value="chaotic-lsb">Chaotic LSB</SelectItem>
                    <SelectItem value="multibit-lsb">Multi-bit LSB</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Compression</Label>
                <Select value={options.compressionAlgorithm} onValueChange={(value: CompressionAlgorithm) => 
                  setOptions(prev => ({ ...prev, compressionAlgorithm: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hybrid">Hybrid (Best)</SelectItem>
                    <SelectItem value="huffman">Huffman</SelectItem>
                    <SelectItem value="rle">Run-Length</SelectItem>
                    <SelectItem value="adaptive">Adaptive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Chaotic Map</Label>
                <Select value={options.chaoticMap} onValueChange={(value: ChaoticMapType) => 
                  setOptions(prev => ({ ...prev, chaoticMap: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="logistic">Logistic</SelectItem>
                    <SelectItem value="tent">Tent</SelectItem>
                    <SelectItem value="henon">Hénon</SelectItem>
                    <SelectItem value="arnold">Arnold Cat</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Iterations: {options.chaoticIterations}</Label>
                <Input
                  type="range"
                  min="500"
                  max="3000"
                  step="100"
                  value={options.chaoticIterations}
                  onChange={(e) => setOptions(prev => ({ 
                    ...prev, 
                    chaoticIterations: parseInt(e.target.value) 
                  }))}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="quantum-resistant">Quantum-Resistant Encryption</Label>
              <Switch
                id="quantum-resistant"
                checked={options.quantumResistant}
                onCheckedChange={(checked) => 
                  setOptions(prev => ({ ...prev, quantumResistant: checked }))
                }
              />
            </div>

            {processing && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 animate-pulse" />
                  <span className="text-sm">Processing...</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                onClick={handleEncode} 
                disabled={processing || !imageFile || !message || !password}
                className="flex-1"
              >
                <Lock className="w-4 h-4 mr-2" />
                Encode Message
              </Button>
              <Button 
                onClick={handleDecode} 
                disabled={processing || !imageFile || !password}
                variant="outline"
                className="flex-1"
              >
                <Shield className="w-4 h-4 mr-2" />
                Decode Message
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle>Results & Metadata</CardTitle>
            <CardDescription>
              View encoding/decoding results and security metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {encodedImage && (
              <div>
                <Label>Encoded Image</Label>
                <div className="border rounded-lg p-4 space-y-2">
                  <img 
                    src={encodedImage} 
                    alt="Encoded" 
                    className="max-w-full h-auto rounded border"
                    style={{ maxHeight: '200px' }}
                  />
                  <Button onClick={downloadEncodedImage} variant="outline" size="sm">
                    Download Encoded Image
                  </Button>
                </div>
              </div>
            )}

            {decodedMessage && (
              <div>
                <Label>Decoded Message</Label>
                <Textarea 
                  value={decodedMessage} 
                  readOnly 
                  rows={4}
                  className="bg-muted"
                />
              </div>
            )}

            {metadata && (
              <div>
                <Label>Security Metadata</Label>
                <div className="bg-muted rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Security Level</span>
                    <Badge className={getSecurityBadgeColor(metadata.securityLevel)}>
                      {metadata.securityLevel}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Algorithm</span>
                    <span className="text-sm">{metadata.algorithm}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Encryption</span>
                    <span className="text-sm">{metadata.encryptionMethod}</span>
                  </div>
                  
                  {metadata.compressionRatio && (
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Compression Ratio</span>
                      <span className="text-sm">
                        {(metadata.compressionRatio * 100).toFixed(1)}%
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Quantum Resistant</span>
                    <Badge variant={metadata.quantumResistant ? "default" : "outline"}>
                      {metadata.quantumResistant ? "Yes" : "No"}
                    </Badge>
                  </div>
                  
                  {metadata.digitalSignature && (
                    <div>
                      <span className="font-medium">Digital Signature</span>
                      <p className="text-xs font-mono bg-background p-2 rounded mt-1 break-all">
                        {metadata.digitalSignature.substring(0, 64)}...
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!encodedImage && !decodedMessage && !metadata && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Upload an image and enter a message to get started with enhanced steganography.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Enhanced Features</CardTitle>
          <CardDescription>
            Current system capabilities and security features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Shield className="w-8 h-8 text-blue-500" />
              <div>
                <h4 className="font-semibold">Chaotic Maps</h4>
                <p className="text-sm text-muted-foreground">Randomized embedding</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Zap className="w-8 h-8 text-green-500" />
              <div>
                <h4 className="font-semibold">Advanced Compression</h4>
                <p className="text-sm text-muted-foreground">Up to 60% reduction</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Lock className="w-8 h-8 text-purple-500" />
              <div>
                <h4 className="font-semibold">Quantum Resistant</h4>
                <p className="text-sm text-muted-foreground">Future-proof security</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <AlertTriangle className="w-8 h-8 text-orange-500" />
              <div>
                <h4 className="font-semibold">Digital Signatures</h4>
                <p className="text-sm text-muted-foreground">Integrity verification</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}