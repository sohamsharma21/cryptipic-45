
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Key } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

const PrivacyBanner: React.FC = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <section className="bg-gradient-to-r from-crypti-neon/20 to-crypti-darkBg/50 p-6 rounded-xl border border-crypti-neon/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-glow">
      <div className="flex items-start space-x-4">
        <Key className="h-10 w-10 text-crypti-neon flex-shrink-0 animate-pulse" />
        <div>
          <h3 className="text-lg font-semibold text-white text-glow">
            Your Privacy Matters
          </h3>
          <p className="text-gray-200">
            All processing happens locally in your browser. Your images and messages are never sent to any server.
          </p>
        </div>
      </div>
      <Button 
        asChild 
        variant="outline" 
        className="whitespace-nowrap flex-shrink-0 border-crypti-neon text-crypti-neon hover:bg-crypti-neon/20"
      >
        <Link to="/about">Learn More</Link>
      </Button>
    </section>
  );
};

export default PrivacyBanner;
