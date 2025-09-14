import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAccess } from '@/context/AccessContext';
import { Shield, Lock, AlertTriangle, Clock, Eye, EyeOff, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';

interface AccessGateProps {
  onAccessGranted: () => void;
}

const AccessGate: React.FC<AccessGateProps> = ({ onAccessGranted }) => {
  const {
    config,
    isLocked,
    lockoutTimeRemaining,
    validatePasscode,
    authenticate,
    checkBruteForce
  } = useAccess();

  const [passcode, setPasscode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [capsLock, setCapsLock] = useState(false);

  // Check for caps lock
  useEffect(() => {
    const checkCapsLock = (e: KeyboardEvent) => {
      const getState = (e as any)?.getModifierState;
      setCapsLock(typeof getState === 'function' ? !!getState.call(e, 'CapsLock') : false);
    };

    window.addEventListener('keydown', checkCapsLock);
    window.addEventListener('keyup', checkCapsLock);

    return () => {
      window.removeEventListener('keydown', checkCapsLock);
      window.removeEventListener('keyup', checkCapsLock);
    };
  }, []);

  const formatLockoutTime = (milliseconds: number): string => {
    const minutes = Math.ceil(milliseconds / (1000 * 60));
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  };

  const handlePasscodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocked) {
      toast.error('Account is locked due to too many failed attempts');
      return;
    }

    if (!passcode.trim()) {
      setError('Please enter the access passcode');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const success = await validatePasscode(passcode);
      
      if (success) {
        onAccessGranted();
      } else {
        setError('Invalid passcode. Please check and try again.');
        setPasscode('');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocked) {
      toast.error('Account is locked due to too many failed attempts');
      return;
    }

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const success = await authenticate(email, password);
      
      if (success) {
        onAccessGranted();
      } else {
        setError('Invalid credentials. Please check and try again.');
        setPassword('');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  if (isLocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-red-950 dark:via-orange-950 dark:to-yellow-950">
        <Card className="w-full max-w-md border-red-200 dark:border-red-800">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-red-800 dark:text-red-200">Access Temporarily Locked</CardTitle>
            <CardDescription className="text-red-600 dark:text-red-400">
              Too many failed attempts detected
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                Your access has been temporarily restricted due to multiple failed authentication attempts.
              </AlertDescription>
            </Alert>

            <div className="flex items-center justify-center space-x-2 text-sm text-red-600 dark:text-red-400">
              <Clock className="w-4 h-4" />
              <span>Time remaining: {formatLockoutTime(lockoutTimeRemaining)}</span>
            </div>

            <div className="pt-4 border-t border-red-200 dark:border-red-800">
              <p className="text-sm text-muted-foreground mb-2">Need help?</p>
              <div className="flex items-center justify-center space-x-1 text-sm text-blue-600 dark:text-blue-400">
                <HelpCircle className="w-4 h-4" />
                <span>Contact your system administrator</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">CryptiPic Access Control</CardTitle>
          <CardDescription>
            {config.useFullAuth 
              ? 'Secure authentication required' 
              : 'Access passcode required to continue'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {config.useFullAuth ? (
            <Tabs defaultValue="login" className="space-y-4">
              <TabsList className="grid w-full grid-cols-1">
                <TabsTrigger value="login">Login</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      disabled={loading}
                      autoComplete="email"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        disabled={loading}
                        autoComplete="current-password"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                        <span className="sr-only">
                          {showPassword ? 'Hide password' : 'Show password'}
                        </span>
                      </Button>
                    </div>
                    
                    {capsLock && (
                      <div className="flex items-center space-x-2 text-sm text-amber-600 dark:text-amber-400">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Caps Lock is on</span>
                      </div>
                    )}
                  </div>

                  {error && (
                    <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800 dark:text-red-200">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Authenticating...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          ) : (
            <form onSubmit={handlePasscodeSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="passcode">Access Passcode</Label>
                <Input
                  id="passcode"
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter access passcode"
                  disabled={loading}
                  autoComplete="off"
                  autoFocus
                  required
                />
                
                {capsLock && (
                  <div className="flex items-center space-x-2 text-sm text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Caps Lock is on</span>
                  </div>
                )}
              </div>

              {error && (
                <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800 dark:text-red-200">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Verifying...' : 'Access System'}
              </Button>
            </form>
          )}

          {/* Security Notice */}
          <div className="mt-6 pt-4 border-t border-border">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Shield className="w-3 h-3" />
                <span>Protected System</span>
              </div>
              <Badge variant="outline" className="text-xs">
                HTTPS Secured
              </Badge>
            </div>
            
            <div className="mt-2 text-center">
              <div className="flex items-center justify-center space-x-1 text-xs text-blue-600 dark:text-blue-400">
                <HelpCircle className="w-3 h-3" />
                <span>Need access? Contact your administrator</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessGate;