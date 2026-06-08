// src/pages/HomeLandingPage.tsx
import React from "react";
import HeroSection from '../components/HeroSection';
import OffersSection from '../components/OffersSection';
import WhyChooseUsSection from '../components/WhyChooseUsSection';
import HowItWorksSection from '../components/HowItWorksSection';
import CTASection from '../components/CTASection';
import type { ParsedVoiceCommand } from '../types/QuoteFormHandle';

interface HomeLandingPageProps {
  prefillData?: ParsedVoiceCommand;
}

const HomeLandingPage: React.FC<HomeLandingPageProps> = ({ prefillData }) => {
  return (
    <>
      <HeroSection />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        <OffersSection />
        <WhyChooseUsSection />
        <HowItWorksSection />
        <CTASection />
      </div>
    </>
  );
};

export default HomeLandingPage;
