
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAudit } from './AuditLogger';
import { ComplianceReport } from '@/types/defense';
import { Shield, CheckCircle, AlertCircle, FileText, Download } from 'lucide-react';

const ComplianceTracker: React.FC = () => {
  const { getAuditLogs } = useAudit();
  const [complianceReport, setComplianceReport] = useState<ComplianceReport | null>(null);

  const generateComplianceReport = () => {
    const logs = getAuditLogs();
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recentLogs = logs.filter(log => new Date(log.timestamp) >= thirtyDaysAgo);
    const totalOperations = recentLogs.length;
    const failedOperations = recentLogs.filter(log => !log.success).length;
    const securityViolations = recentLogs.filter(log => log.event === 'ACCESS_DENIED').length;
    
    const complianceScore = Math.max(0, 100 - (failedOperations * 2) - (securityViolations * 5));

    const recommendations = [];
    if (failedOperations > 0) {
      recommendations.push('Review failed operations and implement corrective measures');
    }
    if (securityViolations > 0) {
      recommendations.push('Investigate security violations and enhance access controls');
    }
    if (complianceScore < 95) {
      recommendations.push('Implement additional security measures to improve compliance score');
    }

    const report: ComplianceReport = {
      id: crypto.randomUUID(),
      generatedAt: now,
      generatedBy: 'current-user@defense.gov',
      period: { start: thirtyDaysAgo, end: now },
      totalOperations,
      failedOperations,
      securityViolations,
      complianceScore,
      recommendations,
    };

    setComplianceReport(report);
  };

  useEffect(() => {
    generateComplianceReport();
  }, []);

  const exportReport = () => {
    if (!complianceReport) return;

    const reportData = {
      ...complianceReport,
      exportedAt: new Date(),
      exportedBy: 'current-user@defense.gov',
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!complianceReport) {
    return <div>Generating compliance report...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5 text-blue-600" />
            NIST SP 800-171 / CMMC Compliance Dashboard
          </CardTitle>
          <CardDescription>
            Compliance monitoring for defense cybersecurity standards
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{complianceReport.totalOperations}</div>
              <div className="text-sm text-gray-600">Total Operations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{complianceReport.failedOperations}</div>
              <div className="text-sm text-gray-600">Failed Operations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{complianceReport.securityViolations}</div>
              <div className="text-sm text-gray-600">Security Violations</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Compliance Score</span>
              <span className="text-sm font-medium">{complianceReport.complianceScore}%</span>
            </div>
            <Progress value={complianceReport.complianceScore} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Needs Improvement</span>
              <span>Excellent</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {complianceReport.complianceScore >= 95 ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-orange-600" />
            )}
            <Badge variant={complianceReport.complianceScore >= 95 ? "default" : "destructive"}>
              {complianceReport.complianceScore >= 95 ? "Compliant" : "Action Required"}
            </Badge>
          </div>

          {complianceReport.recommendations.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Recommendations:</h4>
              <ul className="space-y-1">
                {complianceReport.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start">
                    <span className="mr-2">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex space-x-3">
            <Button onClick={generateComplianceReport} variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Refresh Report
            </Button>
            <Button onClick={exportReport}>
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComplianceTracker;
