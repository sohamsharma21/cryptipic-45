
import React from 'react';
import { ClassificationLevel } from '@/types/defense';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, Lock } from 'lucide-react';

interface SecurityBannerProps {
  classification: ClassificationLevel;
  isOfflineMode?: boolean;
}

const classificationColors = {
  UNCLASSIFIED: 'bg-green-100 border-green-500 text-green-800',
  CUI: 'bg-purple-100 border-purple-500 text-purple-800',
  CONFIDENTIAL: 'bg-blue-100 border-blue-500 text-blue-800',
  SECRET: 'bg-red-100 border-red-500 text-red-800',
  TOP_SECRET: 'bg-orange-100 border-orange-500 text-orange-800',
};

const SecurityBanner: React.FC<SecurityBannerProps> = ({ classification, isOfflineMode = false }) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 space-y-1">
      <Alert className={`rounded-none border-2 ${classificationColors[classification]}`}>
        <Shield className="h-4 w-4" />
        <AlertDescription className="font-bold text-center">
          {classification} - AUTHORIZED PERSONNEL ONLY
        </AlertDescription>
      </Alert>
      
      {isOfflineMode && (
        <Alert className="rounded-none border-2 bg-gray-100 border-gray-500 text-gray-800">
          <Lock className="h-4 w-4" />
          <AlertDescription className="font-medium text-center">
            OFFLINE SECURE MODE - NO NETWORK CONNECTIVITY
          </AlertDescription>
        </Alert>
      )}
      
      <Alert className="rounded-none border-2 bg-yellow-100 border-yellow-500 text-yellow-800">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="text-center text-sm">
          WARNING: This system is for authorized government use only. All activities are monitored and logged.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default SecurityBanner;
