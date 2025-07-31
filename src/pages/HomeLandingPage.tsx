// src/pages/HomeLandingPage.tsx

import React from "react";
// No useTranslation needed if no t() calls here
// No Link import needed directly here

import HeroSection from '../components/HeroSection';
import OffersSection from '../components/OffersSection';
import WhyChooseUsSection from '../components/WhyChooseUsSection';
import HowItWorksSection from '../components/HowItWorksSection';
import TrustedPartnersSection from '../components/TrustedPartnersSection';
import CTASection from '../components/CTASection';

// IMPORTANT: No imports for AboutSection, ServicesOverviewSection, CommitmentSection, ShowcaseSection here
// These are NOT part of the core HomeLandingPage layout based on your feedback.
// Also, no ServiceIcons or QuoteFormShippitin here.

import type { ParsedVoiceCommand } from '../types/QuoteFormHandle'; // Keep this for the prefillData prop

interface HomeLandingPageProps {
  prefillData?: ParsedVoiceCommand; // This prop IS passed from App.tsx, so it must be here
}

const HomeLandingPage: React.FC<HomeLandingPageProps> = ({ prefillData }) => {
  console.log("HomeLandingPage is rendering."); // Keep this log for debugging
  // console.log("HomeLandingPage received prefillData:", prefillData); // Optional: for debugging prefillData flow

  return (
    <>
      {/* Hero Section - This remains at the top */}
      <HeroSection />

      {/* Original Core Content Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        <OffersSection />
        <WhyChooseUsSection />
        <HowItWorksSection />
        <TrustedPartnersSection />
        <CTASection />
      </div>

      {/* IMPORTANT: No AboutSection, ServicesOverviewSection, CommitmentSection, ShowcaseSection rendered here */}
      {/* IMPORTANT: No ServiceIcons or QuoteFormShippitin rendered here */}
    </>
  );
};

export default HomeLandingPage;
