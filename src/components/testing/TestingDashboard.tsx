/**
 * Comprehensive Testing Dashboard
 * Provides real-time testing and monitoring of all CryptiPic features
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Play, 
  RefreshCw,
  Shield,
  Lock,
  Zap,
  Monitor,
  Database,
  Image,
  Smartphone
} from 'lucide-react';
import { featureTester, TestSuite, TestResult } from '@/utils/testing/featureTester';
import { errorHandler } from '@/utils/validation/errorHandler';

interface TestingDashboardProps {
  className?: string;
}

export const TestingDashboard: React.FC<TestingDashboardProps> = ({ className }) => {
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [errorStats, setErrorStats] = useState<any>(null);
  const [lastRunTime, setLastRunTime] = useState<Date | null>(null);

  // Run all tests
  const runAllTests = async () => {
    setIsRunning(true);
    setProgress(0);
    setCurrentTest('Initializing tests...');
    
    try {
      const results = await featureTester.runAllTests();
      setTestSuites(results);
      setLastRunTime(new Date());
      setErrorStats(errorHandler.getErrorStatistics());
    } catch (error) {
      console.error('Testing failed:', error);
    } finally {
      setIsRunning(false);
      setProgress(100);
      setCurrentTest('Tests completed');
    }
  };

  // Run individual test suite
  const runTestSuite = async (suiteName: string) => {
    setIsRunning(true);
    setCurrentTest(`Running ${suiteName}...`);
    
    try {
      // This would run individual test suite
      // For now, we'll run all tests
      await runAllTests();
    } catch (error) {
      console.error(`Test suite ${suiteName} failed:`, error);
    } finally {
      setIsRunning(false);
    }
  };

  // Get status icon for test result
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'skip':
        return <Clock className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pass':
        return <Badge variant="default" className="bg-green-500">Pass</Badge>;
      case 'fail':
        return <Badge variant="destructive">Fail</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-500">Warning</Badge>;
      case 'skip':
        return <Badge variant="outline">Skip</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Get suite icon
  const getSuiteIcon = (suiteName: string) => {
    switch (suiteName) {
      case 'Steganography Features':
        return <Image className="h-5 w-5" />;
      case 'Authentication Features':
        return <Lock className="h-5 w-5" />;
      case 'Encryption Features':
        return <Shield className="h-5 w-5" />;
      case 'PWA Features':
        return <Smartphone className="h-5 w-5" />;
      case 'Metadata Features':
        return <Database className="h-5 w-5" />;
      case 'Security Features':
        return <Shield className="h-5 w-5" />;
      case 'UI Components':
        return <Monitor className="h-5 w-5" />;
      case 'Performance Features':
        return <Zap className="h-5 w-5" />;
      default:
        return <Monitor className="h-5 w-5" />;
    }
  };

  // Get overall status
  const getOverallStatus = () => {
    if (testSuites.length === 0) return 'unknown';
    
    const totalFailed = testSuites.reduce((sum, suite) => sum + suite.failedTests, 0);
    const totalWarnings = testSuites.reduce((sum, suite) => sum + suite.warningTests, 0);
    
    if (totalFailed > 0) return 'fail';
    if (totalWarnings > 0) return 'warning';
    return 'pass';
  };

  // Get overall status color
  const getOverallStatusColor = () => {
    const status = getOverallStatus();
    switch (status) {
      case 'pass':
        return 'text-green-500';
      case 'fail':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  // Get overall status icon
  const getOverallStatusIcon = () => {
    const status = getOverallStatus();
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'fail':
        return <XCircle className="h-6 w-6 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
      default:
        return <Clock className="h-6 w-6 text-gray-500" />;
    }
  };

  // Calculate overall statistics
  const getOverallStats = () => {
    if (testSuites.length === 0) {
      return {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        warningTests: 0,
        skippedTests: 0,
        successRate: 0
      };
    }

    const totalTests = testSuites.reduce((sum, suite) => sum + suite.totalTests, 0);
    const passedTests = testSuites.reduce((sum, suite) => sum + suite.passedTests, 0);
    const failedTests = testSuites.reduce((sum, suite) => sum + suite.failedTests, 0);
    const warningTests = testSuites.reduce((sum, suite) => sum + suite.warningTests, 0);
    const skippedTests = testSuites.reduce((sum, suite) => sum + suite.skippedTests, 0);
    const successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

    return {
      totalTests,
      passedTests,
      failedTests,
      warningTests,
      skippedTests,
      successRate
    };
  };

  const overallStats = getOverallStats();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">CryptiPic Testing Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive testing and monitoring of all platform features
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {lastRunTime && (
            <div className="text-sm text-muted-foreground">
              Last run: {lastRunTime.toLocaleTimeString()}
            </div>
          )}
          <Button 
            onClick={runAllTests} 
            disabled={isRunning}
            className="flex items-center space-x-2"
          >
            {isRunning ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            <span>{isRunning ? 'Running Tests...' : 'Run All Tests'}</span>
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      {isRunning && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{currentTest}</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overall Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {getOverallStatusIcon()}
            <span>Overall Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{overallStats.passedTests}</div>
              <div className="text-sm text-muted-foreground">Passed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{overallStats.failedTests}</div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500">{overallStats.warningTests}</div>
              <div className="text-sm text-muted-foreground">Warnings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{overallStats.successRate.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Results</TabsTrigger>
          <TabsTrigger value="errors">Error Log</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testSuites.map((suite) => (
              <Card key={suite.name} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    {getSuiteIcon(suite.name)}
                    <span>{suite.name}</span>
                  </CardTitle>
                  <CardDescription>
                    {suite.totalTests} tests • {suite.duration}ms
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status:</span>
                    {getStatusBadge(
                      suite.failedTests > 0 ? 'fail' : 
                      suite.warningTests > 0 ? 'warning' : 'pass'
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Passed:</span>
                      <span className="text-green-500">{suite.passedTests}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Failed:</span>
                      <span className="text-red-500">{suite.failedTests}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Warnings:</span>
                      <span className="text-yellow-500">{suite.warningTests}</span>
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => runTestSuite(suite.name)}
                    disabled={isRunning}
                    className="w-full"
                  >
                    <RefreshCw className="h-3 w-3 mr-2" />
                    Re-run Tests
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-4">
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {testSuites.map((suite) => (
                <Card key={suite.name}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      {getSuiteIcon(suite.name)}
                      <span>{suite.name}</span>
                    </CardTitle>
                    <CardDescription>
                      {suite.totalTests} tests • {suite.duration}ms
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {suite.results.map((result, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(result.status)}
                            <div>
                              <div className="font-medium">{result.feature}</div>
                              <div className="text-sm text-muted-foreground">{result.message}</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground">{result.duration}ms</span>
                            {getStatusBadge(result.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Error Statistics</CardTitle>
              <CardDescription>
                Security and validation error monitoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              {errorStats ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{errorStats.totalErrors}</div>
                      <div className="text-sm text-muted-foreground">Total Errors</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-500">{errorStats.criticalErrors.length}</div>
                      <div className="text-sm text-muted-foreground">Critical</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-500">{errorStats.recentErrors.length}</div>
                      <div className="text-sm text-muted-foreground">Recent</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-500">
                        {Object.keys(errorStats.errorsByType).length}
                      </div>
                      <div className="text-sm text-muted-foreground">Types</div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">Errors by Type</h4>
                    <div className="space-y-2">
                      {Object.entries(errorStats.errorsByType).map(([type, count]) => (
                        <div key={type} className="flex justify-between">
                          <span className="capitalize">{type}</span>
                          <span className="font-medium">{count as number}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {errorStats.recentErrors.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-medium mb-2">Recent Errors</h4>
                        <ScrollArea className="h-32">
                          <div className="space-y-2">
                            {errorStats.recentErrors.map((error: any, index: number) => (
                              <Alert key={index}>
                                <AlertDescription>
                                  <div className="flex justify-between">
                                    <span>{error.message}</span>
                                    <span className="text-sm text-muted-foreground">
                                      {new Date(error.timestamp).toLocaleTimeString()}
                                    </span>
                                  </div>
                                </AlertDescription>
                              </Alert>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  No error data available. Run tests to see error statistics.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TestingDashboard;
