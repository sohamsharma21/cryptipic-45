
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { AccessProvider } from '@/context/AccessContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useServiceWorker } from '@/hooks/useServiceWorker';
import { AuditProvider } from '@/components/defense/AuditLogger';
import SiteWideAccessGate from '@/components/access/SiteWideAccessGate';
import Index from '@/pages/Index';
import DefenseApp from '@/pages/DefenseApp';
import HidePage from '@/pages/Hide';
import RevealPage from '@/pages/Reveal';
import About from '@/pages/About';
import Auth from '@/pages/Auth';
import Settings from '@/pages/Settings';
import Dashboard from '@/pages/Dashboard';
import Metadata from '@/pages/Metadata';
import AdminConfig from '@/pages/AdminConfig';
import NotFound from '@/pages/NotFound';
import TestingDashboard from '@/components/testing/TestingDashboard';
import SecurityComplianceValidator from '@/components/compliance/SecurityComplianceValidator';
import SecurityAuditDashboard from '@/components/security/SecurityAuditDashboard';
import LogoTest from '@/components/LogoTest';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

const AppContent = () => {
  const { isOnline, scheduleBackgroundSync } = useServiceWorker();

  useEffect(() => {
    // Register background sync for audit logs
    if (!isOnline) {
      scheduleBackgroundSync('audit-sync');
    }
  }, [isOnline, scheduleBackgroundSync]);

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/defense" element={<DefenseApp />} />
        <Route path="/hide" element={<HidePage />} />
        <Route path="/reveal" element={<RevealPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/metadata" element={<Metadata />} />
        <Route path="/admin" element={<AdminConfig />} />
        <Route path="/testing" element={<TestingDashboard />} />
        <Route path="/compliance" element={<SecurityComplianceValidator />} />
        <Route path="/security-audit" element={<SecurityAuditDashboard />} />
        <Route path="/logo-test" element={<LogoTest />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AccessProvider>
            <AuthProvider>
              <AuditProvider>
                <TooltipProvider>
                  <Router>
                    <SiteWideAccessGate>
                      <AppContent />
                    </SiteWideAccessGate>
                  </Router>
                  <Toaster />
                  <Sonner />
                </TooltipProvider>
              </AuditProvider>
            </AuthProvider>
          </AccessProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
