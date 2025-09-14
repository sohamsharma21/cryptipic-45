
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { HelpCircle, Info } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import UserManualButton from '@/components/UserManualButton';

const HelpSupportSection: React.FC = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <section className={
      isDarkMode
        ? "bg-gradient-to-r from-crypti-darkBg/50 to-crypti-neon/20 p-6 rounded-xl border border-crypti-neon/30 shadow-glow backdrop-blur-sm"
        : "bg-gradient-to-r from-gray-50 to-crypti-neon/5 p-6 rounded-xl border border-crypti-neon/20"
    }>
      <div className="text-center">
        <HelpCircle className={
          isDarkMode 
            ? "h-12 w-12 text-crypti-neon mx-auto mb-4 animate-pulse"
            : "h-12 w-12 text-crypti-neon mx-auto mb-4"
        } />
        <h3 className={
          isDarkMode
            ? "text-xl font-semibold text-white mb-2 text-glow"
            : "text-xl font-semibold text-gray-800 mb-2"
        }>
          Need Help?
        </h3>
        <p className={
          isDarkMode 
            ? "text-gray-200 mb-6 max-w-2xl mx-auto" 
            : "text-gray-700 mb-6 max-w-2xl mx-auto"
        }>
          Check our user manual for detailed guides on using CryptiPic's features, 
          or explore our frequently asked questions section for quick answers.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <UserManualButton 
            variant="outline"
            className={
              isDarkMode
                ? "border-crypti-neon text-crypti-neon hover:bg-crypti-neon/20"
                : "border-crypti-neon text-crypti-neon hover:bg-crypti-neon/10"
            }
          />
          <Button 
            asChild 
            variant="outline" 
            className={
              isDarkMode
                ? "border-crypti-neon text-crypti-neon hover:bg-crypti-neon/20"
                : "border-crypti-neon text-crypti-neon hover:bg-crypti-neon/10"
            }
          >
            <Link to="/about">
              <Info className="h-4 w-4 mr-2" />
              About CryptiPic
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HelpSupportSection;
