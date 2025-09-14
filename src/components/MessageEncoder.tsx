import React, { useState, useEffect } from 'react';
import { encodeMessage, downloadImage, SteganographyAlgorithm, SteganographyOptions, encodeMultipleMessages } from '@/utils/steganography';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Download, Check, Eye, EyeOff, Upload, Save, Settings, Lock, Plus, ListChecks } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import FileUploader from './FileUploader';
import { useAuth } from '@/context/AuthContext';
import { saveImageToStorage } from '@/components/StorageService';
import { TabsContent, Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTheme } from '@/context/ThemeContext';
import DecoyMessageInput from './DecoyMessageInput';
import { DecoyMessage } from '@/utils/steganographyAlgorithms';

const MessageEncoder: React.FC = () => {
  // File and message state
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  
  // Steganography options state
  const [useEncryption, setUseEncryption] = useState(false);
  const [algorithm, setAlgorithm] = useState<SteganographyAlgorithm>('lsb');
  const [quality, setQuality] = useState(90);
  const [capacity, setCapacity] = useState(1);
  const [encryptionAlgorithm, setEncryptionAlgorithm] = useState<'aes' | 'chacha20'>('aes');
  const [useExpiry, setUseExpiry] = useState(false);
  const [expiryType, setExpiryType] = useState<'time' | 'views'>('time');
  const [expiryValue, setExpiryValue] = useState('');
  
  // Decoy messages state
  const [useDecoys, setUseDecoys] = useState(false);
  const [decoys, setDecoys] = useState<DecoyMessage[]>([]);
  
  // UI state
  const [password, setPassword] = useState('');
  const [encodedImage, setEncodedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [savingToAccount, setSavingToAccount] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  
  const { toast } = useToast();
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  
  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    // Reset encoded image if a new file is selected
    setEncodedImage(null);
    
    // Generate default title from filename
    const fileName = selectedFile.name.split('.')[0];
    setTitle(fileName.charAt(0).toUpperCase() + fileName.slice(1));
  };
  
  // Handle adding a new decoy message
  const handleAddDecoy = () => {
    const newDecoy: DecoyMessage = {
      message: '',
      password: '',
      index: decoys.length + 1
    };
    setDecoys([...decoys, newDecoy]);
  };
  
  // Handle updating a decoy message
  const handleUpdateDecoy = (index: number, updatedDecoy: DecoyMessage) => {
    const updatedDecoys = [...decoys];
    updatedDecoys[index] = updatedDecoy;
    setDecoys(updatedDecoys);
  };
  
  // Handle removing a decoy message
  const handleRemoveDecoy = (index: number) => {
    const updatedDecoys = decoys.filter((_, i) => i !== index);
    // Recalculate the indices after removal
    const reorderedDecoys = updatedDecoys.map((decoy, i) => ({
      ...decoy,
      index: i + 1
    }));
    setDecoys(reorderedDecoys);
  };
  
  const handleEncode = async () => {
    if (!file) {
      toast({
        title: 'No image selected',
        description: 'Please upload an image first.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!message.trim()) {
      toast({
        title: 'No message to hide',
        description: 'Please enter a message to hide in the image.',
        variant: 'destructive',
      });
      return;
    }
    
    if (useEncryption && !password.trim()) {
      toast({
        title: 'Password required',
        description: 'Please enter a password for encryption.',
        variant: 'destructive',
      });
      return;
    }
    
    // Validate decoys if enabled
    if (useDecoys) {
      const emptyDecoys = decoys.filter(d => !d.message.trim() || !d.password.trim());
      if (emptyDecoys.length > 0) {
        toast({
          title: 'Incomplete decoy messages',
          description: 'Please ensure all decoy messages have content and passwords.',
          variant: 'destructive',
        });
        return;
      }
    }
    
    try {
      setLoading(true);
      
      // Build encoding options
      const options: SteganographyOptions = {
        algorithm,
        quality,
        capacity: algorithm === 'multibit-lsb' ? capacity : 1,
      };
      
      // Add encryption options if enabled
      if (useEncryption) {
        options.encryption = {
          algorithm: encryptionAlgorithm,
          strength: 256,
        };
      }
      
      // Add expiry if enabled
      if (useExpiry) {
        options.expiry = {
          type: expiryType,
          value: expiryType === 'time' 
            ? new Date(expiryValue).getTime() 
            : parseInt(expiryValue, 10),
        };
      }
      
      let result: string;
      
      // Use either normal encoding or decoy-enabled encoding
      if (useDecoys && decoys.length > 0) {
        result = await encodeMultipleMessages(
          file,
          message,
          useEncryption ? password : undefined,
          decoys,
          options
        );
      } else {
        result = await encodeMessage(
          file,
          message,
          useEncryption ? password : undefined,
          options
        );
      }
      
      setEncodedImage(result);
      
      toast({
        title: 'Message encoded successfully',
        description: useDecoys 
          ? `Your message and ${decoys.length} decoy messages have been hidden in the image.`
          : 'Your message has been hidden in the image.',
        variant: 'default',
      });
    } catch (error: any) {
      toast({
        title: 'Encoding failed',
        description: error.message || 'Failed to hide your message in the image.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleDownload = () => {
    if (!encodedImage) return;
    
    // Generate filename based on original filename
    const originalName = file?.name || 'image';
    const nameParts = originalName.split('.');
    nameParts.pop(); // Remove extension
    const baseFileName = nameParts.join('.');
    const newFileName = `${baseFileName}-secret.png`;
    
    downloadImage(encodedImage, newFileName);
    
    toast({
      title: 'Image downloaded',
      description: 'Your image with the hidden message has been downloaded.',
    });
  };
  
  const handleSaveToAccount = async () => {
    if (!encodedImage || !file || !user) return;
    
    try {
      setSavingToAccount(true);
      
      // Convert data URL to File object for storage
      const response = await fetch(encodedImage);
      const blob = await response.blob();
      const encodedFile = new File([blob], `${title.replace(/\s+/g, '_')}.png`, { type: 'image/png' });
      
      // Save image to Supabase storage with metadata
      await saveImageToStorage({
        userId: user.id,
        title: title || 'Untitled Image',
        description,
        imageFile: encodedFile,
        originalImageFile: file,
        hasHiddenMessage: true,
        isEncrypted: useEncryption,
      });
      
      toast({
        title: 'Image saved to your account',
        description: 'You can access it from your dashboard.',
      });
    } catch (error: any) {
      toast({
        title: 'Failed to save image',
        description: error.message || 'There was a problem saving your image.',
        variant: 'destructive',
      });
    } finally {
      setSavingToAccount(false);
    }
  };
  
  // Effect to validate expiry input
  useEffect(() => {
    if (!useExpiry) return;
    
    if (expiryType === 'views') {
      const viewCount = parseInt(expiryValue, 10);
      if (isNaN(viewCount) || viewCount <= 0) {
        setExpiryValue('1');
      }
    } else if (expiryType === 'time') {
      const date = new Date(expiryValue);
      if (isNaN(date.getTime()) || date <= new Date()) {
        // Default to tomorrow if invalid
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setExpiryValue(tomorrow.toISOString().split('T')[0]);
      }
    }
  }, [useExpiry, expiryType, expiryValue]);
  
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="md:col-span-1 dark:bg-gray-800/50 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-crypti-purple dark:text-crypti-softBlue">Upload Image</CardTitle>
          <CardDescription className="dark:text-gray-400">Select an image to hide your message in</CardDescription>
        </CardHeader>
        <CardContent>
          <FileUploader 
            onFileSelect={handleFileSelect} 
            accept="image/jpeg,image/png"
            label="Upload an image to hide your message"
            fileTypes={['.jpg', '.jpeg', '.png']}
            multiple={false}
          />
        </CardContent>
      </Card>
      
      <Card className="md:col-span-1 dark:bg-gray-800/50 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-crypti-purple dark:text-crypti-softBlue">Secret Message</CardTitle>
          <CardDescription className="dark:text-gray-400">Enter the message you want to hide</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="message" className="dark:text-gray-300">Your Secret Message</Label>
            <Textarea
              id="message"
              placeholder="Type your secret message here..."
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="resize-none dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 dark:bg-gray-700">
              <TabsTrigger value="basic" className="dark:data-[state=active]:bg-crypti-purple dark:data-[state=active]:text-white">
                Basic
              </TabsTrigger>
              <TabsTrigger value="advanced" className="dark:data-[state=active]:bg-crypti-purple dark:data-[state=active]:text-white">
                Advanced
              </TabsTrigger>
              <TabsTrigger value="decoy" className="dark:data-[state=active]:bg-crypti-purple dark:data-[state=active]:text-white">
                Decoys
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4 pt-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="encryption"
                  checked={useEncryption}
                  onCheckedChange={setUseEncryption}
                />
                <Label htmlFor="encryption" className="dark:text-gray-300">Encrypt with password</Label>
              </div>
              
              {useEncryption && (
                <div className="space-y-2">
                  <Label htmlFor="password" className="dark:text-gray-300">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter a strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 dark:text-gray-300"
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
            </TabsContent>
            
            <TabsContent value="advanced" className="space-y-6 pt-4">
              <div className="space-y-2">
                <Label htmlFor="algorithm" className="dark:text-gray-300">Steganography Algorithm</Label>
                <Select 
                  value={algorithm} 
                  onValueChange={(value) => setAlgorithm(value as SteganographyAlgorithm)}
                >
                  <SelectTrigger className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                    <SelectValue placeholder="Select algorithm" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                    <SelectItem value="lsb">LSB (Least Significant Bit)</SelectItem>
                    <SelectItem value="multibit-lsb">Multi-bit LSB</SelectItem>
                    <SelectItem value="dct">DCT (Discrete Cosine Transform)</SelectItem>
                    <SelectItem value="dwt" disabled>DWT (Discrete Wavelet Transform)</SelectItem>
                  </SelectContent>
                </Select>
                
                {algorithm === 'dct' && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                    <strong>Note:</strong> DCT algorithm is more resistant to compression but may reduce image quality slightly.
                  </p>
                )}
              </div>
              
              {algorithm === 'multibit-lsb' && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="capacity" className="dark:text-gray-300">Bit Capacity (1-4)</Label>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{capacity}</span>
                  </div>
                  <Slider
                    id="capacity"
                    min={1}
                    max={4}
                    step={1}
                    value={[capacity]}
                    onValueChange={(values) => setCapacity(values[0])}
                    className="dark:bg-gray-700"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Higher values store more data but may affect image quality.
                  </p>
                </div>
              )}
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="quality" className="dark:text-gray-300">Image Quality</Label>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{quality}%</span>
                </div>
                <Slider
                  id="quality"
                  min={50}
                  max={100}
                  step={5}
                  value={[quality]}
                  onValueChange={(values) => setQuality(values[0])}
                  className="dark:bg-gray-700"
                />
              </div>
              
              {useEncryption && (
                <div className="space-y-2">
                  <Label htmlFor="encryptionAlgorithm" className="dark:text-gray-300">Encryption Algorithm</Label>
                  <Select 
                    value={encryptionAlgorithm} 
                    onValueChange={(value) => setEncryptionAlgorithm(value as 'aes' | 'chacha20')}
                  >
                    <SelectTrigger className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                      <SelectValue placeholder="Select encryption" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                      <SelectItem value="aes">AES-256</SelectItem>
                      <SelectItem value="chacha20">ChaCha20</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="expiry"
                  checked={useExpiry}
                  onCheckedChange={setUseExpiry}
                />
                <Label htmlFor="expiry" className="dark:text-gray-300">Set message expiry</Label>
              </div>
              
              {useExpiry && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="expiryType" className="dark:text-gray-300">Expiry Type</Label>
                    <Select 
                      value={expiryType} 
                      onValueChange={(value) => setExpiryType(value as 'time' | 'views')}
                    >
                      <SelectTrigger className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                        <SelectItem value="time">Date</SelectItem>
                        <SelectItem value="views">View Count</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="expiryValue" className="dark:text-gray-300">
                      {expiryType === 'time' ? 'Expiry Date' : 'View Limit'}
                    </Label>
                    {expiryType === 'time' ? (
                      <Input
                        id="expiryValue"
                        type="date"
                        value={expiryValue}
                        onChange={(e) => setExpiryValue(e.target.value)}
                        className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    ) : (
                      <Input
                        id="expiryValue"
                        type="number"
                        value={expiryValue}
                        onChange={(e) => setExpiryValue(e.target.value)}
                        min="1"
                        className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        placeholder="Number of views"
                      />
                    )}
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="decoy" className="space-y-6 pt-4">
              <div className="flex items-center space-x-2 mb-4">
                <Switch
                  id="use-decoys"
                  checked={useDecoys}
                  onCheckedChange={setUseDecoys}
                />
                <Label htmlFor="use-decoys" className="dark:text-gray-300">Enable decoy messages</Label>
              </div>
              
              {useDecoys && (
                <div className="space-y-4">
                  <div className="bg-orange-100 dark:bg-orange-900/20 p-3 rounded-md text-sm">
                    <h4 className="font-medium text-orange-800 dark:text-orange-400 mb-1">What are decoy messages?</h4>
                    <p className="text-orange-700 dark:text-orange-300">
                      Decoy messages are additional hidden messages that appear when a different password is used.
                      This helps protect your actual secret message by misdirecting suspicious parties.
                    </p>
                  </div>
                  
                  {decoys.map((decoy, index) => (
                    <DecoyMessageInput
                      key={index}
                      index={index}
                      totalDecoys={decoys.length}
                      value={decoy}
                      onChange={handleUpdateDecoy}
                      onRemove={handleRemoveDecoy}
                    />
                  ))}
                  
                  {decoys.length < 3 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddDecoy}
                      className="w-full border-dashed border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Decoy Message
                    </Button>
                  )}
                  
                  {decoys.length === 3 && (
                    <p className="text-xs text-center text-orange-600 dark:text-orange-400">
                      Maximum of 3 decoy messages allowed to maintain image quality.
                    </p>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button
            onClick={handleEncode}
            disabled={loading || !file || !message.trim()}
            className={isDarkMode ? "bg-crypti-softBlue hover:bg-crypti-softBlue/80" : "bg-crypti-purple hover:bg-crypti-purple/80"}
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                Processing...
              </div>
            ) : (
              <>
                <Lock className="mr-2 h-4 w-4" />
                {useDecoys ? 'Hide Messages' : 'Hide Message'}
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      {encodedImage && (
        <Card className="md:col-span-2 border-crypti-purple/30 dark:bg-gray-800/50 dark:border-gray-700">
          <CardHeader className={
            isDarkMode 
              ? "bg-gradient-to-r from-crypti-softBlue/20 to-crypti-purple/10" 
              : "bg-gradient-to-r from-crypti-softBlue to-crypti-purple/10"
          }>
            <CardTitle className="flex items-center text-crypti-darkPurple dark:text-white">
              <Check className="mr-2 h-5 w-5 text-green-500" />
              {useDecoys 
                ? `Message Successfully Hidden (with ${decoys.length} decoys)` 
                : 'Message Successfully Hidden'}
            </CardTitle>
            <CardDescription className="dark:text-gray-400">
              Your message has been encoded in the image. The original image was not modified.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <div className="w-full max-w-md">
                <img
                  src={encodedImage}
                  alt="Encoded"
                  className="rounded-md shadow-md"
                />
              </div>
              
              {useDecoys && (
                <div className="mt-4 w-full max-w-md bg-orange-50 dark:bg-orange-900/10 p-3 rounded-md border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center text-orange-800 dark:text-orange-400 font-medium mb-2">
                    <ListChecks className="h-4 w-4 mr-2" />
                    Decoy Messages Summary
                  </div>
                  <ul className="list-disc list-inside text-sm space-y-1 text-orange-700 dark:text-orange-300">
                    <li>Main message: Access with your primary password</li>
                    {decoys.map((decoy, index) => (
                      <li key={index}>
                        Decoy #{index + 1}: Access with password "{decoy.password.replace(/./g, '•')}"
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {user && (
                <div className="mt-6 w-full max-w-md space-y-4">
                  <h3 className="text-lg font-medium text-crypti-darkPurple dark:text-white">Save to Your Account</h3>
                  <div className="space-y-2">
                    <Label htmlFor="image-title" className="dark:text-gray-300">Title</Label>
                    <Input
                      id="image-title"
                      placeholder="Enter a title for your image"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image-description" className="dark:text-gray-300">Description (Optional)</Label>
                    <Textarea
                      id="image-description"
                      placeholder="Add a description..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    />
                  </div>
                </div>
              )}
              
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  Your message is now hidden in this image. Save it to your device,
                  then share it with someone who knows about CryptiPic.
                </p>
                
                {useEncryption && (
                  <p className="text-sm font-medium text-crypti-purple dark:text-crypti-softBlue mt-2">
                    Remember: They'll need the password to reveal your message!
                  </p>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-center gap-4 flex-wrap">
            <Button
              onClick={handleDownload}
              className={isDarkMode ? "bg-crypti-softBlue hover:bg-crypti-softBlue/80" : "bg-crypti-purple hover:bg-crypti-purple/80"}
            >
              <Download className="mr-2 h-4 w-4" />
              Download Secret Image
            </Button>
            
            {user && (
              <Button
                onClick={handleSaveToAccount}
                disabled={savingToAccount}
                variant="outline"
                className={isDarkMode 
                  ? "border-crypti-softBlue text-crypti-softBlue hover:bg-crypti-softBlue/10"
                  : "border-crypti-purple text-crypti-purple hover:bg-crypti-purple/10"
                }
              >
                <Save className="mr-2 h-4 w-4" />
                {savingToAccount ? 'Saving...' : 'Save to My Account'}
              </Button>
            )}
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default MessageEncoder;
