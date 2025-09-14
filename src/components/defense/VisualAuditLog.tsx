
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAudit } from '@/components/defense/AuditLogger';
import { AuditLog, SecurityEvent } from '@/types/defense';
import { 
  Shield, 
  User, 
  LogIn, 
  LogOut, 
  Lock, 
  Unlock, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

interface VisualAuditLogProps {
  maxEntries?: number;
  showFilters?: boolean;
  compact?: boolean;
}

const VisualAuditLog: React.FC<VisualAuditLogProps> = ({
  maxEntries = 10,
  showFilters = true,
  compact = false
}) => {
  const { getAuditLogs } = useAudit();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [eventFilter, setEventFilter] = useState<SecurityEvent | 'ALL'>('ALL');

  useEffect(() => {
    const allLogs = getAuditLogs();
    const sortedLogs = allLogs.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    setLogs(sortedLogs);
  }, [getAuditLogs]);

  useEffect(() => {
    let filtered = logs;
    if (eventFilter !== 'ALL') {
      filtered = logs.filter(log => log.event === eventFilter);
    }
    setFilteredLogs(filtered.slice(0, maxEntries));
  }, [logs, eventFilter, maxEntries]);

  const getEventIcon = (event: SecurityEvent) => {
    switch (event) {
      case 'LOGIN': return <LogIn className="h-4 w-4" />;
      case 'LOGOUT': return <LogOut className="h-4 w-4" />;
      case 'ENCODE': return <Lock className="h-4 w-4" />;
      case 'DECODE': return <Unlock className="h-4 w-4" />;
      case 'EXPORT': return <FileText className="h-4 w-4" />;
      case 'IMPORT': return <FileText className="h-4 w-4" />;
      case 'ACCESS_DENIED': return <AlertTriangle className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const getEventColor = (event: SecurityEvent, success: boolean) => {
    if (!success) return 'destructive';
    
    switch (event) {
      case 'LOGIN': return 'default';
      case 'LOGOUT': return 'secondary';
      case 'ENCODE': return 'default';
      case 'DECODE': return 'default';
      case 'EXPORT': return 'outline';
      case 'IMPORT': return 'outline';
      case 'ACCESS_DENIED': return 'destructive';
      default: return 'default';
    }
  };

  if (compact) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <Badge variant="outline" className="text-xs">
              {filteredLogs.length} entries
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-48">
            <div className="space-y-2">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className={`audit-log-entry ${log.success ? 'success' : 'failure'} flex items-center justify-between p-2`}
                >
                  <div className="flex items-center space-x-2">
                    {log.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    )}
                    {getEventIcon(log.event)}
                    <span className="text-sm font-medium text-foreground">{log.event}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-muted-foreground">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Security Audit Log</span>
            </CardTitle>
            <CardDescription>
              Recent security events and system activities
            </CardDescription>
          </div>
          {showFilters && (
            <div className="flex items-center space-x-2">
              <select
                value={eventFilter}
                onChange={(e) => setEventFilter(e.target.value as SecurityEvent | 'ALL')}
                className="px-3 py-1 border border-border rounded-md bg-background text-foreground text-sm"
              >
                <option value="ALL">All Events</option>
                <option value="LOGIN">Login</option>
                <option value="LOGOUT">Logout</option>
                <option value="ENCODE">Encode</option>
                <option value="DECODE">Decode</option>
                <option value="EXPORT">Export</option>
                <option value="IMPORT">Import</option>
                <option value="ACCESS_DENIED">Access Denied</option>
              </select>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className={`audit-log-entry ${log.success ? 'success' : 'failure'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      {log.success ? (
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                      )}
                      {getEventIcon(log.event)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getEventColor(log.event, log.success)}>
                          {log.event}
                        </Badge>
                        <span className="text-sm font-medium text-foreground">
                          {log.userEmail}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {log.details}
                      </p>
                      {log.classification && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          {log.classification}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
            {filteredLogs.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No audit logs found</p>
                <p className="text-sm">Security events will appear here</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default VisualAuditLog;
