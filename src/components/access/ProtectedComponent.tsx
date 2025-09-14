import React, { useEffect, useState } from 'react';
import { useAccessMiddleware } from '@/hooks/useAccessMiddleware';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, Lock, RefreshCw } from 'lucide-react';

interface ProtectedComponentProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredClearance?: string;
  fallback?: React.ReactNode;
  path?: string;
}

const ProtectedComponent: React.FC<ProtectedComponentProps> = ({
  children,
  requiredRole,
  requiredClearance,
  fallback,
  path
}) => {
  const { checkAccess } = useAccessMiddleware();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [accessResult, setAccessResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const performAccessCheck = async () => {
    setIsLoading(true);
    try {
      const result = await checkAccess({
        path,
        requiredRole,
        requiredClearance
      });
      
      setAccessResult(result);
      setIsAuthorized(result.authorized);
    } catch (error) {
      console.error('Access check failed:', error);
      setIsAuthorized(false);
      setAccessResult({ 
        authorized: false, 
        reason: 'Access check failed',
        requiresAuth: true 
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    performAccessCheck();
  }, [requiredRole, requiredClearance, path]);

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex items-center justify-center p-8">
          <div className="flex items-center space-x-3">
            <Shield className="w-5 h-5 text-primary animate-pulse" />
            <span className="text-sm text-muted-foreground">Checking access permissions...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isAuthorized === false) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Card className="w-full max-w-md mx-auto border-red-200 dark:border-red-800">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-full">
              <Lock className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="font-semibold text-red-800 dark:text-red-200">Access Denied</h3>
              <p className="text-sm text-red-600 dark:text-red-400">Insufficient permissions</p>
            </div>
          </div>

          <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950 mb-4">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              {accessResult?.reason || 'You do not have the required permissions to access this resource.'}
            </AlertDescription>
          </Alert>

          <div className="space-y-2 text-sm text-muted-foreground">
            {accessResult?.requiresRole && (
              <div>Required Role: <span className="font-medium">{accessResult.requiresRole}</span></div>
            )}
            {accessResult?.requiresClearance && (
              <div>Required Clearance: <span className="font-medium">{accessResult.requiresClearance}</span></div>
            )}
          </div>

          <div className="flex space-x-2 mt-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={performAccessCheck}
              className="flex items-center space-x-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.location.href = '/'}
            >
              Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
};

export default ProtectedComponent;