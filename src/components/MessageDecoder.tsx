
import React, { useState } from 'react';
import { decodeMessage } from '@/utils/steganography';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { toast as toastSonner } from '@/components/ui/sonner';
import { Eye, EyeOff, MessageSquare, Lock, Copy, AlertTriangle, Smartphone } from 'lucide-react';
import FileUploader from './FileUploader';
import { Textarea } from '@/components/ui/textarea';
import { useTheme } from '@/context/ThemeContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useIsMobile } from '@/hooks/use-mobile';
import { Switch } from '@/components/ui/switch';

const MessageDecoder: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [decodedMessage, setDecodedMessage] = useState<string | null>(null);
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [messageMetadata, setMessageMetadata] = useState<any>(null);
  const [decoyIndex, setDecoyIndex] = useState<number | undefined>(undefined);
  const [hasDecoys, setHasDecoys] = useState(false);
  const [decoyMode, setDecoyMode] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [imageSize, setImageSize] = useState<{ width: number, height: number } | null>(null);
  
  const { toast } = useToast();
  const { isDarkMode } = useTheme();
  const isMobile = useIsMobile();
  
  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    // Reset previous results
    setDecodedMessage(null);
    setIsEncrypted(false);
    setMessageMetadata(null);
    setHasDecoys(false);
    setImageSize(null);
    
    // Get image dimensions
    const img = new Image();
    img.onload = () => {
      setImageSize({
        width: img.width,
        height: img.height
      });
    };
    img.src = URL.createObjectURL(selectedFile);
  };
  
  const handleDecode = async () => {
    if (!file) {
      toast({
        title: 'No image selected',
        description: 'Please upload an image first.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Show in-progress toast for mobile users
      if (isMobile) {
        toastSonner('Processing image...', {
          description: 'This may take longer on mobile devices.',
          duration: 3000,
        });
        
        // Add a small delay on mobile to prevent UI freezing
        await new Promise(r => setTimeout(r, 100));
      }
      
      // Log processing for debug mode
      if (debugMode) {
        console.log(`Processing image (${file.size} bytes) on ${isMobile ? 'mobile' : 'desktop'}`);
        console.log(`Image type: ${file.type}`);
      }
      
      const result = await decodeMessage(file, password, decoyMode ? decoyIndex : undefined);
      
      if (result === 'ENCRYPTED') {
        setIsEncrypted(true);
        setDecodedMessage(null);
        toast({
          title: 'Password required',
          description: 'This image contains an encrypted message. Please enter the password to decrypt it.',
        });
      } else {
        // Extract metadata if available
        try {
          if (typeof result === 'string' && result.includes('{')) {
            const metadataStart = result.indexOf('{');
            const metadataEnd = result.indexOf('}', metadataStart);
            if (metadataStart >= 0 && metadataEnd > metadataStart) {
              const metadataJson = result.substring(metadataStart, metadataEnd + 1);
              const metadata = JSON.parse(metadataJson);
              setMessageMetadata(metadata);
              
              // Check if this image potentially has decoys
              if (metadata.dec !== undefined || metadata.idx !== undefined) {
                setHasDecoys(true);
              }
            }
          }
        } catch (e) {
          console.warn("Failed to extract metadata from message", e);
        }
        
        setDecodedMessage(result);
        setIsEncrypted(false);
        
        toast({
          title: 'Message revealed',
          description: decoyMode 
            ? 'The decoy message has been successfully decoded.' 
            : 'The hidden message has been successfully decoded.',
        });
      }
    } catch (error: any) {
      // Enhanced error handling with more helpful messages
      if (error.message.includes('password')) {
        toast({
          title: 'Incorrect password',
          description: 'The password you entered is incorrect.',
          variant: 'destructive',
        });
      } else if (error.message.includes('expired')) {
        toast({
          title: 'Message expired',
          description: 'This message has expired and can no longer be viewed.',
          variant: 'destructive',
        });
      } else if (error.message.includes('decoy')) {
        toast({
          title: 'Decoy not found',
          description: 'No decoy message found with the specified index.',
          variant: 'destructive',
        });
      } else if (error.message.includes('No hidden message') || error.message.includes('corrupted')) {
        toast({
          title: 'No message detected',
          description: isMobile ? 
            'Could not detect a message. The image may have been modified by your device. Try uploading the original.' : 
            'No hidden message detected in this image or the image was corrupted.',
          variant: 'destructive',
        });
      } else if (isMobile && (error.message.includes('decoding') || error.message.includes('algorithm'))) {
        toast({
          title: 'Mobile compatibility issue',
          description: 'Your device may have modified the image. Try using the original uncompressed image.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Decoding failed',
          description: error.message || 'Failed to decode message from this image.',
          variant: 'destructive',
        });
      }
      // Reset encrypted state if decoding fails generally
      setIsEncrypted(false);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCopyToClipboard = () => {
    if (decodedMessage) {
      navigator.clipboard.writeText(decodedMessage);
      toast({
        title: 'Copied to clipboard',
        description: 'The message has been copied to your clipboard.',
      });
    }
  };
  
  const toggleDecoyMode = () => {
    setDecoyMode(!decoyMode);
    setDecoyIndex(decoyMode ? undefined : 1); // Default to first decoy when enabling
    setDecodedMessage(null);
    setIsEncrypted(false);
  };
  
  return (
    <div className={`grid gap-6 ${isMobile ? '' : 'md:grid-cols-2'}`}>
      <Card className={`${isMobile ? 'mb-4' : 'md:col-span-1'} dark:border-gray-700 dark:bg-gray-800/50`}>
        <CardHeader>
          <CardTitle className="text-crypti-purple dark:text-crypti-softBlue">Upload Secret Image</CardTitle>
          <CardDescription className="dark:text-gray-400">
            Select an image that contains a hidden message
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FileUploader 
            onFileSelect={handleFileSelect} 
            accept="image/jpeg,image/png"
            label="Upload an image with a hidden message"
            fileTypes={['.jpg', '.jpeg', '.png']}
          />
          
          {file && imageSize && (
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Image: {file.name} ({Math.round(file.size/1024)} KB, {imageSize.width}×{imageSize.height}px)
            </div>
          )}
          
          {isMobile && file && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start">
                <Smartphone className="text-blue-600 dark:text-blue-400 h-5 w-5 mr-2 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-blue-700 dark:text-blue-300">Mobile Tips</h4>
                  <ul className="text-sm text-blue-600 dark:text-blue-400 mt-1 list-disc pl-4 space-y-1">
                    <li>Use the original unmodified image for best results</li>
                    <li>Avoid downloading/uploading images through messaging apps</li>
                    <li>Larger images may work better than small ones</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          {hasDecoys && !decoyMode && decodedMessage && (
            <div className="mt-4 p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg border border-orange-300 dark:border-orange-800">
              <div className="flex items-start">
                <AlertTriangle className="text-orange-600 dark:text-orange-400 h-5 w-5 mr-2 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-orange-700 dark:text-orange-300">This image may contain decoy messages</h4>
                  <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                    Try different passwords or enable decoy mode to access them.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2 bg-orange-200 dark:bg-orange-800 border-orange-300 dark:border-orange-700 text-orange-800 dark:text-orange-300 hover:bg-orange-300 dark:hover:bg-orange-700"
                    onClick={toggleDecoyMode}
                  >
                    Switch to Decoy Mode
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {decoyMode && (
            <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-700 rounded-lg">
              <h4 className="text-sm font-medium text-orange-800 dark:text-orange-400 mb-2">Decoy Detection Mode</h4>
              <p className="text-xs text-orange-700 dark:text-orange-500 mb-3">
                You're currently in decoy mode. Specify which decoy to extract (1-3).
              </p>
              <div className="flex items-center space-x-3">
                <div className="flex-1">
                  <Label htmlFor="decoy-index" className="text-xs text-orange-800 dark:text-orange-400 mb-1 block">Decoy Index</Label>
                  <Select
                    value={decoyIndex?.toString() || "1"}
                    onValueChange={(value) => setDecoyIndex(parseInt(value))}
                  >
                    <SelectTrigger className="bg-white dark:bg-gray-700 border-orange-300 dark:border-orange-700">
                      <SelectValue placeholder="Select decoy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Decoy 1</SelectItem>
                      <SelectItem value="2">Decoy 2</SelectItem>
                      <SelectItem value="3">Decoy 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="whitespace-nowrap mt-4 border-orange-300 dark:border-orange-700 text-orange-800 dark:text-orange-300"
                  onClick={toggleDecoyMode}
                >
                  Exit Decoy Mode
                </Button>
              </div>
            </div>
          )}
          
          {/* Debug Mode Toggle - for troubleshooting */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="debug-mode" className="text-sm text-gray-700 dark:text-gray-300">
                  Debug Mode
                </Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Enable additional logging for troubleshooting
                </p>
              </div>
              <Switch
                id="debug-mode"
                checked={debugMode}
                onCheckedChange={setDebugMode}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className={`${isMobile ? 'mb-4' : 'md:col-span-1'} dark:border-gray-700 dark:bg-gray-800/50`}>
        <CardHeader>
          <CardTitle className="text-crypti-purple dark:text-crypti-softBlue">
            {decoyMode ? "Reveal Decoy Message" : "Reveal Secret Message"}
          </CardTitle>
          <CardDescription className="dark:text-gray-400">
            {isEncrypted 
              ? 'Enter the password to decrypt the message' 
              : 'Decode the hidden message from the uploaded image'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEncrypted && (
            <div className="space-y-2">
              <Label htmlFor="decode-password" className="dark:text-gray-200">Password</Label>
              <div className="relative">
                <Input
                  id="decode-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter the decryption password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}
          
          {decodedMessage && (
            <div className="space-y-2 mt-4">
              <Label className="flex justify-between items-center dark:text-gray-200">
                <span>{decoyMode ? "Decoy Message" : "Secret Message"}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCopyToClipboard}
                  className="h-7 text-xs dark:bg-gray-700 dark:text-white dark:border-gray-600"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </Button>
              </Label>
              <Textarea
                value={decodedMessage}
                readOnly
                rows={5}
                className={isDarkMode 
                  ? "font-medium bg-crypti-softBlue/20 dark:bg-gray-700/70 dark:text-white"
                  : "font-medium bg-crypti-softBlue/30"
                }
              />
            </div>
          )}
          
          {messageMetadata && (
            <div className="mt-4 p-3 border rounded-md text-sm dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 dark:text-gray-300">
              <h4 className="font-medium mb-1">Message Information:</h4>
              <ul className="space-y-1">
                {messageMetadata.alg && (
                  <li><span className="font-semibold">Algorithm:</span> {messageMetadata.alg}</li>
                )}
                {messageMetadata.enc && (
                  <li><span className="font-semibold">Encryption:</span> {messageMetadata.enc}</li>
                )}
                {messageMetadata.cap && (
                  <li><span className="font-semibold">Bit depth:</span> {messageMetadata.cap}</li>
                )}
                {messageMetadata.mob !== undefined && (
                  <li><span className="font-semibold">Created on:</span> {messageMetadata.mob === 1 ? 'Mobile device' : 'Desktop'}</li>
                )}
                {messageMetadata.exp && (
                  <li>
                    <span className="font-semibold">Expires:</span> {' '}
                    {messageMetadata.exp.type === 'time' 
                      ? `on ${new Date(messageMetadata.exp.value).toLocaleString()}`
                      : `after ${messageMetadata.exp.value} views`}
                  </li>
                )}
                {decoyMode && messageMetadata.idx !== undefined && (
                  <li><span className="font-semibold">Decoy Index:</span> {messageMetadata.idx}</li>
                )}
                {messageMetadata.ts && (
                  <li><span className="font-semibold">Created:</span> {new Date(messageMetadata.ts).toLocaleString()}</li>
                )}
              </ul>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button
            onClick={handleDecode}
            disabled={loading || !file || (isEncrypted && !password)}
            className={isDarkMode ? "bg-crypti-softBlue hover:bg-crypti-softBlue/80" : "bg-crypti-purple hover:bg-crypti-purple/80"}
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                Decoding...
              </div>
            ) : isEncrypted ? (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Decrypt Message
              </>
            ) : (
              <>
                <MessageSquare className="mr-2 h-4 w-4" />
                {decoyMode ? "Reveal Decoy" : "Reveal Message"}
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      {decodedMessage && (
        <Card className={
          isDarkMode 
            ? `${isMobile ? '' : 'md:col-span-2'} border-crypti-softBlue/40 bg-gradient-to-r from-crypti-purple/30 to-gray-800/50` 
            : `${isMobile ? '' : 'md:col-span-2'} border-green-300 bg-gradient-to-r from-crypti-softBlue/50 to-white`
        }>
          <CardHeader>
            <CardTitle className="flex items-center text-crypti-darkPurple dark:text-white">
              <MessageSquare className="mr-2 h-5 w-5 text-crypti-purple dark:text-crypti-softBlue" />
              {decoyMode ? "Decoy Message Revealed" : "Secret Message Revealed"}
            </CardTitle>
            <CardDescription className="dark:text-gray-400">
              {decoyMode 
                ? "The decoy message was successfully extracted from the image."
                : "The hidden message was successfully extracted from the image."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className={
              isDarkMode 
                ? "p-4 bg-gray-700 rounded-lg shadow-sm border border-crypti-purple/40"
                : "p-4 bg-white rounded-lg shadow-sm border border-crypti-purple/20"
            }>
              <p className="whitespace-pre-wrap dark:text-white">{decodedMessage}</p>
            </div>
            
            {decoyMode && (
              <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-700 rounded-lg text-sm">
                <div className="flex items-start">
                  <AlertTriangle className="text-orange-600 dark:text-orange-400 h-5 w-5 mr-2 mt-0.5" />
                  <div>
                    <p className="text-orange-800 dark:text-orange-300 font-medium">You've revealed a decoy message</p>
                    <p className="text-orange-700 dark:text-orange-400 mt-1">
                      This is a decoy message (level {decoyIndex}) designed to misdirect unauthorized access attempts.
                      There may be other decoy messages or a real message protected with different passwords.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {isMobile && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-700 rounded-lg text-sm">
                <div className="flex items-start">
                  <Smartphone className="text-green-600 dark:text-green-400 h-5 w-5 mr-2 mt-0.5" />
                  <div>
                    <p className="text-green-800 dark:text-green-300 font-medium">Success on Mobile!</p>
                    <p className="text-green-700 dark:text-green-400 mt-1">
                      You've successfully decoded this message on a mobile device. For the most reliable results, 
                      always use the original unmodified image file.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MessageDecoder;
