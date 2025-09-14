
import React from 'react';
import HeroSection from './HeroSection';
import UserManualBanner from './UserManualBanner';
import FeatureSection from './FeatureSection';
import AdvancedFeaturesSection from './AdvancedFeaturesSection';
import HelpSupportSection from './HelpSupportSection';
import PrivacyBanner from './PrivacyBanner';
import AnimatedBackground from '@/components/AnimatedBackground';

const HomeContent: React.FC = () => {
  return (
    <div className="relative">
      <AnimatedBackground variant="circles" />
      <div className="flex flex-col gap-12 py-6 relative z-10">
        <HeroSection />
        <UserManualBanner />
        <FeatureSection />
        <AdvancedFeaturesSection />
        <HelpSupportSection />
        <PrivacyBanner />
      </div>
    </div>
  );
};

export default HomeContent;
