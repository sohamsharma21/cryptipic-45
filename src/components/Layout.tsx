
import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { useTheme } from '@/context/ThemeContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { AlertCircle, X } from 'lucide-react';
import { Button } from './ui/button';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isDarkMode } = useTheme();
  const isMobile = useIsMobile();
  const [showMobileBanner, setShowMobileBanner] = useState(false);
  
  // Show mobile banner on first visit to the Hide or Reveal pages
  useEffect(() => {
    if (isMobile && window.location.pathname.match(/\/(hide|reveal)/)) {
      const hasSeenBanner = localStorage.getItem('cryptipic-mobile-banner-seen');
      if (!hasSeenBanner) {
        setShowMobileBanner(true);
      }
    }
  }, [isMobile]);
  
  const dismissMobileBanner = () => {
    setShowMobileBanner(false);
    localStorage.setItem('cryptipic-mobile-banner-seen', 'true');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-crypti-darkBg to-black">
      <Navbar />
      <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
        {showMobileBanner && isMobile && (
          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800 relative">
            <Button 
              variant="ghost" 
              size="sm" 
              className="absolute right-1 top-1 text-blue-500 dark:text-blue-400 h-6 w-6 p-0"
              onClick={dismissMobileBanner}
            >
              <X size={16} />
            </Button>
            <div className="flex items-start pt-1">
              <AlertCircle className="text-blue-600 dark:text-blue-400 h-5 w-5 mr-2 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-blue-800 dark:text-blue-300">Mobile Compatibility Tips</h3>
                <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                  For best results on mobile devices:
                </p>
                <ul className="text-xs text-blue-600 dark:text-blue-500 mt-1 list-disc pl-4 space-y-0.5">
                  <li>Use original, uncompressed images</li>
                  <li>Avoid sharing images through messaging apps</li>
                  <li>Try larger images for better reliability</li>
                  <li>If decoding fails, try again on a desktop device</li>
                </ul>
              </div>
            </div>
          </div>
        )}
        {children}
      </main>
      <footer className="py-4 px-6 bg-crypti-darkBg text-white text-center text-sm">
        <p>&copy; {new Date().getFullYear()} CryptiPic - Secure Image Steganography Tool</p>
        <p className="text-crypti-neon mt-1 text-glow">Your images are processed locally. We don't store any data.</p>
      </footer>
      <Toaster />
      <Sonner />
    </div>
  );
};

export default Layout;
