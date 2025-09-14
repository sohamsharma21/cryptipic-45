
import React from 'react';
import { Book } from 'lucide-react';
import UserManualButton from '@/components/UserManualButton';
import { useTheme } from '@/context/ThemeContext';

const UserManualBanner: React.FC = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <section className="bg-gradient-to-r from-crypti-neon/20 to-black/50 p-6 rounded-xl border border-crypti-neon/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-glow">
      <div className="flex items-start space-x-4">
        <Book className="h-10 w-10 text-crypti-neon flex-shrink-0 animate-pulse" />
        <div>
          <h3 className="text-lg font-semibold text-white">
            Multilingual User Manual
          </h3>
          <p className="text-gray-200">
            New to CryptiPic? Check out our comprehensive user manual available in English, Hindi, and Spanish.
          </p>
        </div>
      </div>
      <UserManualButton 
        variant="outline" 
        size="lg" 
        className="whitespace-nowrap flex-shrink-0 border-crypti-neon text-white hover:bg-crypti-neon/20"
      />
    </section>
  );
};

export default UserManualBanner;
