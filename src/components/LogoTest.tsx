/**
 * Logo Test Component
 * Tests all logo sources and displays status
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface LogoTestResult {
  src: string;
  status: 'loading' | 'success' | 'error';
  loadTime?: number;
}

const LogoTest: React.FC = () => {
  const [results, setResults] = useState<LogoTestResult[]>([]);
  const [isTesting, setIsTesting] = useState(false);

  const logoSources = [
    '/Uplode_img/6a7770e9-8262-4451-a248-72435e52e946.png',
    '/images/favicon.png',
    '/favicon.ico',
    '/Uplode_img/390e3f59-0f90-4390-a0eb-d404f3b7abaf.png'
  ];

  const testLogos = async () => {
    setIsTesting(true);
    setResults([]);

    const testPromises = logoSources.map(async (src) => {
      const startTime = Date.now();
      
      return new Promise<LogoTestResult>((resolve) => {
        const img = new Image();
        
        img.onload = () => {
          const loadTime = Date.now() - startTime;
          resolve({
            src,
            status: 'success',
            loadTime
          });
        };
        
        img.onerror = () => {
          resolve({
            src,
            status: 'error'
          });
        };
        
        img.src = src;
      });
    });

    const testResults = await Promise.all(testPromises);
    setResults(testResults);
    setIsTesting(false);
  };

  useEffect(() => {
    testLogos();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'loading':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      default:
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500">Success</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'loading':
        return <Badge variant="secondary">Loading</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>Logo Loading Test</span>
          {isTesting && <Loader2 className="h-5 w-5 animate-spin" />}
        </CardTitle>
        <CardDescription>
          Test all logo sources and verify loading status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Test Results:</span>
          <Button 
            onClick={testLogos} 
            disabled={isTesting}
            size="sm"
          >
            {isTesting ? 'Testing...' : 'Retest'}
          </Button>
        </div>

        <div className="space-y-3">
          {results.map((result, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                {getStatusIcon(result.status)}
                <div>
                  <div className="font-medium text-sm">{result.src}</div>
                  {result.loadTime && (
                    <div className="text-xs text-muted-foreground">
                      Loaded in {result.loadTime}ms
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusBadge(result.status)}
                {result.status === 'success' && (
                  <img 
                    src={result.src} 
                    alt="Logo preview" 
                    className="w-8 h-8 object-contain border rounded"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        {results.length > 0 && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <div className="text-sm">
              <strong>Summary:</strong>
              <div className="mt-1">
                ✅ Successful: {results.filter(r => r.status === 'success').length}
              </div>
              <div>
                ❌ Failed: {results.filter(r => r.status === 'error').length}
              </div>
              <div>
                ⏱️ Average load time: {
                  results
                    .filter(r => r.loadTime)
                    .reduce((acc, r) => acc + (r.loadTime || 0), 0) / 
                  results.filter(r => r.loadTime).length || 0
                }ms
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LogoTest;
