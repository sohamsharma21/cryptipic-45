/**
 * CryptiPic Logo Component
 * Handles multiple logo sources with fallback
 */

import React, { useState } from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  size = 'md', 
  showText = true 
}) => {
  const [currentLogoIndex, setCurrentLogoIndex] = useState(0);
  
  // Multiple logo sources with fallbacks
  const logoSources = [
    '/Uplode_img/6a7770e9-8262-4451-a248-72435e52e946.png',
    '/images/favicon.png',
    '/favicon.ico',
    // Fallback to a data URI if all else fails
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iIzBmMTcyYSIvPgo8cGF0aCBkPSJNOCAxNkwyNCAxNk0xNiA4TDE2IDI0IiBzdHJva2U9IiMwMGZmZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+Cjwvc3ZnPgo='
  ];

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  const handleImageError = () => {
    if (currentLogoIndex < logoSources.length - 1) {
      setCurrentLogoIndex(currentLogoIndex + 1);
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`${sizeClasses[size]} relative`}>
        <img 
          src={logoSources[currentLogoIndex]}
          alt="CryptiPic Logo" 
          className="w-full h-full object-contain animate-pulse"
          onError={handleImageError}
          onLoad={() => {
            // Reset to first logo on successful load
            if (currentLogoIndex > 0) {
              setCurrentLogoIndex(0);
            }
          }}
        />
      </div>
      {showText && (
        <span className={`font-bold ${textSizeClasses[size]} text-crypti-neon`}>
          CryptiPic
        </span>
      )}
    </div>
  );
};

export default Logo;
