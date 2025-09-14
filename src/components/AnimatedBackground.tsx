
import React from 'react';
import { useTheme } from '@/context/ThemeContext';

type AnimatedBackgroundProps = {
  variant?: 'circles' | 'grid' | 'dots';
  className?: string;
};

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ 
  variant = 'circles',
  className = ''
}) => {
  const { isDarkMode } = useTheme();

  if (variant === 'grid') {
    return (
      <div className={`absolute inset-0 z-0 overflow-hidden ${className}`}>
        <div className={`absolute inset-0 ${
          isDarkMode ? 'opacity-10' : 'opacity-5'
        }`}>
          <div className="absolute inset-0 bg-grid-pattern" 
            style={{
              backgroundImage: `linear-gradient(to right, ${isDarkMode ? '#00ffff10' : '#00ffff20'} 1px, transparent 1px), 
                                linear-gradient(to bottom, ${isDarkMode ? '#00ffff10' : '#00ffff20'} 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
              backgroundPosition: 'center center',
            }}
          />
        </div>
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className={`absolute inset-0 z-0 overflow-hidden ${className}`}>
        <div className={`absolute inset-0 ${
          isDarkMode ? 'opacity-15' : 'opacity-5'
        }`}>
          <div className="absolute inset-0" 
            style={{
              backgroundImage: `radial-gradient(${isDarkMode ? '#00ffff30' : '#00ffff40'} 1px, transparent 1px)`,
              backgroundSize: '30px 30px',
              backgroundPosition: 'center center',
            }}
          />
        </div>
      </div>
    );
  }

  // Default: circles
  return (
    <div className={`absolute inset-0 z-0 overflow-hidden pointer-events-none ${className}`}>
      {[...Array(6)].map((_, i) => (
        <div 
          key={i}
          className={`absolute rounded-full bg-crypti-neon animate-pulse ${
            isDarkMode ? 'opacity-10' : 'opacity-5'
          }`}
          style={{
            width: `${Math.floor(Math.random() * 300) + 100}px`,
            height: `${Math.floor(Math.random() * 300) + 100}px`,
            top: `${Math.floor(Math.random() * 100)}%`,
            left: `${Math.floor(Math.random() * 100)}%`,
            filter: 'blur(60px)',
            animationDuration: `${Math.floor(Math.random() * 5) + 3}s`,
            animationDelay: `${Math.floor(Math.random() * 2)}s`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </div>
  );
};

export default AnimatedBackground;
