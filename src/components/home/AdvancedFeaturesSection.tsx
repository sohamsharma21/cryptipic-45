
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Lock, Eye, Settings, Download } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import AnimatedBackground from '@/components/AnimatedBackground';

const AdvancedFeaturesSection: React.FC = () => {
  const { isDarkMode } = useTheme();
  
  const advancedFeatures = [
    {
      icon: <Lock className="h-6 w-6 text-crypti-neon" />,
      title: 'Advanced Encryption',
      description: 'Multiple encryption algorithms (AES-256, ChaCha20) for maximum security.'
    },
    {
      icon: <Eye className="h-6 w-6 text-crypti-glow" />,
      title: 'Multiple Encoding Algorithms',
      description: 'Choose from various steganography techniques including LSB and Multi-bit LSB.'
    },
    {
      icon: <Settings className="h-6 w-6 text-crypti-secondary" />,
      title: 'Quality Controls',
      description: 'Fine-tune the balance between image quality and hidden message capacity.'
    },
    {
      icon: <Download className="h-6 w-6 text-crypti-neon" />,
      title: 'Time-Limited Messages',
      description: 'Create hidden messages that expire after a set date or number of views.'
    },
  ];
  
  return (
    <section className="relative">
      <AnimatedBackground variant="dots" />
      <div className="relative z-10">
        <h2 className={
          isDarkMode
          ? "text-2xl font-bold text-center mb-6 text-white text-glow"
          : "text-2xl font-bold text-center mb-6 text-gray-800"
        }>
          Advanced Features
        </h2>
        <div className={
          isDarkMode 
            ? "grid gap-6 p-6 rounded-xl border border-crypti-neon/30 bg-crypti-darkBg/70 backdrop-blur-sm shadow-glow"
            : "grid gap-6 p-6 rounded-xl border border-crypti-neon/20 bg-white"
        }>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
            {advancedFeatures.map((feature, index) => (
              <div key={index} className="flex flex-col items-center text-center p-4">
                <div className={
                  isDarkMode
                    ? "mb-4 p-3 bg-crypti-neon/20 rounded-full shadow-glow"
                    : "mb-4 p-3 bg-white rounded-full shadow-sm border border-crypti-neon/10"
                }>
                  {feature.icon}
                </div>
                <h3 className={isDarkMode ? "font-semibold text-lg mb-2 text-white" : "font-semibold text-lg mb-2 text-gray-800"}>
                  {feature.title}
                </h3>
                <p className={isDarkMode ? "text-sm text-gray-300" : "text-sm text-gray-700"}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4">
            <Button 
              asChild 
              variant="outline" 
              className={
                isDarkMode
                  ? "border-crypti-neon text-crypti-neon hover:bg-crypti-neon/20"
                  : "border-crypti-neon text-crypti-neon hover:bg-crypti-neon/10"
              }
            >
              <Link to="/hide">Try Advanced Options</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdvancedFeaturesSection;
