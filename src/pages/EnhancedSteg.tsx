import React from 'react';
import { EnhancedSteganographyDemo } from '@/components/steganography/EnhancedSteganographyDemo';

export default function EnhancedSteg() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900">
      <EnhancedSteganographyDemo />
    </div>
  );
}