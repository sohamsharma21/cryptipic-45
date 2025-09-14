
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileImage, Eye, MessageSquare } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import AnimatedBackground from '@/components/AnimatedBackground';

const FeatureSection: React.FC = () => {
  const { isDarkMode } = useTheme();
  
  const features = [
    {
      icon: <FileImage className={isDarkMode ? "h-12 w-12 text-crypti-neon" : "h-12 w-12 text-crypti-neon"} />,
      title: 'Extract Metadata',
      description: 'View detailed information from your images including camera settings, location, and more.',
      link: '/metadata',
      linkText: 'Extract Metadata',
    },
    {
      icon: <Eye className="h-12 w-12 text-crypti-glow" />,
      title: 'Hide Secret Messages',
      description: 'Embed confidential text within your images that remain invisible to the naked eye.',
      link: '/hide',
      linkText: 'Hide Message',
    },
    {
      icon: <MessageSquare className="h-12 w-12 text-crypti-secondary" />,
      title: 'Reveal Hidden Messages',
      description: 'Extract and decrypt hidden messages from images that were encoded with CryptiPic.',
      link: '/reveal',
      linkText: 'Reveal Message',
    },
  ];
  
  return (
    <section className="relative">
      <AnimatedBackground variant="grid" />
      <div className="relative z-10">
        <h2 className={
          isDarkMode
          ? "text-2xl font-bold text-center mb-8 text-white text-glow"
          : "text-2xl font-bold text-center mb-8 text-gray-800"
        }>
          Key Features
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className={
                isDarkMode
                ? "border-crypti-neon/20 hover:border-crypti-neon/40 bg-crypti-darkBg/70 hover:shadow-glow transition-all backdrop-blur-sm"
                : "border-crypti-neon/10 bg-white hover:shadow-md transition-shadow"
              }
            >
              <CardHeader>
                <div className="mb-2">{feature.icon}</div>
                <CardTitle className={isDarkMode ? "text-xl text-white" : "text-xl text-gray-800"}>{feature.title}</CardTitle>
                <CardDescription className={isDarkMode ? "text-gray-300" : "text-gray-600"}>{feature.description}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button 
                  asChild 
                  className={
                    isDarkMode
                    ? "w-full bg-crypti-neon hover:bg-crypti-neon/90 text-crypti-darkBg"
                    : "w-full bg-crypti-neon hover:bg-crypti-neon/90 text-white"
                  }
                >
                  <Link to={feature.link}>{feature.linkText}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
