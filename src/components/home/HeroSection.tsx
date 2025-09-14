
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/context/ThemeContext';

const HeroSection: React.FC = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <section className="text-center space-y-4 relative">
      <div className={
        isDarkMode 
          ? "inline-block px-6 py-2 bg-gradient-to-r from-crypti-neon/20 to-crypti-neon/30 rounded-full text-sm font-medium text-white mb-2 shadow-glow"
          : "inline-block px-6 py-2 bg-gradient-to-r from-crypti-neon/20 to-crypti-neon/40 rounded-full text-sm font-medium text-gray-800 mb-2"
      }>
        <span className={isDarkMode ? "text-glow" : ""}>Secure • Private • Client-side Processing</span>
      </div>
      <div className="flex justify-center items-center gap-4 mb-2">
        <img 
          src="/lovable-uploads/6a7770e9-8262-4451-a248-72435e52e946.png" 
          alt="CryptiPic Logo" 
          className="w-20 h-20 object-contain animate-pulse"
        />
        <h1 className={
          isDarkMode
            ? "text-4xl md:text-5xl lg:text-6xl font-bold text-white"
            : "text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800"
        }>
          <span className="text-crypti-neon text-glow">Crypti</span>Pic
        </h1>
      </div>
      <p className={
        isDarkMode
          ? "text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto"
          : "text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto"
      }>
        A secure tool to hide secret messages in images 
        and extract detailed metadata.
      </p>
      <div className="flex flex-wrap justify-center gap-4 pt-4">
        <Button 
          asChild 
          size="lg" 
          className={
            isDarkMode 
            ? "bg-crypti-neon hover:bg-crypti-neon/90 text-crypti-darkBg font-bold shadow-glow-lg"
            : "bg-crypti-neon hover:bg-crypti-neon/90 text-white font-bold shadow-md"
          }
        >
          <Link to="/hide">Hide Secret Messages</Link>
        </Button>
        <Button 
          asChild 
          size="lg" 
          variant="outline" 
          className={
            isDarkMode
            ? "border-crypti-neon text-crypti-neon hover:bg-crypti-neon/20 font-medium shadow-glow"
            : "border-crypti-neon text-crypti-neon hover:bg-crypti-neon/10 font-medium"
          }
        >
          <Link to="/reveal">Reveal Hidden Messages</Link>
        </Button>
      </div>
    </section>
  );
};

export default HeroSection;
